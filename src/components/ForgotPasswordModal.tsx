import { useState, useEffect } from 'react';
import { Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Keyboard } from '@capacitor/keyboard';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal = ({ isOpen, onClose }: ForgotPasswordModalProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Handle keyboard show/hide for iOS scrolling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyboardShow = (info: any) => {
      console.log('🎹 Keyboard shown (ForgotPassword):', info);
      // Scroll the focused element into view after a short delay
      setTimeout(() => {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement && activeElement.tagName === 'INPUT') {
          console.log('📍 Scrolling to input:', activeElement.id);
          activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    };

    const handleKeyboardHide = () => {
      console.log('🎹 Keyboard hidden (ForgotPassword)');
    };

    // Add listeners
    Keyboard.addListener('keyboardWillShow', handleKeyboardShow);
    Keyboard.addListener('keyboardDidShow', handleKeyboardShow);
    Keyboard.addListener('keyboardWillHide', handleKeyboardHide);

    console.log('✅ Keyboard listeners added (ForgotPassword)');

    // Cleanup
    return () => {
      Keyboard.removeAllListeners();
      console.log('🧹 Keyboard listeners removed (ForgotPassword)');
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);

    try {
      // Use production URL for mobile apps and production web
      // Only use dynamic origin for local web development (http://localhost)
      const isLocalWebDev =
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
        window.location.protocol === 'http:';

      const redirectUrl = isLocalWebDev
        ? `${window.location.origin}/reset-password`
        : 'https://app.peacefulkids.app/reset-password';

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) throw error;

      setEmailSent(true);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error(error.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setEmailSent(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            {emailSent
              ? "We've sent you a password reset link. Check your email and click the link to reset your password."
              : "Enter your email address and we'll send you a link to reset your password."}
          </DialogDescription>
        </DialogHeader>

        {!emailSent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  autoFocus
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg bg-green-50 dark:bg-green-950 p-4 text-sm text-green-800 dark:text-green-200">
              <p className="font-medium mb-1">Email sent successfully!</p>
              <p>Check your inbox at <strong>{email}</strong> for the password reset link.</p>
            </div>

            <Button
              onClick={handleClose}
              className="w-full"
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
