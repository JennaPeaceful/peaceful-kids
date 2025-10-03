import { useState, useEffect } from 'react';
import { Check, Headphones } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import logo from '@/assets/logo.svg';
import { ParentalGate } from '@/components/ParentalGate';
import { useUserStore } from '@/stores/userStore';
import { useMeditationStore } from '@/stores/meditationStore';
import MeditationCard from '@/components/MeditationCard';

const Explore = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showParentalGate, setShowParentalGate] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { subscription } = useUserStore();
  const { meditations, fetchMeditations } = useMeditationStore();
  const [featuredMeditations, setFeaturedMeditations] = useState<any[]>([]);

  useEffect(() => {
    fetchMeditations();
  }, [fetchMeditations]);

  useEffect(() => {
    if (!meditations || meditations.length === 0) return;

    // Filter featured meditations based on subscription plan
    let planType = 'free';
    if (subscription?.is_active && subscription?.plan_type) {
      planType = subscription.plan_type;
    }

    const featured = meditations.filter(m => 
      m.featured_for_plan && m.featured_for_plan.includes(planType)
    ).slice(0, 6); // Show up to 6 featured meditations

    setFeaturedMeditations(featured);
  }, [meditations, subscription]);

  const handleSelectPlan = (plan: string) => {
    setSelectedPlan(plan);
    setShowParentalGate(true);
  };

  const handleParentalGateSuccess = () => {
    console.log('Selected plan:', selectedPlan);
    // TODO: Implement subscription flow
  };

  const handleTryFreeSamples = () => {
    navigate('/meditations');
  };

  // Determine what to show based on subscription status
  const isPeacePlus = subscription?.is_active && subscription?.plan_type === 'peace_plus_plan';
  const isPeace = subscription?.is_active && subscription?.plan_type === 'peace_plan';
  const isFree = !subscription?.is_active || subscription?.plan_type === 'free';

  return (
    <div className="pb-24 pt-8 min-h-screen">
      {/* Hero Section */}
      <div className="px-4 mb-12">
        <div className="text-center mb-10">
          <div className="inline-block mb-6">
            <img src={logo} alt="Peaceful Kids" className="w-32 h-32 animate-float" />
          </div>
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-gradient-primary">
              {isPeacePlus ? 'Your Featured Meditations' : isPeace ? 'Your Peace Plan' : t('explore.welcome')}
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto mb-6">
            {isPeacePlus 
              ? 'Handpicked meditations just for you' 
              : isPeace 
              ? 'Enjoy your Peace Plan benefits and explore Peace Plus' 
              : t('explore.subtitle')}
          </p>
          
          {/* Try Free Samples Button - Only show for free users */}
          {isFree && (
            <Button
              onClick={handleTryFreeSamples}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <Headphones className="w-5 h-5" />
              Try Free Samples
            </Button>
          )}
        </div>

        {/* Featured Meditations for Peace Plus subscribers */}
        {isPeacePlus && (
          <div className="space-y-6 max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-6">Featured Content</h2>
            {featuredMeditations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredMeditations.map((meditation) => (
                  <MeditationCard key={meditation.id} meditation={meditation} />
                ))}
              </div>
            ) : (
              <Card className="card-gradient p-8 text-center">
                <p className="text-muted-foreground">No featured meditations available yet. Check back soon!</p>
              </Card>
            )}
          </div>
        )}

        {/* Featured Meditations + Peace Plus Upgrade for Peace Plan subscribers */}
        {isPeace && (
          <div className="space-y-8 max-w-6xl mx-auto">
            {/* Featured Peace Plan Meditations */}
            {featuredMeditations.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-center mb-6">Your Featured Meditations</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {featuredMeditations.map((meditation) => (
                    <MeditationCard key={meditation.id} meditation={meditation} />
                  ))}
                </div>
              </div>
            )}

            {/* Peace Plus Upgrade Option */}
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-center mb-6">Upgrade to Peace Plus</h2>
              <Card className="card-premium p-8 border-2 border-accent/50 hover:border-accent transition-all relative">
                <div className="absolute top-4 right-4 bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  Unlock More Content
                </div>
                
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gradient-premium mb-2">Peace Plus Plan</h3>
                  <div className="text-3xl font-bold text-gradient-premium mt-3">$9.99</div>
                  <div className="text-sm text-muted-foreground">/month</div>
                  <p className="text-muted-foreground text-sm mt-3">All Content</p>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-accent" />
                    </div>
                    <span className="text-sm font-medium">Meditations + Courses (Audio + Video)</span>
                  </div>
                </div>

                <Button 
                  onClick={() => handleSelectPlan('peace-plus')}
                  className="w-full btn-premium"
                  size="lg"
                >
                  Upgrade Now
                </Button>
              </Card>
            </div>
          </div>
        )}

        {/* Subscription Plans for Free users */}
        {isFree && (
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
        )}
      </div>

      {/* Parental Gate */}
      <ParentalGate
        isOpen={showParentalGate}
        onClose={() => setShowParentalGate(false)}
        onSuccess={handleParentalGateSuccess}
      />
    </div>
  );
};

export default Explore;
