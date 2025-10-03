-- Add DELETE RLS policies for user data tables

-- User profiles: Allow users to delete own profile
CREATE POLICY "Users can delete own profile" 
ON public.user_profiles 
FOR DELETE 
USING (auth.uid() = user_id);

-- User subscriptions: Allow users to delete own subscription
CREATE POLICY "Users can delete own subscription" 
ON public.user_subscriptions 
FOR DELETE 
USING (auth.uid() = user_id);

-- User progress: Allow users to delete own progress
CREATE POLICY "Users can delete own progress" 
ON public.user_progress 
FOR DELETE 
USING (auth.uid() = user_id);

-- User preferences: Allow users to delete own preferences
CREATE POLICY "Users can delete own preferences" 
ON public.user_preferences 
FOR DELETE 
USING (auth.uid() = user_id);

-- Meditation usage: Allow users to delete own usage records
CREATE POLICY "Users can delete own meditation usage" 
ON public.meditation_usage 
FOR DELETE 
USING (auth.uid() = user_id);