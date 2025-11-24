import { useNavigate } from 'react-router-dom';
import { Music, Video, FileText } from 'lucide-react';
import { Meditation } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useUserStore } from '../stores/userStore';
import { getAgeGroupColor } from '@/lib/ageGroupColors';
import { getContentCategoryIcon } from '@/lib/contentCategoryIcons';
import categoryBackground from '@/assets/category-icon-background.svg';
import logo from '@/assets/logo.svg';
import highlyMeditatedCourseSvg from '@/assets/highly-meditated-course.svg';
import introductionHealingArtsSvg from '@/assets/introduction-healing-arts.svg';
import lecturesSvg from '@/assets/lectures.svg';

interface MeditationListItemProps {
  meditation: Meditation;
  onPlay?: () => void;
  courseThumbnail?: string;
}

const MeditationListItem = ({ meditation, onPlay, courseThumbnail }: MeditationListItemProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscription } = useUserStore();

  const isLocked = !meditation.is_free && 
    (!user || !subscription?.is_active || subscription?.plan_type === 'free');

  // Map database thumbnail paths to imported assets
  const getThumbnailSrc = () => {
    // For lectures, use the lectures SVG
    if (meditation.lecture) {
      return lecturesSvg;
    }
    
    // For non-lectures with course thumbnails
    if (courseThumbnail) {
      if (courseThumbnail === '/highly-meditated-course.svg') {
        return highlyMeditatedCourseSvg;
      }
      if (courseThumbnail === '/introduction-healing-arts.svg') {
        return introductionHealingArtsSvg;
      }
      return courseThumbnail;
    }
    
    // For non-lectures, use meditation's own thumbnail
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

  const handleClick = () => {
    if (onPlay) {
      onPlay();
    }
    
    if (isLocked) {
      navigate('/explore');
    } else {
      navigate(`/meditation/${meditation.id}`);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="w-full flex items-center gap-4 p-4 bg-card hover:bg-accent/10 border border-border rounded-xl transition-all group"
    >
      {/* Thumbnail Icon */}
      <div className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
        {/* Colorful background layer - for wire icons (NO COLOR in URL), SVGs, and logo fallbacks */}
        {!meditation.lecture && (() => {
          const thumbnailToCheck = meditation.thumbnail_url || meditation.thumbnail || courseThumbnail;
          // Show background if using category icon fallback
          const usingCategoryFallback = (!thumbnailToCheck || thumbnailToCheck.includes('/api/placeholder'))
            && meditation.content_categories && meditation.content_categories.length > 0;

          return (thumbnailToCheck || usingCategoryFallback) &&
            (usingCategoryFallback ||
             /NO.?COLOR/i.test(thumbnailToCheck) ||
             /\.svg(\?|$)/i.test(thumbnailToCheck) ||
             /(\/logo\.svg|assets\/logo)/i.test(thumbnailToCheck));
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
          className="absolute inset-0 w-full h-full object-contain p-3"
          style={
            meditation.age_group && getAgeGroupColor(meditation.age_group) && !meditation.lecture
              ? { filter: `drop-shadow(0 0 0 ${getAgeGroupColor(meditation.age_group)})` }
              : undefined
          }
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = logo;
          }}
        />
        {/* SVG color overlay for age groups */}
        {!meditation.lecture && (() => {
          const thumbnailToCheck = meditation.thumbnail_url || meditation.thumbnail || courseThumbnail;
          return meditation.age_group && getAgeGroupColor(meditation.age_group) && 
           /NO.?COLOR/i.test(thumbnailToCheck || '');
        })() && (
          <div 
            className="absolute inset-0 mix-blend-overlay opacity-60 pointer-events-none"
            style={{ backgroundColor: getAgeGroupColor(meditation.age_group) || undefined }}
          />
        )}
        
        {/* Media type indicator */}
        <div className="absolute bottom-1 right-1">
          {meditation.media_type === 'video' ? (
            <Video className="w-4 h-4 text-primary/70 drop-shadow-lg" />
          ) : meditation.media_type === 'pdf' || meditation.media_type === 'text' ? (
            <FileText className="w-4 h-4 text-primary/70 drop-shadow-lg" />
          ) : (
            <Music className="w-4 h-4 text-primary/70 drop-shadow-lg" />
          )}
        </div>
      </div>

      {/* Title and Description */}
      <div className="flex-1 text-left min-w-0">
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
          {meditation.public_title || meditation.title}
        </h3>
        {meditation.description && (
          <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
            {meditation.description}
          </p>
        )}
      </div>

      {/* Lock indicator */}
      {isLocked && (
        <div className="flex-shrink-0">
          <div className="px-3 py-1 bg-primary/10 rounded-full">
            <span className="text-xs font-medium text-primary">Premium</span>
          </div>
        </div>
      )}
    </button>
  );
};

export default MeditationListItem;
