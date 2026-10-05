import React from 'react';
import { ChallengeType, SkillCategory } from '../../../types';

interface BadgeProps {
  variant?: 'type' | 'skill' | 'difficulty' | 'score' | 'neutral';
  type?: ChallengeType;
  skill?: SkillCategory;
  difficulty?: number;
  label?: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  type,
  skill,
  difficulty,
  label,
  className = '',
}) => {
  let bg = 'bg-zinc-800 text-zinc-300 border-zinc-700';

  if (variant === 'type' && type) {
    switch (type) {
      case 'quiz':
        bg = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
        break;
      case 'pattern':
        bg = 'bg-purple-500/10 text-purple-400 border-purple-500/30';
        break;
      case 'memory':
        bg = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
        break;
      case 'reaction':
        bg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
        break;
    }
  } else if (variant === 'difficulty' && difficulty) {
    if (difficulty === 1) bg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    else if (difficulty === 2) bg = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    else bg = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wider ${bg} ${className}`}
    >
      {label || (type ? type : difficulty ? `Diff ${difficulty}` : '')}
    </span>
  );
};
