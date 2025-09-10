import { Star, CheckCircle, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

const SubscriptionCard = () => {
  const benefits = [
    'Unlimited access to all meditations',
    'New content added weekly',
    'Offline download capability',
    'Progress tracking & insights',
    'No ads during sessions',
  ];

  return (
    <div className="card-premium p-6 text-center">
      <div className="mb-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-accent to-warning rounded-full mb-3">
          <Sparkles className="w-8 h-8 text-accent-foreground" />
        </div>
        <h3 className="text-xl font-bold text-gradient-premium mb-2">
          Unlock Premium
        </h3>
        <p className="text-sm text-muted-foreground">
          Get full access to our complete meditation library
        </p>
      </div>

      <div className="space-y-3 mb-6">
        {benefits.map((benefit, index) => (
          <div key={index} className="flex items-center gap-3 text-sm">
            <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
            <span className="text-left">{benefit}</span>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="text-center">
          <div className="text-2xl font-bold text-gradient-premium">
            $9.99
            <span className="text-sm font-normal text-muted-foreground">/month</span>
          </div>
          <p className="text-xs text-muted-foreground">Cancel anytime</p>
        </div>

        <Button className="btn-premium w-full">
          <Star className="w-4 h-4 mr-2" />
          Start Free Trial
        </Button>
        
        <p className="text-xs text-muted-foreground">
          7-day free trial, then $9.99/month
        </p>
      </div>
    </div>
  );
};

export default SubscriptionCard;