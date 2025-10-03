import { useState } from 'react';
import { CheckCircle, Sparkles, Music } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ParentalGate } from './ParentalGate';

interface SubscriptionCardProps {
  onSubscribe?: (plan: string) => void;
}

const SubscriptionCard = ({ onSubscribe }: SubscriptionCardProps) => {
  const [showParentalGate, setShowParentalGate] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSelectPlan = (plan: string) => {
    setSelectedPlan(plan);
    setShowParentalGate(true);
  };

  const handleParentalGateSuccess = () => {
    if (selectedPlan && onSubscribe) {
      onSubscribe(selectedPlan);
    } else {
      console.log('Selected plan:', selectedPlan);
      // TODO: Implement subscription logic
    }
  };

  return (
    <div className="space-y-6">
      {/* Two Cards Side-by-Side on Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
        {/* Peace Plan */}
        <Card className="card-gradient p-6 flex flex-col">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/20 rounded-full mb-3">
              <Music className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-1">Peace Plan</h3>
            <div className="text-3xl font-bold mt-2">
              $5.99
              <span className="text-sm font-normal text-muted-foreground">/month</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              All Meditations
            </p>
          </div>

          <div className="space-y-3 mb-6 flex-grow">
            <div className="flex items-start gap-3 text-sm">
              <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
              <span>Access to full audio meditation library</span>
            </div>
          </div>

          <Button 
            className="btn-soft w-full mt-auto"
            onClick={() => handleSelectPlan('peace')}
          >
            Subscribe
          </Button>
        </Card>

        {/* Peace Plus Plan - Highlighted */}
        <Card className="card-premium p-6 flex flex-col border-2 border-accent/50 relative">
          <div className="absolute top-3 right-3 bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full">
            Recommended
          </div>
          
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-accent to-warning rounded-full mb-3">
              <Sparkles className="w-6 h-6 text-accent-foreground" />
            </div>
            <h3 className="text-xl font-bold text-gradient-premium mb-1">
              Peace Plus Plan
            </h3>
            <div className="text-3xl font-bold text-gradient-premium mt-2">
              $9.99
              <span className="text-sm font-normal text-muted-foreground">/month</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              All Content
            </p>
          </div>

          <div className="space-y-3 mb-6 flex-grow">
            <div className="flex items-start gap-3 text-sm">
              <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
              <span className="font-medium">Meditations + Courses (Audio + Video)</span>
            </div>
          </div>

          <Button 
            className="btn-premium w-full mt-auto"
            onClick={() => handleSelectPlan('peace-plus')}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Subscribe
          </Button>
        </Card>
      </div>

      {/* Disclaimer */}
      <p className="text-sm text-muted-foreground text-center">
        Billed monthly. Cancel anytime.
      </p>

      {/* Parental Gate */}
      <ParentalGate
        isOpen={showParentalGate}
        onClose={() => setShowParentalGate(false)}
        onSuccess={handleParentalGateSuccess}
      />
    </div>
  );
};

export default SubscriptionCard;
