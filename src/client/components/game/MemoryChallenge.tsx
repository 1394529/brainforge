import React, { useState, useEffect, useRef } from 'react';
import { MemoryContent } from '../../../types/memory';
import { ProgressBar } from '../ui/ProgressBar';
import { Sparkles, Eye, ArrowRight, RotateCcw, Loader2, Check } from 'lucide-react';

interface MemoryChallengeProps {
  content: MemoryContent;
  isSubmitting: boolean;
  onSubmit: (submission: { recalledSequence: string[]; durationMs: number }) => void;
}

type MemoryPhase = 'memorizing' | 'recalling';

export const MemoryChallenge: React.FC<MemoryChallengeProps> = ({
  content,
  isSubmitting,
  onSubmit,
}) => {
  const [phase, setPhase] = useState<MemoryPhase>('memorizing');
  const [countdownRemainingMs, setCountdownRemainingMs] = useState<number>(content.displayDurationMs || 3000);
  const [recalledItems, setRecalledItems] = useState<string[]>([]);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const recallStartTimeRef = useRef<number>(0);

  const displayDuration = content.displayDurationMs || 3000;

  // Initialize memorization phase
  useEffect(() => {
    setPhase('memorizing');
    setCountdownRemainingMs(displayDuration);
    setRecalledItems([]);

    // Prepare shuffled options for recall phase (shuffled so order isn't given away)
    const shuffled = [...content.items].sort(() => Math.random() - 0.5);
    setShuffledOptions(shuffled);

    const startTime = performance.now();
    const timer = window.setInterval(() => {
      const elapsed = performance.now() - startTime;
      const remaining = Math.max(0, displayDuration - elapsed);
      setCountdownRemainingMs(remaining);

      if (remaining <= 0) {
        window.clearInterval(timer);
        setPhase('recalling');
        recallStartTimeRef.current = performance.now();
      }
    }, 50);

    return () => window.clearInterval(timer);
  }, [content, displayDuration]);

  const handleSelectItem = (item: string) => {
    if (recalledItems.length >= content.items.length || isSubmitting) return;
    setRecalledItems([...recalledItems, item]);
  };

  const handleRemoveLast = () => {
    if (recalledItems.length === 0 || isSubmitting) return;
    setRecalledItems(recalledItems.slice(0, -1));
  };

  const handleResetRecall = () => {
    if (isSubmitting) return;
    setRecalledItems([]);
  };

  const handleSubmit = () => {
    if (recalledItems.length === 0 || isSubmitting) return;
    const durationMs = Math.round(performance.now() - recallStartTimeRef.current);
    onSubmit({ recalledSequence: recalledItems, durationMs });
  };

  const memorizationProgress = Math.max(0, (countdownRemainingMs / displayDuration) * 100);

  return (
    <div className="space-y-6">
      {/* PHASE 1: MEMORIZATION */}
      {phase === 'memorizing' && (
        <div className="p-8 rounded-2xl bg-zinc-850/90 border border-amber-500/30 text-center space-y-6 animate-fade-in shadow-xl">
          <div className="flex items-center justify-center gap-2 text-amber-400 text-sm font-semibold tracking-wide uppercase">
            <Eye className="w-4 h-4 animate-pulse" />
            <span>Memorize the Sequence</span>
          </div>

          {/* Sequence items displayed large */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 py-6">
            {content.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-center w-14 h-16 sm:w-18 sm:h-20 rounded-2xl bg-amber-500/10 border-2 border-amber-500/60 text-2xl sm:text-3xl font-black font-mono text-amber-200 shadow-lg shadow-amber-950/30 animate-scale-in"
              >
                {item}
              </div>
            ))}
          </div>

          {/* Countdown timer bar */}
          <div className="max-w-md mx-auto space-y-2">
            <div className="flex justify-between text-xs text-zinc-400 font-mono">
              <span>Time Remaining</span>
              <span className="text-amber-400 font-bold">{(countdownRemainingMs / 1000).toFixed(1)}s</span>
            </div>
            <ProgressBar
              progress={memorizationProgress}
              color="from-amber-500 to-amber-300"
              height="h-3"
            />
          </div>
        </div>
      )}

      {/* PHASE 2: RECALL & RECONSTRUCTION */}
      {phase === 'recalling' && (
        <div className="space-y-6 animate-fade-in">
          {/* Target Slots Area */}
          <div className="p-6 sm:p-8 rounded-2xl bg-zinc-850/90 border border-zinc-800 shadow-inner text-center">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Reconstruct Sequence Order
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                {recalledItems.length} / {content.items.length} placed
              </span>
            </div>

            {/* Recalled slots */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 py-4">
              {Array.from({ length: content.items.length }).map((_, idx) => {
                const filledValue = recalledItems[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => idx === recalledItems.length - 1 && handleRemoveLast()}
                    className={`flex items-center justify-center w-14 h-16 sm:w-16 sm:h-18 rounded-2xl font-mono font-bold text-xl sm:text-2xl transition-all duration-200 select-none ${
                      filledValue
                        ? 'bg-zinc-900 border-2 border-amber-500/80 text-amber-200 shadow-md cursor-pointer hover:border-rose-500 hover:text-rose-300'
                        : 'bg-zinc-900/50 border-2 border-dashed border-zinc-700 text-zinc-600'
                    }`}
                  >
                    {filledValue || idx + 1}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-center gap-3 mt-3">
              <button
                type="button"
                onClick={handleRemoveLast}
                disabled={recalledItems.length === 0 || isSubmitting}
                className="text-xs text-zinc-400 hover:text-zinc-200 disabled:opacity-40 cursor-pointer underline"
              >
                Remove last
              </button>
              <span className="text-zinc-600">•</span>
              <button
                type="button"
                onClick={handleResetRecall}
                disabled={recalledItems.length === 0 || isSubmitting}
                className="text-xs text-zinc-400 hover:text-zinc-200 disabled:opacity-40 cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset all
              </button>
            </div>
          </div>

          {/* Symbol Pool Selection */}
          <div className="space-y-3">
            <span className="text-xs uppercase font-semibold text-zinc-400 px-1">
              Select Symbols in Sequence:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {shuffledOptions.map((item, idx) => {
                // Count how many times this item is used in target vs recalled
                const occurrencesInTarget = content.items.filter((x) => x === item).length;
                const occurrencesInRecalled = recalledItems.filter((x) => x === item).length;
                const isExhausted = occurrencesInRecalled >= occurrencesInTarget;

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isExhausted || isSubmitting}
                    onClick={() => handleSelectItem(item)}
                    className={`flex items-center justify-center w-16 h-16 sm:w-18 sm:h-18 rounded-2xl font-mono text-2xl font-black border transition-all duration-150 cursor-pointer shadow-md ${
                      isExhausted
                        ? 'bg-zinc-900 border-zinc-800 text-zinc-600 opacity-40 cursor-not-allowed scale-95'
                        : 'bg-zinc-800 hover:bg-zinc-750 active:scale-95 border-zinc-700 hover:border-amber-500/60 text-zinc-100 hover:text-amber-300'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-zinc-500">
              Click elements to fill each position from left to right
            </span>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={recalledItems.length === 0 || isSubmitting}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm text-zinc-950 transition-all duration-150 flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                recalledItems.length > 0 && !isSubmitting
                  ? 'bg-amber-400 hover:bg-amber-300 shadow-amber-500/20 active:scale-[0.98]'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Evaluating Sequence...</span>
                </>
              ) : (
                <>
                  <span>Submit Sequence</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
