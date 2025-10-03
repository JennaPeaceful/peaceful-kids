import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trackParentalGatePassed } from '@/config/analytics';

interface ParentalGateProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ParentalGate = ({ isOpen, onClose, onSuccess }: ParentalGateProps) => {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');

  // Generate new random numbers when modal opens
  useEffect(() => {
    if (isOpen) {
      setNum1(Math.floor(Math.random() * 9) + 1);
      setNum2(Math.floor(Math.random() * 9) + 1);
      setAnswer('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correctAnswer = num1 + num2;

    if (parseInt(answer) === correctAnswer) {
      // Track successful parental gate passage
      trackParentalGatePassed();

      onSuccess();
      onClose();
    } else {
      setError('Incorrect answer. Please try again.');
      setAnswer('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Parental Verification</DialogTitle>
          <DialogDescription>
            To prevent accidental purchases, please solve this simple math problem:
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-center">
            <p className="text-3xl font-bold mb-4">
              {num1} + {num2} = ?
            </p>
            <Input
              type="number"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Enter answer"
              className="text-center text-xl"
              autoFocus
              required
            />
            {error && (
              <p className="text-destructive text-sm mt-2">{error}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Submit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
