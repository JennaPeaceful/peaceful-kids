-- Drop the old media_type check constraint
ALTER TABLE meditations DROP CONSTRAINT meditations_media_type_check;

-- Add new check constraint that includes 'pdf'
ALTER TABLE meditations ADD CONSTRAINT meditations_media_type_check 
CHECK (media_type = ANY (ARRAY['audio'::text, 'video'::text, 'pdf'::text]));

-- Update existing records with .pdf URLs to have media_type='pdf'
UPDATE meditations 
SET media_type = 'pdf' 
WHERE media_url ILIKE '%.pdf' 
  AND media_type != 'pdf';