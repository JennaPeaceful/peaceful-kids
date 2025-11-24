import { useState, useEffect } from 'react';
import { Check, Headphones } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import logo from '@/assets/logo.svg';
import peacePlanBg from '@/assets/peace-plan-bg.svg';
import peacePlusPlanBg from '@/assets/peace-plus-plan-bg.svg';
import { ParentalGate } from '@/components/ParentalGate';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/hooks/useAuth';
import { useUserStore } from '@/stores/userStore';
import { useMeditationStore } from '@/stores/meditationStore';
import MeditationCard from '@/components/MeditationCard';
import { toast } from '@/hooks/use-toast';
import { isNativePlatform } from '@/utils/platform';
import { getOfferings, purchasePackage } from '@/utils/revenuecat';
import { forceRefreshSubscription } from '@/utils/syncSubscription';

const Explore = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showParentalGate, setShowParentalGate] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
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

    // Apply age group filter (COPPA compliance)
    const ageGroup = localStorage.getItem('user-age-group');
    let filteredByAge = meditations;
    if (ageGroup === 'child') {
      // Children see Kids and Adults categories, but NOT Courses
      filteredByAge = meditations.filter(m => m.category !== 'Courses');
    }

    const featured = filteredByAge.filter(m => 
      m.featured_for_plan && m.featured_for_plan.includes(planType)
    ).slice(0, 6); // Show up to 6 featured meditations

    setFeaturedMeditations(featured);
  }, [meditations, subscription]);

  const handleSelectPlan = (plan: string) => {
    // Check if user is authenticated before showing purchase flow
    if (!user) {
      // Open auth modal directly instead of redirecting
      setShowAuthModal(true);
      return;
    }

    setSelectedPlan(plan);
    setShowParentalGate(true);
  };

  const handleParentalGateSuccess = async () => {
    console.log('[Explore] Parental gate passed, selected plan:', selectedPlan);

    // Check if we're on native platform
    if (!isNativePlatform()) {
      toast({
        title: "Not Available",
        description: "In-app purchases are only available on iOS and Android apps.",
        variant: "destructive",
      });
      return;
    }

    // Determine which package to purchase
    const packageId = selectedPlan === 'peace-plus' ? 'all_monthly' : 'meditations_monthly';

    try {
      toast({
        title: "Loading Subscription Options",
        description: "Please wait...",
      });

      // Get offerings from RevenueCat
      const offerings = await getOfferings();
      console.log('[Explore] RevenueCat offerings:', offerings);

      if (!offerings?.current) {
        console.error('[Explore] No current offering found');
        toast({
          title: "Error Loading Plans",
          description: "Could not load subscription options. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Find the selected package
      const selectedPackage = offerings.current.availablePackages.find(
        (pkg: any) => pkg.identifier === packageId
      );

      if (!selectedPackage) {
        console.error('[Explore] Package not found:', packageId);
        toast({
          title: "Error Loading Plan",
          description: "Could not find the selected subscription plan.",
          variant: "destructive",
        });
        return;
      }

      console.log('[Explore] Purchasing package:', selectedPackage.identifier);

      toast({
        title: "Processing Purchase",
        description: "Please complete the purchase in the popup...",
      });

      // Make the purchase
      const result = await purchasePackage(selectedPackage);
      console.log('[Explore] Purchase result:', result);

      // Purchase successful - sync to Supabase
      if (user?.id) {
        await forceRefreshSubscription(
          user.id,
          (syncResult) => {
            toast({
              title: "Welcome to " + (selectedPlan === 'peace-plus' ? 'Peace Plus!' : 'Peace Plan!'),
              description: "Your subscription is now active. Enjoy unlimited access!",
            });
            // Refresh subscription state
            window.location.reload();
          },
          (error) => {
            console.error('[Explore] Sync error:', error);
            toast({
              title: "Purchase Successful",
              description: "Please restart the app to activate your subscription.",
            });
          }
        );
      } else {
        toast({
          title: "Purchase Successful!",
          description: "Please restart the app to activate your subscription.",
        });
      }

    } catch (error: any) {
      console.error('[Explore] Purchase error:', error);

      // Check if user cancelled
      if (error?.message?.includes('cancelled') || error?.userCancelled) {
        toast({
          title: "Purchase Cancelled",
          description: "You can subscribe anytime from this page.",
        });
        return;
      }

      // Other error
      toast({
        title: "Purchase Failed",
        description: error.message || "Could not complete purchase. Please try again.",
        variant: "destructive",
      });
    }
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 px-4">
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
                <div className="absolute -top-3 right-4 bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                  Unlock More Content
                </div>
                
                <div className="mb-6">
                  <h3 className="text-5xl font-bold text-black mb-2">Peace Plus Plan</h3>
                  <div className="text-6xl font-bold text-black mt-3">$9.99</div>
                  <div className="text-sm text-black">/month</div>
                  <p className="text-black text-sm mt-3">All Content</p>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-accent" />
                    </div>
                    <span className="text-sm">Everything in Peace Plan</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-accent" />
                    </div>
                    <span className="text-sm font-medium">Highly Meditated Course</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-accent" />
                    </div>
                    <span className="text-sm font-medium">Exploring The Healing Arts</span>
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
            <div className="relative overflow-hidden rounded-lg bg-transparent p-8 border-2 border-primary/20 hover:border-primary/40 transition-all flex flex-col">
              {/* SVG Background */}
              <img
                src={peacePlanBg}
                alt=""
                className="absolute -inset-px w-[calc(100%+2px)] h-[calc(100%+2px)] object-cover z-0 pointer-events-none select-none"
                aria-hidden="true"
              />

              <div className="relative z-10 mb-6">
                <h2 className="text-5xl font-bebas font-normal text-black mb-2">Peace Plan</h2>
                <div className="text-6xl font-bebas font-normal text-black mt-3">$5.99</div>
                <div className="text-sm text-black">/month</div>
                <p className="text-black text-sm mt-3">All Meditations</p>
              </div>

              <div className="relative z-10 space-y-4 mb-8 flex-grow">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm">Meditations for Kids</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm">Meditations for Adults</span>
                </div>
              </div>

              <Button
                onClick={() => handleSelectPlan('peace')}
                className="relative z-10 w-full mt-auto bg-[#d1cb3f] hover:bg-[#c4be3a] text-white font-bebas font-normal text-[45px] tracking-[0.3em] transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center leading-none pt-7 pb-7"
                size="lg"
              >
                SUBSCRIBE
              </Button>
            </div>

            {/* Peace Plus Plan - Highlighted */}
            <div className="relative">
              <div className="relative overflow-hidden rounded-lg bg-transparent p-8 border-2 border-accent/50 hover:border-accent transition-all flex flex-col">
                {/* SVG Background */}
                <img
                  src={peacePlusPlanBg}
                  alt=""
                  className="absolute -inset-px w-[calc(100%+2px)] h-[calc(100%+2px)] object-cover z-0 pointer-events-none select-none"
                  aria-hidden="true"
                />
                {/* Yellow overlay */}
                <div className="absolute inset-0 bg-yellow-400/20 z-0"></div>

                <div className="relative z-10 mb-6">
                <h2 className="text-5xl font-bebas font-normal text-black mb-2">Peace Plus Plan</h2>
                <div className="text-6xl font-bebas font-normal text-black mt-3">$9.99</div>
                <div className="text-sm text-black">/month</div>
                <p className="text-black text-sm mt-3">All Content</p>
              </div>

              <div className="relative z-10 space-y-4 mb-8 flex-grow">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-accent" />
                  </div>
                  <span className="text-sm">Meditations for Kids</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-accent" />
                  </div>
                  <span className="text-sm">Meditations for Adults</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-accent" />
                  </div>
                  <span className="text-sm font-medium">Highly Meditated Course</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-accent" />
                  </div>
                  <span className="text-sm font-medium">Exploring The Healing Arts</span>
                </div>
              </div>

              <Button
                onClick={() => handleSelectPlan('peace-plus')}
                className="relative z-10 w-full mt-auto bg-[#da3062] hover:bg-[#c72b58] text-white font-bebas font-normal text-[45px] tracking-[0.3em] transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center leading-none pt-7 pb-7"
                size="lg"
              >
                SUBSCRIBE
              </Button>
            </div>
            <div className="absolute -top-3 right-4 bg-[#ed2025] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md z-20">
              Most Popular
            </div>
          </div>
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

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="signup"
      />
    </div>
  );
};

export default Explore;
