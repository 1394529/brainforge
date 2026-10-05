import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { CoachPreferences, CoachResponse, PersonalizationProfile } from '../../types';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Target,
  Zap,
  RefreshCw,
  Award,
  CheckCircle2,
  AlertCircle,
  Brain,
  ArrowLeft,
  Loader2,
  Info,
  Clock,
  Shield,
} from 'lucide-react';

interface CoachPageProps {
  onBackToDashboard: () => void;
  onStartChallenge: (challengeId: string) => void;
}

export const CoachPage: React.FC<CoachPageProps> = ({
  onBackToDashboard,
  onStartChallenge,
}) => {
  const { user, token } = useAuth();
  const { t, locale } = useLanguage();

  const [insight, setInsight] = useState<CoachResponse | null>(null);
  const [profile, setProfile] = useState<PersonalizationProfile | null>(null);
  const [preferences, setPreferences] = useState<CoachPreferences | null>(null);
  const [isColdStart, setIsColdStart] = useState<boolean>(false);
  const [challengesCount, setChallengesCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isToggling, setIsToggling] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCoachData = async (force: boolean = false) => {
    if (!token) return;
    if (force) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const endpoint = force ? '/api/coach/refresh' : `/api/coach/summary?lang=${locale}`;
      const method = force ? 'POST' : 'GET';
      const body = force ? JSON.stringify({ lang: locale }) : undefined;

      const res = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body,
      });

      if (res.ok) {
        const data = await res.json();
        setInsight(data.insight);
        setProfile(data.profile);
        setIsColdStart(data.isColdStart);
        setChallengesCount(data.challengesCount);
        setPreferences(data.preferences);
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to load coaching data');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCoachData(false);
  }, [token, locale]);

  const handleToggleEnabled = async () => {
    if (!token || !preferences) return;
    setIsToggling(true);
    try {
      const res = await fetch('/api/coach/preferences', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enabled: !preferences.enabled,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPreferences(updated);
        await fetchCoachData(true);
      }
    } catch {
      // Ignore
    } finally {
      setIsToggling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center space-y-4">
        <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mx-auto" />
        <p className="text-xs text-zinc-400 font-mono">
          {locale === 'fr' ? 'Analyse personnalisée en cours...' : 'Loading personalized coaching...'}
        </p>
      </div>
    );
  }

  const isEnabled = preferences?.enabled ?? true;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-emerald-400 transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.coach?.backToDashboard || 'Back to Dashboard'}</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.coach?.badge || 'Cognitive Coach'}</span>
            </div>
            <span className="text-xs text-zinc-500 font-mono">
              {isEnabled ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {t.coach?.statusActive || 'Active'}
                </span>
              ) : (
                <span className="text-zinc-500">
                  {t.coach?.statusPaused || 'Paused'}
                </span>
              )}
            </span>
          </div>
          <h1 className="text-3xl font-black text-white pt-1">
            {t.coach?.title || 'AI Coach'}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
            {t.coach?.subtitle ||
              'Personalized performance analysis & targeted training'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleToggleEnabled}
            disabled={isToggling}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              isEnabled
                ? 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white'
                : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
            }`}
          >
            {isEnabled ? (locale === 'fr' ? 'Désactiver' : 'Pause Coach') : (locale === 'fr' ? 'Activer' : 'Enable Coach')}
          </button>

          <button
            type="button"
            onClick={() => fetchCoachData(true)}
            disabled={isRefreshing || !isEnabled}
            className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? (t.coach?.refreshingBtn || 'Analyzing...') : (t.coach?.refreshBtn || 'Refresh')}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Paused State */}
      {!isEnabled && (
        <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800 text-center space-y-4">
          <Sparkles className="w-10 h-10 text-zinc-600 mx-auto" />
          <h2 className="text-xl font-bold text-white">
            {locale === 'fr' ? 'Coach IA en pause' : 'AI Coach is paused'}
          </h2>
          <p className="text-sm text-zinc-400 max-w-md mx-auto">
            {locale === 'fr'
              ? 'Le Coach IA est actuellement en pause. Vos entraînements et votre progression se poursuivent normalement.'
              : 'The AI Coach is currently paused. Your workouts and progression continue as normal.'}
          </p>
          <button
            type="button"
            onClick={handleToggleEnabled}
            className="px-6 py-2.5 rounded-xl bg-emerald-400 text-zinc-950 font-bold text-xs hover:bg-emerald-300 transition-colors cursor-pointer"
          >
            {locale === 'fr' ? 'Activer le Coach' : 'Enable Coach'}
          </button>
        </div>
      )}

      {/* Cold Start State */}
      {isEnabled && isColdStart && (
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-indigo-950/30 border border-indigo-500/30 shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {t.coach?.coldStartTitle || 'Personalization in progress'}
              </h2>
              <p className="text-xs text-zinc-400">
                {t.coach?.coldStartDesc ||
                  'We need a few more challenges to personalize your recommendations.'}
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
            <div className="flex justify-between text-xs font-mono text-zinc-300 font-bold">
              <span>{locale === 'fr' ? 'Progression de calibration' : 'Calibration Progress'}</span>
              <span className="text-indigo-400">{challengesCount} / 5</span>
            </div>
            <div className="w-full bg-zinc-850 h-3 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((challengesCount / 5) * 100))}%` }}
              />
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              {locale === 'fr'
                ? 'Jouez encore quelques parties sur les différents jeux (Mémoire, Réaction, Patterns, Quiz) afin que notre moteur d’analyse affine vos forces et axes de progression.'
                : 'Play a few more games across the different categories (Memory, Reaction, Patterns, Quiz) so our engine can calibrate your strengths and focus areas.'}
            </p>
          </div>

          {insight?.suggestedChallenge && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => onStartChallenge(insight.suggestedChallenge!.id)}
                className="px-6 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                <span>{t.coach?.startChallenge || 'Start workout'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Active Coach Dashboard */}
      {isEnabled && !isColdStart && insight && (
        <>
          {/* Hero Summary Card */}
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950/20 border border-emerald-500/30 shadow-2xl space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold font-mono uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.coach?.progressTitle || 'Your progress this week'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {locale === 'fr' ? `Bonjour ${user?.displayName || ''} !` : `Hello ${user?.displayName || ''}!`}
              </h2>
              <p className="text-sm sm:text-base text-zinc-200 leading-relaxed font-medium">
                "{insight.summary}"
              </p>
            </div>

            {insight.dailyGoal && (
              <div className="p-4 rounded-2xl bg-zinc-950 border border-emerald-500/20 flex items-start gap-3">
                <Target className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[11px] font-mono uppercase font-bold text-emerald-400">
                    {t.coach?.dailyGoalTitle || "Today's Target"}
                  </div>
                  <div className="text-xs sm:text-sm text-zinc-200 font-semibold mt-0.5">
                    {insight.dailyGoal}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Strengths & Focus Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <TrendingUp className="w-5 h-5" />
                <h3 className="text-sm font-bold uppercase font-mono tracking-wider">
                  {t.coach?.strengthsTitle || 'Your strengths'}
                </h3>
              </div>
              <ul className="space-y-2.5">
                {insight.strengths.map((str, idx) => (
                  <li
                    key={idx}
                    className="p-3.5 rounded-2xl bg-zinc-850/60 border border-zinc-800 flex items-center gap-3 text-xs font-semibold text-zinc-200"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Focus Areas */}
            <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
              <div className="flex items-center gap-2 text-amber-400">
                <Target className="w-5 h-5" />
                <h3 className="text-sm font-bold uppercase font-mono tracking-wider">
                  {t.coach?.focusTitle || 'Focus areas'}
                </h3>
              </div>
              <ul className="space-y-2.5">
                {insight.focusAreas.map((area, idx) => (
                  <li
                    key={idx}
                    className="p-3.5 rounded-2xl bg-zinc-850/60 border border-zinc-800 flex items-center gap-3 text-xs font-semibold text-zinc-200"
                  >
                    <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommendations list */}
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
              <Brain className="w-4 h-4 text-emerald-400" />
              <span>{t.coach?.recommendationsTitle || 'Recommendations'}</span>
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {insight.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-zinc-850/70 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                        {rec.skill}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                          rec.priority === 'high'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : rec.priority === 'medium'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {rec.priority}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        Niv. {rec.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {rec.reason}
                    </p>
                  </div>

                  {rec.suggestedChallengeId && (
                    <button
                      type="button"
                      onClick={() => onStartChallenge(rec.suggestedChallengeId!)}
                      className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-emerald-400 hover:text-zinc-950 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer self-start sm:self-auto"
                    >
                      <span>{t.coach?.startChallenge || 'Start'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Next Challenge Card */}
          {insight.suggestedChallenge && (
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-zinc-900 to-zinc-900 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase font-bold text-emerald-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.coach?.recommendedChallenge || 'Recommended challenge'}</span>
                </div>
                <h4 className="text-xl font-bold text-white">
                  {insight.suggestedChallenge.title}
                </h4>
                <p className="text-xs text-zinc-300 max-w-xl">
                  {insight.suggestedChallenge.reason}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onStartChallenge(insight.suggestedChallenge!.id)}
                className="px-8 py-4 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 cursor-pointer shrink-0"
              >
                <span>{t.coach?.startChallenge || 'Start'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Strict Factual Disclaimer */}
      <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-start gap-3 text-xs text-zinc-400 leading-relaxed">
        <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <span>
          {t.coach?.disclaimer ||
            'Performance in BrainForge activities only. Does not constitute medical evaluation, clinical diagnosis, or IQ measurement.'}
        </span>
      </div>
    </div>
  );
};
