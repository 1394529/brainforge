import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { DailyChallengeStatus, ChallengeAttemptResult, GamificationNotification } from '../../types';
import { ChallengeRenderer } from '../components/game/ChallengeRenderer';
import { Badge } from '../components/ui/Badge';
import {
  Calendar,
  Zap,
  CheckCircle2,
  Clock,
  Award,
  ArrowRight,
  Flame,
  Loader2,
  Sparkles,
} from 'lucide-react';

interface DailyChallengePageProps {
  onBackToDashboard: () => void;
  onViewLeaderboard?: () => void;
  onTriggerNotification?: (notif: GamificationNotification) => void;
}

export const DailyChallengePage: React.FC<DailyChallengePageProps> = ({
  onBackToDashboard,
  onViewLeaderboard,
  onTriggerNotification,
}) => {
  const { token, refreshProgress } = useAuth();
  const { t, locale } = useLanguage();

  const [dailyStatus, setDailyStatus] = useState<DailyChallengeStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [attemptResult, setAttemptResult] = useState<ChallengeAttemptResult | null>(null);
  const [dailyBonus, setDailyBonus] = useState<number>(25);

  const fetchDailyStatus = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/daily', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data: DailyChallengeStatus = await res.json();
        setDailyStatus(data);
      }
    } catch (err) {
      console.error('Failed to fetch daily challenge status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyStatus();
  }, [token]);

  const handleSubmitAttempt = async (submissionPayload: unknown) => {
    if (!token || !dailyStatus?.challenge) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/daily/attempt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          submission: submissionPayload,
          locale,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit daily challenge attempt');
      }

      setAttemptResult(data);
      if (data.postAttempt?.dailyBonusXpAwarded) {
        setDailyBonus(data.postAttempt.dailyBonusXpAwarded);
      }

      // Notify parent for toasts
      if (data.postAttempt?.notifications && onTriggerNotification) {
        data.postAttempt.notifications.forEach((n: GamificationNotification) => {
          onTriggerNotification(n);
        });
      }

      setIsPlaying(false);
      await refreshProgress();
      await fetchDailyStatus();
    } catch (err: any) {
      alert(err.message || 'Error completing daily challenge');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center space-y-4">
        <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mx-auto" />
        <p className="text-xs text-zinc-400 font-mono">
          {locale === 'en' ? 'Loading Daily Challenge...' : 'Chargement du Défi du Jour...'}
        </p>
      </div>
    );
  }

  if (!dailyStatus || !dailyStatus.challenge) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-6">
        <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
          <Calendar className="w-12 h-12 text-zinc-500 mx-auto" />
          <h2 className="text-xl font-bold text-white">
            {locale === 'en' ? 'No challenge scheduled' : 'Aucun défi programmé'}
          </h2>
          <p className="text-sm text-zinc-400">
            {locale === 'en'
              ? 'Check back later for the next daily brain challenge.'
              : 'Revenez plus tard pour le prochain défi cérébral quotidien.'}
          </p>
          <button
            type="button"
            onClick={onBackToDashboard}
            className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs"
          >
            {locale === 'en' ? 'Back to Dashboard' : 'Retour au Dashboard'}
          </button>
        </div>
      </div>
    );
  }

  const { challenge, isCompleted, completedAttempt, challengeDate } = dailyStatus;

  // Render Active Gameplay
  if (isPlaying) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
              {locale === 'fr' ? 'Défi Quotidien en Cours' : 'Daily Challenge in Progress'}
            </span>
          </div>
          <span className="text-xs text-zinc-400 font-mono">{challengeDate}</span>
        </div>

        <ChallengeRenderer
          challenge={challenge}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmitAttempt}
        />
      </div>
    );
  }

  // Render Post-Game or Already Completed Screen
  if (isCompleted || attemptResult) {
    let scorePct = 0;
    let xpWon = 0;
    if (attemptResult) {
      scorePct = attemptResult.score.percentage;
      xpWon = attemptResult.gamification.xpEarned;
    } else if (completedAttempt) {
      scorePct = completedAttempt.percentage;
      xpWon = completedAttempt.xpEarned;
    }

    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-10 space-y-8 animate-fade-in">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-emerald-500/30 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider font-mono">
              <Calendar className="w-3.5 h-3.5" />
              <span>{locale === 'fr' ? 'Défi du Jour terminé ✓' : 'Daily Challenge Completed ✓'}</span>
            </div>
            <h1 className="text-3xl font-black text-white">
              {locale === 'fr' ? 'Félicitations pour votre session !' : 'Congratulations on your session!'}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
              {locale === 'fr' ? (
                <>Votre défi quotidien pour la date du <strong className="text-zinc-200">{challengeDate}</strong> a été validé. Votre série est préservée.</>
              ) : (
                <>Your daily challenge for <strong className="text-zinc-200">{challengeDate}</strong> has been completed. Your streak is preserved.</>
              )}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <div className="p-4 rounded-2xl bg-zinc-850/80 border border-zinc-800 text-center">
              <div className="text-[11px] font-bold text-zinc-400 uppercase font-mono mb-1">
                {locale === 'fr' ? 'Score Obtenu' : 'Final Score'}
              </div>
              <div className="text-3xl font-black text-emerald-400 font-mono">
                {scorePct}%
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-850/80 border border-zinc-800 text-center">
              <div className="text-[11px] font-bold text-zinc-400 uppercase font-mono mb-1">
                {locale === 'fr' ? 'XP Enregistré' : 'Earned XP'}
              </div>
              <div className="text-3xl font-black text-amber-400 font-mono">
                +{xpWon} <span className="text-xs text-zinc-500">XP</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-300 font-medium inline-flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>
              {locale === 'fr'
                ? `Bonus Défi Quotidien de +${dailyBonus} XP inclus. Revenez demain pour le prochain défi !`
                : `Daily Challenge Bonus of +${dailyBonus} XP included. Come back tomorrow for the next challenge!`}
            </span>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={onBackToDashboard}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-bold text-xs transition-all cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              {locale === 'fr' ? 'Retour au Dashboard' : 'Back to Dashboard'}
            </button>
            {onViewLeaderboard && (
              <button
                type="button"
                onClick={onViewLeaderboard}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-bold text-xs transition-all cursor-pointer"
              >
                {locale === 'fr' ? 'Voir le Classement' : 'View Leaderboard'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render Pre-Game Briefing
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-10 space-y-8 animate-fade-in">
      <div className="p-8 sm:p-10 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider font-mono">
              <Calendar className="w-3.5 h-3.5" />
              <span>{locale === 'fr' ? `Défi du Jour • ${challengeDate}` : `Daily Challenge • ${challengeDate}`}</span>
            </div>
            <h1 className="text-3xl font-black text-white pt-1">
              {challenge.title}
            </h1>
          </div>

          <Badge variant="type" type={challenge.type} />
        </div>

        <p className="text-sm text-zinc-300 leading-relaxed">
          {challenge.description}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-zinc-850/80 border border-zinc-800/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-zinc-500 font-mono">
                {locale === 'fr' ? 'Durée' : 'Duration'}
              </div>
              <div className="text-sm font-bold text-zinc-200">
                {locale === 'fr' ? '~ 2 à 5 minutes' : '~ 2 to 5 minutes'}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-850/80 border border-zinc-800/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-zinc-500 font-mono">
                {locale === 'fr' ? 'Récompense' : 'Reward'}
              </div>
              <div className="text-sm font-bold text-amber-400">
                {locale === 'fr' ? 'Score + 25 XP bonus' : 'Score + 25 bonus XP'}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-850/80 border border-zinc-800/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-zinc-500 font-mono">
                {locale === 'fr' ? 'Série (Streak)' : 'Streak'}
              </div>
              <div className="text-sm font-bold text-purple-300">
                {locale === 'fr' ? '+1 jour consécutif' : '+1 consecutive day'}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 leading-relaxed">
          {locale === 'fr' ? (
            <><strong className="text-zinc-200">Règle d'or :</strong> Chaque joueur dispose d'une seule tentative officielle par jour calendaire pour le Daily Challenge. Donnez le meilleur de vous-même !</>
          ) : (
            <><strong className="text-zinc-200">Golden rule:</strong> Each player gets only one official attempt per calendar day for the Daily Challenge. Give it your best!</>
          )}
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-800">
          <button
            type="button"
            onClick={onBackToDashboard}
            className="text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            {locale === 'fr' ? 'Plus tard' : 'Later'}
          </button>

          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-sm text-zinc-950 bg-emerald-400 hover:bg-emerald-300 transition-all flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/25 cursor-pointer active:scale-95"
          >
            <span>{locale === 'fr' ? 'Commencer le Défi du Jour' : 'Start Daily Challenge'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
