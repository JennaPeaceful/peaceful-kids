import { AlertCircle, RefreshCw, WifiOff, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { APP_URLS } from '@/config/urls';

export type ErrorType = 'network' | 'payment' | 'generic' | 'auth';

interface ErrorStateProps {
  type?: ErrorType;
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  showSupport?: boolean;
}

const ERROR_CONFIGS = {
  network: {
    icon: WifiOff,
    title: 'Unable to connect',
    message: 'Please check your internet connection and try again.',
    defaultRetryLabel: 'Try Again',
  },
  payment: {
    icon: CreditCard,
    title: 'Payment could not be processed',
    message: 'Please try again or contact support if the problem persists.',
    defaultRetryLabel: 'Retry Payment',
  },
  auth: {
    icon: AlertCircle,
    title: 'Authentication required',
    message: 'Please sign in to continue.',
    defaultRetryLabel: 'Sign In',
  },
  generic: {
    icon: AlertCircle,
    title: 'Something went wrong',
    message: "We're working on it! Please try again in a moment.",
    defaultRetryLabel: 'Try Again',
  },
};

export const ErrorState = ({
  type = 'generic',
  title,
  message,
  onRetry,
  retryLabel,
  showSupport = true,
}: ErrorStateProps) => {
  const config = ERROR_CONFIGS[type];
  const Icon = config.icon;

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="card-gradient p-8 max-w-md w-full">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <Icon className="w-8 h-8 text-destructive" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold">
              {title || config.title}
            </h3>
            <p className="text-muted-foreground text-sm">
              {message || config.message}
            </p>
          </div>

          {onRetry && (
            <Button onClick={onRetry} className="w-full" variant="default">
              <RefreshCw className="w-4 h-4 mr-2" />
              {retryLabel || config.defaultRetryLabel}
            </Button>
          )}

          {showSupport && (
            <p className="text-xs text-muted-foreground">
              Need help? Contact us at {APP_URLS.supportEmail}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

// Inline error variant (for smaller spaces)
export const InlineErrorState = ({
  type = 'generic',
  message,
  onRetry,
  retryLabel,
}: Omit<ErrorStateProps, 'title' | 'showSupport'>) => {
  const config = ERROR_CONFIGS[type];
  const Icon = config.icon;

  return (
    <div className="flex items-center justify-center p-4 bg-destructive/5 rounded-lg border border-destructive/20">
      <div className="flex items-center gap-3 flex-1">
        <Icon className="w-5 h-5 text-destructive flex-shrink-0" />
        <p className="text-sm text-muted-foreground flex-1">
          {message || config.message}
        </p>
        {onRetry && (
          <Button onClick={onRetry} size="sm" variant="outline">
            <RefreshCw className="w-3 h-3 mr-1" />
            {retryLabel || 'Retry'}
          </Button>
        )}
      </div>
    </div>
  );
};
