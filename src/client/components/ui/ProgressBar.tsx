import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  height?: string;
  color?: string;
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 'h-2.5',
  color = 'from-emerald-500 to-teal-400',
  showLabel = false,
  className = '',
}) => {
  const clamped = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-semibold text-zinc-400 mb-1.5">
          <span>Progress</span>
          <span className="text-zinc-200">{clamped}%</span>
        </div>
      )}
      <div className={`w-full bg-zinc-800/90 rounded-full overflow-hidden border border-zinc-700/50 ${height}`}>
        <div
          className={`h-full bg-gradient-to-r ${color} transition-all duration-500 ease-out`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
