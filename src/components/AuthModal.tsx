import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

const AuthModal = ({ isOpen, onClose, initialMode = 'signin' }: AuthModalProps) => {
  const { t } = useTranslation();
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: ''
  });

  const handleDevLogin = async () => {
    setIsLoading(true);
    try {
      // Create or sign in with a test account
      const { error } = await supabase.auth.signInWithPassword({
        email: 'dev@peacefulkids.app',
        password: 'testpass123',
      });

      if (error) {
        // If login fails, try to create the test account
        const { error: signUpError } = await supabase.auth.signUp({
          email: 'dev@peacefulkids.app',
          password: 'testpass123',
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              display_name: 'Dev User'
            }
          }
        });

        if (signUpError) {
          toast.error('Dev login failed: ' + signUpError.message);
        } else {
          toast.success('Dev account created! Signing you in...');
          // Try to sign in again
          await supabase.auth.signInWithPassword({
            email: 'dev@peacefulkids.app',
            password: 'testpass123',
          });
        }
      } else {
        toast.success('Dev login successful!');
        onClose();
      }
    } catch (error) {
      toast.error('Dev login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              display_name: formData.displayName
            }
          }
        });

        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('This email is already registered. Try signing in instead.');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Account created successfully! You can now sign in.');
          onClose();
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Invalid email or password. Please try again.');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Welcome back!');
          onClose();
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="text-center mb-4">
            <div className="text-4xl mb-4">🧘‍♂️</div>
            <DialogTitle className="text-2xl font-bold text-gradient-primary mb-2">
              {isSignUp ? t('auth.joinPeaceful') : t('auth.welcomeBack')}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              {isSignUp ? t('auth.createJourney') : t('auth.continueJourney')}
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <>
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-sm font-medium">
                  Display Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="Enter your name"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="pl-10 pr-10"
                minLength={6}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </Button>
        </form>

        {/* Dev Mode Section - Only visible in development */}
        {import.meta.env.DEV && (
          <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-dashed border-muted-foreground/30">
            <h3 className="text-xs font-medium text-muted-foreground mb-2 text-center">
              🚧 Developer Mode
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDevLogin}
              disabled={isLoading}
              className="w-full text-xs"
            >
              Quick Dev Login (dev@peacefulkids.app)
            </Button>
          </div>
        )}

        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-primary hover:underline"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;