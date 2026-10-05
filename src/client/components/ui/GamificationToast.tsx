import React from 'react';
import { GamificationNotification } from '../../../types';
import { Award, Flame, Zap, Calendar, Sparkles, X } from 'lucide-react';

interface GamificationToastProps {
  notifications: GamificationNotification[];
  onDismiss: (id: string) => void;
}

export const GamificationToast: React.FC<GamificationToastProps> = ({ notifications, onDismiss }) => {
  if (notifications.length === 0) return null;

  const renderIcon = (type: GamificationNotification['type'], iconName?: string) => {
    switch (type) {
      case 'streak':
        return <Flame className="w-5 h-5 text-amber-400 animate-bounce" />;
      case 'level_up':
        return <Award className="w-5 h-5 text-emerald-400 animate-pulse" />;
      case 'achievement':
        return <Sparkles className="w-5 h-5 text-purple-400" />;
      case 'daily':
        return <Calendar className="w-5 h-5 text-teal-400" />;
      case 'xp':
      default:
        return <Zap className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className="pointer-events-auto bg-zinc-900/95 border border-zinc-700/80 shadow-2xl rounded-2xl p-4 flex items-start gap-3 backdrop-blur-md animate-slide-up transform transition-all hover:scale-[1.02]"
        >
          <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-700/50">
            {renderIcon(notif.type, notif.icon)}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              {notif.title}
            </h4>
            <p className="text-xs text-zinc-300 font-medium mt-0.5 truncate">
              {notif.message}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onDismiss(notif.id)}
            className="text-zinc-500 hover:text-zinc-300 p-1 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
