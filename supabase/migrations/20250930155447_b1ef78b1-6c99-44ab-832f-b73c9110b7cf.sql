-- Update category display names to be more user-friendly
UPDATE categories 
SET display_name = 'Kids' 
WHERE name = 'Kid';

UPDATE categories 
SET display_name = 'Adults' 
WHERE name = 'Adult';