import { useState, useEffect } from 'react';
import { CheckCircle, Sparkles, Music } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ParentalGate } from './ParentalGate';
import { getSubscriptionIcon } from '@/utils/revenuecat';
import peacePlanBg from '@/assets/peace-plan-bg.svg';

interface SubscriptionCardProps {
  onSubscribe?: (plan: string) => void;
}

const SubscriptionCard = ({ onSubscribe }: SubscriptionCardProps) => {
  const [showParentalGate, setShowParentalGate] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [peacePlanIcon, setPeacePlanIcon] = useState<string | null>(null);
  const [peacePlusIcon, setPeacePlusIcon] = useState<string | null>(null);

  // Fetch subscription icons from RevenueCat metadata
  useEffect(() => {
    const fetchIcons = async () => {
      const [peaceIcon, plusIcon] = await Promise.all([
        getSubscriptionIcon('meditations_monthly'),
        getSubscriptionIcon('all_monthly')
      ]);
      setPeacePlanIcon(peaceIcon);
      setPeacePlusIcon(plusIcon);
    };

    fetchIcons();
  }, []);

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
        <div 
          className="relative rounded-lg border text-card-foreground shadow-sm p-6 flex flex-col overflow-hidden"
          style={{
            backgroundImage: `url(${peacePlanBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="relative z-10 mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/20 rounded-full mb-3">
              {peacePlanIcon ? (
                <img src={peacePlanIcon} alt="Peace Plan" className="w-6 h-6" />
              ) : (
                <Music className="w-6 h-6 text-primary" />
              )}
            </div>
            <h3 className="text-xl font-bold font-bebas mb-1">Peace Plan</h3>
            <div className="text-3xl font-bold font-bebas mt-2">
              $5.99
              <span className="text-sm font-normal font-sans text-muted-foreground">/month</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              All Meditations
            </p>
          </div>

          <div className="relative z-10 space-y-3 mb-6 flex-grow">
            <div className="flex items-start gap-3 text-sm">
              <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
              <span>Meditations for Kids</span>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
              <span>Meditations for Adults</span>
            </div>
          </div>

          <Button 
            className="relative z-10 btn-soft w-full mt-auto"
            onClick={() => handleSelectPlan('peace')}
          >
            Subscribe
          </Button>
        </div>

        {/* Peace Plus Plan - Highlighted */}
        <div 
          className="relative rounded-lg border-2 border-accent/50 text-card-foreground shadow-sm p-6 flex flex-col overflow-hidden"
          style={{
            backgroundImage: `url(${peacePlanBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Yellow overlay */}
          <div className="absolute inset-0 bg-yellow-400/20 z-0"></div>
          
          <div className="absolute top-3 right-3 bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full z-10">
            Recommended
          </div>

          <div className="relative z-10 mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-accent to-warning rounded-full mb-3">
              {peacePlusIcon ? (
                <img src={peacePlusIcon} alt="Peace Plus Plan" className="w-6 h-6" />
              ) : (
                <Sparkles className="w-6 h-6 text-accent-foreground" />
              )}
            </div>
            <h3 className="text-xl font-bold font-bebas text-gradient-premium mb-1">
              Peace Plus Plan
            </h3>
            <div className="text-3xl font-bold font-bebas text-gradient-premium mt-2">
              $9.99
              <span className="text-sm font-normal font-sans text-muted-foreground">/month</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              All Content
            </p>
          </div>

          <div className="relative z-10 space-y-3 mb-6 flex-grow">
            <div className="flex items-start gap-3 text-sm">
              <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
              <span>Meditations for Kids</span>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
              <span>Meditations for Adults</span>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
              <span className="font-medium">Highly Meditated Course</span>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
              <span className="font-medium">Rainbow Array Course</span>
            </div>
          </div>

          <Button 
            className="relative z-10 btn-premium w-full mt-auto"
            onClick={() => handleSelectPlan('peace-plus')}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Subscribe
          </Button>
        </div>
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
