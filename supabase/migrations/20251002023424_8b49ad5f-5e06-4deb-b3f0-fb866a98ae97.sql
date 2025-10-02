-- Add comment documenting valid plan types
COMMENT ON COLUMN public.user_subscriptions.plan_type IS 'Valid values: free, peace_plan, peace_plus_plan';

-- Update existing records to use new plan type naming
UPDATE public.user_subscriptions 
SET plan_type = 'free' 
WHERE plan_type NOT IN ('peace_plan', 'peace_plus_plan') OR plan_type IS NULL;