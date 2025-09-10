import { create } from 'zustand';
import { Meditation, FilterState, PlayerState } from '../types';
import { mockMeditations } from '../data/mockData';

interface MeditationState {
  meditations: Meditation[];
  filteredMeditations: Meditation[];
  recentMeditations: Meditation[];
  recommendedMeditations: Meditation[];
  filters: FilterState;
  player: PlayerState;
  
  // Actions
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

export const useMeditationStore = create<MeditationState>((set, get) => ({
  meditations: mockMeditations,
  filteredMeditations: mockMeditations,
  recentMeditations: mockMeditations.slice(0, 3),
  recommendedMeditations: mockMeditations.filter(m => m.category === 'Kids' && m.age_group === '6-8 years').slice(0, 4),
  filters: initialFilters,
  player: initialPlayer,
  
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