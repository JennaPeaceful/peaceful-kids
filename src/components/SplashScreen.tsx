import { useEffect, useState } from 'react';
import logo from '@/assets/logo.svg';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Start exit animation after 2.5 seconds
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 2500);

    // Call onComplete after exit animation finishes
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-background via-primary/5 to-secondary/5 transition-opacity duration-500 ${
        isExiting ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center animate-fade-in">
        <img
          src={logo}
          alt="Peaceful"
          className="w-32 h-32 mb-6 animate-float"
        />
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
          Peaceful
        </h1>
        <p className="text-sm text-muted-foreground mt-2 animate-fade-in">
          Find Your Peace
        </p>
        <p className="text-xs text-muted-foreground/80 mt-1 animate-fade-in">
          Mindful Moments for Every Age
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;
