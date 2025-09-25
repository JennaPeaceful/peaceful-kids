import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useUserStore } from '@/stores/userStore';
import { toast } from 'sonner';

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
        if (subscription) {
          const typedSubscription = {
            ...subscription,
            plan_type: subscription.plan_type as 'free' | 'monthly' | 'yearly'
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
      {children}
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