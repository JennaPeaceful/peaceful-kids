import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AuthModal from './AuthModal';
import exploreIcon from '@/assets/nav-explore.svg';
import meditationsIcon from '@/assets/nav-meditations.svg';
import trackingIcon from '@/assets/nav-tracking.svg';
import profileIcon from '@/assets/nav-profile.svg';

const BottomNavigation = () => {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  
  const handleAuthRequired = (path: string) => {
    if (!user && (path === '/tracking' || path === '/profile')) {
      setAuthModalMode('signin');
      setShowAuthModal(true);
      return;
    }
    // If user is authenticated or path doesn't require auth, navigation is handled by NavLink
  };

  const navItems = [
    { to: '/', icon: exploreIcon, label: 'Explore', requiresAuth: false },
    { to: '/meditations', icon: meditationsIcon, label: 'Meditations', requiresAuth: false },
    { to: '/tracking', icon: trackingIcon, label: 'Tracking', requiresAuth: true },
    { to: '/profile', icon: profileIcon, label: 'Profile', requiresAuth: true },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex items-center justify-around px-4 py-2">
        {navItems.map(({ to, icon, label, requiresAuth }) => (
          requiresAuth && !user ? (
            <button
              key={to}
              onClick={() => handleAuthRequired(to)}
              className="flex flex-col items-center justify-center min-touch py-2 px-3 rounded-xl transition-all duration-300 text-muted-foreground hover:text-primary hover:bg-primary/5"
            >
              <img src={icon} alt={label} className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ) : (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center min-touch py-2 px-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'text-primary bg-primary/10 scale-105'
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                }`
              }
            >
              <img src={icon} alt={label} className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{label}</span>
            </NavLink>
          )
        ))}
      </div>
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        initialMode={authModalMode}
      />
    </nav>
  );
};

export default BottomNavigation;