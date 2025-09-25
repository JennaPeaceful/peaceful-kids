import { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserStore } from '@/stores/userStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Lock, Sparkles } from 'lucide-react';
import AuthModal from './AuthModal';

interface PremiumGateProps {
  children: ReactNode;
  feature?: string;
  showUpgrade?: boolean;
}

const PremiumGate = ({ children, feature = "this content", showUpgrade = true }: PremiumGateProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscription } = useUserStore();
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

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
      <div className="w-20 h-20 bg-gradient-to-br from-warning to-warning/60 rounded-full flex items-center justify-center mb-6">
        <Crown className="w-10 h-10 text-white" />
      </div>

      <h2 className="text-2xl font-bold mb-3">
        Premium Content
      </h2>
      
      <p className="text-muted-foreground mb-6 max-w-sm">
        Unlock access to {feature} and hundreds of premium meditations with Peaceful Kids Premium
      </p>

      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-center gap-2 text-sm">
          <Sparkles className="w-4 h-4 text-warning" />
          <span>Unlimited premium meditations</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Sparkles className="w-4 h-4 text-warning" />
          <span>Progress tracking & streaks</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Sparkles className="w-4 h-4 text-warning" />
          <span>Offline downloads</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Sparkles className="w-4 h-4 text-warning" />
          <span>Ad-free experience</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button className="btn-premium">
          <Crown className="w-4 h-4 mr-2" />
          Upgrade to Premium
        </Button>
        
        {!isLoggedIn && (
          <Button 
            variant="outline" 
            onClick={() => setShowAuthModal(true)}
            className="w-full"
          >
            Sign In to Continue
          </Button>
        )}
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate(-1)}
          className="text-muted-foreground"
        >
          ← Go Back
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