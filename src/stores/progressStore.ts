import { create } from 'zustand';
import { UserProgress, ProgressStats } from '../types';
import { supabase } from '@/integrations/supabase/client';

interface ProgressState {
  userProgress: UserProgress[];
  stats: ProgressStats;
  isLoading: boolean;

  // Actions
  addProgress: (progress: Omit<UserProgress, 'id'>) => void;
  updateStats: () => void;
  completeSession: (meditationId: string, durationSeconds: number) => Promise<void>;
  fetchUserProgress: () => Promise<void>;
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
  userProgress: [],
  isLoading: false,
  stats: {
    currentStreak: 0,
    totalMeditations: 0,
    totalMinutes: 0,
    weeklyActivity: mockWeeklyActivity,
    achievements: [],
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
      // Get current authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user');
        return;
      }

      // Insert progress into Supabase
      const { data, error } = await supabase
        .from('user_progress')
        .insert({
          user_id: user.id,
          meditation_id: meditationId,
          completed_at: new Date().toISOString(),
          progress_seconds: durationSeconds,
          is_completed: true,
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving progress to Supabase:', error);
        return;
      }

      // Update local state with saved data
      if (data) {
        get().addProgress(data);
      }
    } catch (error) {
      console.error('Error in completeSession:', error);
    }
  },

  fetchUserProgress: async () => {
    try {
      set({ isLoading: true });

      // Get current authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user');
        set({ isLoading: false });
        return;
      }

      // Fetch user's progress from Supabase
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('Error fetching progress from Supabase:', error);
        set({ isLoading: false });
        return;
      }

      // Update state with fetched progress
      set({
        userProgress: data || [],
        isLoading: false
      });

      // Recalculate stats
      get().updateStats();
    } catch (error) {
      console.error('Error in fetchUserProgress:', error);
      set({ isLoading: false });
    }
  },
}));