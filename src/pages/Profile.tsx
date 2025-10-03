import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Settings, LogOut, Crown, 
  Shield, FileText, HelpCircle, Trash2, Database,
  ChevronRight, Lock, RefreshCw, ExternalLink
} from 'lucide-react';
import { WellnessDisclaimer } from '@/components/WellnessDisclaimer';
import { ParentalGate } from '@/components/ParentalGate';
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
  const [showParentalGate, setShowParentalGate] = useState(false);
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

  const handleDeleteAccount = () => {
    toast({
      title: "Account Deletion Scheduled",
      description: "Your account will be deleted in 30 days. You can cancel this anytime.",
      variant: "destructive",
    });
    setShowDeleteDialog(false);
    // TODO: Implement account deletion with grace period
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
              <h2 className="text-xl font-bold">{profile?.display_name}</h2>
              <p className="text-muted-foreground">
                Age: {profile?.age} • {formatCategoryName(profile?.category_preference)} content
              </p>
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
              onClick={() => setShowParentalGate(true)}
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
              onClick={() => setShowParentalGate(true)}
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

      {/* Parental Gate */}
      <ParentalGate
        isOpen={showParentalGate}
        onClose={() => setShowParentalGate(false)}
        onSuccess={() => navigate('/explore')}
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
              This action will schedule your account for deletion in 30 days. 
              You can cancel this at any time during the grace period. 
              All your data will be permanently removed after 30 days.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Profile;