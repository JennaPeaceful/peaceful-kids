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
  profile: null,
  subscription: null,
  preferences: null,
  isAuthenticated: false,
  
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