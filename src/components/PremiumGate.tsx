import { ReactNode, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserStore } from '@/stores/userStore';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Lock, Sparkles, Loader2, Check } from 'lucide-react';
import AuthModal from './AuthModal';
import { ParentalGate } from './ParentalGate';
import { isNativePlatform } from '@/utils/platform';
import { getOfferings, purchasePackage } from '@/utils/revenuecat';
import { forceRefreshSubscription } from '@/utils/syncSubscription';
import { toast } from '@/hooks/use-toast';
import { trackPaywallViewed, trackPurchaseInitiated, trackPurchaseCompleted } from '@/config/analytics';
import type { PurchasesOfferings, PurchasesPackage } from '@revenuecat/purchases-capacitor';

interface PremiumGateProps {
  children: ReactNode;
  feature?: string;
  showUpgrade?: boolean;
}

const PremiumGate = ({ children, feature, showUpgrade = true }: PremiumGateProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscription } = useUserStore();
  const { t } = useTranslation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showParentalGate, setShowParentalGate] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  // RevenueCat state
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
  const [isLoadingOfferings, setIsLoadingOfferings] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);

  const isPremium = subscription?.is_active;
  const isLoggedIn = !!user;
  const isNative = isNativePlatform();

  // Load RevenueCat offerings on native platforms
  useEffect(() => {
    if (isNative && showPaywall && !offerings && !isLoadingOfferings) {
      loadOfferings();
    }
  }, [isNative, showPaywall, offerings, isLoadingOfferings]);

  // Track paywall view
  useEffect(() => {
    if (showPaywall) {
      trackPaywallViewed();
    }
  }, [showPaywall]);

  const loadOfferings = async () => {
    setIsLoadingOfferings(true);
    try {
      const fetchedOfferings = await getOfferings();
      setOfferings(fetchedOfferings);

      if (!fetchedOfferings?.current) {
        toast({
          title: 'Unable to Load Products',
          description: 'Could not load subscription options. Please try again later.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to load offerings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subscription options.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingOfferings(false);
    }
  };

  const handleUpgradeClick = () => {
    // User must pass parental gate before seeing paywall
    setShowParentalGate(true);
  };

  const handleParentalGateSuccess = () => {
    setShowParentalGate(false);

    if (isNative) {
      // On native: show RevenueCat paywall
      setShowPaywall(true);
    } else {
      // On web: navigate to explore page (or web payment flow)
      navigate('/explore');
    }
  };

  const handlePurchase = async (pkg: PurchasesPackage) => {
    if (!user?.id) {
      toast({
        title: 'Sign In Required',
        description: 'Please sign in to purchase a subscription.',
      });
      setShowAuthModal(true);
      return;
    }

    setSelectedPackage(pkg);
    setIsPurchasing(true);

    try {
      trackPurchaseInitiated(pkg.identifier);

      const customerInfo = await purchasePackage(pkg);

      if (customerInfo) {
        // Purchase successful!
        trackPurchaseCompleted(pkg.identifier);

        toast({
          title: 'Purchase Successful!',
          description: 'Your subscription is now active. Syncing...',
        });

        // Sync subscription to Supabase
        await forceRefreshSubscription(
          user.id,
          (result) => {
            toast({
              title: 'Welcome to Premium!',
              description: `You now have access to all ${result.planType === 'peace_plus_plan' ? 'content including courses' : 'meditations'}!`,
            });
            setShowPaywall(false);
          },
          (error) => {
            console.error('Sync error:', error);
            toast({
              title: 'Sync Warning',
              description: 'Purchase successful but sync failed. Please restart the app.',
              variant: 'destructive',
            });
          }
        );
      } else {
        // Purchase was cancelled
        console.log('Purchase cancelled by user');
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast({
        title: 'Purchase Failed',
        description: error.message || 'An error occurred during purchase.',
        variant: 'destructive',
      });
    } finally {
      setIsPurchasing(false);
      setSelectedPackage(null);
    }
  };

  // If user is premium, show content
  if (isPremium) {
    return <>{children}</>;
  }

  // If not showing upgrade gate, just render children
  if (!showUpgrade) {
    return <>{children}</>;
  }

  const featureText = feature || t('premiumGate.thisContent');

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
      <div className="w-20 h-20 bg-gradient-to-br from-warning to-warning/60 rounded-full flex items-center justify-center mb-6">
        <Crown className="w-10 h-10 text-white" />
      </div>

      <h2 className="text-2xl font-bold mb-3">
        {t('premiumGate.title')}
      </h2>
      
      <p className="text-muted-foreground mb-6 max-w-sm">
        {t('premiumGate.description', { feature: featureText })}
      </p>

      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-center gap-2 text-sm">
          <Sparkles className="w-4 h-4 text-warning" />
          <span>{t('premiumGate.features.unlimitedPremium')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Sparkles className="w-4 h-4 text-warning" />
          <span>{t('premiumGate.features.progressTracking')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Sparkles className="w-4 h-4 text-warning" />
          <span>{t('premiumGate.features.offlineDownloads')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Sparkles className="w-4 h-4 text-warning" />
          <span>{t('premiumGate.features.adFree')}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button
          className="btn-premium"
          onClick={handleUpgradeClick}
        >
          <Crown className="w-4 h-4 mr-2" />
          {t('premiumGate.upgradeToPremium')}
        </Button>

        {!isLoggedIn && (
          <Button
            variant="outline"
            onClick={() => setShowAuthModal(true)}
            className="w-full"
          >
            {t('premiumGate.signInToContinue')}
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="text-muted-foreground"
        >
          {t('premiumGate.goBack')}
        </Button>
      </div>

      {/* Parental Gate - MUST pass before paywall */}
      <ParentalGate
        isOpen={showParentalGate}
        onClose={() => setShowParentalGate(false)}
        onSuccess={handleParentalGateSuccess}
      />

      {/* Native IAP Paywall */}
      {showPaywall && isNative && (
        <div className="fixed inset-0 bg-background/95 z-50 overflow-y-auto">
          <div className="min-h-screen px-4 py-8">
            <div className="max-w-md mx-auto">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-warning to-warning/60 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Unlock Premium Access</h2>
                <p className="text-muted-foreground">
                  Choose the perfect plan for your family
                </p>
              </div>

              {/* Loading State */}
              {isLoadingOfferings && (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              )}

              {/* Offerings */}
              {!isLoadingOfferings && offerings?.current && (
                <div className="space-y-4 mb-6">
                  {offerings.current.availablePackages.map((pkg) => {
                    const isPeacePlus = pkg.identifier.includes('all');
                    const isSelected = selectedPackage?.identifier === pkg.identifier;

                    return (
                      <Card
                        key={pkg.identifier}
                        className={`p-6 cursor-pointer transition-all ${
                          isSelected ? 'ring-2 ring-primary' : ''
                        } ${isPurchasing && !isSelected ? 'opacity-50' : ''}`}
                        onClick={() => !isPurchasing && handlePurchase(pkg)}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold">
                              {isPeacePlus ? 'Peace Plus Plan' : 'Peace Plan'}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {pkg.product.priceString}/month
                            </p>
                          </div>
                          {isPeacePlus && (
                            <Badge className="bg-gradient-to-r from-primary to-secondary text-white">
                              Best Value
                            </Badge>
                          )}
                        </div>

                        <ul className="space-y-2 mb-4">
                          <li className="flex items-start gap-2 text-sm">
                            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>All Kids & Adults meditations</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>Progress tracking & streaks</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>Ad-free experience</span>
                          </li>
                          {isPeacePlus && (
                            <>
                              <li className="flex items-start gap-2 text-sm">
                                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                <span>Highly Meditated course</span>
                              </li>
                              <li className="flex items-start gap-2 text-sm">
                                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                <span>Rainbow Array course</span>
                              </li>
                            </>
                          )}
                        </ul>

                        <Button
                          className={`w-full ${isPeacePlus ? 'btn-premium' : ''}`}
                          disabled={isPurchasing}
                        >
                          {isPurchasing && isSelected ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            `Subscribe for ${pkg.product.priceString}/month`
                          )}
                        </Button>
                      </Card>
                    );
                  })}
                </div>
              )}

              {/* Error State */}
              {!isLoadingOfferings && !offerings?.current && (
                <Card className="p-6 text-center">
                  <p className="text-muted-foreground mb-4">
                    Unable to load subscription options. Please try again later.
                  </p>
                  <Button onClick={loadOfferings} variant="outline">
                    Retry
                  </Button>
                </Card>
              )}

              {/* Footer */}
              <div className="text-center space-y-2">
                <Button
                  variant="ghost"
                  onClick={() => setShowPaywall(false)}
                  disabled={isPurchasing}
                >
                  Cancel
                </Button>
                <p className="text-xs text-muted-foreground">
                  Subscriptions auto-renew monthly. Cancel anytime in your account settings.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="signin"
      />
    </div>
  );
};

export default PremiumGate;
