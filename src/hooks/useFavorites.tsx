import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

export const useFavorites = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all user's favorites
  const { data: favorites, isLoading } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_favorites')
        .select('meditation_id')
        .eq('user_id', user.id);

      if (error) throw error;
      return data?.map(f => f.meditation_id) || [];
    },
    enabled: !!user?.id,
  });

  // Add favorite
  const addFavorite = useMutation({
    mutationFn: async (meditationId: string) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_favorites')
        .insert({ user_id: user.id, meditation_id: meditationId });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
      toast({
        title: 'Added to favorites',
      });
    },
    onError: (error) => {
      console.error('[Favorites] Add error:', error);
      toast({
        title: 'Failed to add to favorites',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    },
  });

  // Remove favorite
  const removeFavorite = useMutation({
    mutationFn: async (meditationId: string) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('meditation_id', meditationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
      toast({
        title: 'Removed from favorites',
      });
    },
    onError: (error) => {
      console.error('[Favorites] Remove error:', error);
      toast({
        title: 'Failed to remove from favorites',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    },
  });

  const toggleFavorite = (meditationId: string) => {
    if (favorites?.includes(meditationId)) {
      removeFavorite.mutate(meditationId);
    } else {
      addFavorite.mutate(meditationId);
    }
  };

  const isFavorite = (meditationId: string) => {
    return favorites?.includes(meditationId) || false;
  };

  return {
    favorites: favorites || [],
    isLoading,
    toggleFavorite,
    isFavorite,
  };
};
