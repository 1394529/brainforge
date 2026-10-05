import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LeaderboardData, LeaderboardEntry } from '../../types';
import {
  Trophy,
  Medal,
  Crown,
  Calendar,
  Globe,
  Shield,
  Loader2,
  Sparkles,
  ArrowRight,
  User,
} from 'lucide-react';

interface LeaderboardPageProps {
  onGoToSettings?: () => void;
}

export const LeaderboardPage: React.FC<LeaderboardPageProps> = ({ onGoToSettings }) => {
  const { user, token } = useAuth();
  const { t, locale } = useLanguage();

  const [timeframe, setTimeframe] = useState<'weekly' | 'all_time'>('weekly');
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchLeaderboard = async (selectedTimeframe: 'weekly' | 'all_time') => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/leaderboard?timeframe=${selectedTimeframe}&limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json: LeaderboardData = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(timeframe);
  }, [timeframe, token]);

  const top3 = data?.entries.slice(0, 3) || [];
  const restOfEntries = data?.entries.slice(3) || [];
  const currentUserEntry = data?.entries.find((e) => e.isCurrentUser);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider font-mono">
          <Trophy className="w-3.5 h-3.5" />
          <span>{locale === 'fr' ? 'Communauté & Progression' : 'Community & Progression'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          {locale === 'fr' ? 'Classement des Challengers' : 'Challengers Leaderboard'}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
          {locale === 'fr'
            ? 'Suivez votre engagement et comparez votre régularité quotidienne avec les autres membres de BrainForge.'
            : 'Track your engagement and compare your daily consistency with other BrainForge members.'}
        </p>
      </div>

      {/* Timeframe Toggle Buttons */}
      <div className="flex items-center justify-center gap-2 p-1.5 rounded-2xl bg-zinc-900 border border-zinc-800 max-w-md mx-auto">
        <button
          type="button"
          onClick={() => setTimeframe('weekly')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            timeframe === 'weekly'
              ? 'bg-emerald-400 text-zinc-950 shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>{locale === 'fr' ? 'Cette Semaine' : 'This Week'}</span>
        </button>

        <button
          type="button"
          onClick={() => setTimeframe('all_time')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            timeframe === 'all_time'
              ? 'bg-emerald-400 text-zinc-950 shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{locale === 'fr' ? 'Général (All-Time)' : 'All-Time'}</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 text-center space-y-4">
          <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mx-auto" />
          <p className="text-xs text-zinc-400 font-mono">
            {locale === 'fr' ? 'Calcul des rangs...' : 'Calculating ranks...'}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Podium Top 3 */}
          {top3.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 items-end">
              {/* Rank 2 (Left) */}
              {top3[1] && (
                <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 text-center space-y-3 relative order-2 sm:order-1">
                  <div className="w-8 h-8 rounded-full bg-zinc-400/20 text-zinc-300 font-black text-sm flex items-center justify-center mx-auto border border-zinc-400/30">
                    2
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-zinc-700 mx-auto flex items-center justify-center text-zinc-200 font-bold text-lg">
                    {top3[1].displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white truncate">
                      {top3[1].displayName}
                    </h3>
                    <span className="text-[11px] font-mono text-zinc-400">
                      {locale === 'fr' ? `Niveau ${top3[1].level}` : `Level ${top3[1].level}`}
                    </span>
                  </div>
                  <div className="text-lg font-black text-zinc-200 font-mono">
                    {top3[1].xp} <span className="text-xs text-zinc-500 font-normal">XP</span>
                  </div>
                </div>
              )}

              {/* Rank 1 (Center - Elevated) */}
              {top3[0] && (
                <div className="p-7 rounded-3xl bg-gradient-to-b from-zinc-850 to-zinc-900 border-2 border-amber-500/40 text-center space-y-3 shadow-2xl relative order-1 sm:order-2 -mt-4">
                  <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 font-black text-sm flex items-center justify-center mx-auto border border-amber-500/40">
                    <Crown className="w-5 h-5 fill-current" />
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 mx-auto flex items-center justify-center text-zinc-950 font-black text-xl shadow-lg shadow-amber-500/20">
                    {top3[0].displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white truncate">
                      {top3[0].displayName}
                    </h3>
                    <span className="text-xs font-mono text-amber-400 font-bold">
                      {locale === 'fr' ? `Niveau ${top3[0].level}` : `Level ${top3[0].level}`}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-amber-400 font-mono">
                    {top3[0].xp} <span className="text-xs text-zinc-400 font-normal">XP</span>
                  </div>
                </div>
              )}

              {/* Rank 3 (Right) */}
              {top3[2] && (
                <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 text-center space-y-3 relative order-3">
                  <div className="w-8 h-8 rounded-full bg-amber-700/20 text-amber-600 font-black text-sm flex items-center justify-center mx-auto border border-amber-700/30">
                    3
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-zinc-700 mx-auto flex items-center justify-center text-zinc-200 font-bold text-lg">
                    {top3[2].displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white truncate">
                      {top3[2].displayName}
                    </h3>
                    <span className="text-[11px] font-mono text-zinc-400">
                      {locale === 'fr' ? `Niveau ${top3[2].level}` : `Level ${top3[2].level}`}
                    </span>
                  </div>
                  <div className="text-lg font-black text-zinc-200 font-mono">
                    {top3[2].xp} <span className="text-xs text-zinc-500 font-normal">XP</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Current User Highlight Banner */}
          {currentUserEntry && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-lg">
                  #{currentUserEntry.rank}
                </span>
                <span className="text-zinc-200 font-semibold">
                  {locale === 'fr' ? 'Votre position actuelle : ' : 'Your current ranking: '}
                  <strong className="text-white">{currentUserEntry.displayName}</strong>
                </span>
              </div>
              <div className="font-mono font-bold text-emerald-400">
                {currentUserEntry.xp} XP ({locale === 'fr' ? `Niveau ${currentUserEntry.level}` : `Level ${currentUserEntry.level}`})
              </div>
            </div>
          )}

          {/* Full Ranked Table */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 font-mono uppercase tracking-wider">
                  <th className="pb-3 pl-2 w-16">{locale === 'fr' ? 'Rang' : 'Rank'}</th>
                  <th className="pb-3">{locale === 'fr' ? 'Challenger' : 'Challenger'}</th>
                  <th className="pb-3 text-center">{locale === 'fr' ? 'Niveau' : 'Level'}</th>
                  <th className="pb-3 text-right pr-2">{locale === 'fr' ? 'Total XP' : 'Total XP'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {data?.entries.map((entry) => {
                  const isCurrent = entry.isCurrentUser;
                  return (
                    <tr
                      key={entry.userId}
                      className={`transition-colors ${
                        isCurrent
                          ? 'bg-emerald-500/10 hover:bg-emerald-500/15'
                          : 'hover:bg-zinc-850/50'
                      }`}
                    >
                      <td className="py-3.5 pl-2 font-mono font-bold text-zinc-400">
                        {entry.rank <= 3 ? (
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-black ${
                              entry.rank === 1
                                ? 'bg-amber-400 text-zinc-950'
                                : entry.rank === 2
                                ? 'bg-zinc-300 text-zinc-950'
                                : 'bg-amber-700 text-white'
                            }`}
                          >
                            {entry.rank}
                          </span>
                        ) : (
                          `#${entry.rank}`
                        )}
                      </td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 flex items-center justify-center text-xs font-bold">
                            {entry.displayName.charAt(0).toUpperCase()}
                          </div>
                          <span
                            className={`font-semibold ${
                              isCurrent ? 'text-emerald-400 font-bold' : 'text-zinc-200'
                            }`}
                          >
                            {entry.displayName} {isCurrent && (locale === 'fr' ? '(Vous)' : '(You)')}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 text-center font-mono text-zinc-400">
                        Lvl {entry.level}
                      </td>
                      <td className="py-3.5 text-right pr-2 font-mono font-black text-zinc-100">
                        {entry.xp} <span className="text-zinc-500 font-normal">XP</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Privacy & Fairness Footer Note */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-400">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {locale === 'fr'
                  ? "Seul votre nom d'affichage est public. Vos coordonnées, e-mails et historiques détaillés restent strictement confidentiels."
                  : 'Only your display name is public. Your contact info, emails, and detailed history remain strictly confidential.'}
              </span>
            </div>
            {onGoToSettings && (
              <button
                type="button"
                onClick={onGoToSettings}
                className="text-emerald-400 hover:underline font-bold shrink-0 cursor-pointer"
              >
                {locale === 'fr' ? 'Gérer la visibilité dans les Paramètres →' : 'Manage visibility in Settings →'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
