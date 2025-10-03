import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Settings, LogOut, Crown, 
  Shield, FileText, HelpCircle, Trash2, Database,
  ChevronRight, Lock, RefreshCw, ExternalLink
} from 'lucide-react';
import { WellnessDisclaimer } from '@/components/WellnessDisclaimer';
import { useUserStore } from '../stores/userStore';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../integrations/supabase/client';
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
import { formatCategoryName } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

const Profile = () => {
  const navigate = useNavigate();
  const { profile, subscription, preferences, setPreferences } = useUserStore();
  const { signOut, user } = useAuth();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const { t, i18n } = useTranslation();

  const handleRestorePurchases = () => {
    toast({
      title: "Restoring Purchases",
      description: "Checking for previous purchases...",
    });
    // TODO: Implement restore purchases logic
  };

  const handleManageSubscription = () => {
    // TODO: Deep link to subscription management
    window.open('https://apps.apple.com/account/subscriptions', '_blank');
  };

  const handleExportData = () => {
    toast({
      title: "Exporting Data",
      description: "Your data will be sent to your email within 24 hours.",
    });
    // TODO: Implement data export
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
        console.error('Error deleting meditation usage:', usageError);
      }

      // 2. Delete user favorites
      const { error: favError } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id);

      if (favError) {
        console.error('Error deleting favorites:', favError);
      }

      // 3. Delete user progress
      const { error: progressError } = await supabase
        .from('user_progress')
        .delete()
        .eq('user_id', user.id);

      if (progressError) {
        console.error('Error deleting progress:', progressError);
      }

      // 4. Delete user preferences
      const { error: prefError } = await supabase
        .from('user_preferences')
        .delete()
        .eq('user_id', user.id);

      if (prefError) {
        console.error('Error deleting preferences:', prefError);
      }

      // 5. Delete user subscriptions
      const { error: subError } = await supabase
        .from('user_subscriptions')
        .delete()
        .eq('user_id', user.id);

      if (subError) {
        console.error('Error deleting subscriptions:', subError);
      }

      // 6. Finally, delete user profile (most critical)
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', user.id);

      if (profileError) {
        throw profileError;
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
      console.error('Account deletion error:', error);
      toast({
        title: "Deletion Failed",
        description: "Unable to delete account. Please contact support at dev@peacefulkids.app",
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
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{profile?.display_name || user?.email || 'User'}</h2>
              {profile?.age && profile?.category_preference && (
                <p className="text-muted-foreground">
                  Age: {profile.age} • {formatCategoryName(profile.category_preference)} content
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                {subscription?.is_active ? (
                  <div className="flex items-center gap-1 text-warning font-semibold">
                    <Crown className="w-4 h-4" />
                    Premium Member
                  </div>
                ) : (
                  <span className="text-muted-foreground">Free Account</span>
                )}
              </div>
            </div>
          </div>

          {!subscription?.is_active && (
            <Button 
              className="btn-premium w-full"
              onClick={() => navigate('/explore')}
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Premium
            </Button>
          )}
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

          {/* Restore Purchases */}
          <Button 
            variant="outline" 
            className="w-full justify-between"
            onClick={handleRestorePurchases}
          >
            <span className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Restore Purchases
            </span>
            <ChevronRight className="w-4 h-4" />
          </Button>

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
              Upgrade to Premium
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
            onClick={() => window.open('https://peaceful-legal-a6ew5bxei-davids-projects-2b73b5ac.vercel.app/privacy', '_blank')}
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
            onClick={() => window.open('https://peaceful-legal-a6ew5bxei-davids-projects-2b73b5ac.vercel.app/terms', '_blank')}
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
            onClick={() => window.open('https://peaceful-legal-a6ew5bxei-davids-projects-2b73b5ac.vercel.app/support', '_blank')}
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
              <img src={logo} alt="Peaceful Kids" className="w-12 h-12" />
            </div>
            <h4 className="font-semibold mb-1">Peaceful Kids</h4>
            <p className="text-xs text-muted-foreground">
              Version 1.0.0 • Production Channel
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Made with 💜 for mindful families
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
            onClick={handleExportData}
          >
            <span className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Export My Data
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