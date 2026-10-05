import React, { useState, useEffect, useRef } from 'react';
import { ReactionContent } from '../../../types/reaction';
import { Zap, AlertTriangle, ArrowRight, Loader2, Play, MousePointerClick } from 'lucide-react';

interface ReactionChallengeProps {
  content: ReactionContent;
  isSubmitting: boolean;
  onSubmit: (submission: {
    reactionTimeMs: number;
    durationMs: number;
    isFalseStart?: boolean;
    clientTimestamp?: number;
  }) => void;
}

type ReactionState = 'ready' | 'waiting' | 'stimulus' | 'responded' | 'false_start';

export const ReactionChallenge: React.FC<ReactionChallengeProps> = ({
  content,
  isSubmitting,
  onSubmit,
}) => {
  const [gameState, setGameState] = useState<ReactionState>('ready');
  const [recordedRt, setRecordedRt] = useState<number | null>(null);

  const timeoutRef = useRef<number | null>(null);
  const stimulusTimeRef = useRef<number>(0);

  const minDelay = content.minDelayMs || 1000;
  const maxDelay = content.maxDelayMs || 3000;

  // Cleanup timeout on unmount or challenge change
  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleStartTrial = () => {
    if (isSubmitting) return;

    setGameState('waiting');
    setRecordedRt(null);

    // Random stochastic delay between minDelay and maxDelay
    const randomDelay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;

    timeoutRef.current = window.setTimeout(() => {
      stimulusTimeRef.current = performance.now();
      setGameState('stimulus');
    }, randomDelay);
  };

  const handleAreaClick = () => {
    if (isSubmitting) return;

    if (gameState === 'ready') {
      handleStartTrial();
    } else if (gameState === 'waiting') {
      // FALSE START: User clicked before the stimulus appeared!
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
      setGameState('false_start');
    } else if (gameState === 'stimulus') {
      // Valid reaction!
      const rt = Math.max(1, Math.round(performance.now() - stimulusTimeRef.current));
      setRecordedRt(rt);
      setGameState('responded');
    }
  };

  const handleRetryFalseStart = () => {
    setGameState('ready');
    setRecordedRt(null);
  };

  const handleSubmit = (isFalseStartOverride = false) => {
    if (isSubmitting) return;

    if (gameState === 'false_start' || isFalseStartOverride) {
      onSubmit({
        reactionTimeMs: 0,
        durationMs: 0,
        isFalseStart: true,
        clientTimestamp: Date.now(),
      });
    } else if (recordedRt !== null) {
      onSubmit({
        reactionTimeMs: recordedRt,
        durationMs: recordedRt,
        isFalseStart: false,
        clientTimestamp: Date.now(),
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Interactive Trigger Surface */}
      <div
        onClick={handleAreaClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            handleAreaClick();
          }
        }}
        className={`w-full min-h-[300px] sm:min-h-[360px] rounded-3xl p-8 flex flex-col items-center justify-center text-center select-none transition-all duration-150 cursor-pointer border-2 shadow-2xl relative overflow-hidden outline-none ${
          gameState === 'ready'
            ? 'bg-zinc-850/90 border-zinc-700 hover:border-emerald-500/60'
            : gameState === 'waiting'
            ? 'bg-amber-950/30 border-amber-500/80 animate-pulse'
            : gameState === 'stimulus'
            ? 'bg-emerald-600 border-emerald-300 scale-[1.01] shadow-emerald-500/50'
            : gameState === 'false_start'
            ? 'bg-rose-950/40 border-rose-500/80'
            : 'bg-zinc-900 border-emerald-500/60'
        }`}
      >
        {/* STATE: READY */}
        {gameState === 'ready' && (
          <div className="space-y-4 max-w-md animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-zinc-800 border border-zinc-700 text-emerald-400 mx-auto shadow-inner">
              <Play className="w-9 h-9 fill-current translate-x-0.5" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-zinc-100">
                Click Anywhere to Start
              </h3>
              <p className="text-sm text-zinc-400 mt-2">
                {content.prompt || 'Wait for the stimulus to flash green, then click as fast as humanly possible.'}
              </p>
            </div>
            <div className="text-xs text-zinc-500 pt-2 font-mono">
              Spacebar or click to engage
            </div>
          </div>
        )}

        {/* STATE: WAITING */}
        {gameState === 'waiting' && (
          <div className="space-y-4 max-w-md animate-fade-in pointer-events-none">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-amber-500/20 border border-amber-500/40 text-amber-400 mx-auto">
              <Zap className="w-10 h-10 animate-bounce" />
            </div>
            <div>
              <h3 className="text-3xl font-black text-amber-300 tracking-wider">
                WAIT FOR SIGNAL...
              </h3>
              <p className="text-sm text-amber-200/80 mt-2 font-medium">
                Hold your trigger. Do NOT click prematurely!
              </p>
            </div>
          </div>
        )}

        {/* STATE: STIMULUS (FLASH) */}
        {gameState === 'stimulus' && (
          <div className="space-y-4 max-w-md animate-scale-in text-white pointer-events-none">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white text-emerald-700 mx-auto shadow-2xl animate-ping-once">
              <MousePointerClick className="w-14 h-14" />
            </div>
            <div>
              <h3 className="text-4xl sm:text-5xl font-black tracking-tight drop-shadow-md">
                CLICK NOW!
              </h3>
              <p className="text-base text-emerald-100 font-semibold mt-1">
                Trigger action immediately!
              </p>
            </div>
          </div>
        )}

        {/* STATE: FALSE START */}
        {gameState === 'false_start' && (
          <div className="space-y-4 max-w-md animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-rose-500/20 border border-rose-500/50 text-rose-400 mx-auto">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-3xl font-black text-rose-300 tracking-wider">
                FALSE START!
              </h3>
              <p className="text-sm text-rose-200/80 mt-2">
                You clicked before the stimulus appeared. Anticipation invalidates the trial.
              </p>
            </div>
            <div className="flex gap-3 justify-center pt-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRetryFalseStart();
                }}
                className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs border border-zinc-700 cursor-pointer"
              >
                Reset Trial
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSubmit(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-zinc-950 font-bold text-xs cursor-pointer"
              >
                Submit False Start (0 XP)
              </button>
            </div>
          </div>
        )}

        {/* STATE: RESPONDED */}
        {gameState === 'responded' && recordedRt !== null && (
          <div className="space-y-4 max-w-md animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto">
              <Zap className="w-10 h-10" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest font-bold text-emerald-400">
                Reaction Recorded
              </span>
              <h3 className="text-5xl font-black text-zinc-100 font-mono mt-1">
                {recordedRt} <span className="text-2xl font-normal text-zinc-500">ms</span>
              </h3>
            </div>
          </div>
        )}
      </div>

      {/* Action Footer when trial is responded */}
      {gameState === 'responded' && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleStartTrial}
            disabled={isSubmitting}
            className="text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer underline"
          >
            Retest Reflex Before Submitting
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm text-zinc-950 bg-emerald-400 hover:bg-emerald-300 transition-all duration-150 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting Trial...</span>
              </>
            ) : (
              <>
                <span>Submit Reaction Result</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
