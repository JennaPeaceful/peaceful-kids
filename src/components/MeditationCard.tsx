import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Meditation } from '../types';
import { useUserStore } from '../stores/userStore';
import { useMeditationStore } from '../stores/meditationStore';
import { useAuth } from '../hooks/useAuth';
import logo from '../assets/logo.svg';

interface MeditationCardProps {
  meditation: Meditation;
  onPlay?: () => void;
}

const MeditationCard = ({ meditation, onPlay }: MeditationCardProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { subscription } = useUserStore();
  const { themes } = useMeditationStore();
  
  // Temporarily disabled for development
  const isLocked = false; // !meditation.is_free && !subscription?.is_active;

  // Get theme objects with icons for this meditation
  const meditationThemes = meditation.themes
    .map(themeName => themes.find(t => t.name === themeName))
    .filter(Boolean)
    .slice(0, 3);

  const handleCardClick = () => {
    // If meditation is not free
    if (!meditation.is_free) {
      if (!user) {
        // Not signed in -> redirect to profile
        navigate('/profile');
        return;
      } else {
        // Signed in -> redirect to explore
        navigate('/');
        return;
      }
    }
    
    // Free meditation -> go to player
    navigate(`/meditation/${meditation.id}`);
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
            const target = e.target as HTMLImageElement;
            if (!target.src.includes(logo)) {
              target.src = logo;
            }
          }}
        />

        {/* Premium badge */}
        {!meditation.is_free && (
          <div className="absolute top-2 right-2 bg-warning text-warning-foreground px-2 py-1 rounded-full text-xs font-bold">
            {t('meditationCard.premium')}
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
            theme && theme.icon_svg_url && (
              <div
                key={theme.id}
                className="w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center"
                title={theme.name}
              >
                <img 
                  src={theme.icon_svg_url} 
                  alt={theme.name}
                  className="w-4 h-4"
                />
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
            <p className="text-sm font-semibold text-warning">{t('meditationCard.premiumOnly')}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeditationCard;
