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
import BottomNavigation from "./components/BottomNavigation";
import ProtectedRoute from "./components/ProtectedRoute";
import Explore from "./pages/Explore";
import Meditations from "./pages/Meditations";
import Tracking from "./pages/Tracking";
import Profile from "./pages/Profile";
import MeditationPlayer from "./pages/MeditationPlayer";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
    {children}
    <BottomNavigation />
  </div>
);

const App = () => {
  const { showSplash, completeSplash } = useSplash();

  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {showSplash ? (
            <SplashScreen onComplete={completeSplash} />
          ) : (
            <BrowserRouter>
              <AuthProvider>
                <Routes>
                  <Route path="/" element={<AppLayout><Explore /></AppLayout>} />
                  <Route path="/meditations" element={<AppLayout><Meditations /></AppLayout>} />
                  <Route path="/meditation/:id" element={<MeditationPlayer />} />
                  <Route path="/tracking" element={<AppLayout><Tracking /></AppLayout>} />
                  <Route path="/profile" element={<AppLayout><Profile /></AppLayout>} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AuthProvider>
            </BrowserRouter>
          )}
        </TooltipProvider>
      </QueryClientProvider>
    </I18nextProvider>
  );
};

export default App;
