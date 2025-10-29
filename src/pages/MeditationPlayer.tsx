import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, ArrowLeft, Heart, Lock, AlertCircle, Volume2, VolumeX, Maximize, Minimize, ChevronDown, ChevronUp } from 'lucide-react';
import { useMeditationStore } from '../stores/meditationStore';
import { useProgressStore } from '../stores/progressStore';
import { useUserStore } from '../stores/userStore';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Slider } from '../components/ui/slider';
import { toast } from '../hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import Skip10Icon from '@/components/icons/Skip10Icon';
import { ParentalGate } from '@/components/ParentalGate';
import AuthModal from '@/components/AuthModal';
import logoSvg from '@/assets/logo.svg';
import { supabase } from '@/integrations/supabase/client';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { logger } from '@/utils/logger';

// Safe analytics imports - no-op if not available
const trackMeditationPlayed = async (meditationId: string, title: string) => {
  try {
    const { trackMeditationPlayed: track } = await import('@/config/analytics');
    track(meditationId, title);
  } catch {
    // Analytics not available
  }
};

const trackMeditationCompleted = async (meditationId: string, title: string, duration: number) => {
  try {
    const { trackMeditationCompleted: track } = await import('@/config/analytics');
    track(meditationId, title, duration);
  } catch {
    // Analytics not available
  }
};

const trackPaywallViewed = async (source: string) => {
  try {
    const { trackPaywallViewed: track } = await import('@/config/analytics');
    track(source);
  } catch {
    // Analytics not available
  }
};

const trackParentalGatePassed = async () => {
  try {
    const { trackParentalGatePassed: track } = await import('@/config/analytics');
    track();
  } catch {
    // Analytics not available
  }
};

const MeditationPlayer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { meditations, themes, player, setCurrentMeditation, setPlaying, setCurrentTime, fetchMeditations } = useMeditationStore();
  const { completeSession } = useProgressStore();
  const { subscription } = useUserStore();
  const { user } = useAuth();
  const { toggleFavorite, isFavorite } = useFavorites();
  
  // Media state
  const [localCurrentTime, setLocalCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canPlay, setCanPlay] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showParentalGate, setShowParentalGate] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [hasCompletedOnce, setHasCompletedOnce] = useState(false);
  const [usageRecordId, setUsageRecordId] = useState<string | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const meditation = meditations.find(m => m.id === id);
  const isFav = meditation ? isFavorite(meditation.id) : false;
  
  // Premium content gating - treat inactive subscriptions as 'free' plan
  const effectivePlanType = (subscription?.is_active && subscription?.plan_type) || 'free';
  const isCourse = meditation?.category === 'Courses';
  const isLocked = meditation && !meditation.is_free && (
    !user ||
    effectivePlanType === 'free' ||
    (effectivePlanType === 'peace_plan' && isCourse)
  );
  const isAudio = meditation?.media_type === 'audio';

  // Debug logging
  logger.log('[MeditationPlayer] Debug:', {
    meditationId: meditation?.id,
    meditationTitle: meditation?.title,
    isFree: meditation?.is_free,
    category: meditation?.category,
    hasUser: !!user,
    subscriptionActive: subscription?.is_active,
    planType: subscription?.plan_type,
    isCourse,
    isLocked
  });

  useEffect(() => {
    // Fetch meditations if not loaded yet
    if (meditations.length === 0) {
      fetchMeditations();
    }
  }, [meditations.length, fetchMeditations]);

  useEffect(() => {
    if (meditation) {
      setCurrentMeditation(meditation);
      // Handle null duration from database
      setDuration(meditation.duration || 300); // Default to 5 minutes if duration is null
    }
  }, [meditation]); // Removed setCurrentMeditation from dependencies to prevent infinite loop

  // Diagnostic: Log video element properties on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const videoEl = videoRef.current;
      if (videoEl && !isAudio) {
        logger.log('[Video Diagnostics] Video element loaded:', {
          hasControls: videoEl.controls,
          controlsList: videoEl.getAttribute('controlsList'),
          className: videoEl.className,
          touchAction: videoEl.style.touchAction,
          pointerEvents: videoEl.style.pointerEvents
        });
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [meditation, isAudio]);

  // Media event handlers
  const handleLoadStart = () => {
    setIsLoading(true);
    setError(null);
    setCanPlay(false);
    logger.log(`Starting to load ${isAudio ? 'audio' : 'video'}:`, meditation?.media_url);
  };

  const handleCanPlay = () => {
    logger.log('[Video] Can play event fired');
    setIsLoading(false);
    setCanPlay(true);
    const mediaElement = isAudio ? audioRef.current : videoRef.current;
    if (mediaElement && mediaElement.duration) {
      logger.log('[Video] Duration:', mediaElement.duration);
      setDuration(mediaElement.duration);
    }
  };

  const handleLoadedMetadata = () => {
    logger.log('[Video] Loaded metadata event fired');
    const mediaElement = isAudio ? audioRef.current : videoRef.current;
    if (mediaElement && mediaElement.duration) {
      logger.log('[Video] Metadata duration:', mediaElement.duration);
      setDuration(mediaElement.duration);
    }
  };

  const handleTimeUpdate = () => {
    const mediaElement = isAudio ? audioRef.current : videoRef.current;
    if (mediaElement) {
      const currentTime = mediaElement.currentTime;
      setLocalCurrentTime(currentTime);
      setCurrentTime(currentTime);
      
      // Update meditation_usage every 15 seconds
      const now = Date.now();
      if (user && meditation && usageRecordId && now - lastUpdateTimeRef.current > 15000) {
        lastUpdateTimeRef.current = now;
        supabase
          .from('meditation_usage')
          .update({
            duration_seconds: Math.floor(currentTime),
            updated_at: new Date().toISOString(),
          })
          .eq('id', usageRecordId)
          .then(() => {}, () => {});
      }
      
      // Check if meditation is completed (within 2 seconds of end)
      if (duration > 0 && currentTime >= duration - 2 && !isCompleted) {
        handleMediaComplete();
      }
    }
  };

  const handleMediaComplete = async () => {
    if (hasCompletedOnce) return; // Prevent double-firing

    setHasCompletedOnce(true);
    setIsCompleted(true);
    setPlaying(false);
    if (meditation) {
      await completeSession(meditation.id, duration);
      
      // Mark usage as completed
      if (user && usageRecordId) {
        try {
          await supabase
            .from('meditation_usage')
            .update({
              completed: true,
              duration_seconds: Math.floor(duration),
              updated_at: new Date().toISOString(),
            })
            .eq('id', usageRecordId);
        } catch (error) {
          console.error('Failed to mark meditation as completed:', error);
        }
      }
      
      // Invalidate the progress stats query to refresh the tracking page
      queryClient.invalidateQueries({ queryKey: ['progress-stats'] });

      // Track meditation completion in analytics
      trackMeditationCompleted(meditation.id, meditation.title, duration);

      toast({
        title: "Meditation Complete! 🎉",
        description: "Great job! You've completed another mindful session.",
      });
    }
  };

  const handleError = (e: any) => {
    const mediaElement = e.target;
    const errorCode = mediaElement?.error?.code;
    const errorDetails = {
      type: mediaElement?.tagName,
      errorCode: errorCode,
      errorMessage: mediaElement?.error?.message,
      networkState: mediaElement?.networkState,
      readyState: mediaElement?.readyState,
      src: mediaElement?.src,
      currentSrc: mediaElement?.currentSrc
    };
    logger.error('Media error details:', errorDetails);

    setIsLoading(false);
    const mediaType = isAudio ? 'audio' : 'video';

    // More specific error messages based on error code
    let errorMessage = `Unable to load ${mediaType}`;
    if (errorCode === 1) {
      errorMessage = `${mediaType} loading was aborted`;
    } else if (errorCode === 2) {
      errorMessage = `Network error loading ${mediaType}. Please check your connection.`;
    } else if (errorCode === 3) {
      errorMessage = `${mediaType} format not supported or decoding failed`;
    } else if (errorCode === 4) {
      // Error code 4 = MEDIA_ERR_SRC_NOT_SUPPORTED
      // This usually means the video codec is not iOS-compatible
      errorMessage = `${mediaType} format not supported by this device. iOS requires H.264 or HEVC codec. Video may need to be re-encoded.`;
      logger.error('[Video Codec Error] iOS requires H.264 (baseline/main profile) or HEVC codec with AAC audio. Current video may use an incompatible codec.');
    } else if (mediaElement?.networkState === 3) {
      errorMessage = `${mediaType} file not found (404). The content may not be uploaded to the CDN yet.`;
    }

    setError(errorMessage);
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
      
      // Exit fullscreen if active
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    };
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
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
    logger.log('[PlayPause] Button clicked, isLocked:', isLocked, 'canPlay:', canPlay, 'isPlaying:', player.isPlaying);

    if (isLocked) {
      trackPaywallViewed('meditation_player');
      toast({
        title: "Premium Required",
        description: "Upgrade to premium to access this meditation.",
        variant: "destructive",
      });
      return;
    }

    if (!canPlay) {
      logger.log('[PlayPause] Media not ready yet, showing loading toast');
      toast({
        title: "Media Loading",
        description: "Please wait for the meditation to load completely.",
      });
      return;
    }

    const mediaElement = isAudio ? audioRef.current : videoRef.current;
    if (!mediaElement) {
      logger.log('[PlayPause] No media element found!');
      return;
    }

    logger.log('[PlayPause] Media element ready:', {
      readyState: mediaElement.readyState,
      networkState: mediaElement.networkState,
      currentSrc: mediaElement.currentSrc,
      paused: mediaElement.paused
    });

    try {
      if (player.isPlaying) {
        logger.log('[PlayPause] Pausing media');
        mediaElement.pause();
      } else {
        logger.log('[PlayPause] Starting playback');
        // Track meditation playback start
        if (meditation && !player.isPlaying) {
          trackMeditationPlayed(meditation.id, meditation.title);
          
          // Track usage in meditation_usage table
          if (user) {
            try {
              const { data, error } = await supabase
                .from('meditation_usage')
                .insert({
                  user_id: user.id,
                  meditation_id: meditation.id,
                  started_at: new Date().toISOString(),
                  duration_seconds: 0,
                  completed: false,
                })
                .select('id')
                .single();
              
              if (!error && data) {
                setUsageRecordId(data.id);
                lastUpdateTimeRef.current = Date.now();
              }
            } catch (error) {
              console.error('Failed to track meditation usage:', error);
            }
          }
        }

        // Request wake lock to keep screen active during playback
        if ('wakeLock' in navigator) {
          try {
            await (navigator as any).wakeLock.request('screen');
            logger.log('[PlayPause] Wake lock acquired');
          } catch (err) {
            // Wake lock not supported or denied
            logger.log('[PlayPause] Wake lock not available:', err);
          }
        }

        const playPromise = mediaElement.play();
        logger.log('[PlayPause] Play promise created');
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              logger.log('[PlayPause] Playback started successfully');
            })
            .catch((error) => {
              logger.error('[PlayPause] Playback failed:', error);
              setError('Playback failed. Please try again.');
              setPlaying(false);
            });
        }
      }
    } catch (error) {
      logger.error('[PlayPause] Playback error:', error);
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


  const handleVolumeChange = (newVolume: number[]) => {
    const vol = newVolume[0];
    setVolume(vol);
    setIsMuted(vol === 0);
    const mediaElement = isAudio ? audioRef.current : videoRef.current;
    if (mediaElement) {
      mediaElement.volume = vol;
    }
  };

  const toggleMute = () => {
    const mediaElement = isAudio ? audioRef.current : videoRef.current;
    if (!mediaElement) return;

    if (isMuted) {
      mediaElement.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      mediaElement.volume = 0;
      setIsMuted(true);
    }
  };

  const handleSeek = (newTime: number[]) => {
    const time = newTime[0];
    const mediaElement = isAudio ? audioRef.current : videoRef.current;
    if (mediaElement && canPlay) {
      mediaElement.currentTime = time;
    }
  };

  const handleFavoriteClick = () => {
    if (!user) {
      // Not authenticated - show auth modal
      setShowAuthModal(true);
      return;
    }

    if (meditation) {
      toggleFavorite(meditation.id);
    }
  };

  const toggleFullscreen = async () => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    try {
      // Use the video element's native fullscreen for iOS (no toast)
      const doc = document as any;
      const video = videoEl as any;
      
      if (!document.fullscreenElement && !doc.webkitFullscreenElement) {
        // Try webkit fullscreen first (iOS Safari)
        if (video.webkitEnterFullscreen) {
          video.webkitEnterFullscreen();
          setIsFullscreen(true);
        } else if (videoEl.requestFullscreen) {
          await videoEl.requestFullscreen();
          setIsFullscreen(true);
        }
      } else {
        // Exit fullscreen
        if (doc.webkitExitFullscreen) {
          doc.webkitExitFullscreen();
        } else if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (err) {
      logger.error('Fullscreen error:', err);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Removed handleVideoClick - using native controls only to avoid interference

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 pb-24">
      {/* Header - with safe area padding for mobile */}
      <div className="flex items-center justify-between p-4 pt-6 safe-top">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleFavoriteClick}
          className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm"
        >
          <Heart className={`w-5 h-5 ${isFav ? 'fill-primary text-primary' : ''}`} />
        </Button>
      </div>

      {/* Audio Element (hidden, audio only) */}
      {isAudio && (
        <audio
          ref={audioRef}
          src={meditation.media_url}
          onLoadStart={() => {
            logger.log('[Audio] Loading from:', meditation.media_url);
            logger.log('[Audio] Media type:', meditation.media_type);
            handleLoadStart();
          }}
          onCanPlay={() => {
            logger.log('[Audio] Can play event fired');
            handleCanPlay();
          }}
          onCanPlayThrough={() => {
            logger.log('[Audio] Can play through');
          }}
          onLoadedMetadata={() => {
            logger.log('[Audio] Loaded metadata event fired');
            handleLoadedMetadata();
          }}
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => {
            logger.log('[Audio] Play event fired');
            setPlaying(true);
          }}
          onPause={() => {
            logger.log('[Audio] Pause event fired');
            setPlaying(false);
          }}
          onEnded={handleEnded}
          onError={(e) => {
            logger.error('[Audio] Error occurred');
            handleError(e);
          }}
          onWaiting={() => {
            logger.log('[Audio] Waiting for data');
          }}
          onSuspend={() => {
            logger.log('[Audio] Suspended - attempting to resume');
            const audioEl = audioRef.current;
            if (audioEl && audioEl.readyState < 3) {
              // If not fully loaded, try to resume loading
              setTimeout(() => {
                logger.log('[Audio] Calling load() to resume');
                audioEl.load();
              }, 100);
            }
          }}
          onProgress={() => {
            const audioEl = audioRef.current;
            if (audioEl && audioEl.buffered.length > 0) {
              logger.log('[Audio] Buffering:',
                ((audioEl.buffered.end(0) / audioEl.duration) * 100).toFixed(1) + '%'
              );
            }
          }}
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
        {/* Media Display */}
        <div className="relative w-full max-w-2xl mb-8" style={{ maxHeight: '50vh' }}>
          {isAudio ? (
            /* Thumbnail for audio meditations */
            <img
              src={meditation.thumbnail_url || meditation.thumbnail}
              alt={meditation.title}
              className="w-full h-full object-cover rounded-3xl shadow-2xl"
              onError={(e) => {
                if (!e.currentTarget.src.includes('data:')) {
                  logger.warn('Thumbnail failed to load, using placeholder');
                  e.currentTarget.src = 'data:image/svg+xml;base64,' + btoa(`
                    <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:hsl(var(--primary));stop-opacity:0.3" />
                          <stop offset="100%" style="stop-color:hsl(var(--secondary));stop-opacity:0.6" />
                        </linearGradient>
                      </defs>
                      <rect width="300" height="300" fill="url(#grad)" />
                      <text x="150" y="150" font-family="system-ui" font-size="16" fill="hsl(var(--foreground))" text-anchor="middle" dy=".3em">🧘‍♀️</text>
                    </svg>
                  `);
                }
              }}
            />
          ) : (
            /* Video player with custom poster overlay */
            <>
              {/* Custom Poster Overlay - show when video is not playing */}
              {!player.isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center rounded-lg z-10 pointer-events-none">
                  <img
                    src={logoSvg}
                    alt={meditation.title}
                    className="w-auto h-auto max-w-[60%] max-h-[60%] object-contain"
                    onError={(e) => {
                      e.currentTarget.src = logoSvg;
                    }}
                  />
                  {/* Play button overlay */}
                  {canPlay && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 bg-black/30 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <Play className="w-10 h-10 text-white ml-1" />
                      </div>
                    </div>
                  )}
                </div>
              )}
              <video
              ref={videoRef}
              playsInline
              controls
              preload="metadata"
              className="w-full rounded-lg shadow-2xl"
              style={{
                maxHeight: '50vh',
                objectFit: 'cover',
                WebkitUserSelect: 'none',
                WebkitTouchCallout: 'none'
              }}
              onLoadStart={() => {
                  logger.log('[Video] Loading from:', meditation.media_url);
                  logger.log('[Video] Poster URL:', meditation.thumbnail_url || meditation.thumbnail || 'none');
                  const videoEl = videoRef.current;
                  if (videoEl) {
                    logger.log('[Video Debug] Container dimensions:', {
                      parentWidth: videoEl.parentElement?.offsetWidth,
                      parentHeight: videoEl.parentElement?.offsetHeight,
                      videoWidth: videoEl.offsetWidth,
                      videoHeight: videoEl.offsetHeight,
                      videoClientWidth: videoEl.clientWidth,
                      videoClientHeight: videoEl.clientHeight
                    });
                  }
                  handleLoadStart();
                }}
                onCanPlay={handleCanPlay}
                onCanPlayThrough={() => {
                  logger.log('[Video] Can play through');
                }}
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => {
                  logger.log('[Video] Play event - native controls');
                  setPlaying(true);
                }}
                onPause={() => {
                  logger.log('[Video] Pause event - native controls');
                  setPlaying(false);
                }}
                onEnded={handleEnded}
                onError={(e) => {
                  const videoEl = e.target as HTMLVideoElement;
                  // Only handle actual video errors, not poster image errors
                  // Poster errors don't set videoEl.error, so we check for that
                  if (videoEl.error && videoEl.error.code) {
                    logger.error('[Video] Actual video error occurred:', {
                      code: videoEl.error.code,
                      message: videoEl.error.message
                    });
                    handleError(e);
                  } else {
                    // Just a poster image error - log but don't show error toast
                    logger.warn('[Video] Poster image may have failed (not critical):', videoEl.poster);
                  }
                }}
                onWaiting={() => {
                  const videoEl = videoRef.current;
                  logger.log('[Video] Waiting', {
                    readyState: videoEl?.readyState,
                    networkState: videoEl?.networkState
                  });
                }}
                onProgress={() => {
                  const videoEl = videoRef.current;
                  if (videoEl && videoEl.buffered.length > 0) {
                    logger.log('[Video] Buffering:',
                      ((videoEl.buffered.end(0) / videoEl.duration) * 100).toFixed(1) + '%'
                    );
                  }
                }}
              >
                <source src={meditation.media_url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </>
          )}
          
          {/* Loading Overlay - Only for audio, video uses native loading indicator */}
          {isLoading && isAudio && (
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
                <Button 
                  className="btn-premium"
                  onClick={() => setShowParentalGate(true)}
                >
                  Unlock Premium
                </Button>
              </div>
            </div>
          )}
          
          {/* Floating Animation for Free Content */}
          {!isLocked && player.isPlaying && (
            <div className="absolute inset-0 rounded-3xl animate-pulse-celebration"
                 style={{
                   boxShadow: '0 0 40px rgba(139, 69, 255, 0.3)',
                   pointerEvents: 'none' // Allow touches to pass through to video controls
                 }}
            />
          )}
        </div>

        {/* Meditation Info */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">{meditation.public_title || meditation.title}</h1>
          <p className="text-muted-foreground mb-4 max-w-sm">
            {meditation.description}
          </p>

          {/* Transcript Section */}
          {meditation.transcript && (
            <Collapsible 
              open={isTranscriptOpen} 
              onOpenChange={setIsTranscriptOpen}
              className="w-full max-w-md mx-auto mt-6"
            >
              <div className="bg-muted/30 rounded-lg border border-border/40 overflow-hidden">
                <CollapsibleTrigger asChild>
                  <button 
                    className="w-full p-4 text-left hover:bg-muted/50 transition-colors flex items-start justify-between gap-3"
                    onClick={() => setIsTranscriptOpen(!isTranscriptOpen)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-foreground">Transcript</h3>
                      </div>
                      {!isTranscriptOpen && (
                        <p className="text-sm text-muted-foreground line-clamp-2 text-left">
                          {meditation.transcript}
                        </p>
                      )}
                    </div>
                    {isTranscriptOpen ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    )}
                  </button>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="border-t border-border/40">
                    <ScrollArea className="h-[450px] w-full">
                      <div className="p-4 text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed text-left">
                        {meditation.transcript}
                      </div>
                    </ScrollArea>
                    <div className="p-2 border-t border-border/40 bg-muted/20">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsTranscriptOpen(false)}
                        className="w-full text-xs"
                      >
                        <ChevronUp className="w-4 h-4 mr-1" />
                        Collapse
                      </Button>
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          )}
          
          {/* Themes */}
          <div className="flex flex-wrap justify-center gap-2 mb-4 mt-6">
            {meditation.themes.map((themeName) => {
              const themeData = themes.find(t => t.name === themeName);
              return (
                <span 
                  key={themeName}
                  className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5"
                >
                  {themeData?.icon_svg_url && (
                    <img 
                      src={themeData.icon_svg_url} 
                      alt={themeName}
                      className="w-4 h-4"
                    />
                  )}
                  {themeName}
                </span>
              );
            })}
          </div>
        </div>

        {/* Controls for Audio only - Video uses native controls */}
        {isAudio && !isCompleted && (
          <>
            {/* Seek Slider */}
            <div className="w-full max-w-md mb-6 px-4">
              <Slider
                value={[localCurrentTime]}
                max={duration}
                step={1}
                onValueChange={handleSeek}
                className="cursor-pointer"
                disabled={!canPlay || isLocked}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>{formatTime(localCurrentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Play/Pause and Skip Controls */}
            <div className="flex items-center justify-center gap-6 mb-8">
              <Button
                variant="ghost"
                size="lg"
                onClick={() => handleSkip(-10)}
                disabled={isLocked || !canPlay}
                className="w-16 h-16 rounded-full relative group"
              >
                <Skip10Icon
                  className="w-8 h-8"
                  direction="backward"
                />
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
                onClick={() => handleSkip(10)}
                disabled={isLocked || !canPlay}
                className="w-16 h-16 rounded-full relative group"
              >
                <Skip10Icon
                  className="w-8 h-8"
                  direction="forward"
                />
              </Button>
            </div>
          </>
        )}

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
              {user ? (
                // Logged-in users: Show progress tracking
                <>
                  <Button onClick={() => navigate('/tracking')} className="btn-soft">
                    View Progress
                  </Button>
                  <Button onClick={() => navigate('/meditations')} variant="outline">
                    Find Another
                  </Button>
                </>
              ) : (
                // Non-logged-in users: Encourage account creation
                <>
                  <Button onClick={() => navigate('/explore')} className="btn-premium">
                    Create Account to Track Progress
                  </Button>
                  <Button onClick={() => navigate('/meditations')} variant="outline">
                    Try Another Free Meditation
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Parental Gate */}
      <ParentalGate
        isOpen={showParentalGate}
        onClose={() => setShowParentalGate(false)}
        onSuccess={() => navigate('/explore')}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
};

export default MeditationPlayer;
