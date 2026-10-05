import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Zap, Brain, History, User, Globe, LogIn, LogOut, Settings, Shield, UserPlus, Home, Info, DollarSign, Trophy, Calendar, Sparkles } from 'lucide-react';
import { ProgressBar } from '../ui/ProgressBar';

export type AppTab =
  | 'home'
  | 'dashboard'
  | 'coach'
  | 'train'
  | 'daily'
  | 'leaderboard'
  | 'achievements'
  | 'streak'
  | 'stats'
  | 'history'
  | 'profile'
  | 'settings'
  | 'admin'
  | 'login'
  | 'signup'
  | 'how'
  | 'pricing'
  | 'contact'
  | 'privacy'
  | 'terms';

interface HeaderProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onOpenAuth?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onSelectTab }) => {
  const { user, progress, logout } = useAuth();
  const { locale, toggleLocale, t } = useLanguage();

  const level = progress?.currentLevel || 1;
  const totalXp = progress?.totalXp || 0;
  const levelProgress = progress?.levelProgress?.progressPercentage || 0;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => onSelectTab(user ? 'dashboard' : 'home')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-zinc-950 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Brain className="w-5 h-5 font-black" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                BrainForge
              </span>
              <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                v1.5
              </span>
            </div>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
          {!user ? (
            <>
              <button
                type="button"
                onClick={() => onSelectTab('home')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'home'
                    ? 'bg-zinc-800 text-emerald-400 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>{t.nav.home}</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectTab('how')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'how'
                    ? 'bg-zinc-800 text-emerald-400 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Info className="w-3.5 h-3.5" />
                <span>{t.nav.howItWorks}</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectTab('pricing')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'pricing'
                    ? 'bg-zinc-800 text-emerald-400 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>{t.nav.pricing}</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onSelectTab('dashboard')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'dashboard'
                    ? 'bg-zinc-800 text-emerald-400 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>{t.nav.dashboard}</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('daily')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'daily'
                    ? 'bg-zinc-800 text-emerald-400 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.nav.daily || (locale === 'fr' ? 'Défi du Jour' : 'Daily Challenge')}</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('coach')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'coach'
                    ? 'bg-zinc-800 text-emerald-400 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>{t.nav.coach || (locale === 'fr' ? 'Coach IA' : 'AI Coach')}</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('train')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'train'
                    ? 'bg-zinc-800 text-emerald-400 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Brain className="w-3.5 h-3.5" />
                <span>{t.nav.train}</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('leaderboard')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'leaderboard'
                    ? 'bg-zinc-800 text-emerald-400 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                <span>{t.nav.leaderboard || (locale === 'fr' ? 'Classement' : 'Leaderboard')}</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('history')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'history'
                    ? 'bg-zinc-800 text-emerald-400 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>{t.nav.history}</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('profile')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'profile'
                    ? 'bg-zinc-800 text-emerald-400 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>{t.nav.profile}</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('settings')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'settings'
                    ? 'bg-zinc-800 text-emerald-400 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>{t.nav.settings}</span>
              </button>

              {user.role === 'admin' && (
                <button
                  type="button"
                  onClick={() => onSelectTab('admin')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'admin'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'text-amber-400/80 hover:text-amber-300'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>{t.nav.admin}</span>
                </button>
              )}
            </>
          )}
        </nav>

        {/* Right Controls: Gamification HUD & Locale & User */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User Level & XP HUD */}
          {user && (
            <div
              onClick={() => onSelectTab('profile')}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer select-none"
            >
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 font-bold text-xs flex items-center justify-center font-mono">
                {level}
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-zinc-300">
                  <Zap className="w-3 h-3 text-emerald-400 fill-current" />
                  <span>{totalXp} XP</span>
                </div>
                <ProgressBar
                  progress={levelProgress}
                  height="h-1"
                  className="w-16 mt-0.5"
                  color="from-emerald-400 to-teal-300"
                />
              </div>
            </div>
          )}

          {/* Language Toggle */}
          <button
            type="button"
            onClick={toggleLocale}
            className="px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-bold text-zinc-300 flex items-center gap-1.5 cursor-pointer uppercase transition-colors"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-zinc-400" />
            <span>{locale}</span>
          </button>

          {/* User Sign In / Profile action */}
          {user ? (
            <div className="flex items-center gap-1.5">
              <span className="hidden md:inline text-xs font-semibold text-zinc-300 max-w-[100px] truncate">
                {user.displayName}
              </span>
              <button
                type="button"
                onClick={logout}
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
                title={t.nav.signOut}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onSelectTab('login')}
                className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-200 border border-zinc-800 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t.nav.signIn}</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectTab('signup')}
                className="hidden sm:flex px-3.5 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-zinc-950 text-xs font-bold transition-all cursor-pointer items-center gap-1.5 shadow-md shadow-emerald-500/20"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{t.nav.signUp}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="flex lg:hidden border-t border-zinc-800/80 bg-zinc-950 px-2 py-1.5 justify-around">
        {!user ? (
          <>
            <button
              type="button"
              onClick={() => onSelectTab('home')}
              className={`flex-1 py-1 rounded-lg text-xs font-bold flex flex-col items-center gap-1 cursor-pointer ${
                activeTab === 'home' ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="text-[10px]">{t.nav.home}</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('how')}
              className={`flex-1 py-1 rounded-lg text-xs font-bold flex flex-col items-center gap-1 cursor-pointer ${
                activeTab === 'how' ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Info className="w-4 h-4" />
              <span className="text-[10px]">{t.nav.howItWorks}</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('pricing')}
              className={`flex-1 py-1 rounded-lg text-xs font-bold flex flex-col items-center gap-1 cursor-pointer ${
                activeTab === 'pricing' ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span className="text-[10px]">{t.nav.pricing}</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('login')}
              className={`flex-1 py-1 rounded-lg text-xs font-bold flex flex-col items-center gap-1 cursor-pointer ${
                activeTab === 'login' ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span className="text-[10px]">{t.nav.signIn}</span>
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onSelectTab('dashboard')}
              className={`flex-1 py-1 rounded-lg text-xs font-bold flex flex-col items-center gap-1 ${
                activeTab === 'dashboard' ? 'text-emerald-400' : 'text-zinc-500'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>{t.nav.home || (locale === 'fr' ? 'Accueil' : 'Home')}</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('daily')}
              className={`flex-1 py-1 rounded-lg text-xs font-bold flex flex-col items-center gap-1 ${
                activeTab === 'daily' ? 'text-emerald-400' : 'text-zinc-500'
              }`}
            >
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>{t.nav.daily || (locale === 'fr' ? 'Défi' : 'Daily')}</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('coach')}
              className={`flex-1 py-1 rounded-lg text-xs font-bold flex flex-col items-center gap-1 ${
                activeTab === 'coach' ? 'text-emerald-400' : 'text-zinc-500'
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Coach</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('train')}
              className={`flex-1 py-1 rounded-lg text-xs font-bold flex flex-col items-center gap-1 ${
                activeTab === 'train' ? 'text-emerald-400' : 'text-zinc-500'
              }`}
            >
              <Brain className="w-4 h-4" />
              <span>{t.nav.train}</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('leaderboard')}
              className={`flex-1 py-1 rounded-lg text-xs font-bold flex flex-col items-center gap-1 ${
                activeTab === 'leaderboard' ? 'text-emerald-400' : 'text-zinc-500'
              }`}
            >
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span>{t.nav.ranks || (locale === 'fr' ? 'Rangs' : 'Ranks')}</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('profile')}
              className={`flex-1 py-1 rounded-lg text-xs font-bold flex flex-col items-center gap-1 ${
                activeTab === 'profile' ? 'text-emerald-400' : 'text-zinc-500'
              }`}
            >
              <User className="w-4 h-4" />
              <span>{t.nav.profile}</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
};
