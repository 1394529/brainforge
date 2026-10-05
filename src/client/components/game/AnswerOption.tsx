import React from 'react';

interface AnswerOptionProps {
  id: string | number;
  label: string | number;
  prefix?: string;
  isSelected: boolean;
  isDisabled?: boolean;
  onClick: () => void;
  className?: string;
}

export const AnswerOption: React.FC<AnswerOptionProps> = ({
  prefix,
  label,
  isSelected,
  isDisabled = false,
  onClick,
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={`group relative w-full text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer select-none flex items-center gap-3.5 min-h-[56px] ${
        isSelected
          ? 'bg-emerald-500/15 border-emerald-500/80 text-emerald-100 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-950/20'
          : 'bg-zinc-850/80 hover:bg-zinc-800/90 border-zinc-700/80 hover:border-zinc-600 text-zinc-200'
      } ${isDisabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
    >
      {prefix && (
        <span
          className={`flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold font-mono transition-colors ${
            isSelected
              ? 'bg-emerald-500 text-zinc-950 shadow-sm'
              : 'bg-zinc-800 text-zinc-400 group-hover:bg-zinc-750 group-hover:text-zinc-200'
          }`}
        >
          {prefix}
        </span>
      )}
      <span className="flex-1 text-sm sm:text-base font-medium leading-snug">
        {label}
      </span>
      <div
        className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
          isSelected
            ? 'border-emerald-400 bg-emerald-500'
            : 'border-zinc-600 group-hover:border-zinc-500'
        }`}
      >
        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-zinc-950" />}
      </div>
    </button>
  );
};
