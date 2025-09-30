// Data models for Peaceful Kids meditation app

export interface Meditation {
  id: string;
  title: string;
  public_title?: string;
  description: string;
  thumbnail: string;
  thumbnail_url?: string;
  duration: number; // in seconds
  media_url: string;
  media_type: 'audio' | 'video';
  is_free: boolean;
  category: string;
  age_group: string;
  themes: string[];
  content_categories?: string[];
  created_at: string;
  sort_order: number;
}

export interface Category {
  id: string;
  name: string;
  display_name: string;
  thumbnail_png_url?: string;
  thumbnail_svg_url?: string;
  sort_order?: number;
  created_at?: string;
}

export interface AgeGroup {
  id: string;
  category_id: string;
  label: string;
  min_age: number;
  max_age: number;
}

export interface Theme {
  id: string;
  name: string;
  icon: string;
  color?: string;
  category?: string[];
  icon_svg_url?: string;
  icon_png_url?: string;
  sort_order?: number;
}

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  age: number;
  category_preference: string;
  avatar_url?: string;
  created_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  meditation_id: string;
  completed_at: string;
  progress_seconds: number;
  is_completed: boolean;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  preferred_age_group: string;
  language?: string;
  notification_settings: {
    daily_reminder: boolean;
    streak_celebration: boolean;
    new_content: boolean;
  };
}

export interface UserSubscription {
  id: string;
  user_id: string;
  is_active: boolean;
  plan_type: 'free' | 'monthly' | 'yearly';
  expires_at?: string;
}

// UI State types
export interface FilterState {
  selectedCategory: string | null;
  selectedContentCategories: string[];
  selectedAgeGroup: string | null;
  selectedThemes: string[];
  searchQuery: string;
}

export interface PlayerState {
  currentMeditation: Meditation | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isLoading: boolean;
}

export interface ProgressStats {
  currentStreak: number;
  totalMeditations: number;
  totalMinutes: number;
  weeklyActivity: { date: string; minutes: number }[];
  achievements: string[];
}