import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const DISCLAIMER_STORAGE_KEY = 'wellness_disclaimer_accepted';

interface WellnessDisclaimerProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export const WellnessDisclaimer = ({ forceOpen = false, onClose }: WellnessDisclaimerProps) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (forceOpen) {
      setOpen(true);
      return;
    }
    
    const hasAccepted = localStorage.getItem(DISCLAIMER_STORAGE_KEY);
    if (!hasAccepted) {
      setOpen(true);
    }
  }, [forceOpen]);

  const handleAccept = () => {
    localStorage.setItem(DISCLAIMER_STORAGE_KEY, 'true');
    setOpen(false);
    onClose?.();
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-xl">Wellness Disclaimer</DialogTitle>
          <DialogDescription className="text-base pt-4">
            Peaceful provides meditation for general wellness, not medical treatment. 
            Consult healthcare professionals for medical concerns.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button onClick={handleAccept} className="w-full sm:w-auto">
            I Understand
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
