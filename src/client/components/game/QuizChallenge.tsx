import React, { useState, useEffect, useRef } from 'react';
import { QuizContent } from '../../../types/quiz';
import { AnswerOption } from './AnswerOption';
import { ChallengeTimer } from './ChallengeTimer';
import { ArrowRight, Loader2 } from 'lucide-react';

interface QuizChallengeProps {
  content: QuizContent;
  isSubmitting: boolean;
  onSubmit: (submission: { selectedOptionId: string; durationMs: number }) => void;
}

export const QuizChallenge: React.FC<QuizChallengeProps> = ({
  content,
  isSubmitting,
  onSubmit,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const startTimeRef = useRef<number>(performance.now());
  const prefixes = ['A', 'B', 'C', 'D', 'E', 'F'];

  useEffect(() => {
    startTimeRef.current = performance.now();
    setSelectedId(null);
  }, [content]);

  // Keyboard shortcut listener (1-4 or A-D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSubmitting) return;

      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= content.options.length) {
        setSelectedId(content.options[num - 1].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [content, isSubmitting]);

  const handleSubmit = () => {
    if (!selectedId || isSubmitting) return;
    const durationMs = Math.round(performance.now() - startTimeRef.current);
    onSubmit({ selectedOptionId: selectedId, durationMs });
  };

  return (
    <div className="space-y-6">
      {/* Question Card */}
      <div className="flex items-start justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-zinc-850/90 border border-zinc-800 shadow-inner">
        <h3 className="text-lg sm:text-xl font-semibold text-zinc-100 leading-relaxed">
          {content.question}
        </h3>
        <ChallengeTimer isRunning={!isSubmitting} />
      </div>

      {/* Options List */}
      <div className="grid grid-cols-1 gap-3" role="radiogroup" aria-label="Quiz options">
        {content.options.map((opt, idx) => (
          <AnswerOption
            key={opt.id}
            id={opt.id}
            label={opt.label}
            prefix={prefixes[idx] || `${idx + 1}`}
            isSelected={selectedId === opt.id}
            isDisabled={isSubmitting}
            onClick={() => setSelectedId(opt.id)}
          />
        ))}
      </div>

      {/* Submit Action */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs text-zinc-500 hidden sm:inline">
          Use number keys (1-{content.options.length}) or click to select
        </span>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!selectedId || isSubmitting}
          className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm text-zinc-950 transition-all duration-150 flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
            selectedId && !isSubmitting
              ? 'bg-emerald-400 hover:bg-emerald-300 shadow-emerald-500/20 active:scale-[0.98]'
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
