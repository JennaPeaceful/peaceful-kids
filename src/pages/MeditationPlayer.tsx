import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, SkipBack, SkipForward, ArrowLeft, Heart, Share, Lock } from 'lucide-react';
import { useMeditationStore } from '../stores/meditationStore';
import { useProgressStore } from '../stores/progressStore';
import { useUserStore } from '../stores/userStore';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { toast } from '../hooks/use-toast';

const MeditationPlayer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { meditations, player, setCurrentMeditation, setPlaying, setCurrentTime } = useMeditationStore();
  const { completeSession } = useProgressStore();
  const { subscription } = useUserStore();
  
  const [localCurrentTime, setLocalCurrentTime] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const meditation = meditations.find(m => m.id === id);
  const isLocked = meditation && !meditation.is_free && !subscription?.is_active;

  useEffect(() => {
    if (meditation) {
      setCurrentMeditation(meditation);
    }
  }, [meditation, setCurrentMeditation]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (player.isPlaying && !isLocked) {
      interval = setInterval(() => {
        setLocalCurrentTime(prev => {
          const newTime = prev + 1;
          setCurrentTime(newTime);
          
          // Check if meditation is completed
          if (newTime >= meditation!.duration && !isCompleted) {
            setIsCompleted(true);
            setPlaying(false);
            completeSession(meditation!.id, newTime);
            toast({
              title: "Meditation Complete! 🎉",
              description: "Great job! You've completed another mindful session.",
            });
          }
          
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [player.isPlaying, isLocked, meditation, completeSession, setCurrentTime, setPlaying, isCompleted]);

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

  const handlePlayPause = () => {
    if (isLocked) {
      toast({
        title: "Premium Required",
        description: "Upgrade to premium to access this meditation.",
        variant: "destructive",
      });
      return;
    }
    setPlaying(!player.isPlaying);
  };

  const handleSkip = (seconds: number) => {
    if (isLocked) return;
    const newTime = Math.max(0, Math.min(localCurrentTime + seconds, meditation.duration));
    setLocalCurrentTime(newTime);
    setCurrentTime(newTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = (localCurrentTime / meditation.duration) * 100;

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

      {/* Main Content */}
      <div className="flex flex-col items-center px-6 pb-8">
        {/* Meditation Image */}
        <div className="relative w-80 h-80 mb-8">
          <img
            src={meditation.thumbnail}
            alt={meditation.title}
            className="w-full h-full object-cover rounded-3xl shadow-2xl"
          />
          
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

        {/* Progress Bar */}
        <div className="w-full max-w-sm mb-6">
          <Progress value={progressPercentage} className="h-2 mb-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formatTime(localCurrentTime)}</span>
            <span>{formatTime(meditation.duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 mb-8">
          <Button
            variant="ghost"
            size="lg"
            onClick={() => handleSkip(-30)}
            disabled={isLocked}
            className="w-12 h-12 rounded-full"
          >
            <SkipBack className="w-6 h-6" />
          </Button>

          <Button
            onClick={handlePlayPause}
            className="w-20 h-20 rounded-full btn-hero flex items-center justify-center"
            disabled={isLocked}
          >
            {player.isPlaying ? (
              <Pause className="w-8 h-8" />
            ) : (
              <Play className="w-8 h-8 ml-1" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="lg"
            onClick={() => handleSkip(30)}
            disabled={isLocked}
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
              You've added {Math.round(meditation.duration / 60)} mindful minutes to your day
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