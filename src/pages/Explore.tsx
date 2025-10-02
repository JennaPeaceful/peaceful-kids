import { Check, Headphones } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import logo from '@/assets/logo.svg';

const Explore = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSelectPlan = (plan: string) => {
    console.log('Selected plan:', plan);
    // TODO: Implement subscription flow
  };

  const handleTryFreeSamples = () => {
    navigate('/meditations');
  };

  return (
    <div className="pb-24 pt-8 min-h-screen">
      {/* Hero Section */}
      <div className="px-4 mb-12">
        <div className="text-center mb-10">
          <div className="inline-block mb-6">
            <img src={logo} alt="Peaceful Kids" className="w-32 h-32 animate-float" />
          </div>
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-gradient-primary">{t('explore.welcome')}</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto mb-6">
            {t('explore.subtitle')}
          </p>
          
          {/* Try Free Samples Button */}
          <Button
            onClick={handleTryFreeSamples}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <Headphones className="w-5 h-5" />
            Try Free Samples
          </Button>
        </div>

        {/* Subscription Plans */}
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Two Cards Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Peace Plan */}
            <Card className="card-gradient p-8 border-2 border-primary/20 hover:border-primary/40 transition-all flex flex-col">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-primary mb-2">Peace Plan</h2>
                <div className="text-3xl font-bold text-primary mt-3">$5.99</div>
                <div className="text-sm text-muted-foreground">/month</div>
                <p className="text-muted-foreground text-sm mt-3">All Meditations</p>
              </div>

              <div className="space-y-4 mb-8 flex-grow">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm">Access to full audio meditation library</span>
                </div>
              </div>

              <Button 
                onClick={() => handleSelectPlan('peace')}
                className="w-full btn-soft mt-auto"
                size="lg"
              >
                Subscribe
              </Button>
            </Card>

            {/* Peace Plus Plan - Highlighted */}
            <Card className="card-premium p-8 border-2 border-accent/50 hover:border-accent transition-all relative flex flex-col">
              <div className="absolute top-4 right-4 bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full">
                Recommended
              </div>
              
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gradient-premium mb-2">Peace Plus Plan</h2>
                <div className="text-3xl font-bold text-gradient-premium mt-3">$9.99</div>
                <div className="text-sm text-muted-foreground">/month</div>
                <p className="text-muted-foreground text-sm mt-3">All Content</p>
              </div>

              <div className="space-y-4 mb-8 flex-grow">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-accent" />
                  </div>
                  <span className="text-sm font-medium">Meditations + Courses (Audio + Video)</span>
                </div>
              </div>

              <Button 
                onClick={() => handleSelectPlan('peace-plus')}
                className="w-full btn-premium mt-auto"
                size="lg"
              >
                Subscribe
              </Button>
            </Card>
          </div>

          {/* Disclaimer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Billed monthly. Cancel anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explore;
