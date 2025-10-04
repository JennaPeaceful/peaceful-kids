-- Mark all non-course meditations containing "introduction" as free
UPDATE meditations 
SET is_free = true 
WHERE LOWER(title) LIKE '%introduction%' 
AND (category != 'Courses' OR category IS NULL);