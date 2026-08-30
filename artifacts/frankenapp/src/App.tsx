import { type ReactNode, useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';
import { Home } from '@/pages/Home';
import { LabOverlay } from '@/components/LabOverlay';
import { VideoIntro } from '@/components/VideoIntro';

const queryClient = new QueryClient();

function Router({ onOpenLab }: { onOpenLab: () => void }) {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/">
          <Home onOpenLab={onOpenLab} />
        </Route>
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  const [introOpen,  setIntroOpen]  = useState(false);
  const [labOpen,    setLabOpen]    = useState(false);
  const [forcePlay,  setForcePlay]  = useState(false);

  // Always start at the top on load/refresh
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
  }, []);

  // Dark mode when intro or lab is open (landing page is yellow)
  useEffect(() => {
    if (introOpen || labOpen) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [introOpen, labOpen]);

  function handleOpenLab() {
    setForcePlay(false);
    setIntroOpen(true);
  }

  function handleIntroComplete() {
    setForcePlay(false);
    setIntroOpen(false);
    setLabOpen(true);
  }

  function handleReplayIntro() {
    setLabOpen(false);
    setForcePlay(true);
    setTimeout(() => setIntroOpen(true), 350); // wait for lab exit animation
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router onOpenLab={handleOpenLab} />
        </WouterRouter>
        {/* Step 1 — intro video */}
        <VideoIntro
          open={introOpen}
          forcePlay={forcePlay}
          onComplete={handleIntroComplete}
        />
        {/* Step 2 — mutation lab */}
        <LabOverlay
          open={labOpen}
          onClose={() => setLabOpen(false)}
          onReplayIntro={handleReplayIntro}
        />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
