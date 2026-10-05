import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { AchievementWithStatus } from '../../types';
import {
  Award,
  Flame,
  Zap,
  Calendar,
  Sparkles,
  Lock,
  CheckCircle2,
  Trophy,
  Loader2,
  Crown,
  Target,
  Brain,
  Medal,
} from 'lucide-react';

interface AchievementsPageProps {
  onBackToProfile?: () => void;
}

export const AchievementsPage: React.FC<AchievementsPageProps> = ({ onBackToProfile }) => {
  const { token } = useAuth();
  const { locale } = useLanguage();
  const [achievements, setAchievements] = useState<AchievementWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const fetchAchievements = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/achievements', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data: AchievementWithStatus[] = await res.json();
        setAchievements(data);
      }
    } catch (err) {
      console.error('Failed to load achievements:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, [token]);

  const renderIcon = (iconName: string, isUnlocked: boolean) => {
    const className = `w-6 h-6 ${isUnlocked ? 'text-emerald-400' : 'text-zinc-600'}`;
    switch (iconName) {
      case 'Flame':
        return <Flame className={className} />;
      case 'Calendar':
        return <Calendar className={className} />;
      case 'Crown':
        return <Crown className={className} />;
      case 'Zap':
        return <Zap className={className} />;
      case 'Brain':
        return <Brain className={className} />;
      case 'Target':
        return <Target className={className} />;
      case 'Medal':
        return <Medal className={className} />;
      case 'CheckCircle2':
        return <CheckCircle2 className={className} />;
      case 'Sparkles':
      case 'Award':
      default:
        return <Award className={className} />;
    }
  };

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
  const totalCount = achievements.length;
  const progressPct = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  const filtered = achievements.filter((a) => {
    if (selectedCategory === 'all') return true;
    return a.category === selectedCategory;
  });

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider font-mono">
            <Trophy className="w-3.5 h-3.5" />
            <span>{locale === 'fr' ? 'Badges & Trophées' : 'Badges & Trophies'}</span>
          </div>
          <h1 className="text-3xl font-black text-white pt-1">
            {locale === 'fr' ? 'Vos Accomplissements' : 'Your Achievements'}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            {locale === 'fr'
              ? 'Débloquez des badges en complétant vos défis quotidiens, vos séries et vos exploits.'
              : 'Unlock badges by completing your daily challenges, streaks, and feats.'}
          </p>
        </div>

        {/* Global Progress pill */}
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-right min-w-[160px]">
          <div className="text-xs font-mono text-zinc-400">
            {locale === 'fr' ? 'Progression' : 'Progress'}
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {unlockedCount} / {totalCount}
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
        {[
          { id: 'all', label: locale === 'fr' ? 'Tous les badges' : 'All Badges' },
          { id: 'streak', label: locale === 'fr' ? 'Séries (Streaks)' : 'Streaks' },
          { id: 'performance', label: locale === 'fr' ? 'Performances' : 'Performances' },
          { id: 'level', label: locale === 'fr' ? 'Niveaux' : 'Levels' },
          { id: 'general', label: locale === 'fr' ? 'Général' : 'General' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedCategory(tab.id)}
            className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === tab.id
                ? 'bg-emerald-400 text-zinc-950 shadow-md shadow-emerald-500/10'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-20 text-center space-y-4">
          <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mx-auto" />
          <p className="text-xs text-zinc-400 font-mono">
            {locale === 'fr' ? 'Chargement des badges...' : 'Loading badges...'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((ach) => {
            const isUnlocked = ach.isUnlocked;
            return (
              <div
                key={ach.id}
                className={`p-5 rounded-3xl border transition-all relative flex flex-col justify-between ${
                  isUnlocked
                    ? 'bg-gradient-to-b from-zinc-900 to-zinc-950 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                    : 'bg-zinc-900/50 border-zinc-800/80 opacity-70 hover:opacity-90'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                        isUnlocked
                          ? 'bg-emerald-500/10 border-emerald-500/30'
                          : 'bg-zinc-800/80 border-zinc-700/50'
                      }`}
                    >
                      {isUnlocked ? (
                        renderIcon(ach.icon, true)
                      ) : (
                        <Lock className="w-5 h-5 text-zinc-600" />
                      )}
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                        isUnlocked
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                      }`}
                    >
                      +{ach.xpBonus} XP
                    </span>
                  </div>

                  <h3
                    className={`text-sm font-bold tracking-tight ${
                      isUnlocked ? 'text-white' : 'text-zinc-400'
                    }`}
                  >
                    {locale === 'en' ? (ach.name || ach.nameFr) : (ach.nameFr || ach.name)}
                  </h3>

                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    {locale === 'en' ? (ach.description || ach.descriptionFr) : (ach.descriptionFr || ach.description)}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono">
                  {isUnlocked ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{locale === 'fr' ? 'Débloqué' : 'Unlocked'}</span>
                    </span>
                  ) : (
                    <span className="text-zinc-500 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>{locale === 'fr' ? 'Verrouillé' : 'Locked'}</span>
                    </span>
                  )}

                  {ach.unlockedAt && (
                    <span className="text-zinc-500 text-[10px]">
                      {new Date(ach.unlockedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
