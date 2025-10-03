import { Baby, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

  const handleAgeSelection = (group: 'child' | 'adult') => {
    // Store in localStorage
    localStorage.setItem('age-gate-completed', 'true');
    localStorage.setItem('user-age-group', group);

    // Store in Zustand
    setAgeGroup(group);

    // Track age gate response in analytics
    trackAgeGateResponse(group);

    // Complete the flow
    onComplete();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <img src={logo} alt="Peaceful Kids" className="w-20 h-20" />
          </div>
          <DialogTitle className="text-center text-2xl">
            Welcome to Peaceful Kids!
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
      </DialogContent>
    </Dialog>
  );
};
