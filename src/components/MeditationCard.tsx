import { Lock, Video, Music } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Meditation } from '../types';
import { useUserStore } from '../stores/userStore';
import { useMeditationStore } from '../stores/meditationStore';
import { useAuth } from '../hooks/useAuth';
import categoryBackground from '@/assets/category-icon-background.svg';
import logo from '@/assets/logo.svg';

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
  
  // Check if content is locked - treat inactive subscriptions as 'free' plan
  const effectivePlanType = (subscription?.is_active && subscription?.plan_type) || 'free';
  const isCourse = meditation.category === 'Courses';
  const isLocked = !meditation.is_free && (
    !user || 
    effectivePlanType === 'free' ||
    (effectivePlanType === 'peace_plan' && isCourse)
  );

  // Get theme objects with icons for this meditation
  const meditationThemes = meditation.themes
    .map(themeName => themes.find(t => t.name === themeName))
    .filter(Boolean)
    .slice(0, 3);

  const handleCardClick = () => {
    if (onPlay) {
      onPlay();
      return;
    }
    
    // Check if meditation is free
    if (!meditation.is_free) {
      // If user is not logged in, redirect to explore to see plans
      if (!user) {
        navigate('/explore');
        return;
      }
      
      // Check if user has appropriate plan for this content
      const planType = subscription?.plan_type;
      const isActive = subscription?.is_active;
      
      // Peace Plan only gets audio, Peace Plus gets everything
      if (!isActive || planType === 'free') {
        navigate('/explore');
        return;
      }
      
      // If user has Peace Plan but content is a course, redirect to explore to upgrade
      const isCourse = meditation.category === 'Courses';
      if (planType === 'peace_plan' && isCourse) {
        navigate('/explore');
        return;
      }
    }
    
    // Navigate to meditation player
    navigate(`/meditation/${meditation.id}`);
  };

  return (
    <div 
      className={`relative card-gradient p-3 transition-all duration-300 hover:scale-[1.02] cursor-pointer aspect-square ${isLocked ? 'card-premium' : ''}`}
      onClick={handleCardClick}
    >
      {/* Thumbnail Image */}
      <div className="relative mb-3 rounded-xl overflow-hidden aspect-square">
        {/* Colorful background layer - only for Adult meditations (no age group) with custom thumbnails (not logo) */}
        {!meditation.age_group &&
         (meditation.thumbnail_url || meditation.thumbnail) &&
         !/logo\.svg/i.test(meditation.thumbnail_url || meditation.thumbnail || '') && (
          <img 
            src={categoryBackground}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-70"
          />
        )}
        {/* Thumbnail layer on top */}
        <img 
          src={meditation.thumbnail_url || meditation.thumbnail || logo} 
          alt={meditation.title}
          className="absolute inset-0 w-full h-full object-contain p-4"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = logo;
          }}
        />

        {/* Premium badge - only show if user doesn't have access */}
        {!meditation.is_free && (() => {
          const isActive = subscription?.is_active;
          const planType = subscription?.plan_type;
          const isCourse = meditation.category === 'Courses';
          
          // Don't show badge if user has access
          if (user && isActive && planType !== 'free') {
            // Peace Plus has access to everything
            if (planType === 'peace_plus_plan') return null;
            // Peace Plan has access to meditations (not courses)
            if (planType === 'peace_plan' && !isCourse) return null;
          }
          
          // Show badge if no access
          return (
            <div className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-lg">
              <Lock className="w-3 h-3" />
              {isCourse ? 'Peace Plus' : 'Peace Plan'}
            </div>
          );
        })()}
      </div>

      {/* Content */}
      <div className="space-y-1.5">
        <h3 className="font-bold text-sm leading-tight line-clamp-2 min-h-[2.5rem]">
          {meditation.public_title || meditation.title}
        </h3>
        
        <p className="text-xs text-muted-foreground line-clamp-2">
          {meditation.description}
        </p>
        
        {/* Themes and Media Type Icons */}
        <div className="flex items-center justify-between gap-1">
          {/* Theme Icons - limited to prevent overflow */}
          <div className="flex flex-wrap gap-1 flex-1 min-w-0">
            {meditationThemes.map((theme) => (
              theme && theme.icon_svg_url && (
                <div
                  key={theme.id}
                  className="w-6 h-6 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 rounded-lg flex items-center justify-center flex-shrink-0"
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
          
          {/* Media Type Icon */}
          <div className="flex-shrink-0">
            {meditation.media_type === 'video' ? (
              <Video className="w-5 h-5 text-primary/70" />
            ) : (
              <Music className="w-5 h-5 text-primary/70" />
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default MeditationCard;
