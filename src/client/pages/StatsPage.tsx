import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { UserStatsData } from '../../types';
import {
  BarChart3,
  Target,
  Zap,
  Award,
  Flame,
  Brain,
  Sparkles,
  HelpCircle,
  Clock,
  ArrowLeft,
  Loader2,
  Info,
} from 'lucide-react';

interface StatsPageProps {
  onBackToProfile?: () => void;
}

export const StatsPage: React.FC<StatsPageProps> = ({ onBackToProfile }) => {
  const { token } = useAuth();
  const { locale } = useLanguage();
  const [stats, setStats] = useState<UserStatsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;
      setIsLoading(true);
      try {
        const res = await fetch('/api/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data: UserStatsData = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (isLoading) {
    return (
      <div className="py-20 text-center space-y-4">
        <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mx-auto" />
        <p className="text-xs text-zinc-400 font-mono">
          {locale === 'fr' ? 'Compilation de vos statistiques...' : 'Compiling your statistics...'}
        </p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {onBackToProfile && (
        <button
          type="button"
          onClick={onBackToProfile}
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-emerald-400 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{locale === 'fr' ? 'Retour au Profil' : 'Back to Profile'}</span>
        </button>
      )}

      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider font-mono">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>{locale === 'fr' ? 'Tableau de Bord Analytique' : 'Analytics Dashboard'}</span>
        </div>
        <h1 className="text-3xl font-black text-white">
          {locale === 'fr' ? 'Performances dans les jeux BrainForge' : 'BrainForge Game Performance'}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          {locale === 'fr'
            ? "Suivez l'évolution de vos scores, votre temps de réaction et votre régularité."
            : 'Track your score trends, reaction time, and consistency.'}
        </p>
      </div>

      {/* Global Matrix */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-md">
          <div className="flex items-center justify-between text-xs uppercase font-bold text-zinc-400 mb-1">
            <span>{locale === 'fr' ? 'Parties Jouées' : 'Games Played'}</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono">
            {stats.totalPlayed}
          </div>
          <span className="text-[10px] text-zinc-500 font-mono block mt-2">
            {locale === 'fr' ? 'Défis complétés' : 'Completed challenges'}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-md">
          <div className="flex items-center justify-between text-xs uppercase font-bold text-zinc-400 mb-1">
            <span>{locale === 'fr' ? 'Score Moyen' : 'Average Score'}</span>
            <Award className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-3xl font-black text-teal-400 font-mono">
            {stats.averageScore}%
          </div>
          <span className="text-[10px] text-zinc-500 font-mono block mt-2">
            {locale === 'fr' ? `Record : ${stats.bestScore}%` : `Best: ${stats.bestScore}%`}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-md">
          <div className="flex items-center justify-between text-xs uppercase font-bold text-zinc-400 mb-1">
            <span>{locale === 'fr' ? 'Série Quotidienne' : 'Daily Streak'}</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400 font-mono">
            🔥 {stats.currentStreak} {locale === 'fr' ? 'j' : 'd'}
          </div>
          <span className="text-[10px] text-zinc-500 font-mono block mt-2">
            {locale === 'fr' ? `Record : ${stats.longestStreak} jours` : `Record: ${stats.longestStreak} days`}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-md">
          <div className="flex items-center justify-between text-xs uppercase font-bold text-zinc-400 mb-1">
            <span>{locale === 'fr' ? 'Badges Débloqués' : 'Unlocked Badges'}</span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-black text-purple-400 font-mono">
            {stats.achievementsUnlocked} / {stats.totalAchievements}
          </div>
          <span className="text-[10px] text-zinc-500 font-mono block mt-2">
            {locale === 'fr' ? 'Accomplissements' : 'Achievements'}
          </span>
        </div>
      </div>

      {/* Breakdown by Game Type */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-100">
          {locale === 'fr' ? 'Détail par Pilier Cognitif' : 'Breakdown by Cognitive Pillar'}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Reaction */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {locale === 'fr' ? 'Vitesse de Réaction' : 'Reaction Speed'}
                </h3>
                <span className="text-xs text-zinc-400 font-mono">
                  {stats.byType.reaction.totalPlayed} {locale === 'fr' ? 'épreuves disputées' : 'challenges played'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-zinc-850/60 border border-zinc-800/80">
                <div className="text-[10px] font-mono uppercase text-zinc-500">
                  {locale === 'fr' ? 'Temps Moyen' : 'Average Time'}
                </div>
                <div className="text-xl font-black text-emerald-400 font-mono">
                  {stats.byType.reaction.averageReactionTimeMs
                    ? `${stats.byType.reaction.averageReactionTimeMs} ms`
                    : '—'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-850/60 border border-zinc-800/80">
                <div className="text-[10px] font-mono uppercase text-zinc-500">
                  {locale === 'fr' ? 'Précision' : 'Accuracy'}
                </div>
                <div className="text-xl font-black text-white font-mono">
                  {stats.byType.reaction.averageScore}%
                </div>
              </div>
            </div>
          </div>

          {/* Memory */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {locale === 'fr' ? 'Mémoire Séquentielle' : 'Sequential Memory'}
                </h3>
                <span className="text-xs text-zinc-400 font-mono">
                  {stats.byType.memory.totalPlayed} {locale === 'fr' ? 'épreuves disputées' : 'challenges played'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-zinc-850/60 border border-zinc-800/80">
                <div className="text-[10px] font-mono uppercase text-zinc-500">
                  {locale === 'fr' ? 'Score Moyen' : 'Average Score'}
                </div>
                <div className="text-xl font-black text-amber-400 font-mono">
                  {stats.byType.memory.averageScore}%
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-850/60 border border-zinc-800/80">
                <div className="text-[10px] font-mono uppercase text-zinc-500">
                  {locale === 'fr' ? 'Meilleur Score' : 'Best Score'}
                </div>
                <div className="text-xl font-black text-white font-mono">
                  {stats.byType.memory.bestScore}%
                </div>
              </div>
            </div>
          </div>

          {/* Pattern */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {locale === 'fr' ? 'Logique & Motifs' : 'Logic & Patterns'}
                </h3>
                <span className="text-xs text-zinc-400 font-mono">
                  {stats.byType.pattern.totalPlayed} {locale === 'fr' ? 'épreuves disputées' : 'challenges played'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-zinc-850/60 border border-zinc-800/80">
                <div className="text-[10px] font-mono uppercase text-zinc-500">
                  {locale === 'fr' ? 'Score Moyen' : 'Average Score'}
                </div>
                <div className="text-xl font-black text-purple-400 font-mono">
                  {stats.byType.pattern.averageScore}%
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-850/60 border border-zinc-800/80">
                <div className="text-[10px] font-mono uppercase text-zinc-500">
                  {locale === 'fr' ? 'Meilleur Score' : 'Best Score'}
                </div>
                <div className="text-xl font-black text-white font-mono">
                  {stats.byType.pattern.bestScore}%
                </div>
              </div>
            </div>
          </div>

          {/* Quiz */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {locale === 'fr' ? 'Quiz & Connaissances' : 'Quiz & Knowledge'}
                </h3>
                <span className="text-xs text-zinc-400 font-mono">
                  {stats.byType.quiz.totalPlayed} {locale === 'fr' ? 'épreuves disputées' : 'challenges played'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-zinc-850/60 border border-zinc-800/80">
                <div className="text-[10px] font-mono uppercase text-zinc-500">
                  {locale === 'fr' ? 'Score Moyen' : 'Average Score'}
                </div>
                <div className="text-xl font-black text-blue-400 font-mono">
                  {stats.byType.quiz.averageScore}%
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-850/60 border border-zinc-800/80">
                <div className="text-[10px] font-mono uppercase text-zinc-500">
                  {locale === 'fr' ? 'Meilleur Score' : 'Best Score'}
                </div>
                <div className="text-xl font-black text-white font-mono">
                  {stats.byType.quiz.bestScore}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Strict Factual Disclaimer Note */}
      <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex items-start gap-3 text-xs text-zinc-400 leading-relaxed">
        <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <span>
          {locale === 'fr' ? (
            <><strong>Performances dans les jeux BrainForge :</strong> Les scores présentés sont des indicateurs de progression ludique et d'exactitude aux exercices proposés. Ils ne constituent en aucun cas une évaluation médicale, un diagnostic clinique ou un calcul de QI.</>
          ) : (
            <><strong>BrainForge Game Performance:</strong> The scores shown are indicators of game progress and accuracy on the presented exercises. They do not constitute in any way a medical evaluation, clinical diagnosis, or IQ measurement.</>
          )}
        </span>
      </div>
    </div>
  );
};
