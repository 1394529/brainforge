import React, { useState, useEffect, useRef } from 'react';
import { PatternContent } from '../../../types/pattern';
import { AnswerOption } from './AnswerOption';
import { ChallengeTimer } from './ChallengeTimer';
import { ArrowRight, Loader2, HelpCircle } from 'lucide-react';

interface PatternChallengeProps {
  content: PatternContent;
  isSubmitting: boolean;
  onSubmit: (submission: { selectedOption: string | number; durationMs: number }) => void;
}

export const PatternChallenge: React.FC<PatternChallengeProps> = ({
  content,
  isSubmitting,
  onSubmit,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | number | null>(null);
  const startTimeRef = useRef<number>(performance.now());
  const prefixes = ['1', '2', '3', '4', '5', '6'];

  useEffect(() => {
    startTimeRef.current = performance.now();
    setSelectedOption(null);
  }, [content]);

  // Keyboard shortcut (1-4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSubmitting) return;
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= content.options.length) {
        setSelectedOption(content.options[num - 1]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [content, isSubmitting]);

  const handleSubmit = () => {
    if (selectedOption === null || isSubmitting) return;
    const durationMs = Math.round(performance.now() - startTimeRef.current);
    onSubmit({ selectedOption, durationMs });
  };

  return (
    <div className="space-y-6">
      {/* Sequence Display Box */}
      <div className="p-6 sm:p-8 rounded-2xl bg-zinc-850/90 border border-zinc-800 shadow-inner">
        <div className="flex items-center justify-between gap-4 mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">
            Sequence Progression
          </span>
          <ChallengeTimer isRunning={!isSubmitting} />
        </div>

        {/* Visual Sequence Cards */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-4">
          {content.sequence.map((item, idx) => (
            <React.Fragment key={idx}>
              <div className="flex items-center justify-center min-w-[54px] sm:min-w-[64px] h-14 sm:h-16 px-4 rounded-xl bg-zinc-900 border border-zinc-700/80 text-lg sm:text-xl font-black font-mono text-zinc-100 shadow-md">
                {item}
              </div>
              <span className="text-zinc-600 font-bold text-lg select-none">→</span>
            </React.Fragment>
          ))}
          {/* Unknown target slot */}
          <div className="flex items-center justify-center min-w-[54px] sm:min-w-[64px] h-14 sm:h-16 px-4 rounded-xl bg-purple-950/30 border-2 border-dashed border-purple-500/80 text-xl font-black font-mono text-purple-300 shadow-inner animate-pulse">
            {selectedOption !== null ? selectedOption : '?'}
          </div>
        </div>

        {content.hint && (
          <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-zinc-500">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{content.hint}</span>
          </div>
        )}
      </div>

      {/* Answer Options Grid */}
      <div>
        <div className="text-xs uppercase font-semibold text-zinc-400 mb-3 px-1">
          Select Next Value
        </div>
        <div className="grid grid-cols-2 gap-3" role="radiogroup">
          {content.options.map((opt, idx) => (
            <AnswerOption
              key={idx}
              id={opt}
              label={opt}
              prefix={prefixes[idx]}
              isSelected={selectedOption === opt}
              isDisabled={isSubmitting}
              onClick={() => setSelectedOption(opt)}
            />
          ))}
        </div>
      </div>

      {/* Submit Action */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs text-zinc-500 hidden sm:inline">
          Choose the value that completes the pattern
        </span>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={selectedOption === null || isSubmitting}
          className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm text-zinc-950 transition-all duration-150 flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
            selectedOption !== null && !isSubmitting
              ? 'bg-purple-400 hover:bg-purple-300 shadow-purple-500/20 active:scale-[0.98]'
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Evaluating...</span>
            </>
          ) : (
            <>
              <span>Submit Answer</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
