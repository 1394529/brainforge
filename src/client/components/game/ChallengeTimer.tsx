import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface ChallengeTimerProps {
  isRunning: boolean;
  onTick?: (elapsedMs: number) => void;
  countdownFromMs?: number;
  onCountdownComplete?: () => void;
  className?: string;
}

export const ChallengeTimer: React.FC<ChallengeTimerProps> = ({
  isRunning,
  onTick,
  countdownFromMs,
  onCountdownComplete,
  className = '',
}) => {
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const isCountdown = countdownFromMs !== undefined && countdownFromMs > 0;

  useEffect(() => {
    setElapsedMs(0);
  }, [countdownFromMs]);

  useEffect(() => {
    if (!isRunning) return;

    const start = performance.now() - elapsedMs;
    const interval = window.setInterval(() => {
      const current = performance.now() - start;
      setElapsedMs(current);
      if (onTick) onTick(current);

      if (isCountdown && current >= countdownFromMs) {
        window.clearInterval(interval);
        if (onCountdownComplete) onCountdownComplete();
      }
    }, 50);

    return () => window.clearInterval(interval);
  }, [isRunning, countdownFromMs, isCountdown]);

  const displaySeconds = isCountdown
    ? Math.max(0, ((countdownFromMs - elapsedMs) / 1000)).toFixed(1)
    : (elapsedMs / 1000).toFixed(1);

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/90 border border-zinc-700/80 text-zinc-300 text-sm font-mono shadow-sm ${className}`}
    >
      <Clock className={`w-4 h-4 ${isRunning ? 'text-emerald-400 animate-pulse' : 'text-zinc-500'}`} />
      <span>{displaySeconds}s</span>
    </div>
  );
};
