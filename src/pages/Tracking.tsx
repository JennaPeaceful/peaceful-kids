import { TrendingUp, Target, Flame, Clock } from 'lucide-react';
import { useProgressStats } from '../hooks/useProgressStats';
import { useTranslation } from 'react-i18next';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import yourJourneyIcon from '../assets/your-journey.svg';

const Tracking = () => {
  const { data: stats, isLoading } = useProgressStats();
  const { t } = useTranslation();

  if (isLoading || !stats) {
    return (
      <div className="pb-24 pt-6 px-4">
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🧘‍♂️</div>
          <p className="text-muted-foreground">{t('tracking.loadingProgress')}</p>
        </div>
      </div>
    );
  }

  const hasNoData = stats.currentStreak === 0 && stats.totalMeditations === 0 && stats.totalMinutes === 0;

  if (hasNoData) {
    return (
      <div className="pb-24 pt-6">
        {/* Header */}
        <div className="px-4 mb-8">
          <h1 className="text-2xl font-bold text-gradient-primary mb-2">
            {t('tracking.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('tracking.subtitle')}
          </p>
        </div>

        {/* Empty State */}
        <div className="px-4">
          <Card className="card-gradient p-8 text-center">
            <div className="mb-6 flex justify-center">
              <img src={yourJourneyIcon} alt="Your Journey Begins" className="w-24 h-24" />
            </div>
            <h2 className="text-2xl font-bold mb-4">{t('tracking.emptyState.title')}</h2>
            <p className="text-muted-foreground mb-6 max-w-sm md:max-w-2xl lg:max-w-3xl mx-auto">
              {t('tracking.emptyState.description')}
            </p>
            <Button 
              onClick={() => window.location.href = '/meditations'}
              className="btn-hero"
            >
              {t('tracking.emptyState.button')}
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const weekDays = [
    t('tracking.weekDays.sun'),
    t('tracking.weekDays.mon'),
    t('tracking.weekDays.tue'),
    t('tracking.weekDays.wed'),
    t('tracking.weekDays.thu'),
    t('tracking.weekDays.fri'),
    t('tracking.weekDays.sat')
  ];

  return (
    <div className="pb-24 pt-6">
      {/* Header */}
      <div className="px-4 mb-8">
        <h1 className="text-2xl font-bold text-gradient-primary mb-2">
          {t('tracking.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('tracking.subtitle')}
        </p>
      </div>

      {/* Weekly Activity */}
      <div className="px-4 mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-success" />
          {t('tracking.thisWeek')}
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
                  {weekDays[index]}
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <div className="text-lg font-semibold mb-1">
              {stats.weeklyActivity.reduce((sum, day) => sum + day.minutes, 0)} {t('tracking.minutesThisWeek')}
            </div>
            <div className="text-sm text-muted-foreground">
              {(() => {
                const weeklyMinutes = stats.weeklyActivity.reduce((sum, day) => sum + day.minutes, 0);
                if (weeklyMinutes === 0) {
                  return t('tracking.startJourney');
                } else if (weeklyMinutes < 50) {
                  return t('tracking.greatStart');
                } else {
                  return t('tracking.keepWork');
                }
              })()}
            </div>
          </div>
        </Card>
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
              {t('tracking.dayStreak')}
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
              Total {t('tracking.sessions')}
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
            Total {t('tracking.mindfulMinutes')}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {t('tracking.hoursOfPeace', { hours: Math.round(stats.totalMinutes / 60 * 10) / 10 })}
          </div>
        </Card>
      </div>

    </div>
  );
};

export default Tracking;