import { create } from 'zustand';
import { Meditation, FilterState, PlayerState } from '../types';
import { supabase } from '@/integrations/supabase/client';

interface MeditationState {
  meditations: Meditation[];
  filteredMeditations: Meditation[];
  recentMeditations: Meditation[];
  recommendedMeditations: Meditation[];
  contentCategories: string[];
  themes: Array<{id: string; name: string; icon: string; color: string; category: string[]; icon_svg_url?: string; icon_png_url?: string; sort_order?: number}>;
  ageGroups: string[];
  filters: FilterState;
  player: PlayerState;
  isLoading: boolean;
  
  // Actions
  fetchMeditations: () => Promise<void>;
  fetchContentCategories: () => Promise<void>;
  initializeThemes: () => void;
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
  selectedContentCategories: [],
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
  description: dbMeditation.description || '',
  thumbnail: dbMeditation.thumbnail_url || '/api/placeholder/300/200',
  thumbnail_url: dbMeditation.thumbnail_url || '/api/placeholder/300/200',
  duration: dbMeditation.duration || 0,
  media_url: dbMeditation.media_url || '',
  media_type: (dbMeditation.media_type as 'audio' | 'video') || 'audio',
  is_free: dbMeditation.is_free || false,
  category: (dbMeditation.category as 'Kids' | 'Adults') || 'Kids',
  age_group: dbMeditation.age_group || '',
  themes: dbMeditation.themes || [],
  content_categories: dbMeditation.content_categories || [],
  created_at: dbMeditation.created_at || '',
  sort_order: dbMeditation.sort_order || 0,
});

export const useMeditationStore = create<MeditationState>((set, get) => ({
  meditations: [],
  filteredMeditations: [],
  recentMeditations: [],
  recommendedMeditations: [],
  contentCategories: [],
  themes: [],
  ageGroups: [],
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
        recommendedMeditations: meditations.filter(m => m.category === 'Kids' && m.age_group === '6-8 years').slice(0, 4),
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
      
      // Fetch additional data
      await get().fetchContentCategories();
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
  
  fetchContentCategories: async () => {
    try {
      const { data, error } = await supabase
        .from('meditations')
        .select('content_categories')
        .not('content_categories', 'is', null);

      if (error) throw error;

      const categories = [...new Set(data.flatMap((row: any) => row.content_categories || []))];
      set({ contentCategories: categories });
    } catch (error) {
      console.error('Error fetching content categories:', error);
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
    
    if (filters.selectedCategory) {
      filtered = filtered.filter(m => m.category === filters.selectedCategory);
    }
    
    if (filters.selectedContentCategories.length > 0) {
      filtered = filtered.filter(m => 
        m.content_categories?.some(cat => filters.selectedContentCategories.includes(cat))
      );
    }
    
    if (filters.selectedAgeGroup) {
      filtered = filtered.filter(m => m.age_group === filters.selectedAgeGroup);
    }
    
    if (filters.selectedThemes.length > 0) {
      filtered = filtered.filter(m => 
        m.themes.some(theme => filters.selectedThemes.includes(theme)) ||
        m.content_categories?.some(cat => filters.selectedThemes.includes(cat))
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
}));