import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "./lib/i18n";
import { AuthProvider } from "./hooks/useAuth";
import { useSplash } from "./hooks/useSplash";
import SplashScreen from "./components/SplashScreen";
import { AgeGate } from "./components/AgeGate";
import { WellnessDisclaimer } from "./components/WellnessDisclaimer";
import { ErrorBoundary } from "./components/ErrorBoundary";
import BottomNavigation from "./components/BottomNavigation";
import ScrollToTop from "./components/ScrollToTop";
import Explore from "./pages/Explore";
import Meditations from "./pages/Meditations";
import Tracking from "./pages/Tracking";
import Profile from "./pages/Profile";
import MeditationPlayer from "./pages/MeditationPlayer";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import { useUserStore } from "./stores/userStore";

const queryClient = new QueryClient();

const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 pt-safe">
    {children}
    <BottomNavigation />
  </div>
);

const App = () => {
  const { showSplash, completeSplash } = useSplash();
  const [showAgeGate, setShowAgeGate] = useState(false);
  const { setAgeGroup } = useUserStore();

  // Hide native Capacitor splash screen as soon as web app is loaded
  useEffect(() => {
    const hideNativeSplash = async () => {
      if (import.meta.env.VITE_CAPACITOR_ENABLED === 'true') {
        try {
          const { SplashScreen } = await import('@capacitor/splash-screen');
          await SplashScreen.hide();
        } catch (error) {
          // SplashScreen not available in this environment
          console.log('SplashScreen not available:', error);
        }
      }
    };
    hideNativeSplash();
  }, []);

  useEffect(() => {
    const ageGateCompleted = localStorage.getItem('age-gate-completed');
    const savedAgeGroup = localStorage.getItem('user-age-group');

    if (!ageGateCompleted) {
      setShowAgeGate(true);
    } else if (savedAgeGroup) {
      // Restore ageGroup to userStore
      setAgeGroup(savedAgeGroup as 'child' | 'adult');
    }
  }, [setAgeGroup]);

  const handleAgeGateComplete = () => {
    setShowAgeGate(false);
  };

  return (
    <ErrorBoundary>
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <WellnessDisclaimer />

            {/* Age Gate - Shows first, before splash */}
            <AgeGate isOpen={showAgeGate} onComplete={handleAgeGateComplete} />

            {showSplash ? (
              <SplashScreen onComplete={completeSplash} />
            ) : (
              <BrowserRouter>
                <ScrollToTop />
                <AuthProvider>
                  <Routes>
                    <Route path="/" element={<AppLayout><Explore /></AppLayout>} />
                    <Route path="/explore" element={<AppLayout><Explore /></AppLayout>} />
                    <Route path="/meditations" element={<AppLayout><Meditations /></AppLayout>} />
                    <Route path="/meditation/:id" element={<AppLayout><MeditationPlayer /></AppLayout>} />
                    <Route path="/tracking" element={<AppLayout><Tracking /></AppLayout>} />
                    <Route path="/profile" element={<AppLayout><Profile /></AppLayout>} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </AuthProvider>
              </BrowserRouter>
            )}
          </TooltipProvider>
        </QueryClientProvider>
      </I18nextProvider>
    </ErrorBoundary>
  );
};

export default App;
