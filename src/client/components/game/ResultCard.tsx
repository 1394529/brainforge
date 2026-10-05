import React, { useEffect, useState } from 'react';
import { ChallengeAttemptResult } from '../../../types';
import { ProgressBar } from '../ui/ProgressBar';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { CheckCircle, XCircle, Award, Zap, Clock, Target, ArrowRight, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ResultCardProps {
  result: ChallengeAttemptResult;
  onNext: () => void;
  isLastChallengeInSession?: boolean;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  result,
  onNext,
  isLastChallengeInSession = false,
}) => {
  const { score, gamification, feedback, challenge } = result;
  const { token } = useAuth();
  const { locale } = useLanguage();
  const [coachTip, setCoachTip] = useState<string | null>(null);
  const isSuccess = (score.percentage ?? 0) >= 50;

  useEffect(() => {
    if (!token) return;
    fetch('/api/coach/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        challengeType: challenge.type,
        difficulty: challenge.difficulty,
        scorePercentage: score.percentage,
        durationMs: score.durationMs,
        lang: locale,
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.feedback) setCoachTip(data.feedback);
      })
      .catch(() => {});
  }, [challenge.id, token, locale]);

  useEffect(() => {
    if (gamification.leveledUp || score.percentage === 100) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#6366f1', '#f59e0b', '#3b82f6'],
        });
      } catch {
        // Safe fallback if canvas is not present
      }
    }
  }, [gamification.leveledUp, score.percentage]);

  const durationSec = score.durationMs ? (score.durationMs / 1000).toFixed(1) : null;

  return (
    <div className="w-full max-w-xl mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl animate-fade-in">
      {/* Level Up Banner if leveled up */}
      {gamification.leveledUp && (
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-indigo-500/20 border border-amber-500/40 text-center animate-bounce-short">
          <span className="text-xs uppercase tracking-widest font-bold text-amber-400">
            Level Up!
          </span>
          <h3 className="text-xl font-black text-white mt-0.5">
            You reached Level {gamification.currentLevel}!
          </h3>
        </div>
      )}

      {/* Main Status Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-zinc-850 border border-zinc-700/80 shadow-inner">
          {score.metrics?.isFalseStart ? (
            <XCircle className="w-9 h-9 text-rose-400" />
          ) : isSuccess ? (
            <CheckCircle className="w-9 h-9 text-emerald-400" />
          ) : (
            <XCircle className="w-9 h-9 text-amber-400" />
          )}
        </div>

        <h2 className="text-2xl font-black text-zinc-100 tracking-tight">
          {feedback?.title || 'Challenge Complete'}
        </h2>
        {feedback?.message && (
          <p className="text-sm text-zinc-400 mt-1 max-w-md mx-auto">
            {feedback.message}
          </p>
        )}
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {/* Score */}
        <div className="bg-zinc-850/80 border border-zinc-800 rounded-xl p-3.5 text-center">
          <div className="text-xs font-semibold uppercase text-zinc-400 mb-1 flex items-center justify-center gap-1">
            <Target className="w-3.5 h-3.5 text-zinc-500" />
            Score
          </div>
          <div className="text-xl sm:text-2xl font-black text-zinc-100">
            {score.rawScore} <span className="text-xs text-zinc-500 font-normal">/ {score.maxScore}</span>
          </div>
        </div>

        {/* Percentage / Accuracy */}
        <div className="bg-zinc-850/80 border border-zinc-800 rounded-xl p-3.5 text-center">
          <div className="text-xs font-semibold uppercase text-zinc-400 mb-1 flex items-center justify-center gap-1">
            <Award className="w-3.5 h-3.5 text-zinc-500" />
            Accuracy
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400">
            {score.percentage}%
          </div>
        </div>

        {/* Duration / Reaction time */}
        <div className="bg-zinc-850/80 border border-zinc-800 rounded-xl p-3.5 text-center">
          <div className="text-xs font-semibold uppercase text-zinc-400 mb-1 flex items-center justify-center gap-1">
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
            Time
          </div>
          <div className="text-xl sm:text-2xl font-black text-zinc-100 font-mono">
            {score.metrics?.reactionTimeMs !== undefined
              ? `${score.metrics.reactionTimeMs}ms`
              : durationSec
              ? `${durationSec}s`
              : '--'}
          </div>
        </div>

        {/* XP Earned */}
        <div className="bg-zinc-850/80 border border-emerald-500/20 rounded-xl p-3.5 text-center bg-emerald-950/10">
          <div className="text-xs font-semibold uppercase text-emerald-400 mb-1 flex items-center justify-center gap-1">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            XP Earned
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-300 font-mono">
            +{gamification.xpEarned}
          </div>
        </div>
      </div>

      {/* Gamification Level & Next Level Progress */}
      <div className="bg-zinc-850 border border-zinc-800/80 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between text-xs font-semibold mb-2">
          <span className="text-zinc-300">
            Level <strong className="text-emerald-400">{gamification.currentLevel}</strong> Progression
          </span>
          <span className="text-zinc-400 font-mono">
            {gamification.totalXp} Total XP
          </span>
        </div>
        <ProgressBar
          progress={gamification.levelProgress}
          color="from-emerald-500 via-teal-400 to-indigo-500"
        />
        <div className="flex justify-between items-center text-[11px] text-zinc-500 mt-1.5 font-mono">
          <span>Current level</span>
          <span>{gamification.levelProgress}% towards next level</span>
        </div>
      </div>

      {/* AI Coach Feedback Tip */}
      {coachTip && (
        <div className="mb-6 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-start gap-3 text-xs text-indigo-200">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block text-[10px] uppercase font-mono text-indigo-400">
              {locale === 'fr' ? 'Conseil du Coach IA' : 'AI Coach Feedback'}
            </span>
            <p className="leading-relaxed text-zinc-200">{coachTip}</p>
          </div>
        </div>
      )}

      {/* Action Button */}
      <button
        type="button"
        onClick={onNext}
        className="w-full py-4 px-6 rounded-xl font-bold text-sm sm:text-base text-zinc-950 bg-emerald-400 hover:bg-emerald-300 active:scale-[0.99] transition-all duration-150 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
      >
        <span>{isLastChallengeInSession ? 'Complete Session' : 'Next Challenge'}</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
