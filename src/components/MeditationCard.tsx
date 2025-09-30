import { Lock, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Meditation } from '../types';
import { useUserStore } from '../stores/userStore';
import { useFavorites } from '../hooks/useFavorites';
import { useMeditationStore } from '../stores/meditationStore';

interface MeditationCardProps {
  meditation: Meditation;
  onPlay?: () => void;
}

const MeditationCard = ({ meditation, onPlay }: MeditationCardProps) => {
  const navigate = useNavigate();
  const { subscription } = useUserStore();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { themes } = useMeditationStore();
  
  // Temporarily disabled for development
  const isLocked = false; // !meditation.is_free && !subscription?.is_active;
  const isFav = isFavorite(meditation.id);

  // Get theme objects with icons for this meditation
  const meditationThemes = meditation.themes
    .map(themeName => themes.find(t => t.name === themeName))
    .filter(Boolean)
    .slice(0, 3);

  const handleCardClick = () => {
    navigate(`/meditation/${meditation.id}`);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(meditation.id);
  };

  return (
    <div 
      className={`relative card-gradient p-3 transition-all duration-300 hover:scale-[1.02] cursor-pointer aspect-square ${isLocked ? 'card-premium' : ''}`}
      onClick={handleCardClick}
    >
      {/* Thumbnail Image */}
      <div className="relative mb-3 rounded-xl overflow-hidden aspect-square">
        <img 
          src={meditation.thumbnail_url || meditation.thumbnail} 
          alt={meditation.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Show placeholder if image fails to load
            const target = e.target as HTMLImageElement;
            if (!target.src.includes('data:')) {
              target.src = 'data:image/svg+xml;base64,' + btoa(`
                <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style="stop-color:hsl(var(--primary));stop-opacity:0.2" />
                      <stop offset="100%" style="stop-color:hsl(var(--secondary));stop-opacity:0.4" />
                    </linearGradient>
                  </defs>
                  <rect width="200" height="200" fill="url(#grad)" />
                  <text x="100" y="100" font-family="system-ui" font-size="20" fill="hsl(var(--muted-foreground))" text-anchor="middle" dy=".3em">🧘‍♀️</text>
                </svg>
              `);
            }
          }}
        />
        
        {/* Favorite button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 left-2 w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-colors z-10"
          aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart 
            className={`w-4 h-4 transition-colors ${
              isFav ? 'fill-primary text-primary' : 'text-muted-foreground'
            }`}
          />
        </button>

        {/* Premium badge */}
        {!meditation.is_free && (
          <div className="absolute top-2 right-2 bg-warning text-warning-foreground px-2 py-1 rounded-full text-xs font-bold">
            Premium
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-1.5">
        <h3 className="font-bold text-sm leading-tight line-clamp-2 min-h-[2.5rem]">
          {meditation.public_title || meditation.title}
        </h3>
        
        <p className="text-xs text-muted-foreground line-clamp-2">
          {meditation.description}
        </p>
        
        {/* Themes - Icon Grid */}
        <div className="flex flex-wrap gap-1">
          {meditationThemes.map((theme) => (
            theme && (
              <div
                key={theme.id}
                className="w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center"
                title={theme.name}
              >
                {theme.icon_svg_url ? (
                  <img 
                    src={theme.icon_svg_url} 
                    alt={theme.name}
                    className="w-4 h-4"
                  />
                ) : (
                  <span className="text-xs">🧘</span>
                )}
              </div>
            )
          ))}
        </div>
      </div>
      
      {/* Lock overlay for locked content */}
      {isLocked && (
        <div className="absolute inset-0 bg-warning/5 rounded-2xl border-2 border-warning/20 flex items-center justify-center">
          <div className="text-center p-4">
            <Lock className="w-8 h-8 text-warning mx-auto mb-2" />
            <p className="text-sm font-semibold text-warning">Premium Only</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeditationCard;