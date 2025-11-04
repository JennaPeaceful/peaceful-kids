import { useState } from 'react';
import { Baby, User, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useUserStore } from '@/stores/userStore';
import logo from '@/assets/logo.svg';

// Safe import for analytics - no-op if not available
const trackAgeGateResponse = async (ageGroup: string) => {
  try {
    const { trackAgeGateResponse: track } = await import('@/config/analytics');
    track(ageGroup);
  } catch {
    // Analytics not available in this environment
  }
};

interface AgeGateProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const AgeGate = ({ isOpen, onComplete }: AgeGateProps) => {
  const { setAgeGroup } = useUserStore();
  const [showUnder13Message, setShowUnder13Message] = useState(false);

  const handleAgeSelection = (group: 'child' | 'adult') => {
    // Track age gate response in analytics
    trackAgeGateResponse(group);

    if (group === 'child') {
      // COPPA Compliance: Block account creation for under-13 users
      // Show message explaining they need parental permission
      setShowUnder13Message(true);
    } else {
      // 13+ users can proceed with account creation
      // Store in localStorage
      localStorage.setItem('age-gate-completed', 'true');
      localStorage.setItem('user-age-group', group);

      // Store in Zustand
      setAgeGroup(group);

      // Complete the flow
      onComplete();
    }
  };

  const handleUnder13Continue = () => {
    // Allow under-13 users to browse free content without account
    localStorage.setItem('age-gate-completed', 'true');
    localStorage.setItem('user-age-group', 'child');
    setAgeGroup('child');
    onComplete();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="w-[90vw] max-w-md md:max-w-lg lg:max-w-2xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {showUnder13Message ? (
          // COPPA Compliance: Show message for under-13 users
          <>
            <DialogHeader>
              <div className="flex justify-center mb-4">
                <img src={logo} alt="Peaceful" className="w-20 h-20" />
              </div>
              <DialogTitle className="text-center text-2xl">
                Ask a Parent or Guardian
              </DialogTitle>
              <DialogDescription className="text-center text-base">
                To create an account and save your progress, please ask a parent or guardian to sign up for you.
              </DialogDescription>
            </DialogHeader>

            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You can still enjoy free meditations without an account! But to unlock premium features and save your progress, a parent needs to create an account.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col gap-3 mt-4">
              <Button
                onClick={handleUnder13Continue}
                className="w-full"
                size="lg"
              >
                Continue Without Account
              </Button>
              <Button
                onClick={() => setShowUnder13Message(false)}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Go Back
              </Button>
            </div>
          </>
        ) : (
          // Initial age selection screen
          <>
            <DialogHeader>
              <div className="flex justify-center mb-4">
                <img src={logo} alt="Peaceful" className="w-20 h-20" />
              </div>
              <DialogTitle className="text-center text-2xl">
                Welcome to Peaceful!
              </DialogTitle>
              <DialogDescription className="text-center text-base">
                Please select your age group to see content designed for you
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Child Button */}
              <Button
                onClick={() => handleAgeSelection('child')}
                className="flex flex-col items-center gap-3 h-auto py-8 bg-gradient-to-br from-secondary to-primary hover:scale-105 transition-transform rounded-2xl"
                size="lg"
              >
                <Baby className="w-12 h-12" />
                <span className="text-lg font-semibold">I am under 13</span>
              </Button>

              {/* Adult Button */}
              <Button
                onClick={() => handleAgeSelection('adult')}
                className="flex flex-col items-center gap-3 h-auto py-8 bg-gradient-to-br from-primary to-accent hover:scale-105 transition-transform rounded-2xl"
                size="lg"
              >
                <User className="w-12 h-12" />
                <span className="text-lg font-semibold">I am 13 or older</span>
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground mt-4">
              This helps us provide age-appropriate content for your meditation journey
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
