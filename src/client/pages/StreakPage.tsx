import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { UserStreakRecord } from '../../types';
import { Flame, Trophy, Calendar, CheckCircle2, Award, Clock, ArrowLeft, Loader2 } from 'lucide-react';

interface StreakPageProps {
  onBackToProfile?: () => void;
  onGoToDaily?: () => void;
}

export const StreakPage: React.FC<StreakPageProps> = ({ onBackToProfile, onGoToDaily }) => {
  const { token } = useAuth();
  const { locale } = useLanguage();
  const [streak, setStreak] = useState<UserStreakRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStreak = async () => {
      if (!token) return;
      setIsLoading(true);
      try {
        const res = await fetch('/api/streak', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data: UserStreakRecord = await res.json();
          setStreak(data);
        }
      } catch (err) {
        console.error('Failed to load streak:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStreak();
  }, [token]);

  if (isLoading) {
    return (
      <div className="py-20 text-center space-y-4">
        <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mx-auto" />
        <p className="text-xs text-zinc-400 font-mono">
          {locale === 'fr' ? 'Chargement de votre série...' : 'Loading your streak...'}
        </p>
      </div>
    );
  }

  const currentStreak = streak?.currentStreak || 0;
  const longestStreak = streak?.longestStreak || 0;
  const completedDates = new Set(streak?.completedDates || []);

  // Build last 14 calendar days
  const recentDays: Array<{ dateStr: string; label: string; isCompleted: boolean }> = [];
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'short' });
    const dayNum = d.getDate();
    recentDays.push({
      dateStr,
      label: `${dayName} ${dayNum}`,
      isCompleted: completedDates.has(dateStr),
    });
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {onBackToProfile && (
        <button
          type="button"
          onClick={onBackToProfile}
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-emerald-400 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{locale === 'fr' ? 'Retour au Profil' : 'Back to Profile'}</span>
        </button>
      )}

      {/* Hero Streak Card */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-amber-500/30 shadow-2xl text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-xl shadow-amber-500/10">
          <Flame className="w-10 h-10 animate-bounce" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider font-mono">
            <span>{locale === 'fr' ? 'Série Quotidienne Active' : 'Active Daily Streak'}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white font-mono">
            {currentStreak} {locale === 'fr' ? (currentStreak > 1 ? 'Jours' : 'Jour') : (currentStreak > 1 ? 'Days' : 'Day')}
          </h1>
          <p className="text-sm text-zinc-400 max-w-md mx-auto">
            {currentStreak > 0
              ? (locale === 'fr'
                  ? 'Excellent rythme ! Vous stimulez votre esprit chaque jour avec régularité.'
                  : 'Great pace! You stimulate your mind every day with consistency.')
              : (locale === 'fr'
                  ? 'Commencez votre série aujourd’hui en validant le Défi du Jour !'
                  : 'Start your streak today by completing the Daily Challenge!')}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto pt-2">
          <div className="p-4 rounded-2xl bg-zinc-850/80 border border-zinc-800 text-center">
            <div className="text-[10px] font-bold text-zinc-500 uppercase font-mono mb-1">
              {locale === 'fr' ? 'Série Actuelle' : 'Current Streak'}
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono">
              🔥 {currentStreak} {locale === 'fr' ? 'j' : 'd'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-850/80 border border-zinc-800 text-center">
            <div className="text-[10px] font-bold text-zinc-500 uppercase font-mono mb-1">
              {locale === 'fr' ? 'Record Personnel' : 'Personal Record'}
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              🏆 {longestStreak} {locale === 'fr' ? 'j' : 'd'}
            </div>
          </div>
        </div>

        {onGoToDaily && (
          <div className="pt-2">
            <button
              type="button"
              onClick={onGoToDaily}
              className="px-8 py-3.5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
            >
              {locale === 'fr'
                ? 'Faire le Défi du Jour pour entretenir le Streak'
                : 'Play Daily Challenge to keep your Streak'}
            </button>
          </div>
        )}
      </div>

      {/* Calendar of the Last 14 Days */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">
              {locale === 'fr'
                ? 'Historique récent des 14 derniers jours'
                : 'Recent history of the last 14 days'}
            </h2>
          </div>
          <span className="text-xs text-zinc-400 font-mono">
            {completedDates.size} {locale === 'fr' ? 'sessions validées' : 'completed sessions'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-7 gap-3 pt-2">
          {recentDays.map((d) => (
            <div
              key={d.dateStr}
              className={`p-3.5 rounded-2xl border text-center transition-all ${
                d.isCompleted
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-zinc-850/40 border-zinc-800 text-zinc-500'
              }`}
            >
              <div className="text-[11px] font-mono capitalize">{d.label}</div>
              <div className="mt-2 flex items-center justify-center">
                {d.isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <div className="w-5 h-5 rounded-full border border-zinc-700/60" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Streak Rules & Motivation */}
      <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-3 text-xs text-zinc-400 leading-relaxed">
        <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
          {locale === 'fr' ? 'Règles du Streak BrainForge' : 'BrainForge Streak Rules'}
        </h3>
        <ul className="list-disc list-inside space-y-1.5 pl-1">
          <li>
            {locale === 'fr'
              ? 'Chaque jour calendaire où vous complétez un défi, votre série augmente de 1.'
              : 'Each calendar day you complete a challenge, your streak increases by 1.'}
          </li>
          <li>
            {locale === 'fr'
              ? 'Si vous complétez plusieurs défis dans la même journée, votre série est maintenue.'
              : 'If you complete multiple challenges in the same day, your streak is maintained.'}
          </li>
          <li>
            {locale === 'fr'
              ? "Si une journée complète s'écoule sans partie jouée, votre série courante recommence à 1."
              : 'If a full day passes without any played game, your current streak resets to 1.'}
          </li>
          <li>
            {locale === 'fr'
              ? 'Votre meilleure série historique reste enregistrée à tout jamais sur votre profil.'
              : 'Your all-time personal best streak remains saved on your profile forever.'}
          </li>
        </ul>
      </div>
    </div>
  );
};
