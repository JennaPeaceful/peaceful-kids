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

export const WellnessDisclaimer = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hasAccepted = localStorage.getItem(DISCLAIMER_STORAGE_KEY);
    if (!hasAccepted) {
      setOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(DISCLAIMER_STORAGE_KEY, 'true');
    setOpen(false);
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
