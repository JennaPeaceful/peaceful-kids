-- Update content category thumbnails for adult categories
UPDATE content_categories 
SET thumbnail_png_url = 'https://cdn.peacefulkids.app/thumbnails/content-category/adults/breathwork_adult.png'
WHERE name = 'Breathwork';

UPDATE content_categories 
SET thumbnail_png_url = 'https://cdn.peacefulkids.app/thumbnails/content-category/adults/binaurals_adult.png'
WHERE name = 'Binaurals';

UPDATE content_categories 
SET thumbnail_png_url = 'https://cdn.peacefulkids.app/thumbnails/content-category/adults/meditation_adult.png'
WHERE name = 'Meditation';

UPDATE content_categories 
SET thumbnail_png_url = 'https://cdn.peacefulkids.app/thumbnails/content-category/adults/somaticresets_adults.png'
WHERE name = 'Somatic Reset';

UPDATE content_categories 
SET thumbnail_png_url = 'https://cdn.peacefulkids.app/thumbnails/content-category/adults/transitions_adult.png'
WHERE name = 'Transitions';