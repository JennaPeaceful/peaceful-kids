-- Step 1: Create course_modules table
CREATE TABLE course_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_name text NOT NULL,
  module_number integer NOT NULL,
  title text NOT NULL,
  description text,
  sort_order integer,
  created_at timestamptz DEFAULT now(),
  UNIQUE(course_name, module_number)
);

-- Enable RLS
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;

-- Public read access (same as meditations)
CREATE POLICY "Modules are viewable by everyone"
  ON course_modules FOR SELECT
  USING (true);

-- Step 2: Add module_id column to meditations table
ALTER TABLE meditations 
ADD COLUMN module_id uuid REFERENCES course_modules(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX idx_meditations_module_id ON meditations(module_id);

-- Step 3: Populate course_modules with data
-- Extract module titles using the logic:
-- If module has a "title placeholder" (title only, no public_title/media/transcript/drive_id) → use that title
-- Otherwise → use the first meditation's public_title (or title if no public_title)
INSERT INTO course_modules (course_name, module_number, title, sort_order)
SELECT DISTINCT
  courses as course_name,
  module as module_number,
  COALESCE(
    -- Try to find title placeholder first
    (SELECT title 
     FROM meditations m2 
     WHERE m2.courses = m1.courses 
       AND m2.module = m1.module
       AND m2.title IS NOT NULL
       AND m2.public_title IS NULL
       AND m2.media_url IS NULL
       AND m2.google_drive_id IS NULL
       AND m2.transcript IS NULL
     LIMIT 1),
    -- Otherwise use first meditation's public_title or title
    (SELECT COALESCE(public_title, title)
     FROM meditations m2
     WHERE m2.courses = m1.courses
       AND m2.module = m1.module
       AND (m2.public_title IS NOT NULL OR m2.title IS NOT NULL)
     ORDER BY m2.lecture NULLS LAST
     LIMIT 1)
  ) as title,
  module as sort_order
FROM meditations m1
WHERE courses IS NOT NULL 
  AND module IS NOT NULL
ORDER BY courses, module;

-- Step 4: Link meditations to modules
UPDATE meditations m
SET module_id = cm.id
FROM course_modules cm
WHERE m.courses = cm.course_name
  AND m.module = cm.module_number;

-- Step 5: Clean up title placeholder entries
-- Remove entries that were only used as module titles
DELETE FROM meditations
WHERE title IS NOT NULL
  AND public_title IS NULL
  AND media_url IS NULL
  AND google_drive_id IS NULL
  AND transcript IS NULL
  AND courses IS NOT NULL
  AND module IS NOT NULL;