import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { XpTransactionRecord, UserStreakRecord, AchievementWithStatus } from '../../types';
import { ProgressBar } from '../components/ui/ProgressBar';
import { StatsPage } from './StatsPage';
import { AchievementsPage } from './AchievementsPage';
import { StreakPage } from './StreakPage';
import {
  User,
  Zap,
  Award,
  Shield,
  FileText,
  Loader2,
  LogOut,
  Flame,
  Trophy,
  BarChart3,
  History,
  Settings,
} from 'lucide-react';

interface ProfilePageProps {
  initialTab?: 'overview' | 'stats' | 'achievements' | 'streak' | 'ledger';
  onNavigateToSettings?: () => void;
  onNavigateToHistory?: () => void;
  onNavigateToDaily?: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  initialTab = 'overview',
  onNavigateToSettings,
  onNavigateToHistory,
  onNavigateToDaily,
}) => {
  const { user, progress, token, logout } = useAuth();
  const { t, locale } = useLanguage();

  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'achievements' | 'streak' | 'ledger'>(initialTab);
  const [ledger, setLedger] = useState<XpTransactionRecord[]>([]);
  const [isLoadingLedger, setIsLoadingLedger] = useState<boolean>(false);
  const [streak, setStreak] = useState<UserStreakRecord | null>(null);
  const [achievements, setAchievements] = useState<AchievementWithStatus[]>([]);

  useEffect(() => {
    if (!token) return;

    fetch('/api/streak', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : null))
      .then(setStreak)
      .catch(console.error);

    fetch('/api/achievements', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : []))
      .then(setAchievements)
      .catch(console.error);

    if (activeTab === 'ledger') {
      setIsLoadingLedger(true);
      fetch('/api/progress/ledger', { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => (res.ok ? res.json() : []))
        .then(setLedger)
        .catch(console.error)
        .finally(() => setIsLoadingLedger(false));
    }
  }, [token, activeTab]);

  if (!user || !progress) {
    return (
      <div className="p-16 text-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
      </div>
    );
  }

  const { currentLevel, totalXp, levelProgress } = progress;
  const currentStreak = streak?.currentStreak || 0;
  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Player Header Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-zinc-950 font-black text-2xl shadow-lg shadow-emerald-500/20">
            {user.displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-zinc-100">
                {user.displayName}
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold font-mono">
                {locale === 'fr' ? `Niveau ${currentLevel}` : `Level ${currentLevel}`}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 font-mono">
              {user.email}
            </p>

            <div className="flex items-center gap-3 pt-2 text-xs font-mono">
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-current" />
                {currentStreak} {locale === 'fr' ? 'jours streak' : 'days streak'}
              </span>
              <span className="text-zinc-500">•</span>
              <span className="text-purple-400 font-bold flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5" />
                {unlockedCount} {locale === 'fr' ? 'badges' : 'badges'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {onNavigateToSettings && (
            <button
              type="button"
              onClick={onNavigateToSettings}
              className="px-4 py-2.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold border border-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-zinc-400" />
              <span>{t.nav.settings || (locale === 'fr' ? 'Paramètres' : 'Settings')}</span>
            </button>
          )}

          <button
            type="button"
            onClick={logout}
            className="px-4 py-2.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold border border-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-zinc-400" />
            <span>{t.nav.signOut}</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 overflow-x-auto text-xs font-bold">
        {[
          { id: 'overview', label: locale === 'fr' ? 'Aperçu & Niveau' : 'Overview & Level', icon: Award },
          { id: 'stats', label: locale === 'fr' ? 'Statistiques' : 'Statistics', icon: BarChart3 },
          { id: 'achievements', label: locale === 'fr' ? 'Achievements' : 'Achievements', icon: Trophy },
          { id: 'streak', label: locale === 'fr' ? 'Série (Streak)' : 'Streak', icon: Flame },
          { id: 'ledger', label: locale === 'fr' ? 'Historique XP' : 'XP History', icon: Zap },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                isActive
                  ? 'bg-emerald-400 text-zinc-950 shadow-md shadow-emerald-500/10'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-850/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab: Stats */}
      {activeTab === 'stats' && <StatsPage />}

      {/* Tab: Achievements */}
      {activeTab === 'achievements' && <AchievementsPage />}

      {/* Tab: Streak */}
      {activeTab === 'streak' && <StreakPage onGoToDaily={onNavigateToDaily} />}

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-zinc-100">
                  {locale === 'fr' ? 'Progression de Rang & XP' : 'Rank & XP Progression'}
                </h2>
              </div>
              <div className="text-xs font-mono text-zinc-400">
                {locale === 'fr' ? `${totalXp} XP Cumulés` : `${totalXp} Total XP`}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-zinc-850/80 border border-zinc-800 text-center">
                <div className="text-xs uppercase font-bold text-zinc-400 mb-1">
                  {locale === 'fr' ? 'Niveau Actuel' : 'Current Level'}
                </div>
                <div className="text-3xl font-black text-emerald-400 font-mono">
                  Lvl {currentLevel}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-850/80 border border-zinc-800 text-center">
                <div className="text-xs uppercase font-bold text-zinc-400 mb-1">
                  {locale === 'fr' ? 'Seuil du Niveau' : 'Level Threshold'}
                </div>
                <div className="text-3xl font-black text-zinc-200 font-mono">
                  {levelProgress.xpForCurrentLevel} <span className="text-xs font-normal text-zinc-500">XP</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-850/80 border border-zinc-800 text-center">
                <div className="text-xs uppercase font-bold text-zinc-400 mb-1">
                  {locale === 'fr' ? 'Prochain Niveau' : 'Next Level'}
                </div>
                <div className="text-3xl font-black text-amber-400 font-mono">
                  {levelProgress.xpForNextLevel} <span className="text-xs font-normal text-zinc-500">XP</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                <span>{locale === 'fr' ? `Progression vers le Niveau ${currentLevel + 1}` : `Progress towards Level ${currentLevel + 1}`}</span>
                <span className="text-emerald-400 font-bold">{levelProgress.progressPercentage}%</span>
              </div>
              <ProgressBar progress={levelProgress.progressPercentage} height="h-2.5" />
            </div>
          </div>

          {/* Quick shortcuts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setActiveTab('stats')}
              className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 transition-all text-left group cursor-pointer"
            >
              <BarChart3 className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="text-sm font-bold text-white">
                {locale === 'fr' ? 'Statistiques Détaillées' : 'Detailed Statistics'}
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                {locale === 'fr'
                  ? 'Consultez vos moyennes et temps de réaction par pilier.'
                  : 'View your averages and reaction times by pillar.'}
              </p>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('achievements')}
              className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-purple-500/50 transition-all text-left group cursor-pointer"
            >
              <Trophy className="w-5 h-5 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="text-sm font-bold text-white">
                {locale === 'fr' ? 'Galerie des Badges' : 'Badge Gallery'}
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                {locale === 'fr'
                  ? "Découvrez les défis à relever pour débloquer de l'XP bonus."
                  : 'Discover challenges to complete to unlock bonus XP.'}
              </p>
            </button>
          </div>
        </div>
      )}

      {/* Tab: XP Ledger */}
      {activeTab === 'ledger' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-zinc-100">
                {locale === 'fr' ? 'Registre Immuable des Transactions XP' : 'Immutable XP Transaction Ledger'}
              </h2>
            </div>
            <span className="text-xs font-mono text-zinc-500">
              {ledger.length} transactions
            </span>
          </div>

          {isLoadingLedger ? (
            <div className="py-12 text-center">
              <Loader2 className="w-6 h-6 text-emerald-400 animate-spin mx-auto" />
            </div>
          ) : ledger.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500">
              {locale === 'fr'
                ? "Aucune transaction XP enregistrée pour l'instant."
                : 'No XP transactions recorded yet.'}
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/80 max-h-96 overflow-y-auto pr-1">
              {ledger.map((tx) => (
                <div key={tx.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-zinc-200 capitalize">
                      {tx.reason.replace(/_/g, ' ')}
                    </div>
                    <div className="text-[10px] font-mono text-zinc-500">
                      ID: {tx.attemptId} • {new Date(tx.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="font-mono font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                    +{tx.amount} XP
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
