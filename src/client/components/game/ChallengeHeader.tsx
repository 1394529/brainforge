import React from 'react';
import { ChallengeType, SkillCategory } from '../../../types';
import { Badge } from '../ui/Badge';
import { Brain, Sparkles, Zap, Target, HelpCircle } from 'lucide-react';

interface ChallengeHeaderProps {
  type: ChallengeType;
  skill: SkillCategory;
  difficulty: number;
  title: string;
  description: string;
  currentIndex?: number;
  totalChallenges?: number;
  className?: string;
}

export const ChallengeHeader: React.FC<ChallengeHeaderProps> = ({
  type,
  skill,
  difficulty,
  title,
  description,
  currentIndex,
  totalChallenges,
  className = '',
}) => {
  const getIcon = () => {
    switch (type) {
      case 'quiz':
        return <HelpCircle className="w-5 h-5 text-blue-400" />;
      case 'pattern':
        return <Brain className="w-5 h-5 text-purple-400" />;
      case 'memory':
        return <Sparkles className="w-5 h-5 text-amber-400" />;
      case 'reaction':
        return <Zap className="w-5 h-5 text-emerald-400" />;
      default:
        return <Target className="w-5 h-5 text-zinc-400" />;
    }
  };

  return (
    <div className={`border-b border-zinc-800 pb-5 mb-6 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-zinc-850 border border-zinc-700/60 shadow-inner">
            {getIcon()}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="type" type={type} label={type} />
            <Badge variant="difficulty" difficulty={difficulty} label={`Diff ${difficulty}`} />
          </div>
        </div>

        {currentIndex !== undefined && totalChallenges !== undefined && (
          <div className="text-xs font-semibold px-3 py-1 rounded-md bg-zinc-850 border border-zinc-700/80 text-zinc-300">
            Challenge <span className="text-emerald-400 font-bold">{currentIndex}</span> / {totalChallenges}
          </div>
        )}
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight mb-1">
        {title}
      </h2>
      <p className="text-sm text-zinc-400">
        {description}
      </p>
    </div>
  );
};
