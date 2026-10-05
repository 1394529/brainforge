import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { CoachResponse, PersonalizationProfile } from '../../../types';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Target,
  Zap,
  RefreshCw,
  Award,
  ChevronRight,
  Brain,
} from 'lucide-react';

interface CoachCardProps {
  insight: CoachResponse | null;
  profile: PersonalizationProfile | null;
  isColdStart: boolean;
  challengesCount: number;
  enabled: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  onStartChallenge?: (challengeId: string) => void;
  onViewCoachPage?: () => void;
}

export const CoachCard: React.FC<CoachCardProps> = ({
  insight,
  isColdStart,
  challengesCount,
  enabled,
  isLoading,
  isRefreshing,
  onRefresh,
  onStartChallenge,
  onViewCoachPage,
}) => {
  const { t, locale } = useLanguage();

  if (!enabled) {
    return (
      <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 text-xs font-mono font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t.coach?.statusPaused || 'Coach Paused'}</span>
        </div>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto">
          {locale === 'fr'
            ? 'Le Coach IA est actuellement en pause. Vous pouvez le réactiver dans vos paramètres de profil.'
            : 'The AI Coach is currently paused. You can re-enable it in your profile settings.'}
        </p>
      </div>
    );
  }

  // Cold Start State
  if (isColdStart) {
    const progressPct = Math.min(100, Math.round((challengesCount / 5) * 100));
    return (
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-indigo-950/20 border border-indigo-500/20 shadow-xl space-y-5 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-mono font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.coach?.title || 'AI Coach'}</span>
          </div>
          <span className="text-[11px] font-mono text-zinc-400">
            {challengesCount} / 5
          </span>
        </div>

        <div>
          <h3 className="text-lg font-bold text-white">
            {t.coach?.coldStartTitle || 'Personalization in progress'}
          </h3>
          <p className="text-xs sm:text-sm text-zinc-300 mt-1 leading-relaxed">
            {t.coach?.coldStartDesc ||
              'We need a few more challenges to personalize your recommendations.'}
          </p>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="text-[10px] font-mono text-zinc-500 flex justify-between">
            <span>{locale === 'fr' ? 'Démarrage' : 'Baseline'}</span>
            <span>{5 - challengesCount} {locale === 'fr' ? 'défis restants' : 'challenges left'}</span>
          </div>
        </div>

        {insight?.suggestedChallenge && onStartChallenge && (
          <button
            type="button"
            onClick={() => onStartChallenge(insight.suggestedChallenge!.id)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-400 hover:bg-indigo-300 text-zinc-950 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <span>{t.coach?.startChallenge || 'Start workout'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  // Active AI Coach State
  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950/20 border border-emerald-500/25 shadow-xl space-y-6 relative overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
              <span>{t.coach?.title || 'AI Coach'}</span>
            </div>
            <div className="text-[11px] text-zinc-500">
              {t.coach?.progressTitle || 'Your progress this week'}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing || isLoading}
          className="p-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
          title={t.coach?.refreshBtn || 'Refresh'}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Summary Narrative */}
      {insight?.summary && (
        <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-medium">
          "{insight.summary}"
        </p>
      )}

      {/* Strengths & Focus Areas Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {insight?.strengths && insight.strengths.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-zinc-850/70 border border-zinc-800 space-y-1">
            <div className="text-[10px] font-mono uppercase font-bold text-emerald-400 flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3" />
              <span>{t.coach?.strengthsTitle || 'Your strengths'}</span>
            </div>
            <div className="text-xs font-semibold text-zinc-200">
              {insight.strengths[0]}
            </div>
          </div>
        )}

        {insight?.focusAreas && insight.focusAreas.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-zinc-850/70 border border-zinc-800 space-y-1">
            <div className="text-[10px] font-mono uppercase font-bold text-amber-400 flex items-center gap-1.5">
              <Target className="w-3 h-3" />
              <span>{t.coach?.focusTitle || 'Focus areas'}</span>
            </div>
            <div className="text-xs font-semibold text-zinc-200">
              {insight.focusAreas[0]}
            </div>
          </div>
        )}
      </div>

      {/* Recommended Next Challenge Card */}
      {insight?.suggestedChallenge && (
        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-[10px] font-mono uppercase font-bold text-zinc-500">
              {t.coach?.recommendedChallenge || 'Recommended challenge'}
            </div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <Brain className="w-4 h-4 text-emerald-400" />
              <span>{insight.suggestedChallenge.title}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                Niv. {insight.suggestedChallenge.difficulty}
              </span>
            </div>
            <div className="text-[11px] text-zinc-400">
              {insight.suggestedChallenge.reason}
            </div>
          </div>

          {onStartChallenge && (
            <button
              type="button"
              onClick={() => onStartChallenge(insight.suggestedChallenge!.id)}
              className="px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-zinc-950 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer shrink-0"
            >
              <span>{t.coach?.startChallenge || 'Start'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Footer link to Full Coach View */}
      {onViewCoachPage && (
        <div className="flex items-center justify-between pt-1 border-t border-zinc-800/80 text-xs">
          <span className="text-[11px] text-zinc-500 italic">
            {insight?.encouragement || t.coach?.encouragement}
          </span>
          <button
            type="button"
            onClick={onViewCoachPage}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>{locale === 'fr' ? 'Analyse Complète' : 'Full Analysis'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
