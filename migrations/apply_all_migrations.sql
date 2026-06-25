-- Combined migrations for easy execution (run in order)

-- 000: create lecturers and classes
-- ==================================
CREATE TABLE IF NOT EXISTS public.lecturers (
  lecturer_id serial PRIMARY KEY,
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone_number text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.classes (
  course_id serial PRIMARY KEY,
  lecturer_id integer NOT NULL REFERENCES public.lecturers(lecturer_id) ON DELETE CASCADE,
  course_title text,
  course_code text,
  schedule jsonb,
  attendees jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lecturers_email ON public.lecturers(email);
CREATE INDEX IF NOT EXISTS idx_classes_lecturer_id ON public.classes(lecturer_id);

-- 001: create attendees table
-- ==================================
CREATE TABLE IF NOT EXISTS public.attendees (
  attendee_id serial PRIMARY KEY,
  course_id integer NOT NULL REFERENCES public.classes(course_id) ON DELETE CASCADE,
  matric_no text NOT NULL,
  name text,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_attendees_course_id ON public.attendees(course_id);
CREATE INDEX IF NOT EXISTS idx_attendees_matric_no ON public.attendees(matric_no);

-- 002: migrate attendees from classes.attendees JSON (safe insert)
-- ==================================
INSERT INTO public.attendees (course_id, matric_no, name, timestamp, created_at)
SELECT
  c.course_id,
  (attendee->>'matric_no') AS matric_no,
  (attendee->>'name') AS name,
  (attendee->>'timestamp')::timestamptz AS timestamp,
  now() AS created_at
FROM public.classes c,
     jsonb_array_elements(COALESCE(c.attendees, '[]'::jsonb)) AS attendee
WHERE c.attendees IS NOT NULL 
  AND jsonb_array_length(c.attendees) > 0
ON CONFLICT DO NOTHING;

-- 003: enable RLS and policies (run by project admin in Supabase)
-- ==================================
ALTER TABLE IF EXISTS public.lecturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.attendees ENABLE ROW LEVEL SECURITY;

-- Link lecturers to auth users if auth_user_id missing
DO $$
BEGIN
  BEGIN
    ALTER TABLE public.lecturers
    ADD COLUMN IF NOT EXISTS auth_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;
  EXCEPTION WHEN undefined_table THEN
    -- auth schema may not exist in some contexts; skip if so
    RAISE NOTICE 'auth.users not available in this context.';
  END;
END;
$$;

-- Policies (idempotent create):
DROP POLICY IF EXISTS lecturers_insert_own ON public.lecturers;
CREATE POLICY lecturers_insert_own ON public.lecturers
FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS lecturers_read_own ON public.lecturers;
CREATE POLICY lecturers_read_own ON public.lecturers
FOR SELECT USING (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS lecturers_update_own ON public.lecturers;
CREATE POLICY lecturers_update_own ON public.lecturers
FOR UPDATE USING (auth.uid() = auth_user_id) WITH CHECK (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS lecturers_read_public ON public.lecturers;
CREATE POLICY lecturers_read_public ON public.lecturers
FOR SELECT USING (true);

DROP POLICY IF EXISTS classes_insert_own ON public.classes;
CREATE POLICY classes_insert_own ON public.classes
FOR INSERT WITH CHECK (
  lecturer_id = (
    SELECT lecturer_id FROM public.lecturers 
    WHERE auth_user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS classes_read_own ON public.classes;
CREATE POLICY classes_read_own ON public.classes
FOR SELECT USING (
  lecturer_id = (
    SELECT lecturer_id FROM public.lecturers 
    WHERE auth_user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS classes_update_own ON public.classes;
CREATE POLICY classes_update_own ON public.classes
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

DROP POLICY IF EXISTS classes_read_public ON public.classes;
CREATE POLICY classes_read_public ON public.classes
FOR SELECT USING (true);

DROP POLICY IF EXISTS attendees_read_own_class ON public.attendees;
CREATE POLICY attendees_read_own_class ON public.attendees
FOR SELECT USING (
  course_id IN (
    SELECT course_id FROM public.classes
    WHERE lecturer_id = (
      SELECT lecturer_id FROM public.lecturers 
      WHERE auth_user_id = auth.uid()
    )
  )
);

DROP POLICY IF EXISTS attendees_insert_public ON public.attendees;
CREATE POLICY attendees_insert_public ON public.attendees
FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS attendees_update_own_class ON public.attendees;
CREATE POLICY attendees_update_own_class ON public.attendees
FOR UPDATE USING (
  course_id IN (
    SELECT course_id FROM public.classes
    WHERE lecturer_id = (
      SELECT lecturer_id FROM public.lecturers 
      WHERE auth_user_id = auth.uid()
    )
  )
);

-- Indexes to ensure
CREATE INDEX IF NOT EXISTS idx_lecturers_auth_user_id ON public.lecturers(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_lecturers_email ON public.lecturers(email);
CREATE INDEX IF NOT EXISTS idx_classes_lecturer_id ON public.classes(lecturer_id);
CREATE INDEX IF NOT EXISTS idx_attendees_course_id ON public.attendees(course_id);
CREATE INDEX IF NOT EXISTS idx_attendees_matric_no ON public.attendees(matric_no);

-- End of combined migrations
