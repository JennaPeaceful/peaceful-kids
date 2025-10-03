import { Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface LoadingStateProps {
  message?: string;
  variant?: 'spinner' | 'skeleton' | 'card-grid' | 'list';
  count?: number;
}

export const LoadingState = ({
  message = 'Loading...',
  variant = 'spinner',
  count = 3,
}: LoadingStateProps) => {
  if (variant === 'spinner') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    );
  }

  if (variant === 'card-grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} className="p-4 space-y-3">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </Card>
        ))}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // variant === 'skeleton'
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );
};

// Inline loading variant (for buttons, inline elements)
export const InlineLoadingState = ({ message }: { message?: string }) => {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="w-4 h-4 animate-spin" />
      {message && <span>{message}</span>}
    </div>
  );
};

// Full page loading (for route transitions)
export const PageLoadingState = ({ message = 'Loading...' }: { message?: string }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};
