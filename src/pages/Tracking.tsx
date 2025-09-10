import { Calendar, Award, TrendingUp, Target, Flame, Clock } from 'lucide-react';
import { useProgressStore } from '../stores/progressStore';
import { Card } from '../components/ui/card';

const Tracking = () => {
  const { stats } = useProgressStore();

  const achievements = [
    { id: 1, title: 'First Session', description: 'Completed your first meditation', icon: '🎯', unlocked: true },
    { id: 2, title: 'Week Warrior', description: '7 day meditation streak', icon: '🔥', unlocked: true },
    { id: 3, title: 'Calm Explorer', description: 'Tried 5 different meditations', icon: '🧭', unlocked: true },
    { id: 4, title: 'Focus Master', description: 'Complete 10 focus meditations', icon: '🎭', unlocked: false },
    { id: 5, title: 'Sleep Champion', description: 'Complete 15 bedtime meditations', icon: '🌙', unlocked: false },
    { id: 6, title: 'Mindful Month', description: '30 day meditation streak', icon: '🏆', unlocked: false },
  ];

  return (
    <div className="pb-24 pt-6">
      {/* Header */}
      <div className="px-4 mb-8">
        <h1 className="text-2xl font-bold text-gradient-primary mb-2">
          Your Journey
        </h1>
        <p className="text-muted-foreground">
          Track your progress and celebrate achievements
        </p>
      </div>

      {/* Stats Overview */}
      <div className="px-4 mb-8">
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Current Streak */}
          <Card className="card-gradient p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-3">
              <Flame className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="text-3xl font-bold text-primary mb-1">
              {stats.currentStreak}
            </div>
            <div className="text-sm text-muted-foreground">
              Day Streak
            </div>
          </Card>

          {/* Total Sessions */}
          <Card className="card-gradient p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-secondary-foreground" />
            </div>
            <div className="text-3xl font-bold text-secondary mb-1">
              {stats.totalMeditations}
            </div>
            <div className="text-sm text-muted-foreground">
              Sessions
            </div>
          </Card>
        </div>

        {/* Total Minutes */}
        <Card className="card-gradient p-6 text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-accent to-warning rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-accent-foreground" />
          </div>
          <div className="text-4xl font-bold text-gradient-premium mb-2">
            {stats.totalMinutes}
          </div>
          <div className="text-lg text-muted-foreground">
            Mindful Minutes
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            That's {Math.round(stats.totalMinutes / 60 * 10) / 10} hours of peace! 🌸
          </div>
        </Card>
      </div>

      {/* Weekly Activity */}
      <div className="px-4 mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-success" />
          This Week
        </h2>
        
        <Card className="card-gradient p-6">
          <div className="flex items-end justify-between gap-2 h-32 mb-4">
            {stats.weeklyActivity.map((day, index) => (
              <div key={day.date} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-gradient-to-t from-primary to-secondary rounded-t-md transition-all duration-500"
                  style={{ 
                    height: `${Math.max(day.minutes / 30 * 100, day.minutes > 0 ? 20 : 0)}%`,
                    minHeight: day.minutes > 0 ? '8px' : '0'
                  }}
                />
                <div className="text-xs text-muted-foreground mt-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index]}
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <div className="text-lg font-semibold mb-1">
              {stats.weeklyActivity.reduce((sum, day) => sum + day.minutes, 0)} minutes this week
            </div>
            <div className="text-sm text-muted-foreground">
              Keep up the great work! 🌟
            </div>
          </div>
        </Card>
      </div>

      {/* Achievements */}
      <div className="px-4 mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-warning" />
          Achievements
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          {achievements.map((achievement) => (
            <Card 
              key={achievement.id} 
              className={`p-4 text-center transition-all duration-300 ${
                achievement.unlocked 
                  ? 'card-gradient border-success/20 bg-success/5' 
                  : 'bg-muted/50 opacity-60'
              }`}
            >
              <div className="text-3xl mb-2">{achievement.icon}</div>
              <h3 className={`font-bold text-sm mb-1 ${
                achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {achievement.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {achievement.description}
              </p>
              {achievement.unlocked && (
                <div className="mt-2 text-xs text-success font-semibold">
                  ✨ Unlocked!
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Motivational Message */}
      <div className="px-4">
        <Card className="card-gradient p-6 text-center">
          <div className="text-2xl mb-3">🌈</div>
          <h3 className="font-bold text-lg mb-2">You're Amazing!</h3>
          <p className="text-muted-foreground">
            Every moment of mindfulness makes a difference. Keep growing your inner peace, one breath at a time.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Tracking;