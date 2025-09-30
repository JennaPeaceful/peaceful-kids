import { User, Settings, Bell, Download, Heart, LogOut, Crown } from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import logo from '@/assets/logo.svg';

const Profile = () => {
  const { profile, subscription, preferences } = useUserStore();
  const { signOut } = useAuth();

  const menuItems = [
    { icon: Settings, label: 'Account Settings', action: () => {} },
    { icon: Bell, label: 'Notifications', action: () => {} },
    { icon: Download, label: 'Downloaded Content', action: () => {} },
    { icon: Heart, label: 'Favorites', action: () => {} },
  ];

  return (
    <div className="pb-24 pt-6">
      {/* Header */}
      <div className="px-4 mb-8">
        <h1 className="text-2xl font-bold text-gradient-primary mb-2">
          Profile
        </h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile Card */}
      <div className="px-4 mb-8">
        <Card className="card-gradient p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{profile?.display_name}</h2>
              <p className="text-muted-foreground">
                Age: {profile?.age} • {profile?.category_preference} content
              </p>
              <div className="flex items-center gap-2 mt-2">
                {subscription?.is_active ? (
                  <div className="flex items-center gap-1 text-warning font-semibold">
                    <Crown className="w-4 h-4" />
                    Premium Member
                  </div>
                ) : (
                  <span className="text-muted-foreground">Free Account</span>
                )}
              </div>
            </div>
          </div>

          {!subscription?.is_active && (
            <Button className="btn-premium w-full">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Premium
            </Button>
          )}
        </Card>
      </div>

      {/* Notification Settings */}
      <div className="px-4 mb-8">
        <h3 className="text-lg font-bold mb-4">Notification Settings</h3>
        <Card className="card-gradient p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Daily Reminder</h4>
              <p className="text-sm text-muted-foreground">
                Get reminded to meditate each day
              </p>
            </div>
            <Switch 
              checked={preferences?.notification_settings.daily_reminder}
              onCheckedChange={() => {}}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Streak Celebrations</h4>
              <p className="text-sm text-muted-foreground">
                Celebrate your meditation streaks
              </p>
            </div>
            <Switch 
              checked={preferences?.notification_settings.streak_celebration}
              onCheckedChange={() => {}}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">New Content</h4>
              <p className="text-sm text-muted-foreground">
                Notifications about new meditations
              </p>
            </div>
            <Switch 
              checked={preferences?.notification_settings.new_content}
              onCheckedChange={() => {}}
            />
          </div>
        </Card>
      </div>

      {/* Menu Items */}
      <div className="px-4 mb-8">
        <div className="space-y-2">
          {menuItems.map((item, index) => (
            <Card 
              key={index}
              className="card-gradient p-4 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={item.action}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="font-medium">{item.label}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* App Info */}
      <div className="px-4 mb-8">
        <Card className="card-gradient p-6 text-center">
          <div className="flex justify-center mb-3">
            <img src={logo} alt="Peaceful Kids" className="w-16 h-16" />
          </div>
          <h3 className="font-bold text-lg mb-2">Peaceful Kids</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Version 1.0.0 • Made with 💜 for mindful families
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <button className="hover:text-primary">Privacy Policy</button>
            <span>•</span>
            <button className="hover:text-primary">Terms of Service</button>
            <span>•</span>
            <button className="hover:text-primary">Support</button>
          </div>
        </Card>
      </div>

      {/* Logout */}
      <div className="px-4">
        <Button 
          variant="outline" 
          className="w-full text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
          onClick={signOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Profile;