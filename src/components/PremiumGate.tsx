import { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserStore } from '@/stores/userStore';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Lock, Sparkles } from 'lucide-react';
import AuthModal from './AuthModal';

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
  
  const isPremium = subscription?.is_active;
  const isLoggedIn = !!user;

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
        <Button className="btn-premium">
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
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        initialMode="signin"
      />
    </div>
  );
};

export default PremiumGate;
