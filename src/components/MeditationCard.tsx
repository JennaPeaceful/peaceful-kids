import { Lock, Video, Music, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Meditation } from '../types';
import { useUserStore } from '../stores/userStore';
import { useMeditationStore } from '../stores/meditationStore';
import { useAuth } from '../hooks/useAuth';
import { getAgeGroupColor } from '@/lib/ageGroupColors';
import { getContentCategoryIcon } from '@/lib/contentCategoryIcons';
import categoryBackground from '@/assets/category-icon-background.svg';
import logo from '@/assets/logo.svg';
import highlyMeditatedCourseSvg from '@/assets/highly-meditated-course.svg';
import introductionHealingArtsSvg from '@/assets/introduction-healing-arts.svg';

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

  // Get theme objects with icons for this meditation (deduped by id)
  const meditationThemes = (() => {
    const seen = new Set<string>();
    const list: Array<NonNullable<typeof themes[number]>> = [] as any;
    for (const themeName of meditation.themes || []) {
      const theme = themes.find(t => t.name === themeName);
      if (theme && !seen.has(theme.id)) {
        seen.add(theme.id);
        list.push(theme);
        if (list.length === 3) break;
      }
    }
    return list;
  })();

  // Map database thumbnail paths to imported assets
  const getThumbnailSrc = () => {
    const thumbnailUrl = meditation.thumbnail_url || meditation.thumbnail;

    // Filter out invalid placeholder URLs
    if (!thumbnailUrl || thumbnailUrl.includes('/api/placeholder')) {
      // Check if meditation has content categories - use category icon
      if (meditation.content_categories && meditation.content_categories.length > 0) {
        const categoryIcon = getContentCategoryIcon(meditation.content_categories[0]);
        if (categoryIcon) {
          return categoryIcon; // Line art SVG - will show on colorful background
        }
      }
      return logo; // Final fallback
    }

    if (thumbnailUrl === '/highly-meditated-course.svg') {
      return highlyMeditatedCourseSvg;
    }
    if (thumbnailUrl === '/introduction-healing-arts.svg') {
      return introductionHealingArtsSvg;
    }
    return thumbnailUrl;
  };

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
        {/* Colorful background layer - for wire icons (NO COLOR in URL), SVGs, and logo fallbacks */}
        {(() => {
          const thumbnailUrl = meditation.thumbnail_url || meditation.thumbnail;
          // Show background if using category icon fallback
          const usingCategoryFallback = (!thumbnailUrl || thumbnailUrl.includes('/api/placeholder'))
            && meditation.content_categories && meditation.content_categories.length > 0;

          return (thumbnailUrl || usingCategoryFallback) &&
            (usingCategoryFallback ||
             /NO.?COLOR/i.test(thumbnailUrl || '') ||
             /\.svg(\?|$)/i.test(thumbnailUrl || '') ||
             /(\/logo\.svg|assets\/logo)/i.test(thumbnailUrl || ''));
        })() && (
          <img
            src={categoryBackground}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-70"
          />
        )}
        {/* Thumbnail layer on top */}
        <img
          src={getThumbnailSrc()}
          alt={meditation.title}
          className="absolute inset-0 w-full h-full object-contain p-4"
          style={
            meditation.age_group && getAgeGroupColor(meditation.age_group)
              ? { filter: `drop-shadow(0 0 0 ${getAgeGroupColor(meditation.age_group)})` }
              : undefined
          }
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = logo;
          }}
        />
        {/* SVG color overlay for age groups */}
        {meditation.age_group && getAgeGroupColor(meditation.age_group) && 
         /NO.?COLOR/i.test(meditation.thumbnail_url || meditation.thumbnail || '') && (
          <div 
            className="absolute inset-0 mix-blend-overlay opacity-60 pointer-events-none"
            style={{ backgroundColor: getAgeGroupColor(meditation.age_group) || undefined }}
          />
        )}

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
        <h3 className="font-bold text-xs leading-tight line-clamp-3 min-h-[3rem]">
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
            ) : meditation.media_type === 'pdf' || meditation.media_type === 'text' ? (
              <FileText className="w-5 h-5 text-primary/70" />
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
