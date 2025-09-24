import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, SkipBack, SkipForward, ArrowLeft, Heart, Share, Lock, AlertCircle } from 'lucide-react';
import { useMeditationStore } from '../stores/meditationStore';
import { useProgressStore } from '../stores/progressStore';
import { useUserStore } from '../stores/userStore';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { toast } from '../hooks/use-toast';
import AudioWaveform from '../components/AudioWaveform';

const MeditationPlayer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { meditations, player, setCurrentMeditation, setPlaying, setCurrentTime, fetchMeditations } = useMeditationStore();
  const { completeSession } = useProgressStore();
  const { subscription } = useUserStore();
  
  // Media state
  const [localCurrentTime, setLocalCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canPlay, setCanPlay] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const meditation = meditations.find(m => m.id === id);
  // Temporarily disabled for development
  const isLocked = false; // meditation && !meditation.is_free && !subscription?.is_active;
  const isAudio = meditation?.media_type === 'audio';

  useEffect(() => {
    // Fetch meditations if not loaded yet
    if (meditations.length === 0) {
      fetchMeditations();
    }
  }, [meditations.length, fetchMeditations]);

  // Test media URL accessibility
  useEffect(() => {
    if (meditation?.media_url) {
      console.log('Testing media URL accessibility:', meditation.media_url);
      
      // Test if we can access the media URL
      fetch(meditation.media_url, { 
        method: 'HEAD',
        mode: 'no-cors' // Try no-cors first to avoid CORS issues
      })
      .then(() => console.log('Media URL is accessible'))
      .catch((err) => {
        console.error('Media URL test failed:', err);
        console.log('This might indicate CORS issues or the file doesn\'t exist');
      });
    }
  }, [meditation?.media_url]);

  // Media event handlers
  const handleLoadStart = () => {
    setIsLoading(true);
    setError(null);
    setCanPlay(false);
    console.log(`Starting to load ${isAudio ? 'audio' : 'video'}:`, meditation?.media_url);
  };

  const handleCanPlay = () => {
    setIsLoading(false);
    setCanPlay(true);
    const mediaElement = isAudio ? audioRef.current : videoRef.current;
    if (mediaElement && mediaElement.duration) {
      setDuration(mediaElement.duration);
    }
  };

  const handleLoadedMetadata = () => {
    const mediaElement = isAudio ? audioRef.current : videoRef.current;
    if (mediaElement && mediaElement.duration) {
      setDuration(mediaElement.duration);
    }
  };

  const handleTimeUpdate = () => {
    const mediaElement = isAudio ? audioRef.current : videoRef.current;
    if (mediaElement) {
      const currentTime = mediaElement.currentTime;
      setLocalCurrentTime(currentTime);
      setCurrentTime(currentTime);
      
      // Check if meditation is completed (within 2 seconds of end)
      if (duration > 0 && currentTime >= duration - 2 && !isCompleted) {
        handleMediaComplete();
      }
    }
  };

  const handleMediaComplete = () => {
    setIsCompleted(true);
    setPlaying(false);
    if (meditation) {
      completeSession(meditation.id, duration);
      toast({
        title: "Meditation Complete! 🎉",
        description: "Great job! You've completed another mindful session.",
      });
    }
  };

  const handleError = (e: any) => {
    const errorDetails = {
      type: e.target?.tagName,
      error: e.target?.error,
      networkState: e.target?.networkState,
      readyState: e.target?.readyState,
      src: e.target?.src,
      currentSrc: e.target?.currentSrc
    };
    console.error('Media error details:', errorDetails);
    
    setIsLoading(false);
    const mediaType = isAudio ? 'audio' : 'video';
    
    // Try fallback demo content for development
    if (meditation && !meditation.media_url.includes('demo-content')) {
      console.log('Media file not found, trying demo content...');
      const demoUrl = isAudio 
        ? 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
        : 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
      
      const mediaElement = isAudio ? audioRef.current : videoRef.current;
      if (mediaElement) {
        mediaElement.src = demoUrl;
        mediaElement.load();
        toast({
          title: "Using Demo Content",
          description: `Original ${mediaType} file not found, playing demo content instead.`,
        });
        return;
      }
    }
    
    setError(`${mediaType} file not found (404). The content may not be uploaded to the CDN yet.`);
    setPlaying(false);
  };

  const handleEnded = () => {
    handleMediaComplete();
  };

  // Cleanup function
  useEffect(() => {
    return () => {
      // Cleanup media on unmount
      const audioEl = audioRef.current;
      const videoEl = videoRef.current;
      
      if (audioEl) {
        audioEl.pause();
        audioEl.src = '';
      }
      if (videoEl) {
        videoEl.pause();
        videoEl.src = '';
      }
      setPlaying(false);
    };
  }, []);

  if (!meditation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Meditation not found</h2>
          <Button onClick={() => navigate('/meditations')}>
            Browse Meditations
          </Button>
        </div>
      </div>
    );
  }

  const handlePlayPause = async () => {
    if (isLocked) {
      toast({
        title: "Premium Required",
        description: "Upgrade to premium to access this meditation.",
        variant: "destructive",
      });
      return;
    }
    
    if (!canPlay) {
      toast({
        title: "Media Loading",
        description: "Please wait for the meditation to load completely.",
      });
      return;
    }
    
    const mediaElement = isAudio ? audioRef.current : videoRef.current;
    if (!mediaElement) return;
    
    try {
      if (player.isPlaying) {
        mediaElement.pause();
      } else {
        // Request wake lock to keep screen active during playback
        if ('wakeLock' in navigator) {
          try {
            await (navigator as any).wakeLock.request('screen');
          } catch (err) {
            // Wake lock not supported or denied
            console.log('Wake lock not available');
          }
        }
        
        const playPromise = mediaElement.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error('Playback failed:', error);
            setError('Playback failed. Please try again.');
            setPlaying(false);
          });
        }
      }
    } catch (error) {
      console.error('Playback error:', error);
      setError('Playback failed. Please try again.');
      setPlaying(false);
    }
  };

  const handleSkip = (seconds: number) => {
    if (isLocked || !canPlay) return;
    const mediaElement = isAudio ? audioRef.current : videoRef.current;
    if (!mediaElement) return;
    
    const newTime = Math.max(0, Math.min(mediaElement.currentTime + seconds, duration));
    mediaElement.currentTime = newTime;
  };

  const handleWaveformClick = (time: number) => {
    if (isLocked || !canPlay) return;
    const mediaElement = isAudio ? audioRef.current : videoRef.current;
    if (!mediaElement) return;
    
    mediaElement.currentTime = time;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 rounded-full"
          >
            <Heart className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 rounded-full"
          >
            <Share className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Media Elements */}
      {isAudio ? (
        <audio
          ref={audioRef}
          src={meditation.media_url}
          crossOrigin="anonymous"
          onLoadStart={() => {
            console.log('Loading audio from:', meditation.media_url);
            handleLoadStart();
          }}
          onCanPlay={handleCanPlay}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={handleEnded}
          onError={handleError}
          preload="metadata"
          className="hidden"
        />
      ) : (
        <video
          ref={videoRef}
          src={meditation.media_url}
          crossOrigin="anonymous"
          onLoadStart={() => {
            console.log('Loading video from:', meditation.media_url);
            handleLoadStart();
          }}
          onCanPlay={handleCanPlay}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={handleEnded}
          onError={handleError}
          preload="metadata"
          className="hidden"
        />
      )}

      {/* Error State */}
      {error && (
        <div className="mx-4 mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => {
              setError(null);
              const mediaElement = isAudio ? audioRef.current : videoRef.current;
              if (mediaElement) {
                mediaElement.load();
              }
            }}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col items-center px-6 pb-8">
        {/* Meditation Image */}
        <div className="relative w-80 h-80 mb-8">
          <img
            src={meditation.thumbnail || '/api/placeholder/300/300'}
            alt={meditation.title}
            className="w-full h-full object-cover rounded-3xl shadow-2xl"
            onError={(e) => {
              console.warn('Thumbnail failed to load, using placeholder');
              e.currentTarget.src = '/api/placeholder/300/300';
            }}
          />
          
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-black/60 rounded-3xl flex items-center justify-center">
              <div className="text-center text-white">
                <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-sm">Loading meditation...</p>
              </div>
            </div>
          )}
          
          {/* Lock Overlay */}
          {isLocked && (
            <div className="absolute inset-0 bg-black/60 rounded-3xl flex items-center justify-center">
              <div className="text-center text-white">
                <Lock className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">Premium Required</h3>
                <p className="text-sm opacity-90 mb-4">
                  Upgrade to access this meditation
                </p>
                <Button className="btn-premium">
                  Unlock Premium
                </Button>
              </div>
            </div>
          )}
          
          {/* Floating Animation for Free Content */}
          {!isLocked && player.isPlaying && (
            <div className="absolute inset-0 rounded-3xl animate-pulse-celebration" 
                 style={{ 
                   boxShadow: '0 0 40px rgba(139, 69, 255, 0.3)' 
                 }} 
            />
          )}
        </div>

        {/* Meditation Info */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">{meditation.title}</h1>
          <p className="text-muted-foreground mb-4 max-w-sm">
            {meditation.description}
          </p>
          
          {/* Themes */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {meditation.themes.map((theme) => (
              <span 
                key={theme}
                className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium"
              >
                {theme}
              </span>
            ))}
          </div>
        </div>

        {/* Audio Waveform */}
        <div className="w-full max-w-md mb-6">
          <AudioWaveform
            audioUrl={meditation.media_url}
            isPlaying={player.isPlaying && !isLocked && canPlay}
            currentTime={localCurrentTime}
            duration={duration}
            height={60}
            barWidth={3}
            barGap={1}
            onClick={handleWaveformClick}
            className="mb-2"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formatTime(localCurrentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 mb-8">
          <Button
            variant="ghost"
            size="lg"
            onClick={() => handleSkip(-30)}
            disabled={isLocked || !canPlay}
            className="w-12 h-12 rounded-full"
          >
            <SkipBack className="w-6 h-6" />
          </Button>

          <Button
            onClick={handlePlayPause}
            className="w-20 h-20 rounded-full btn-hero flex items-center justify-center"
            disabled={isLocked || (!canPlay && !isLoading)}
          >
            {isLoading ? (
              <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
            ) : player.isPlaying ? (
              <Pause className="w-8 h-8" />
            ) : (
              <Play className="w-8 h-8 ml-1" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="lg"
            onClick={() => handleSkip(30)}
            disabled={isLocked || !canPlay}
            className="w-12 h-12 rounded-full"
          >
            <SkipForward className="w-6 h-6" />
          </Button>
        </div>

        {/* Completion Celebration */}
        {isCompleted && (
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce-gentle">🎉</div>
            <h2 className="text-xl font-bold text-gradient-primary mb-2">
              Meditation Complete!
            </h2>
            <p className="text-muted-foreground mb-6">
              You've added {Math.round(duration / 60)} mindful minutes to your day
            </p>
            <div className="flex gap-3">
              <Button onClick={() => navigate('/tracking')} className="btn-soft">
                View Progress
              </Button>
              <Button onClick={() => navigate('/meditations')} variant="outline">
                Find Another
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeditationPlayer;
