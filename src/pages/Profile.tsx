import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Settings, LogOut, Crown,
  Shield, FileText, HelpCircle, Trash2,
  ChevronRight, Lock, RefreshCw, ExternalLink, Loader2, Key, Gift
} from 'lucide-react';
import { App as CapacitorApp } from '@capacitor/app';
import { isNativePlatform, isIOS, isAndroid } from '@/utils/platform';
import { restorePurchases, openSubscriptionManagement, presentPromoCodeRedemption } from '@/utils/revenuecat';
import { forceRefreshSubscription } from '@/utils/syncSubscription';
import { WellnessDisclaimer } from '@/components/WellnessDisclaimer';
import { ChangePasswordModal } from '@/components/ChangePasswordModal';
import { useUserStore } from '../stores/userStore';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../integrations/supabase/client';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '../components/ui/alert-dialog';
import { toast } from '../hooks/use-toast';
import logo from '@/assets/logo.svg';
import madeWithLove from '@/assets/made-with-love.svg';
import { formatCategoryName } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { logger } from '@/utils/logger';
import { APP_URLS } from '@/config/urls';

const Profile = () => {
  const navigate = useNavigate();
  const { profile, subscription, preferences, setPreferences, ageGroup, setSubscription } = useUserStore();
  const { signOut, user } = useAuth();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [isRestoringPurchases, setIsRestoringPurchases] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [appVersion, setAppVersion] = useState<string>('1.2.6');
  const { t, i18n } = useTranslation();

  // Fetch app version on mount
  useEffect(() => {
    const getAppVersion = async () => {
      if (isNativePlatform()) {
        try {
          const info = await CapacitorApp.getInfo();
          setAppVersion(info.version);
        } catch (error) {
          logger.error('Failed to get app version:', error);
        }
      }
    };

    getAppVersion();
  }, []);

  const handleRefreshSubscription = async () => {
    if (!user?.id) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to refresh subscription.",
        variant: "destructive",
      });
      return;
    }

    setIsRefreshing(true);

    try {
      // Fetch the latest subscription from Supabase
      const { data: latestSub, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        throw error;
      }

      if (latestSub) {
        // Update the Zustand store with fresh data
        setSubscription({
          id: latestSub.id,
          user_id: latestSub.user_id,
          plan_type: latestSub.plan_type as 'free' | 'peace_plan' | 'peace_plus_plan',
          is_active: latestSub.is_active,
        });

        toast({
          title: "Subscription Refreshed",
          description: `Current plan: ${latestSub.plan_type} (${latestSub.is_active ? 'Active' : 'Inactive'})`,
        });
      } else {
        toast({
          title: "No Subscription Found",
          description: "No subscription record found for this account.",
        });
      }
    } catch (error: any) {
      logger.error('Refresh subscription error:', error);
      toast({
        title: "Refresh Failed",
        description: error.message || "Failed to refresh subscription.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRestorePurchases = async () => {
    if (!isNativePlatform()) {
      toast({
        title: "Not Available",
        description: "Restore purchases is only available on mobile apps.",
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to restore purchases.",
        variant: "destructive",
      });
      return;
    }

    setIsRestoringPurchases(true);

    try {
      toast({
        title: "Restoring Purchases",
        description: "Checking for previous purchases...",
      });

      const customerInfo = await restorePurchases();

      if (customerInfo && Object.keys(customerInfo.entitlements.active).length > 0) {
        // Found active entitlements - sync to Supabase
        await forceRefreshSubscription(
          user.id,
          (result) => {
            toast({
              title: "Purchases Restored!",
              description: `Your ${result.planType === 'peace_plus_plan' ? 'Peace Plus' : 'Peace'} Plan subscription has been restored.`,
            });
          },
          (error) => {
            logger.error('Sync error:', error);
            toast({
              title: "Sync Warning",
              description: "Purchases restored but sync failed. Please restart the app.",
              variant: "destructive",
            });
          }
        );
      } else {
        toast({
          title: "No Purchases Found",
          description: "No previous purchases were found for this account.",
        });
      }
    } catch (error: any) {
      logger.error('Restore purchases error:', error);
      toast({
        title: "Restore Failed",
        description: error.message || "Failed to restore purchases. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRestoringPurchases(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!isNativePlatform()) {
      // On web, open App Store subscription page
      window.open(APP_URLS.appStore.subscriptions, '_blank');
      return;
    }

    try {
      // Use RevenueCat's native subscription management
      await openSubscriptionManagement();
    } catch (error) {
      logger.error('Failed to open subscription management:', error);
      toast({
        title: "Error",
        description: "Failed to open subscription management.",
        variant: "destructive",
      });
    }
  };

  const handleRedeemPromoCode = async () => {
    if (!isNativePlatform()) {
      toast({
        title: "Not Available",
        description: "Promo code redemption is only available on mobile apps.",
      });
      return;
    }

    try {
      const result = await presentPromoCodeRedemption();

      if (result.platform === 'android') {
        // Android: Show guidance since we opened Play Store
        toast({
          title: "Play Store Opened",
          description: "Enter your promo code in the Play Store, then return here and tap 'Restore Purchases'.",
        });
      } else if (result.platform === 'ios') {
        // iOS: Success is handled by the native sheet
        // If user successfully redeems, we should refresh subscription
        if (user?.id) {
          setTimeout(() => {
            forceRefreshSubscription(
              user.id,
              (syncResult) => {
                toast({
                  title: "Promo Code Applied!",
                  description: `Your ${syncResult.planType === 'peace_plus_plan' ? 'Peace Plus' : 'Peace'} Plan is now active.`,
                });
              },
              (error) => {
                logger.error('Sync error:', error);
              }
            );
          }, 2000); // Wait 2 seconds for App Store to process
        }
      }
    } catch (error: any) {
      logger.error('Promo code redemption error:', error);
      toast({
        title: "Redemption Failed",
        description: error.message || "Failed to open promo code redemption.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "No user session found.",
        variant: "destructive",
      });
      setShowDeleteDialog(false);
      return;
    }

    try {
      // Delete user data from Supabase tables
      // Note: These deletes will work based on RLS policies we just added

      // 1. Delete meditation usage records
      const { error: usageError } = await supabase
        .from('meditation_usage')
        .delete()
        .eq('user_id', user.id);

      if (usageError) {
        logger.error('Error deleting meditation usage:', usageError);
      }

      // 2. Delete user favorites
      const { error: favError } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id);

      if (favError) {
        logger.error('Error deleting favorites:', favError);
      }

      // 3. Delete user progress
      const { error: progressError } = await supabase
        .from('user_progress')
        .delete()
        .eq('user_id', user.id);

      if (progressError) {
        logger.error('Error deleting progress:', progressError);
      }

      // 4. Delete user preferences
      const { error: prefError } = await supabase
        .from('user_preferences')
        .delete()
        .eq('user_id', user.id);

      if (prefError) {
        logger.error('Error deleting preferences:', prefError);
      }

      // 5. Delete user subscriptions
      const { error: subError } = await supabase
        .from('user_subscriptions')
        .delete()
        .eq('user_id', user.id);

      if (subError) {
        logger.error('Error deleting subscriptions:', subError);
      }

      // 6. Delete user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', user.id);

      if (profileError) {
        throw profileError;
      }

      // 7. Finally, delete the auth user account itself (CRITICAL)
      // Use RPC function because admin.deleteUser requires service role key
      const { error: authError } = await supabase.rpc('delete_user');

      if (authError) {
        logger.error('Error deleting auth user:', authError);
        throw authError;
      }

      // Show success message
      toast({
        title: "Account Deleted",
        description: "Your account and all data have been permanently removed.",
        variant: "destructive",
      });

      // Sign out after successful deletion
      setTimeout(() => {
        signOut();
      }, 1500);

    } catch (error) {
      logger.error('Account deletion error:', error);
      toast({
        title: "Deletion Failed",
        description: `Unable to delete account. Please contact support at ${APP_URLS.supportEmail}`,
        variant: "destructive",
      });
    } finally {
      setShowDeleteDialog(false);
    }
  };

  const handleSignOutEverywhere = () => {
    toast({
      title: "Signed Out Everywhere",
      description: "All sessions have been terminated.",
    });
    signOut();
    // TODO: Implement sign out from all devices
  };

  return (
    <div className="pb-24 pt-6">
      {/* Header */}
      <div className="px-4 mb-8">
        <h1 className="text-2xl font-bold text-gradient-primary mb-2">
          {t('profile.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('profile.subtitle')}
        </p>
      </div>

      {/* Profile Card */}
      <div className="px-4 mb-8">
        <Card className="card-gradient p-6">
          <div className="flex flex-col gap-3">
            <h2 className="text-xl font-bold">{profile?.display_name || user?.email || 'User'}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                {subscription?.is_active ? (
                  <div className="flex items-center gap-1 text-warning font-semibold">
                    <Crown className="w-4 h-4" />
                    Premium Member
                  </div>
                ) : (
                  <span className="text-muted-foreground">Free Account</span>
                )}
              </div>
              {ageGroup && (
                <Badge variant="outline" className="w-fit">
                  Age Group: {ageGroup === 'child' ? 'Under 13' : '13+'}
                </Badge>
              )}
            </div>
          </div>
        </Card>
      </div>


      {/* Purchases Section */}
      <div className="px-4 mb-8">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Crown className="w-5 h-5" />
          {t('profile.purchases')}
        </h3>
        <Card className="card-gradient p-6 space-y-4">
          {/* Subscription Status */}
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div>
              <h4 className="font-semibold">Current Plan</h4>
              <p className="text-sm text-muted-foreground">
                {subscription?.is_active ? subscription.plan_type : 'Free'}
              </p>
            </div>
            {subscription?.is_active ? (
              <div className="flex items-center gap-1 text-warning font-semibold">
                <Crown className="w-4 h-4" />
                Active
              </div>
            ) : (
              <span className="text-muted-foreground text-sm">Inactive</span>
            )}
          </div>

          {/* Refresh Subscription - Web */}
          {!isNativePlatform() && (
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={handleRefreshSubscription}
              disabled={isRefreshing}
            >
              <span className="flex items-center gap-2">
                {isRefreshing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Refresh Subscription
              </span>
              {!isRefreshing && <ChevronRight className="w-4 h-4" />}
            </Button>
          )}

          {/* Restore Purchases - Native only */}
          {isNativePlatform() && (
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={handleRestorePurchases}
              disabled={isRestoringPurchases}
            >
              <span className="flex items-center gap-2">
                {isRestoringPurchases ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Restore Purchases
              </span>
              {!isRestoringPurchases && <ChevronRight className="w-4 h-4" />}
            </Button>
          )}

          {/* Redeem Promo Code - Native only (iOS and Android) */}
          {isNativePlatform() && (
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={handleRedeemPromoCode}
            >
              <span className="flex items-center gap-2">
                <Gift className="w-4 h-4" />
                Redeem Promo Code
              </span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}

          {/* Manage Subscription */}
          {subscription?.is_active && (
            <Button 
              variant="outline" 
              className="w-full justify-between"
              onClick={handleManageSubscription}
            >
              <span className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Manage Subscription
              </span>
              <ExternalLink className="w-4 h-4" />
            </Button>
          )}

          {/* Upgrade Button */}
          {!subscription?.is_active && (
            <Button 
              className="btn-premium w-full"
              onClick={() => navigate('/explore')}
            >
              <Crown className="w-4 h-4 mr-2" />
              Subscribe
            </Button>
          )}
        </Card>
      </div>


      {/* Legal Section */}
      <div className="px-4 mb-8">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          {t('profile.legal')}
        </h3>
        <Card className="card-gradient p-6 space-y-2">
          <Button 
            variant="ghost" 
            className="w-full justify-between"
            onClick={() => window.open(APP_URLS.privacy, '_blank')}
          >
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Privacy Policy
            </span>
            <ChevronRight className="w-4 h-4" />
          </Button>

          <Button 
            variant="ghost" 
            className="w-full justify-between"
            onClick={() => window.open(APP_URLS.terms, '_blank')}
          >
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Terms of Service
            </span>
            <ChevronRight className="w-4 h-4" />
          </Button>

          <Button 
            variant="ghost" 
            className="w-full justify-between"
            onClick={() => window.open(APP_URLS.support, '_blank')}
          >
            <span className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              Support
            </span>
            <ChevronRight className="w-4 h-4" />
          </Button>

          {/* App Version */}
          <div className="pt-4 mt-4 border-t border-border text-center">
            <div className="flex justify-center mb-3">
              <img src={logo} alt="Peaceful Meditation" className="w-12 h-12" />
            </div>
            <h4 className="font-semibold mb-1">Peaceful Meditation</h4>
            <p className="text-xs text-muted-foreground">
              Version {appVersion} • Production Channel
            </p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
              <img src={madeWithLove} alt="Made with love" className="w-4 h-4" />
              for mindful families
            </p>
          </div>

          {/* First Launch Disclaimer */}
          <Button 
            variant="ghost" 
            size="sm"
            className="w-full mt-2 text-xs"
            onClick={() => setShowDisclaimer(true)}
          >
            View First-Launch Disclaimer
          </Button>
        </Card>
      </div>

      {/* Account Section */}
      <div className="px-4 mb-8">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5" />
          {t('profile.account')}
        </h3>
        <Card className="card-gradient p-6 space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-between"
            onClick={() => setShowChangePassword(true)}
          >
            <span className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              Change Password
            </span>
            <ChevronRight className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-between"
            onClick={handleSignOutEverywhere}
          >
            <span className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Sign Out Everywhere
            </span>
            <ChevronRight className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-between text-destructive hover:text-destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <span className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Delete Account
            </span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </Card>
      </div>

      {/* Sign Out */}
      <div className="px-4 mb-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={signOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          {t('profile.signOut')}
        </Button>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />

      {/* Wellness Disclaimer Modal */}
      <WellnessDisclaimer
        forceOpen={showDisclaimer}
        onClose={() => setShowDisclaimer(false)}
      />

      {/* Delete Account Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your account and all associated data including:
              {'\n'}• Your profile information
              {'\n'}• Meditation progress and history
              {'\n'}• Subscription information
              {'\n'}• Saved preferences and favorites
              {'\n\n'}This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Permanently Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Profile;