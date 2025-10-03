import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useUserStore } from '@/stores/userStore';
import { toast } from 'sonner';
import { identifyUser as identifyAnalyticsUser, resetAnalytics, trackSignIn } from '@/config/analytics';
import { identifyUser as identifyRevenueCatUser, logoutUser as logoutRevenueCatUser } from '@/utils/revenuecat';
import { syncOnAppLaunch } from '@/utils/syncSubscription';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setProfile, setSubscription, setPreferences, login, logout } = useUserStore();

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profile) {
        // Cast the types to match our interfaces
        const typedProfile = {
          ...profile,
          category_preference: profile.category_preference as 'Kids' | 'Adults'
        };

        setProfile(typedProfile);
        login(typedProfile);

        // Set default subscription if none exists
        let planType: 'free' | 'peace_plan' | 'peace_plus_plan' = 'free';
        if (subscription) {
          // Map old plan types to new ones
          if (subscription.plan_type === 'peace_plan' || subscription.plan_type === 'peace_plus_plan') {
            planType = subscription.plan_type;
          } else if (subscription.plan_type === 'monthly') {
            planType = 'peace_plan';
          } else if (subscription.plan_type === 'yearly') {
            planType = 'peace_plus_plan';
          }

          const typedSubscription = {
            ...subscription,
            plan_type: planType
          };
          setSubscription(typedSubscription);
        } else {
          const defaultSubscription = {
            id: '1',
            user_id: userId,
            is_active: false,
            plan_type: 'free' as const,
          };
          setSubscription(defaultSubscription);
        }

        // Set default preferences
        const defaultPreferences = {
          id: '1',
          user_id: userId,
          preferred_age_group: profile.age <= 8 ? '6-8 years' : '9+ years',
          notification_settings: {
            daily_reminder: true,
            streak_celebration: true,
            new_content: true,
          },
        };
        setPreferences(defaultPreferences);

        // Track user in analytics
        identifyAnalyticsUser(userId, {
          email: profile.email || undefined,
          name: profile.display_name || undefined,
          age: profile.age || undefined,
          subscription_tier: planType,
        });

        // Identify user with RevenueCat for purchase attribution
        await identifyRevenueCatUser(userId);

        // Sync subscription status from RevenueCat on app launch
        // This ensures we catch any subscription changes that happened elsewhere
        await syncOnAppLaunch(userId);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error('Error signing out');
      } else {
        logout();
        resetAnalytics(); // Clear analytics user identity
        await logoutRevenueCatUser(); // Log out from RevenueCat
        toast.success('Signed out successfully');
      }
    } catch (error) {
      toast.error('An error occurred while signing out');
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer Supabase calls to avoid deadlock
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          logout();
        }
        
        setIsLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(() => {
          fetchUserProfile(session.user.id);
        }, 0);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signOut }}>
      {isLoading ? (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading...</p>
          </div>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};