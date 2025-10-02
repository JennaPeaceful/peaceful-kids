import { create } from 'zustand';
import { UserProfile, UserSubscription, UserPreferences } from '../types';

interface UserState {
  profile: UserProfile | null;
  subscription: UserSubscription | null;
  preferences: UserPreferences | null;
  isAuthenticated: boolean;
  
  // Actions
  setProfile: (profile: UserProfile) => void;
  setSubscription: (subscription: UserSubscription) => void;
  setPreferences: (preferences: UserPreferences) => void;
  login: (profile: UserProfile) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  profile: {
    id: '1',
    user_id: '1',
    display_name: 'Alex',
    age: 8,
    category_preference: 'Kid',
    avatar_url: undefined,
    created_at: new Date().toISOString(),
  },
  subscription: {
    id: '1',
    user_id: '1',
    is_active: false,
    plan_type: 'free' as const,
  },
  preferences: {
    id: '1',
    user_id: '1',
    preferred_age_group: '6-8 years',
    notification_settings: {
      daily_reminder: true,
      streak_celebration: true,
      new_content: true,
    },
  },
  isAuthenticated: true,
  
  setProfile: (profile) => set({ profile }),
  setSubscription: (subscription) => set({ subscription }),
  setPreferences: (preferences) => set({ preferences }),
  login: (profile) => set({ profile, isAuthenticated: true }),
  logout: () => set({ 
    profile: null, 
    subscription: null, 
    preferences: null, 
    isAuthenticated: false 
  }),
}));