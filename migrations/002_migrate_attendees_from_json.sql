-- Migration: migrate existing attendees from classes.attendees JSON to normalized attendees table

-- Insert attendees from existing classes.attendees JSON array into the new attendees table
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
ON CONFLICT DO NOTHING; -- Skip duplicates if any

-- Optional: Clear the attendees field from classes (commented out for safety)
-- UPDATE public.classes SET attendees = NULL WHERE attendees IS NOT NULL;
