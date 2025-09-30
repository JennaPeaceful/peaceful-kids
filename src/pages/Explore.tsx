import { Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useTranslation } from 'react-i18next';
import logo from '@/assets/logo.svg';

const Explore = () => {
  const { t } = useTranslation();

  const handleSelectPlan = (plan: string) => {
    console.log('Selected plan:', plan);
    // TODO: Implement subscription flow
  };

  return (
    <div className="pb-24 pt-6 min-h-screen">
      {/* Hero Section */}
      <div className="px-4 mb-8">
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <img src={logo} alt="Peaceful Kids" className="w-32 h-32 animate-float" />
          </div>
          <h1 className="text-4xl font-bold mb-3">
            <span className="text-gradient-primary">{t('explore.welcome')}</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            {t('explore.subtitle')}
          </p>
        </div>

        {/* Subscription Plans */}
        <div className="space-y-4 max-w-lg mx-auto">
          {/* Peace Plan */}
          <Card className="card-gradient p-6 border-2 border-primary/20 hover:border-primary/40 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-primary mb-1">{t('explore.peacePlan')}</h2>
                <p className="text-muted-foreground text-sm">{t('explore.peacePlanDesc')}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">$5.99</div>
                <div className="text-xs text-muted-foreground">{t('explore.perMonth')}</div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm">{t('explore.features.allAudioKids')}</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm">{t('explore.features.allAudioAdults')}</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm">{t('explore.features.unlimitedAccess')}</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm">{t('explore.features.trackProgress')}</span>
              </div>
            </div>

            <Button 
              onClick={() => handleSelectPlan('peace')}
              className="w-full btn-soft"
              size="lg"
            >
              {t('explore.startPeacePlan')}
            </Button>
          </Card>

          {/* Peace Plus Plan */}
          <Card className="card-premium p-6 border-2 border-accent/50 hover:border-accent transition-all relative overflow-hidden">
            <div className="absolute top-3 right-3 bg-gradient-to-r from-accent to-warning text-accent-foreground px-3 py-1 rounded-full text-xs font-bold shadow-premium">
              {t('explore.mostPopular')}
            </div>
            
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gradient-premium mb-1">{t('explore.peacePlusPlan')}</h2>
                <p className="text-muted-foreground text-sm">{t('explore.peacePlusPlanDesc')}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gradient-premium">$9.99</div>
                <div className="text-xs text-muted-foreground">{t('explore.perMonth')}</div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-accent" />
                </div>
                <span className="text-sm font-medium">{t('explore.features.everythingInPeace')}</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-accent" />
                </div>
                <span className="text-sm font-medium">{t('explore.features.highlyMediated')}</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-accent" />
                </div>
                <span className="text-sm font-medium">{t('explore.features.rainbowArray')}</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-accent" />
                </div>
                <span className="text-sm font-medium">{t('explore.features.premiumVideo')}</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-accent" />
                </div>
                <span className="text-sm font-medium">{t('explore.features.prioritySupport')}</span>
              </div>
            </div>

            <Button 
              onClick={() => handleSelectPlan('peace-plus')}
              className="w-full btn-premium"
              size="lg"
            >
              {t('explore.startPeacePlusPlan')}
            </Button>
          </Card>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            {t('explore.cancelAnytime')}
          </p>
          <p className="text-xs text-muted-foreground">
            {t('explore.freeTrial')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Explore;
