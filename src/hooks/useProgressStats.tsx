import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isToday, differenceInDays } from 'date-fns';

export const useProgressStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['progress-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user');

      const { data: progressData, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_completed', true)
        .order('completed_at', { ascending: false });

      if (error) throw error;

      // Calculate total sessions and minutes
      const totalMeditations = progressData?.length || 0;
      const totalMinutes = Math.round(
        (progressData?.reduce((sum, p) => sum + (p.progress_seconds || 0), 0) || 0) / 60
      );

      // Calculate current streak
      let currentStreak = 0;
      if (progressData && progressData.length > 0) {
        const sortedDates = progressData
          .map(p => p.completed_at ? new Date(p.completed_at) : null)
          .filter((d): d is Date => d !== null)
          .map(d => format(d, 'yyyy-MM-dd'))
          .filter((v, i, a) => a.indexOf(v) === i)
          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

        if (sortedDates.length > 0) {
          const today = format(new Date(), 'yyyy-MM-dd');
          const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
          
          if (sortedDates[0] === today || sortedDates[0] === yesterday) {
            currentStreak = 1;
            for (let i = 1; i < sortedDates.length; i++) {
              const diff = differenceInDays(new Date(sortedDates[i - 1]), new Date(sortedDates[i]));
              if (diff === 1) {
                currentStreak++;
              } else {
                break;
              }
            }
          }
        }
      }

      // Calculate weekly activity
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
      const weekEnd = endOfWeek(new Date(), { weekStartsOn: 0 });
      const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

      const weeklyActivity = daysOfWeek.map(day => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const dayProgress = progressData?.filter(p => 
          p.completed_at && format(new Date(p.completed_at), 'yyyy-MM-dd') === dayStr
        ) || [];
        
        const minutes = Math.round(
          dayProgress.reduce((sum, p) => sum + (p.progress_seconds || 0), 0) / 60
        );

        return {
          date: dayStr,
          minutes,
          sessions: dayProgress.length,
        };
      });

      return {
        currentStreak,
        totalMeditations,
        totalMinutes,
        weeklyActivity,
      };
    },
    enabled: !!user?.id,
  });
};
