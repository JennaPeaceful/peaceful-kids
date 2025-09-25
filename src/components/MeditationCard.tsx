import { Lock, Play, Pause, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Meditation } from '../types';
import { useUserStore } from '../stores/userStore';
import { useMeditationStore } from '../stores/meditationStore';
import AudioWaveform from './AudioWaveform';
import { useState, useRef } from 'react';

interface MeditationCardProps {
  meditation: Meditation;
  onPlay?: () => void;
}

const MeditationCard = ({ meditation, onPlay }: MeditationCardProps) => {
  const navigate = useNavigate();
  const { subscription } = useUserStore();
  const { setCurrentMeditation, updateRecentMeditations } = useMeditationStore();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Temporarily disabled for development
  const isLocked = false; // !meditation.is_free && !subscription?.is_active;
  const isAudio = meditation.media_type === 'audio';

  const togglePlayback = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card navigation
    if (isLocked) return;
    
    const mediaElement = isAudio ? audioRef.current : videoRef.current;
    if (!mediaElement) return;

    if (isPlaying) {
      mediaElement.pause();
    } else {
      mediaElement.play();
      setCurrentMeditation(meditation);
      updateRecentMeditations(meditation);
    }
    setIsPlaying(!isPlaying);
    onPlay?.();
  };

  const handleTimeUpdate = () => {
    const mediaElement = isAudio ? audioRef.current : videoRef.current;
    if (mediaElement) {
      setCurrentTime(mediaElement.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    const mediaElement = isAudio ? audioRef.current : videoRef.current;
    if (mediaElement) {
      setDuration(mediaElement.duration);
    }
  };

  const handleWaveformClick = (time: number) => {
    if (isLocked || !audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleCardClick = () => {
    navigate(`/meditation/${meditation.id}`);
  };

  return (
    <div 
      className={`relative card-gradient p-4 transition-all duration-300 hover:scale-105 cursor-pointer ${isLocked ? 'card-premium' : ''}`}
      onClick={handleCardClick}
    >
      {/* Media Player */}
      <div className="relative mb-3 rounded-xl overflow-hidden">
        {isAudio ? (
          <div className="relative">
            <img 
              src={meditation.thumbnail_url || meditation.thumbnail} 
              alt={meditation.title}
              className="w-full h-32 object-cover"
            />
            <audio
              ref={audioRef}
              src={meditation.media_url}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </div>
        ) : (
          <video
            ref={videoRef}
            src={meditation.media_url}
            className="w-full h-32 object-cover"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            controls={!isLocked}
          />
        )}
        
        {/* Play button overlay for audio */}
        {isAudio && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <button
              onClick={togglePlayback}
              className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                isLocked 
                  ? 'bg-warning/80 text-warning-foreground' 
                  : 'bg-primary/80 text-primary-foreground hover:bg-primary hover:scale-110'
              }`}
              disabled={isLocked}
            >
              {isLocked ? (
                <Lock className="w-5 h-5" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </button>
          </div>
        )}
        
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
        
        {/* Audio Waveform for audio content */}
        {isAudio && (
          <div className="py-2" onClick={(e) => e.stopPropagation()}>
            <AudioWaveform
              audioUrl={meditation.media_url}
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
              height={24}
              barWidth={1}
              barGap={1}
              className="opacity-60"
              onClick={handleWaveformClick}
            />
          </div>
        )}
        
        {/* Themes */}
        <div className="flex gap-1 justify-end">
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