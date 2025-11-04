import { useNavigate } from 'react-router-dom';
import { Play, Video } from 'lucide-react';
import { Meditation } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useUserStore } from '../stores/userStore';
import logo from '@/assets/logo.svg';
import categoryBackground from '@/assets/category-icon-background.svg';
import emotionsIcon from '@/assets/emotions.svg';

interface MeditationListItemProps {
  meditation: Meditation;
  onPlay?: () => void;
}

const MeditationListItem = ({ meditation, onPlay }: MeditationListItemProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscription } = useUserStore();

  const isLocked = !meditation.is_free && 
    (!user || !subscription?.is_active || subscription?.plan_type === 'free');

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
        {meditation.courses && (meditation.thumbnail_url || meditation.thumbnail) ? (
          <>
            <img 
              src={categoryBackground}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-70"
            />
            <img 
              src={meditation.thumbnail_url || meditation.thumbnail} 
              alt={meditation.title}
              className="absolute inset-0 w-full h-full object-contain p-3"
            />
          </>
        ) : meditation.thumbnail_url || meditation.thumbnail ? (
          <img
            src={meditation.thumbnail_url || meditation.thumbnail}
            alt={meditation.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = logo;
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="w-6 h-6 text-primary" />
          </div>
        )}
        
        {/* Media type indicator */}
        <div className="absolute bottom-1 right-1">
          {meditation.media_type === 'video' ? (
            <Video className="w-4 h-4 text-white drop-shadow-lg" />
          ) : (
            <Play className="w-4 h-4 text-white drop-shadow-lg" />
          )}
        </div>
      </div>

      {/* Title and Description */}
      <div className="flex-1 text-left min-w-0">
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
          {meditation.title}
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
