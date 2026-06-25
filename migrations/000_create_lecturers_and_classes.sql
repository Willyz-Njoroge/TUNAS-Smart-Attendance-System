-- Migration: create lecturers and classes tables

CREATE TABLE IF NOT EXISTS public.lecturers (
  lecturer_id serial PRIMARY KEY,
  Full_Name text NOT NULL,
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lecturers_email ON public.lecturers(email);
CREATE INDEX IF NOT EXISTS idx_classes_lecturer_id ON public.classes(lecturer_id);
