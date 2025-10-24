-- Set sort_order for free intro videos to display in ascending age order
-- This ensures intro videos appear in the correct age sequence

-- 3-5 Year Old Introduction
UPDATE meditations 
SET sort_order = 1 
WHERE id = 'd60890a9-64a2-4d6a-8ef0-3d163d137463';

-- 6-8 Year Old Introduction (also fix age_group)
UPDATE meditations 
SET sort_order = 2,
    age_group = 'Ages 6-8'
WHERE id = 'fbf8f878-737f-4cce-a7ae-d6fc8134bf51';

-- 9-12 Year Old Introduction
UPDATE meditations 
SET sort_order = 3 
WHERE id = 'cdfb66af-018f-4646-8758-888c3e67087a';

-- 13-17 Year Old Introduction
UPDATE meditations 
SET sort_order = 4 
WHERE id = 'e9b87204-fb3f-4967-98ab-dbad309511a1';