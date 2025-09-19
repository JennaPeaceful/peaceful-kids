import { create } from 'zustand';
import { Meditation, FilterState, PlayerState } from '../types';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

interface MeditationState {
  meditations: Meditation[];
  filteredMeditations: Meditation[];
  recentMeditations: Meditation[];
  recommendedMeditations: Meditation[];
  filters: FilterState;
  player: PlayerState;
  isLoading: boolean;
  
  // Actions
  fetchMeditations: () => Promise<void>;
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

// Helper function to transform Supabase data to app format
const transformMeditation = (dbMeditation: Tables<'meditations'>): Meditation => ({
  id: dbMeditation.id,
  title: dbMeditation.title,
  description: dbMeditation.description || '',
  thumbnail: dbMeditation.thumbnail_url || '/api/placeholder/300/200',
  duration: dbMeditation.duration || 0,
  media_url: dbMeditation.media_url || '',
  media_type: (dbMeditation.media_type as 'audio' | 'video') || 'audio',
  is_free: dbMeditation.is_free || false,
  category: (dbMeditation.category as 'Kids' | 'Adults') || 'Kids',
  age_group: dbMeditation.age_group || '',
  themes: dbMeditation.themes || [],
  created_at: dbMeditation.created_at || '',
  sort_order: dbMeditation.sort_order || 0,
});

export const useMeditationStore = create<MeditationState>((set, get) => ({
  meditations: [],
  filteredMeditations: [],
  recentMeditations: [],
  recommendedMeditations: [],
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
  
  applyFilters: () => {
    const { meditations, filters } = get();
    let filtered = [...meditations];
    
    if (filters.selectedCategory) {
      filtered = filtered.filter(m => m.category === filters.selectedCategory);
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
}));