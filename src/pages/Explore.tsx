import { useEffect } from 'react';
import { Sparkles, Play, TrendingUp } from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { useMeditationStore } from '../stores/meditationStore';
import { useProgressStore } from '../stores/progressStore';
import MeditationCard from '../components/MeditationCard';
import SubscriptionCard from '../components/SubscriptionCard';
import { Button } from '../components/ui/button';

const Explore = () => {
  const { profile, subscription } = useUserStore();
  const { recommendedMeditations, recentMeditations, fetchMeditations, isLoading } = useMeditationStore();
  const { stats } = useProgressStore();

  useEffect(() => {
    fetchMeditations();
  }, [fetchMeditations]);

  return (
    <div className="pb-24 pt-6">
      {/* Header */}
      <div className="px-4 mb-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gradient-primary mb-2">
            Welcome back, {profile?.display_name}! 🌟
          </h1>
          <p className="text-muted-foreground">
            Ready for your peaceful moment today?
          </p>
        </div>

        {/* Stats Card */}
        <div className="card-gradient p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Your Progress</h2>
            <TrendingUp className="w-5 h-5 text-success" />
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{stats.currentStreak}</div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-secondary">{stats.totalMeditations}</div>
              <div className="text-xs text-muted-foreground">Sessions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent">{stats.totalMinutes}</div>
              <div className="text-xs text-muted-foreground">Minutes</div>
            </div>
          </div>
        </div>

        {/* Daily Suggestion */}
        <div className="card-gradient p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-bold">Today's Suggestion</h3>
              <p className="text-sm text-muted-foreground">Perfect for your mood</p>
            </div>
          </div>
          
          {recommendedMeditations[0] && (
            <div className="mb-4">
              <MeditationCard meditation={recommendedMeditations[0]} />
            </div>
          )}
          
          <Button className="btn-soft w-full">
            <Play className="w-4 h-4 mr-2" />
            Start Your Daily Practice
          </Button>
        </div>
      </div>

      {/* Subscription Upsell for Free Users */}
      {!subscription?.is_active && (
        <div className="px-4 mb-8">
          <SubscriptionCard />
        </div>
      )}

      {/* Recommended for You */}
      <div className="px-4 mb-8">
        <h2 className="text-xl font-bold mb-4">Recommended for You</h2>
        <div className="grid grid-cols-2 gap-4">
          {recommendedMeditations.slice(0, 4).map((meditation) => (
            <MeditationCard key={meditation.id} meditation={meditation} />
          ))}
        </div>
      </div>

      {/* Recently Played */}
      {recentMeditations.length > 0 && (
        <div className="px-4 mb-8">
          <h2 className="text-xl font-bold mb-4">Continue Listening</h2>
          <div className="space-y-4">
            {recentMeditations.slice(0, 3).map((meditation) => (
              <div key={meditation.id} className="card-gradient p-4 flex items-center gap-4">
                <img 
                  src={meditation.thumbnail} 
                  alt={meditation.title}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{meditation.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {meditation.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground">
                      {Math.round(meditation.duration / 60)} min
                    </span>
                    {meditation.themes.slice(0, 1).map((theme) => (
                      <span 
                        key={theme}
                        className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
                <Button size="sm" className="btn-soft">
                  <Play className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Explore;