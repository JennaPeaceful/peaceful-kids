import { Lock, Play, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Meditation } from '../types';
import { useUserStore } from '../stores/userStore';
import { useMeditationStore } from '../stores/meditationStore';
import AudioWaveform from './AudioWaveform';

interface MeditationCardProps {
  meditation: Meditation;
  onPlay?: () => void;
}

const MeditationCard = ({ meditation, onPlay }: MeditationCardProps) => {
  const navigate = useNavigate();
  const { subscription } = useUserStore();
  const { setCurrentMeditation, updateRecentMeditations } = useMeditationStore();
  
  const isLocked = !meditation.is_free && !subscription?.is_active;
  const duration = Math.round(meditation.duration / 60);

  const handlePlay = () => {
    if (isLocked) return;
    setCurrentMeditation(meditation);
    updateRecentMeditations(meditation);
    navigate(`/meditation/${meditation.id}`);
    onPlay?.();
  };

  return (
    <div className={`relative card-gradient p-4 transition-all duration-300 hover:scale-105 ${isLocked ? 'card-premium' : ''}`}>
      {/* Thumbnail */}
      <div className="relative mb-3 rounded-xl overflow-hidden">
        <img 
          src={meditation.thumbnail} 
          alt={meditation.title}
          className="w-full h-32 object-cover"
        />
        
        {/* Play button overlay */}
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <button
            onClick={handlePlay}
            className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
              isLocked 
                ? 'bg-warning/80 text-warning-foreground' 
                : 'bg-primary/80 text-primary-foreground hover:bg-primary hover:scale-110'
            }`}
            disabled={isLocked}
          >
            {isLocked ? <Lock className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
        </div>
        
        {/* Premium badge */}
        {!meditation.is_free && (
          <div className="absolute top-2 right-2 bg-warning text-warning-foreground px-2 py-1 rounded-full text-xs font-bold">
            Premium
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-2">
        <h3 className="font-bold text-base leading-tight line-clamp-2">
          {meditation.title}
        </h3>
        
        <p className="text-sm text-muted-foreground line-clamp-2">
          {meditation.description}
        </p>
        
        {/* Audio Waveform */}
        <div className="py-2">
          <AudioWaveform
            audioUrl={meditation.media_url}
            height={24}
            barWidth={1}
            barGap={1}
            className="opacity-60"
          />
        </div>
        
        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{duration} min</span>
          </div>
          
          <div className="flex gap-1">
            {meditation.themes.slice(0, 2).map((theme) => (
              <span 
                key={theme}
                className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium"
              >
                {theme}
              </span>
            ))}
          </div>
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