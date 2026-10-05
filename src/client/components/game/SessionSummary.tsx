import React from 'react';
import { ChallengeAttemptResult } from '../../../types';
import { Award, Clock, Zap, CheckCircle2, RotateCcw, History, ArrowRight } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface SessionSummaryProps {
  results: ChallengeAttemptResult[];
  totalDurationMs: number;
  onRestart: () => void;
  onViewHistory: () => void;
  onBackToDashboard?: () => void;
}

export const SessionSummary: React.FC<SessionSummaryProps> = ({
  results,
  totalDurationMs,
  onRestart,
  onViewHistory,
  onBackToDashboard,
}) => {
  const totalChallenges = results.length;
  const totalXp = results.reduce((acc, r) => acc + (r.gamification?.xpEarned || 0), 0);
  const avgScore = totalChallenges > 0
    ? Math.round(results.reduce((acc, r) => acc + (r.score?.percentage || 0), 0) / totalChallenges)
    : 0;

  const totalMinutes = Math.floor(totalDurationMs / 60000);
  const totalSeconds = Math.floor((totalDurationMs % 60000) / 1000);
  const formattedTime = `${totalMinutes}m ${totalSeconds}s`;

  return (
    <div className="w-full max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-2xl animate-fade-in">
      {/* Trophy Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500/20 via-indigo-500/20 to-amber-500/20 border border-emerald-500/30 mb-4 shadow-xl">
          <Award className="w-10 h-10 text-emerald-400" />
        </div>
        <h2 className="text-3xl font-black text-zinc-100 tracking-tight">
          Session Complete
        </h2>
        <p className="text-sm text-zinc-400 mt-1.5">
          Great workout! All session challenges processed through the Cognitive Engine.
        </p>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-8">
        <div className="bg-zinc-850/90 border border-zinc-800 rounded-2xl p-4 text-center">
          <div className="text-xs uppercase font-semibold text-zinc-400 mb-1 flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-zinc-500" />
            Completed
          </div>
          <div className="text-2xl font-black text-zinc-100">
            {totalChallenges}
          </div>
        </div>

        <div className="bg-zinc-850/90 border border-zinc-800 rounded-2xl p-4 text-center">
          <div className="text-xs uppercase font-semibold text-zinc-400 mb-1 flex items-center justify-center gap-1">
            <Award className="w-3.5 h-3.5 text-zinc-500" />
            Avg Score
          </div>
          <div className="text-2xl font-black text-emerald-400">
            {avgScore}%
          </div>
        </div>

        <div className="bg-zinc-850/90 border border-emerald-500/30 rounded-2xl p-4 text-center bg-emerald-950/15">
          <div className="text-xs uppercase font-semibold text-emerald-400 mb-1 flex items-center justify-center gap-1">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            Total XP
          </div>
          <div className="text-2xl font-black text-emerald-300 font-mono">
            +{totalXp}
          </div>
        </div>

        <div className="bg-zinc-850/90 border border-zinc-800 rounded-2xl p-4 text-center">
          <div className="text-xs uppercase font-semibold text-zinc-400 mb-1 flex items-center justify-center gap-1">
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
            Total Time
          </div>
          <div className="text-2xl font-black text-zinc-100 font-mono">
            {formattedTime}
          </div>
        </div>
      </div>

      {/* Challenges Breakdown List */}
      <div className="mb-8">
        <h3 className="text-sm uppercase tracking-wider font-bold text-zinc-400 mb-3 px-1">
          Challenge Breakdown
        </h3>
        <div className="space-y-2.5">
          {results.map((r, idx) => {
            const isPerfect = r.score.percentage === 100;
            return (
              <div
                key={r.attemptId || idx}
                className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-850/70 border border-zinc-800/80 hover:border-zinc-700/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-zinc-500 w-5">
                    #{idx + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-zinc-200">
                        {r.challenge.title}
                      </span>
                      <Badge variant="type" type={r.challenge.type} label={r.challenge.type} />
                    </div>
                    <div className="text-xs text-zinc-400 mt-0.5">
                      {r.feedback?.title}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <div className={`text-sm font-bold ${isPerfect ? 'text-emerald-400' : 'text-zinc-200'}`}>
                      {r.score.percentage}%
                    </div>
                    <div className="text-[11px] font-mono text-emerald-400/90">
                      +{r.gamification.xpEarned} XP
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="button"
          onClick={onRestart}
          className="flex-1 py-3.5 px-5 rounded-xl font-bold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Play Again</span>
        </button>

        {onBackToDashboard && (
          <button
            type="button"
            onClick={onBackToDashboard}
            className="py-3.5 px-5 rounded-xl font-semibold text-zinc-200 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Back to Dashboard</span>
          </button>
        )}

        <button
          type="button"
          onClick={onViewHistory}
          className="py-3.5 px-5 rounded-xl font-semibold text-zinc-400 hover:text-zinc-200 bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <History className="w-4 h-4" />
          <span>History</span>
        </button>
      </div>
    </div>
  );
};
