import { create } from 'zustand';
import { UserProfile, UserSubscription, UserPreferences } from '../types';

interface UserState {
  profile: UserProfile | null;
  subscription: UserSubscription | null;
  preferences: UserPreferences | null;
  isAuthenticated: boolean;
  ageGroup: 'child' | 'adult' | null;
  
  // Actions
  setProfile: (profile: UserProfile) => void;
  setSubscription: (subscription: UserSubscription) => void;
  setPreferences: (preferences: UserPreferences) => void;
  setAgeGroup: (group: 'child' | 'adult') => void;
  login: (profile: UserProfile) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  subscription: null,
  preferences: null,
  isAuthenticated: false,
  ageGroup: null,
  
  setProfile: (profile) => set({ profile }),
  setSubscription: (subscription) => set({ subscription }),
  setPreferences: (preferences) => set({ preferences }),
  setAgeGroup: (group) => {
    set({ ageGroup: group });
    localStorage.setItem('user-age-group', group);
  },
  login: (profile) => set({ profile, isAuthenticated: true }),
  logout: () => set({ 
    profile: null, 
    subscription: null, 
    preferences: null, 
    isAuthenticated: false 
  }),
}));