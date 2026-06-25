-- Migration: create normalized attendees table

CREATE TABLE IF NOT EXISTS public.attendees (
  attendee_id serial PRIMARY KEY,
  course_id integer NOT NULL REFERENCES public.classes(course_id) ON DELETE CASCADE,
  matric_no text NOT NULL,
  name text,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Useful index for lookups
CREATE INDEX IF NOT EXISTS idx_attendees_course_id ON public.attendees(course_id);
CREATE INDEX IF NOT EXISTS idx_attendees_matric_no ON public.attendees(matric_no);
