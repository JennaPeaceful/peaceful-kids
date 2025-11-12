// Data models for Peaceful Kids meditation app

export interface CourseModule {
  id: string;
  course_name: string;
  module_number: number;
  title: string;
  description?: string;
  sort_order?: number;
  created_at?: string;
}

export interface Meditation {
  id: string;
  title: string;
  public_title?: string;
  description: string;
  transcript?: string;
  thumbnail: string;
  thumbnail_url?: string;
  duration: number; // in seconds
  media_url: string;
  media_type: 'audio' | 'video' | 'pdf' | 'text';
  image_url?: string; // Pre-converted image URL for PDFs
  is_free: boolean;
  category: string;
  age_group: string;
  themes: string[];
  content_categories?: string[];
  courses?: string | null;
  module?: number | null;
  lecture?: number | null;
  module_id?: string | null;
  course_module?: CourseModule; // Joined data
  created_at: string;
  sort_order: number;
  featured_for_plan?: string[]; // Array of plan types: 'free', 'peace_plan', 'peace_plus_plan'
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
  plan_type: 'free' | 'peace_plan' | 'peace_plus_plan';
  expires_at?: string;
}

// UI State types
export interface FilterState {
  selectedCategory: string | null;
  selectedCourses: string[];
  selectedModule: number | null;
  selectedAgeGroup: string | null;
  selectedThemes: string[];
  selectedContentCategories: string[];
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