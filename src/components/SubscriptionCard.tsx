import { Star, CheckCircle, Sparkles, Music, Video } from 'lucide-react';
import { Button } from './ui/button';
import { useTranslation } from 'react-i18next';

const SubscriptionCard = () => {
  const { t } = useTranslation();

  const peacePlanBenefits = [
    { text: t('subscription.unlimitedAccess'), icon: CheckCircle },
    { text: 'All audio meditations for Kids & Adults', icon: Music },
    { text: t('subscription.progressTracking'), icon: CheckCircle },
    { text: t('subscription.noAds'), icon: CheckCircle },
  ];

  const peacePlusBenefits = [
    { text: 'Everything in Peace Plan', icon: CheckCircle },
    { text: 'Highly Mediated video series', icon: Video },
    { text: 'Rainbow Array video series', icon: Video },
    { text: t('subscription.offlineDownload'), icon: CheckCircle },
  ];

  return (
    <div className="space-y-4">
      {/* Peace Plan */}
      <div className="card-gradient p-6">
        <div className="mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/20 rounded-full mb-3">
            <Music className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-1">Peace Plan</h3>
          <p className="text-sm text-muted-foreground">
            Perfect for audio meditation
          </p>
        </div>

        <div className="space-y-2 mb-6">
          {peacePlanBenefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-3 text-sm">
              <benefit.icon className="w-4 h-4 text-success flex-shrink-0" />
              <span className="text-left">{benefit.text}</span>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="text-center">
            <div className="text-2xl font-bold">
              $5.99
              <span className="text-sm font-normal text-muted-foreground">/month</span>
            </div>
          </div>

          <Button className="btn-primary w-full">
            <Star className="w-4 h-4 mr-2" />
            Choose Peace Plan
          </Button>
        </div>
      </div>

      {/* Peace Plus Plan */}
      <div className="card-premium p-6">
        <div className="mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-accent to-warning rounded-full mb-3">
            <Sparkles className="w-6 h-6 text-accent-foreground" />
          </div>
          <h3 className="text-xl font-bold text-gradient-premium mb-1">
            Peace Plus Plan
          </h3>
          <p className="text-sm text-muted-foreground">
            Complete audio & video access
          </p>
        </div>

        <div className="space-y-2 mb-6">
          {peacePlusBenefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-3 text-sm">
              <benefit.icon className="w-4 h-4 text-success flex-shrink-0" />
              <span className="text-left">{benefit.text}</span>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-gradient-premium">
              $9.99
              <span className="text-sm font-normal text-muted-foreground">/month</span>
            </div>
          </div>

          <Button className="btn-premium w-full">
            <Sparkles className="w-4 h-4 mr-2" />
            Choose Peace Plus
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            {t('subscription.cancelAnytime')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCard;
