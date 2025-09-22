import { useEffect, useRef } from 'react';

interface AudioWaveformProps {
  audioUrl?: string;
  isPlaying?: boolean;
  currentTime?: number;
  duration?: number;
  height?: number;
  barWidth?: number;
  barGap?: number;
  className?: string;
  onClick?: (time: number) => void;
}

const AudioWaveform = ({
  audioUrl,
  isPlaying = false,
  currentTime = 0,
  duration = 0,
  height = 40,
  barWidth = 2,
  barGap = 1,
  className = '',
  onClick,
}: AudioWaveformProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  // Mock waveform data - in a real app, you'd generate this from the audio file
  const generateMockWaveform = (length: number = 50) => {
    return Array.from({ length }, () => Math.random() * 0.8 + 0.2);
  };

  const waveformData = generateMockWaveform();
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleWaveformClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!onClick || duration === 0) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickPercentage = clickX / rect.width;
    const clickTime = clickPercentage * duration;
    
    onClick(clickTime);
  };

  return (
    <div className={`relative ${className}`}>
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="metadata"
          style={{ display: 'none' }}
        />
      )}
      
      <div
        className="flex items-center gap-px cursor-pointer"
        style={{ height: `${height}px` }}
        onClick={handleWaveformClick}
      >
        {waveformData.map((amplitude, index) => {
          const barHeight = amplitude * height;
          const isPlayed = (index / waveformData.length) * 100 <= progress;
          
          return (
            <div
              key={index}
              className={`transition-all duration-150 ${
                isPlayed 
                  ? 'bg-primary' 
                  : 'bg-muted-foreground/30'
              } ${isPlaying && isPlayed ? 'animate-pulse' : ''}`}
              style={{
                width: `${barWidth}px`,
                height: `${barHeight}px`,
                minHeight: '2px',
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default AudioWaveform;