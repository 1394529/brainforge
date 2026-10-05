import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ChallengeAttemptRecord, ChallengeType } from '../../types';
import { Badge } from '../components/ui/Badge';
import { History, Target, Zap, Clock, Filter, ArrowRight, Loader2 } from 'lucide-react';

interface HistoryPageProps {
  onStartTraining: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onStartTraining }) => {
  const { token } = useAuth();
  const { t } = useLanguage();
  const [history, setHistory] = useState<ChallengeAttemptRecord[]>([]);
  const [selectedType, setSelectedType] = useState<ChallengeType | 'all'>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchHistory = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const typeParam = selectedType !== 'all' ? `?type=${selectedType}` : '';
      const res = await fetch(`/api/history${typeParam}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [token, selectedType]);

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <History className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-black text-zinc-100">
              {t.history.title}
            </h1>
          </div>
          <p className="text-sm text-zinc-400">
            {t.history.subtitle}
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-zinc-500 mr-1" />
          {[
            { id: 'all', label: t.types.all },
            { id: 'quiz', label: t.types.quiz },
            { id: 'pattern', label: t.types.pattern },
            { id: 'memory', label: t.types.memory },
            { id: 'reaction', label: t.types.reaction },
          ].map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setSelectedType(id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedType === id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-zinc-850 hover:bg-zinc-800 text-zinc-400 border border-zinc-700/60'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Table / List */}
      {isLoading ? (
        <div className="p-16 text-center bg-zinc-900 border border-zinc-800 rounded-3xl">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-3" />
          <p className="text-sm text-zinc-400">Loading attempt records...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="p-16 text-center bg-zinc-900 border border-zinc-800 rounded-3xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-850 border border-zinc-800 flex items-center justify-center text-zinc-500 mx-auto">
            <History className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-zinc-200">
            {t.history.emptyTitle}
          </h3>
          <p className="text-sm text-zinc-400 max-w-md mx-auto">
            {t.history.emptySubtitle}
          </p>
          <button
            type="button"
            onClick={onStartTraining}
            className="px-6 py-2.5 rounded-xl font-bold text-xs text-zinc-950 bg-emerald-400 hover:bg-emerald-300 transition-colors inline-flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-500/20"
          >
            <span>{t.history.startNow}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-850/70 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">{t.history.tableHeaders.challenge}</th>
                  <th className="py-3.5 px-4">{t.history.tableHeaders.type}</th>
                  <th className="py-3.5 px-4">{t.history.tableHeaders.score}</th>
                  <th className="py-3.5 px-4">{t.history.tableHeaders.xp}</th>
                  <th className="py-3.5 px-4">{t.history.tableHeaders.metrics}</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">{t.history.tableHeaders.date}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80 text-sm">
                {history.map((attempt) => {
                  const isPerfect = attempt.percentage === 100;
                  return (
                    <tr
                      key={attempt.id}
                      className="hover:bg-zinc-850/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 sm:px-6 font-semibold text-zinc-200">
                        {attempt.challengeTitle || attempt.challengeId}
                      </td>
                      <td className="py-3.5 px-4">
                        {attempt.challengeType && (
                          <Badge variant="type" type={attempt.challengeType} />
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-mono font-bold ${
                            isPerfect
                              ? 'text-emerald-400'
                              : attempt.percentage > 0
                              ? 'text-zinc-200'
                              : 'text-rose-400'
                          }`}
                        >
                          {attempt.percentage}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-emerald-400 text-xs bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                          +{attempt.xpEarned} XP
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono text-zinc-400">
                        {attempt.metrics.reactionTimeMs !== undefined ? (
                          <span>{attempt.metrics.reactionTimeMs}ms rt</span>
                        ) : attempt.metrics.correctItems !== undefined ? (
                          <span>{attempt.metrics.correctItems}/{attempt.metrics.totalItems} items</span>
                        ) : attempt.durationMs > 0 ? (
                          <span>{(attempt.durationMs / 1000).toFixed(1)}s</span>
                        ) : (
                          <span>--</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right text-xs text-zinc-500 whitespace-nowrap">
                        {formatDate(attempt.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
