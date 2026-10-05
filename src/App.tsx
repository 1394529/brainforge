import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './client/context/AuthContext';
import { LanguageProvider, useLanguage } from './client/context/LanguageContext';
import { Header, AppTab } from './client/components/layout/Header';
import { LandingPage } from './client/pages/LandingPage';
import { HowItWorksPage } from './client/pages/HowItWorksPage';
import { PricingPage } from './client/pages/PricingPage';
import { ContactPage } from './client/pages/ContactPage';
import { LegalPage } from './client/pages/LegalPage';
import { Footer } from './client/components/layout/Footer';
import { DashboardPage } from './client/pages/DashboardPage';
import { CoachPage } from './client/pages/CoachPage';
import { TrainingPage } from './client/pages/TrainingPage';
import { DailyChallengePage } from './client/pages/DailyChallengePage';
import { LeaderboardPage } from './client/pages/LeaderboardPage';
import { AchievementsPage } from './client/pages/AchievementsPage';
import { StreakPage } from './client/pages/StreakPage';
import { StatsPage } from './client/pages/StatsPage';
import { HistoryPage } from './client/pages/HistoryPage';
import { ProfilePage } from './client/pages/ProfilePage';
import { SettingsPage } from './client/pages/SettingsPage';
import { AdminPage } from './client/pages/AdminPage';
import { AuthPage } from './client/pages/AuthPage';
import { AuthModal } from './client/pages/AuthModal';
import { GamificationToast } from './client/components/ui/GamificationToast';
import { GamificationNotification } from './types';

function parsePathToTab(path: string): AppTab | 'forgot-password' | 'reset-password' {
  const normalized = path.replace(/\/$/, '') || '/';
  if (normalized === '/' || normalized === '/home') return 'home';
  if (normalized === '/dashboard') return 'dashboard';
  if (normalized === '/coach' || normalized === '/dashboard/coach') return 'coach';
  if (normalized === '/daily') return 'daily';
  if (normalized === '/train') return 'train';
  if (normalized === '/leaderboard') return 'leaderboard';
  if (normalized === '/achievements') return 'achievements';
  if (normalized === '/streak') return 'streak';
  if (normalized === '/stats') return 'stats';
  if (normalized === '/profile/history' || normalized === '/history') return 'history';
  if (normalized === '/profile') return 'profile';
  if (normalized === '/settings') return 'settings';
  if (normalized.startsWith('/admin')) return 'admin';
  if (normalized === '/login') return 'login';
  if (normalized === '/signup') return 'signup';
  if (normalized === '/forgot-password') return 'forgot-password';
  if (normalized === '/reset-password') return 'reset-password';
  if (normalized === '/how' || normalized === '/fonctionnement') return 'how';
  if (normalized === '/pricing' || normalized === '/tarifs') return 'pricing';
  if (normalized === '/contact') return 'contact';
  if (
    normalized === '/privacy' ||
    normalized === '/confidentialite' ||
    normalized === '/fr/confidentialite' ||
    normalized === '/en/privacy'
  ) return 'privacy';
  if (
    normalized === '/terms' ||
    normalized === '/conditions' ||
    normalized === '/fr/conditions' ||
    normalized === '/en/terms'
  ) return 'terms';
  return 'home';
}

function parseTabToPath(tab: AppTab | 'forgot-password' | 'reset-password', locale: 'fr' | 'en' = 'fr'): string {
  switch (tab) {
    case 'home':
      return '/';
    case 'dashboard':
      return '/dashboard';
    case 'coach':
      return '/coach';
    case 'daily':
      return '/daily';
    case 'train':
      return '/train';
    case 'leaderboard':
      return '/leaderboard';
    case 'achievements':
      return '/achievements';
    case 'streak':
      return '/streak';
    case 'stats':
      return '/stats';
    case 'history':
      return '/profile/history';
    case 'profile':
      return '/profile';
    case 'settings':
      return '/settings';
    case 'admin':
      return '/admin';
    case 'login':
      return '/login';
    case 'signup':
      return '/signup';
    case 'forgot-password':
      return '/forgot-password';
    case 'reset-password':
      return '/reset-password';
    case 'how':
      return locale === 'fr' ? '/fonctionnement' : '/how';
    case 'pricing':
      return locale === 'fr' ? '/tarifs' : '/pricing';
    case 'contact':
      return '/contact';
    case 'privacy':
      return locale === 'fr' ? '/fr/confidentialite' : '/en/privacy';
    case 'terms':
      return locale === 'fr' ? '/fr/conditions' : '/en/terms';
    default:
      return '/';
  }
}

function AppContent() {
  const { user, isLoading } = useAuth();
  const { locale } = useLanguage();
  const [currentTab, setCurrentTab] = useState<AppTab | 'forgot-password' | 'reset-password'>(() => {
    return parsePathToTab(window.location.pathname);
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<GamificationNotification[]>([]);
  const [trainingPreferredType, setTrainingPreferredType] = useState<any>();
  const [trainingChallengeId, setTrainingChallengeId] = useState<string | undefined>();

  const handleNotification = (notif: GamificationNotification) => {
    setNotifications((prev) => [...prev, notif]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
    }, 6000);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const navigateTo = (tab: AppTab | 'forgot-password' | 'reset-password') => {
    setCurrentTab(tab);
    const newPath = parseTabToPath(tab, locale);
    if (window.location.pathname !== newPath) {
      window.history.pushState({}, '', newPath);
    }
  };

  // Sync with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentTab(parsePathToTab(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Protected route enforcement (Section 8)
  useEffect(() => {
    if (isLoading) return;

    const protectedTabs = [
      'dashboard',
      'daily',
      'train',
      'leaderboard',
      'achievements',
      'streak',
      'stats',
      'history',
      'profile',
      'settings',
      'admin',
    ];
    if (protectedTabs.includes(currentTab) && !user) {
      // Redirect unauthenticated user to /login
      navigateTo('login');
    }
  }, [user, isLoading, currentTab]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Navigation Header */}
      <Header
        activeTab={
          currentTab === 'forgot-password' || currentTab === 'reset-password'
            ? 'login'
            : currentTab
        }
        onSelectTab={(tab) => navigateTo(tab)}
        onOpenAuth={() => navigateTo('login')}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center pb-16 md:pb-8">
        {/* Public Marketing Pages */}
        {currentTab === 'home' && (
          <LandingPage
            onStart={() => navigateTo(user ? 'train' : 'signup')}
            onDiscover={() => navigateTo('how')}
            onSignUp={() => navigateTo('signup')}
            onLogin={() => navigateTo('login')}
            onPricing={() => navigateTo('pricing')}
            onContact={() => navigateTo('contact')}
          />
        )}

        {currentTab === 'how' && (
          <HowItWorksPage
            onSignUp={() => navigateTo('signup')}
            onViewPricing={() => navigateTo('pricing')}
            onStart={() => navigateTo(user ? 'train' : 'signup')}
          />
        )}

        {currentTab === 'pricing' && (
          <PricingPage
            onSelectFree={() => navigateTo(user ? 'train' : 'signup')}
            onSelectPremium={() => navigateTo('signup')}
            onViewHow={() => navigateTo('how')}
          />
        )}

        {/* Contact Page */}
        {currentTab === 'contact' && (
          <ContactPage onBackToHome={() => navigateTo('home')} />
        )}

        {/* Legal Pages */}
        {currentTab === 'privacy' && (
          <LegalPage type="privacy" onBack={() => navigateTo('home')} />
        )}

        {currentTab === 'terms' && (
          <LegalPage type="terms" onBack={() => navigateTo('home')} />
        )}

        {/* Dashboard */}
        {currentTab === 'dashboard' && (
          <DashboardPage
            onStartTraining={(type, challengeId) => {
              setTrainingPreferredType(type);
              setTrainingChallengeId(challengeId);
              navigateTo('train');
            }}
            onViewHistory={() => navigateTo('history')}
            onGoToDaily={() => navigateTo('daily')}
            onGoToLeaderboard={() => navigateTo('leaderboard')}
            onGoToAchievements={() => navigateTo('achievements')}
            onGoToStreak={() => navigateTo('streak')}
            onGoToStats={() => navigateTo('stats')}
            onGoToCoach={() => navigateTo('coach')}
          />
        )}

        {/* AI Coach (V1.5) */}
        {currentTab === 'coach' && (
          <CoachPage
            onBackToDashboard={() => navigateTo('dashboard')}
            onStartChallenge={(challengeId) => {
              setTrainingChallengeId(challengeId);
              setTrainingPreferredType(undefined);
              navigateTo('train');
            }}
          />
        )}

        {/* Daily Challenge (V1.4) */}
        {currentTab === 'daily' && (
          <DailyChallengePage
            onBackToDashboard={() => navigateTo('dashboard')}
            onViewLeaderboard={() => navigateTo('leaderboard')}
            onTriggerNotification={handleNotification}
          />
        )}

        {/* Leaderboard (V1.4) */}
        {currentTab === 'leaderboard' && (
          <LeaderboardPage onGoToSettings={() => navigateTo('settings')} />
        )}

        {/* Achievements (V1.4) */}
        {currentTab === 'achievements' && (
          <AchievementsPage onBackToProfile={() => navigateTo('profile')} />
        )}

        {/* Streak (V1.4) */}
        {currentTab === 'streak' && (
          <StreakPage
            onBackToProfile={() => navigateTo('profile')}
            onGoToDaily={() => navigateTo('daily')}
          />
        )}

        {/* User Stats (V1.4) */}
        {currentTab === 'stats' && (
          <StatsPage onBackToProfile={() => navigateTo('profile')} />
        )}

        {/* Training Games */}
        {currentTab === 'train' && (
          <TrainingPage
            preferredType={trainingPreferredType}
            initialChallengeId={trainingChallengeId}
            onViewHistory={() => navigateTo('history')}
            onBackToDashboard={() => {
              setTrainingChallengeId(undefined);
              setTrainingPreferredType(undefined);
              navigateTo('dashboard');
            }}
            onTriggerNotification={handleNotification}
          />
        )}

        {/* History */}
        {currentTab === 'history' && (
          <HistoryPage onStartTraining={() => navigateTo('train')} />
        )}

        {/* User Profile */}
        {currentTab === 'profile' && <ProfilePage />}

        {/* Settings */}
        {currentTab === 'settings' && <SettingsPage />}

        {/* Admin Dashboard & Management */}
        {currentTab === 'admin' && (
          <AdminPage onBackToDashboard={() => navigateTo('dashboard')} />
        )}

        {/* Authentication Pages */}
        {currentTab === 'login' && (
          <AuthPage
            initialMode="login"
            onSuccess={() => navigateTo('dashboard')}
          />
        )}

        {currentTab === 'signup' && (
          <AuthPage
            initialMode="signup"
            onSuccess={() => navigateTo('dashboard')}
          />
        )}

        {currentTab === 'forgot-password' && (
          <AuthPage
            initialMode="forgot-password"
            onSuccess={() => navigateTo('login')}
          />
        )}

        {currentTab === 'reset-password' && (
          <AuthPage
            initialMode="reset-password"
            onSuccess={() => navigateTo('login')}
          />
        )}
      </main>

      {/* Footer component (Shown on public & account pages, excluded during active workout trials) */}
      {currentTab !== 'train' && (
        <Footer onNavigate={(tab) => navigateTo(tab)} />
      )}

      {/* Quick Auth Modal fallback */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Real-time Gamification Notifications Toast (V1.4) */}
      <GamificationToast
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
