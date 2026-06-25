-- Database Security: Row-Level Security (RLS) & Auth Integration

-- ============================================
-- 1. ENABLE ROW-LEVEL SECURITY
-- ============================================
-- Run in Supabase SQL editor

ALTER TABLE public.lecturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendees ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. LINK LECTURERS TO AUTH USERS
-- ============================================
-- Add auth_user_id column if missing (references auth.users.id)
ALTER TABLE public.lecturers
ADD COLUMN auth_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;

-- ============================================
-- 3. RLS POLICIES FOR LECTURERS TABLE
-- ============================================

-- Allow authenticated users to insert their own lecturer row
CREATE POLICY "lecturers_insert_own" ON public.lecturers
FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

-- Allow lecturers to read their own row
CREATE POLICY "lecturers_read_own" ON public.lecturers
FOR SELECT USING (auth.uid() = auth_user_id);

-- Allow lecturers to update their own row
CREATE POLICY "lecturers_update_own" ON public.lecturers
FOR UPDATE USING (auth.uid() = auth_user_id) 
WITH CHECK (auth.uid() = auth_user_id);

-- Allow public read for finding lecturer by email (for student attendance page)
CREATE POLICY "lecturers_read_public" ON public.lecturers
FOR SELECT USING (true);

-- ============================================
-- 4. RLS POLICIES FOR CLASSES TABLE
-- ============================================

-- Allow lecturers to insert classes they own
CREATE POLICY "classes_insert_own" ON public.classes
FOR INSERT WITH CHECK (
  lecturer_id = (
    SELECT lecturer_id FROM public.lecturers 
    WHERE auth_user_id = auth.uid()
  )
);

-- Allow lecturers to read their own classes
CREATE POLICY "classes_read_own" ON public.classes
FOR SELECT USING (
  lecturer_id = (
    SELECT lecturer_id FROM public.lecturers 
    WHERE auth_user_id = auth.uid()
  )
);

-- Allow lecturers to update their own classes
CREATE POLICY "classes_update_own" ON public.classes
FOR UPDATE USING (
  lecturer_id = (
    SELECT lecturer_id FROM public.lecturers 
    WHERE auth_user_id = auth.uid()
  )
) WITH CHECK (
  lecturer_id = (
    SELECT lecturer_id FROM public.lecturers 
    WHERE auth_user_id = auth.uid()
  )
);

-- Allow public read for students to access class details (attendance page)
CREATE POLICY "classes_read_public" ON public.classes
FOR SELECT USING (true);

-- ============================================
-- 5. RLS POLICIES FOR ATTENDEES TABLE
-- ============================================

-- Allow lecturers to read attendees for their classes
CREATE POLICY "attendees_read_own_class" ON public.attendees
FOR SELECT USING (
  course_id IN (
    SELECT course_id FROM public.classes
    WHERE lecturer_id = (
      SELECT lecturer_id FROM public.lecturers 
      WHERE auth_user_id = auth.uid()
    )
  )
);

-- Allow authenticated users to insert attendees (students marking attendance)
CREATE POLICY "attendees_insert_public" ON public.attendees
FOR INSERT WITH CHECK (true);

-- Allow lecturers to read/export attendees for their classes
CREATE POLICY "attendees_update_own_class" ON public.attendees
FOR UPDATE USING (
  course_id IN (
    SELECT course_id FROM public.classes
    WHERE lecturer_id = (
      SELECT lecturer_id FROM public.lecturers 
      WHERE auth_user_id = auth.uid()
    )
  )
);

-- ============================================
-- 6. OPTIONAL: SERVICE ROLE (Admin) BYPASS
-- ============================================
-- Service role functions (called from backend, not client)
-- These are only for administrative tasks

-- Function to create lecturer (called during registration)
CREATE OR REPLACE FUNCTION public.create_lecturer(
  p_auth_user_id uuid,
  p_full_name text,
  p_email text,
  p_phone_number text
) RETURNS public.lecturers AS $$
DECLARE
  v_lecturer public.lecturers;
BEGIN
  INSERT INTO public.lecturers (auth_user_id, full_name, email, phone_number)
  VALUES (p_auth_user_id, p_full_name, p_email, p_phone_number)
  RETURNING * INTO v_lecturer;
  RETURN v_lecturer;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. OPTIONAL: AUDIT LOGGING
-- ============================================
-- Track who modified attendance records

CREATE TABLE IF NOT EXISTS public.audit_log (
  id serial PRIMARY KEY,
  table_name text NOT NULL,
  operation text NOT NULL, -- INSERT, UPDATE, DELETE
  record_id integer,
  changed_by uuid,
  changed_at timestamptz DEFAULT now(),
  old_data jsonb,
  new_data jsonb
);

-- Example trigger (optional; uncomment to enable)
/*
CREATE OR REPLACE FUNCTION audit_attendees()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_log (table_name, operation, record_id, changed_by, new_data)
  VALUES ('attendees', TG_OP, NEW.attendee_id, auth.uid(), to_jsonb(NEW));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER attendees_audit_trigger
AFTER INSERT ON public.attendees
FOR EACH ROW EXECUTE FUNCTION audit_attendees();
*/

-- ============================================
-- 8. INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_lecturers_auth_user_id ON public.lecturers(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_lecturers_email ON public.lecturers(email);
CREATE INDEX IF NOT EXISTS idx_classes_lecturer_id ON public.classes(lecturer_id);
CREATE INDEX IF NOT EXISTS idx_attendees_course_id ON public.attendees(course_id);
CREATE INDEX IF NOT EXISTS idx_attendees_matric_no ON public.attendees(matric_no);
