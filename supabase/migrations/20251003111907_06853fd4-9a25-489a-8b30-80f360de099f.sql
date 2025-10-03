-- Add featured_for_plan column to meditations table
ALTER TABLE public.meditations 
ADD COLUMN IF NOT EXISTS featured_for_plan text[] DEFAULT NULL;

-- Add an index for better query performance
CREATE INDEX IF NOT EXISTS idx_meditations_featured_for_plan 
ON public.meditations USING GIN(featured_for_plan);

-- Add a comment explaining the column
COMMENT ON COLUMN public.meditations.featured_for_plan IS 'Array of plan types this meditation is featured for: free, peace, peace_plus';
