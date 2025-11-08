import { create } from 'zustand';
import { Meditation, FilterState, PlayerState, Category } from '../types';
import { supabase } from '@/integrations/supabase/client';

interface MeditationState {
  meditations: Meditation[];
  filteredMeditations: Meditation[];
  recentMeditations: Meditation[];
  recommendedMeditations: Meditation[];
  userMeditationUsage: Array<{ meditation_id: string; updated_at: string }> | null;
  categories: Category[];
  courses: string[];
  themes: Array<{id: string; name: string; icon: string; color: string; category: string[]; icon_svg_url?: string; icon_png_url?: string; sort_order?: number}>;
  ageGroups: string[];
  availableThemes: string[];
  filters: FilterState;
  player: PlayerState;
  isLoading: boolean;
  
  // Actions
  fetchMeditations: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchCourses: () => Promise<void>;
  initializeThemes: () => void;
  fetchUserMeditationUsage: (userId: string) => Promise<void>;
  setMeditations: (meditations: Meditation[]) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  clearFilters: () => void;
  applyFilters: () => void;
  setCurrentMeditation: (meditation: Meditation | null) => void;
  setPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (time: number) => void;
  updateRecentMeditations: (meditation: Meditation) => void;
}

const initialFilters: FilterState = {
  selectedCategory: null,
  selectedCourses: [],
  selectedModules: [],
  selectedAgeGroup: null,
  selectedThemes: [],
  searchQuery: '',
};

const initialPlayer: PlayerState = {
  currentMeditation: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  isLoading: false,
};

// Static themes data based on what we have in the database
const staticThemes = [
  { id: '1df342d1-dcee-4141-ab35-05a5703127c0', name: 'Anger', icon: '😤', color: '#EF4444', category: ['Kids'] },
  { id: '13029b0b-ae20-42e8-8800-5437c8990000', name: 'Anxiety\\Worry', icon: '😰', color: '#F59E0B', category: ['Kids'] },
  { id: 'da784955-5511-4b67-a018-480c25b01fc1', name: 'Bedtime', icon: '🌙', color: '#6366F1', category: ['Kids'] },
  { id: '530b4f09-5c03-4927-9196-d83529776aa2', name: 'Calm', icon: '😌', color: '#10B981', category: ['Kids'] },
  { id: '4543d661-9fd6-46f4-9c3f-00bd7aa9fcae', name: 'Energize', icon: '⚡', color: '#F97316', category: ['Kids'] },
  { id: '8b9e058e-fa8b-4560-b6ea-431e79940b45', name: 'Family Change', icon: '👨‍👩‍👧‍👦', color: '#8B5CF6', category: ['Kids'] },
  { id: '62d57f20-90ce-47b2-a6d6-7be8eebb1b9a', name: 'Focus', icon: '🎯', color: '#3B82F6', category: ['Kids'] },
  { id: '82f1ea88-6589-4470-a188-f8876d74100e', name: 'Frustration', icon: '😣', color: '#DC2626', category: ['Kids'] },
  { id: '587d2eb9-805e-4693-9d71-bb05f88b018e', name: 'Mornings', icon: '🌅', color: '#FCD34D', category: ['Kids'] },
  { id: '38c0299a-86e7-46c8-8270-ba43bda0f11d', name: 'Overwhelm', icon: '🌊', color: '#7C3AED', category: ['Kids'] },
  { id: 'bbdd9303-e271-4b08-a81a-a6493c6e0e07', name: 'Protection', icon: '🛡️', color: '#1E40AF', category: ['Kids'] },
  { id: '3ca63b2d-71eb-471c-a878-ef775343625b', name: 'Reset', icon: '🔄', color: '#0891B2', category: ['Kids'] },
  { id: 'b510f838-3a24-4b0b-8d1c-e5182ae666ad', name: 'Rest', icon: '😴', color: '#9333EA', category: ['Kids'] },
  { id: 'ce81265b-ddb4-4eb4-b7c2-f6af54755cd1', name: 'Sadness', icon: '😢', color: '#64748B', category: ['Kids'] },
  { id: '8849847d-fea3-42f2-bd3a-e6d78231b961', name: 'Scared', icon: '😨', color: '#7C2D12', category: ['Kids'] },
  { id: '9f568eb6-820d-4ab7-b1b4-69d3ab40919f', name: 'Separation Anxiety', icon: '👋', color: '#BE185D', category: ['Kids'] },
  { id: '84906132-9572-46f5-b413-ff90996c12c6', name: 'Stress', icon: '😟', color: '#EA580C', category: ['Kids'] },
  { id: 'e1e4c02e-2017-4697-99a0-47dc114d0ce4', name: 'Transitions', icon: '🚪', color: '#4F46E5', category: ['Kids'] },
  { id: '222d6345-e877-4748-ae5d-c90467db5a4e', name: 'Upset', icon: '😔', color: '#991B1B', category: ['Kids'] },
  { id: '807e7bd8-5def-40b4-b411-e844abb2ed30', name: 'Binaurals', icon: '🎧', color: '#6366F1', category: ['Adults'] },
  { id: '4793c37f-3f0e-4807-9321-7e718c771b83', name: 'Miscellaneous', icon: '📌', color: '#94A3B8', category: ['Adults'] },
  { id: '759e4a6b-6bc6-430a-a9bb-756549190747', name: 'Kid', icon: '👶', color: '#EC4899', category: ['Kids', 'Adults'] },
  { id: '19f70c78-9f26-4171-aad9-70dfed7539d8', name: 'Sports', icon: '⚽', color: '#10B981', category: ['Kids', 'Adults'] }
];

// Helper function to transform Supabase data to app format
const transformMeditation = (dbMeditation: any): Meditation => ({
  id: dbMeditation.id,
  title: dbMeditation.title,
  public_title: dbMeditation.public_title,
  description: dbMeditation.description || '',
  transcript: dbMeditation.transcript || undefined,
  thumbnail: dbMeditation.thumbnail_url || '/api/placeholder/300/200',
  thumbnail_url: dbMeditation.thumbnail_url || '/api/placeholder/300/200',
  duration: dbMeditation.duration || 0,
  media_url: dbMeditation.media_url || '',
  media_type: (dbMeditation.media_type as 'audio' | 'video' | 'pdf') || 'audio',
  is_free: dbMeditation.is_free || false,
  category: dbMeditation.category || 'Kid',
  age_group: dbMeditation.age_group || '',
  themes: dbMeditation.themes || [],
  content_categories: dbMeditation.content_categories || [],
  courses: dbMeditation.courses || null,
  module: dbMeditation.module || null,
  lecture: dbMeditation.lecture || null,
  created_at: dbMeditation.created_at || '',
  sort_order: dbMeditation.sort_order || 0,
});

export const useMeditationStore = create<MeditationState>((set, get) => ({
  meditations: [],
  filteredMeditations: [],
  recentMeditations: [],
  recommendedMeditations: [],
  userMeditationUsage: null,
  categories: [],
  courses: [],
  themes: [],
  ageGroups: [],
  availableThemes: [],
  filters: initialFilters,
  player: initialPlayer,
  isLoading: false,
  
  fetchMeditations: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('meditations')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;

      const meditations = data.map(transformMeditation);
      set({ 
        meditations,
        filteredMeditations: meditations,
        recentMeditations: meditations.slice(0, 3),
        recommendedMeditations: meditations.filter(m => m.category === 'Kid' && m.age_group === 'Ages 6-8').slice(0, 4),
        isLoading: false 
      });
      
      // Extract unique age groups from meditations and sort them
      const uniqueAgeGroups = [...new Set(meditations.map(m => m.age_group).filter(Boolean))];
      const sortedAgeGroups = uniqueAgeGroups.sort((a, b) => {
        // Define age order priority
        const ageOrder = [
          'Ages 3-5', 'Ages 3-8', 'Ages 6-8', 'Ages 9-12', 
          'Ages 9-17', 'Ages 13-17', 'All Ages'
        ];
        return ageOrder.indexOf(a) - ageOrder.indexOf(b);
      });
      set({ ageGroups: sortedAgeGroups });
      
      // Extract unique themes from meditations
      const allThemes = meditations.flatMap(m => m.themes || []);
      const uniqueThemes = [...new Set(allThemes)].sort();
      set({ availableThemes: uniqueThemes });
      
      // Fetch additional data
      await get().fetchCategories();
      await get().fetchCourses();
      await get().initializeThemes();
      
      // Apply current filters if any
      get().applyFilters();
    } catch (error) {
      console.error('Error fetching meditations:', error);
      set({ isLoading: false });
    }
  },

  setMeditations: (meditations) => set({ meditations }),
  
  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    }));
    get().applyFilters();
  },
  
  clearFilters: () => {
    set({ filters: initialFilters });
    get().applyFilters();
  },

  fetchCategories: async () => {
    try {
      const { data, error } = await supabase
        .from('categories' as any)
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      
      const categories = (data || []).map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        display_name: cat.display_name,
        thumbnail_png_url: cat.thumbnail_png_url,
        thumbnail_svg_url: cat.thumbnail_svg_url,
        sort_order: cat.sort_order,
        created_at: cat.created_at,
      }));
      
      set({ categories });
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  },
  
  fetchCourses: async () => {
    try {
      const { data, error } = await supabase
        .from('meditations')
        .select('courses')
        .eq('category', 'Courses')
        .not('courses', 'is', null);

      if (error) throw error;

      const courses = [...new Set(data.map((row: any) => row.courses).filter(Boolean))];
      set({ courses });
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  },

  initializeThemes: async () => {
    try {
      const { data, error } = await supabase
        .from('themes')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      set({ themes: data || [] });
    } catch (error) {
      console.error('Error fetching themes:', error);
      // Fallback to static themes if database fetch fails
      set({ themes: staticThemes });
    }
  },

  applyFilters: () => {
    const { meditations, filters } = get();
    let filtered = [...meditations];
    
    // ALWAYS exclude meditations with courses field unless Courses category is explicitly selected
    if (filters.selectedCategory !== 'Courses') {
      filtered = filtered.filter(m => !m.courses && m.category !== 'Courses');
    }
    
    // Apply category filter (skip for "Emotions" which uses themes instead)
    if (filters.selectedCategory && filters.selectedCategory !== 'Emotions' && filters.selectedCategory !== 'Courses') {
      filtered = filtered.filter(m => m.category === filters.selectedCategory);
    }
    
    // If Courses is selected, only show meditations with courses field
    if (filters.selectedCategory === 'Courses') {
      filtered = filtered.filter(m => m.category === 'Courses' || m.courses);
    }

    if (filters.selectedCourses.length > 0) {
      filtered = filtered.filter(m => 
        m.courses && filters.selectedCourses.includes(m.courses)
      );
    }
    
    if (filters.selectedModules.length > 0) {
      filtered = filtered.filter(m => 
        m.module && filters.selectedModules.includes(m.module)
      );
    }
    
    if (filters.selectedAgeGroup) {
      filtered = filtered.filter(m => m.age_group === filters.selectedAgeGroup);
    }
    
    if (filters.selectedThemes.length > 0) {
      filtered = filtered.filter(m => 
        m.themes.some(theme => filters.selectedThemes.includes(theme))
      );
    }
    
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(m =>
        m.title.toLowerCase().includes(query) ||
        m.description.toLowerCase().includes(query) ||
        m.themes.some(theme => theme.toLowerCase().includes(query))
      );
    }
    
    set({ filteredMeditations: filtered });
  },
  
  setCurrentMeditation: (meditation) => 
    set((state) => ({
      player: { ...state.player, currentMeditation: meditation }
    })),
  
  setPlaying: (isPlaying) =>
    set((state) => ({
      player: { ...state.player, isPlaying }
    })),
  
  setCurrentTime: (currentTime) =>
    set((state) => ({
      player: { ...state.player, currentTime }
    })),
    
  updateRecentMeditations: (meditation) => {
    set((state) => {
      const recent = [meditation, ...state.recentMeditations.filter(m => m.id !== meditation.id)].slice(0, 5);
      return { recentMeditations: recent };
    });
  },
  
  fetchUserMeditationUsage: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('meditation_usage')
        .select('meditation_id, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Group by meditation_id and keep only the most recent entry
      const usageMap = new Map<string, string>();
      data?.forEach(item => {
        if (!usageMap.has(item.meditation_id)) {
          usageMap.set(item.meditation_id, item.updated_at);
        }
      });

      const usage = Array.from(usageMap.entries()).map(([meditation_id, updated_at]) => ({
        meditation_id,
        updated_at,
      }));

      set({ userMeditationUsage: usage });
    } catch (error) {
      console.error('Failed to fetch user meditation usage:', error);
      set({ userMeditationUsage: null });
    }
  },
}));