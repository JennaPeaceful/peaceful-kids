-- Enable RLS on the backup table (it's an actual table)
ALTER TABLE public.meditations_backup_before_dedupe ENABLE ROW LEVEL SECURITY;

-- Add public read policy for backup meditations
CREATE POLICY "Backup meditations are viewable by everyone" 
ON public.meditations_backup_before_dedupe 
FOR SELECT 
USING (true);