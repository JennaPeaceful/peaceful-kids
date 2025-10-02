import { create } from 'zustand';
import { UserProgress, ProgressStats } from '../types';
import { supabase } from '@/integrations/supabase/client';

interface ProgressState {
  userProgress: UserProgress[];
  stats: ProgressStats;
  
  // Actions
  addProgress: (progress: Omit<UserProgress, 'id'>) => void;
  updateStats: () => void;
  completeSession: (meditationId: string, durationSeconds: number) => Promise<void>;
}

const mockWeeklyActivity = [
  { date: '2024-01-01', minutes: 15 },
  { date: '2024-01-02', minutes: 20 },
  { date: '2024-01-03', minutes: 0 },
  { date: '2024-01-04', minutes: 12 },
  { date: '2024-01-05', minutes: 18 },
  { date: '2024-01-06', minutes: 25 },
  { date: '2024-01-07', minutes: 10 },
];

export const useProgressStore = create<ProgressState>((set, get) => ({
  userProgress: [
    {
      id: '1',
      user_id: '1',
      meditation_id: '1',
      completed_at: new Date().toISOString(),
      progress_seconds: 600,
      is_completed: true,
    },
    {
      id: '2',
      user_id: '1',
      meditation_id: '2',
      completed_at: new Date(Date.now() - 86400000).toISOString(),
      progress_seconds: 480,
      is_completed: true,
    },
  ],
  stats: {
    currentStreak: 3,
    totalMeditations: 12,
    totalMinutes: 145,
    weeklyActivity: mockWeeklyActivity,
    achievements: ['First Session', 'Week Warrior', 'Calm Explorer'],
  },
  
  addProgress: (progress) => {
    const newProgress: UserProgress = {
      ...progress,
      id: Date.now().toString(),
    };
    
    set((state) => ({
      userProgress: [...state.userProgress, newProgress]
    }));
    
    get().updateStats();
  },
  
  updateStats: () => {
    const { userProgress } = get();
    const completed = userProgress.filter(p => p.is_completed);
    const totalMinutes = Math.round(
      userProgress.reduce((sum, p) => sum + p.progress_seconds, 0) / 60
    );
    
    // Calculate streak (simplified)
    const today = new Date();
    const yesterday = new Date(today.getTime() - 86400000);
    const hasToday = completed.some(p => 
      new Date(p.completed_at).toDateString() === today.toDateString()
    );
    const hasYesterday = completed.some(p => 
      new Date(p.completed_at).toDateString() === yesterday.toDateString()
    );
    
    let currentStreak = 0;
    if (hasToday) currentStreak = hasYesterday ? 3 : 1;
    else if (hasYesterday) currentStreak = 2;
    
    set((state) => ({
      stats: {
        ...state.stats,
        totalMeditations: completed.length,
        totalMinutes,
        currentStreak,
      }
    }));
  },
  
  completeSession: async (meditationId, durationSeconds) => {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('No authenticated user found');
        return;
      }

      // Insert progress record into Supabase
      const { error } = await supabase
        .from('user_progress')
        .insert({
          user_id: user.id,
          meditation_id: meditationId,
          completed_at: new Date().toISOString(),
          progress_seconds: Math.round(durationSeconds),
          is_completed: true,
        });

      if (error) {
        console.error('Error saving progress:', error);
        throw error;
      }

      // Also update local state for immediate UI feedback
      get().addProgress({
        user_id: user.id,
        meditation_id: meditationId,
        completed_at: new Date().toISOString(),
        progress_seconds: Math.round(durationSeconds),
        is_completed: true,
      });

      console.log('Progress saved successfully!');
    } catch (error) {
      console.error('Failed to complete session:', error);
    }
  },
}));