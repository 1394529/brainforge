import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  ChallengeAttemptRecord,
  ChallengeType,
  DailyChallengeStatus,
  UserStreakRecord,
  AchievementWithStatus,
  LeaderboardData,
  CoachResponse,
  PersonalizationProfile,
} from '../../types';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Badge } from '../components/ui/Badge';
import { CoachCard } from '../components/coach/CoachCard';
import {
  Brain,
  Zap,
  Sparkles,
  HelpCircle,
  Play,
  ArrowRight,
  Award,
  Target,
  Clock,
  History,
  Flame,
  Calendar,
  Trophy,
  CheckCircle2,
} from 'lucide-react';

interface DashboardPageProps {
  onStartTraining: (preferredType?: ChallengeType, challengeId?: string) => void;
  onViewHistory: () => void;
  onGoToDaily?: () => void;
  onGoToLeaderboard?: () => void;
  onGoToAchievements?: () => void;
  onGoToStreak?: () => void;
  onGoToStats?: () => void;
  onGoToCoach?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onStartTraining,
  onViewHistory,
  onGoToDaily,
  onGoToLeaderboard,
  onGoToAchievements,
  onGoToStreak,
  onGoToStats,
  onGoToCoach,
}) => {
  const { user, progress, token } = useAuth();
  const { t, locale } = useLanguage();
  const [recentAttempts, setRecentAttempts] = useState<ChallengeAttemptRecord[]>([]);
  const [dailyStatus, setDailyStatus] = useState<DailyChallengeStatus | null>(null);
  const [streak, setStreak] = useState<UserStreakRecord | null>(null);
  const [achievements, setAchievements] = useState<AchievementWithStatus[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardData | null>(null);

  // V1.5 AI Coach State
  const [coachInsight, setCoachInsight] = useState<CoachResponse | null>(null);
  const [coachProfile, setCoachProfile] = useState<PersonalizationProfile | null>(null);
  const [isColdStart, setIsColdStart] = useState<boolean>(false);
  const [challengesCount, setChallengesCount] = useState<number>(0);
  const [isCoachEnabled, setIsCoachEnabled] = useState<boolean>(true);
  const [isLoadingCoach, setIsLoadingCoach] = useState<boolean>(true);
  const [isRefreshingCoach, setIsRefreshingCoach] = useState<boolean>(false);

  const fetchCoachSummary = (force: boolean = false) => {
    if (!token) return;
    if (force) setIsRefreshingCoach(true);
    else setIsLoadingCoach(true);

    const endpoint = force ? '/api/coach/refresh' : `/api/coach/summary?lang=${locale}`;
    const method = force ? 'POST' : 'GET';
    const body = force ? JSON.stringify({ lang: locale }) : undefined;

    fetch(endpoint, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setCoachInsight(data.insight);
          setCoachProfile(data.profile);
          setIsColdStart(data.isColdStart);
          setChallengesCount(data.challengesCount);
          setIsCoachEnabled(data.enabled);
        }
      })
      .catch(console.error)
      .finally(() => {
        setIsLoadingCoach(false);
        setIsRefreshingCoach(false);
      });
  };

  useEffect(() => {
    if (!token) return;

    fetchCoachSummary(false);

    // 1. Fetch recent attempts
    fetch('/api/history?limit=5', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then(setRecentAttempts)
      .catch(console.error);

    // 2. Fetch daily challenge status
    fetch('/api/daily', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then(setDailyStatus)
      .catch(console.error);

    // 3. Fetch streak
    fetch('/api/streak', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then(setStreak)
      .catch(console.error);

    // 4. Fetch achievements count
    fetch('/api/achievements', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then(setAchievements)
      .catch(console.error);

    // 5. Fetch leaderboard rank
    fetch('/api/leaderboard?timeframe=weekly&limit=10', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then(setLeaderboard)
      .catch(console.error);
  }, [token]);

  const displayName = user?.displayName || 'Player';
  const level = progress?.currentLevel || 1;
  const totalXp = progress?.totalXp || 0;
  const levelProgress = progress?.levelProgress?.progressPercentage || 0;
  const xpForNext = progress?.levelProgress?.xpForNextLevel || 100;

  const currentStreak = streak?.currentStreak || 0;
  const longestStreak = streak?.longestStreak || 0;
  const unlockedAchievementsCount = achievements.filter((a) => a.isUnlocked).length;
  const totalAchievementsCount = achievements.length || 12;

  // Find last performance per type
  const getLastScore = (type: ChallengeType): string => {
    const found = recentAttempts.find((a) => a.challengeType === type);
    return found ? `${found.percentage}%` : '—';
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* 1. Daily Challenge Hero Card (V1.4 Core Loop) */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-850 to-zinc-900 border-2 border-emerald-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider font-mono">
              <Calendar className="w-3.5 h-3.5" />
              <span>{t.dashboard.dailyBadge || 'DAILY CHALLENGE'}</span>
            </div>

            {dailyStatus?.isCompleted ? (
              <>
                <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
                  <span>{t.dashboard.dailyCompleted || (locale === 'fr' ? 'Défi du jour terminé' : 'Daily challenge completed')}</span>
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 inline" />
                </h1>
                <p className="text-xs sm:text-sm text-zinc-300">
                  {t.dashboard.scoreLabel || 'Score'} : <strong className="text-emerald-400 font-mono">{dailyStatus.completedAttempt?.percentage ?? 100}%</strong>
                  {' • '}
                  {t.dashboard.xpEarned || (locale === 'fr' ? 'XP gagné' : 'XP earned')} : <strong className="text-amber-400 font-mono">+{dailyStatus.completedAttempt?.xpEarned ?? 25} XP</strong>
                </p>
                <p className="text-xs text-zinc-500">
                  {t.dashboard.streakSaved || (locale === 'fr' ? "Votre série est sauvegardée pour aujourd'hui. Revenez demain pour le prochain défi !" : "Your streak is saved for today. Come back tomorrow for the next challenge!")}
                </p>
              </>
            ) : (
              <>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {t.dashboard.dailyWaiting || (locale === 'fr' ? 'Le défi du jour vous attend.' : 'The daily challenge is waiting for you.')}
                </h1>
                <p className="text-xs sm:text-sm text-zinc-300">
                  {dailyStatus?.challenge?.title
                    ? `${dailyStatus.challenge.title} — ${t.dashboard.dailyFocusPrefix || (locale === 'fr' ? "5 minutes d'attention ciblée." : "5 minutes of focused attention.")}`
                    : (t.dashboard.dailyFocusDefault || (locale === 'fr' ? '5 minutes d’entraînement cognitif quotidien.' : '5 minutes of daily cognitive workout.'))}
                </p>
                <div className="flex items-center gap-4 text-xs font-mono text-zinc-400 pt-1">
                  <span className="flex items-center gap-1.5 text-zinc-300">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    {t.dashboard.fiveMinutes || '5 minutes'}
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <Zap className="w-3.5 h-3.5" />
                    {t.dashboard.xpPossible || (locale === 'fr' ? '+100 XP possible (dont +25 XP bonus)' : '+100 XP possible (including +25 XP bonus)')}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
            {dailyStatus?.isCompleted ? (
              <button
                type="button"
                onClick={onGoToDaily}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl font-bold text-sm text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t.dashboard.viewResult || (locale === 'fr' ? 'Voir le résultat' : 'View result')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onGoToDaily}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-base text-zinc-950 bg-emerald-400 hover:bg-emerald-300 transition-all flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/25 cursor-pointer active:scale-95"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>{t.dashboard.start || (locale === 'fr' ? 'Commencer' : 'Start')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Gamification Matrix: Level, Streak, Achievements, Leaderboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Level */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-md">
          <div className="flex items-center justify-between text-xs uppercase font-bold text-zinc-400 mb-1 font-mono">
            <span>{t.dashboard.currentLevel}</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono">
            {level}
          </div>
          <div className="mt-2.5">
            <ProgressBar progress={levelProgress} height="h-1.5" />
            <span className="text-[10px] text-zinc-500 font-mono block mt-1">
              {totalXp} XP • {levelProgress}% {locale === 'fr' ? `vers Lvl ${level + 1}` : `towards Lvl ${level + 1}`}
            </span>
          </div>
        </div>

        {/* Streak */}
        <div
          onClick={onGoToStreak}
          className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-md hover:border-amber-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs uppercase font-bold text-zinc-400 mb-1 font-mono">
            <span>{t.dashboard.activeStreak || (locale === 'fr' ? 'Série Active' : 'Active Streak')}</span>
            <Flame className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-black text-amber-400 font-mono">
            🔥 {currentStreak} <span className="text-xs font-normal text-zinc-400">{t.dashboard.days || (locale === 'fr' ? 'jours' : 'days')}</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono block mt-2 group-hover:text-zinc-300 transition-colors">
            {locale === 'fr' ? `Meilleure série : ${longestStreak} jours →` : `Best streak: ${longestStreak} days →`}
          </span>
        </div>

        {/* Achievements */}
        <div
          onClick={onGoToAchievements}
          className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-md hover:border-purple-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs uppercase font-bold text-zinc-400 mb-1 font-mono">
            <span>{t.dashboard.achievements || 'Achievements'}</span>
            <Trophy className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-black text-purple-400 font-mono">
            {unlockedAchievementsCount} <span className="text-xs font-normal text-zinc-500">/ {totalAchievementsCount}</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono block mt-2 group-hover:text-zinc-300 transition-colors">
            {t.dashboard.viewBadges || (locale === 'fr' ? 'Voir vos badges débloqués →' : 'View unlocked badges →')}
          </span>
        </div>

        {/* Leaderboard */}
        <div
          onClick={onGoToLeaderboard}
          className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-md hover:border-teal-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs uppercase font-bold text-zinc-400 mb-1 font-mono">
            <span>{t.dashboard.leaderboard || (locale === 'fr' ? 'Classement' : 'Leaderboard')}</span>
            <Target className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-black text-teal-400 font-mono">
            {leaderboard?.currentUserRank ? `#${leaderboard.currentUserRank}` : '—'}
          </div>
          <span className="text-[10px] text-zinc-500 font-mono block mt-2 group-hover:text-zinc-300 transition-colors">
            {t.dashboard.currentWeek || (locale === 'fr' ? 'Semaine en cours →' : 'Current week →')}
          </span>
        </div>
      </div>

      {/* 2.5 AI Coach Section (V1.5) */}
      <CoachCard
        insight={coachInsight}
        profile={coachProfile}
        isColdStart={isColdStart}
        challengesCount={challengesCount}
        enabled={isCoachEnabled}
        isLoading={isLoadingCoach}
        isRefreshing={isRefreshingCoach}
        onRefresh={() => fetchCoachSummary(true)}
        onStartChallenge={(challengeId) => onStartTraining(undefined, challengeId)}
        onViewCoachPage={onGoToCoach}
      />

      {/* 3. Quick Play ("Jouer maintenant") */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <span>{t.dashboard.playNow || (locale === 'fr' ? 'Jouer maintenant' : 'Play Now')}</span>
              {coachInsight?.suggestedChallenge && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold uppercase">
                  {t.coach?.badge || 'Coach IA'}
                </span>
              )}
            </h2>
            <p className="text-xs text-zinc-400">
              {t.dashboard.playNowSubtitle || (locale === 'fr' ? 'Entraînez-vous librement sur nos 4 piliers cognitifs.' : 'Practice freely across our 4 cognitive pillars.')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {coachInsight?.suggestedChallenge && (
              <button
                type="button"
                onClick={() => onStartTraining(undefined, coachInsight.suggestedChallenge!.id)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{locale === 'fr' ? 'Défi du Coach' : 'Coach Workout'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onStartTraining()}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
            >
              {t.dashboard.launchMix || (locale === 'fr' ? 'Lancer un mix complet →' : 'Launch complete workout →')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Reaction */}
          <button
            type="button"
            onClick={() => onStartTraining('reaction')}
            className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/60 hover:bg-zinc-850/80 transition-all text-left group cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Zap className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
                ~1 min
              </span>
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
              {t.types.reaction}
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              {t.dashboard.reactionDesc || (locale === 'fr' ? 'Réflexe visuel & temps de réaction' : 'Visual reflex & reaction time')}
            </p>
            <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono">
              <span className="text-zinc-500">{t.dashboard.lastScore || (locale === 'fr' ? 'Dernier score' : 'Last score')}</span>
              <span className="text-emerald-400 font-bold">{getLastScore('reaction')}</span>
            </div>
          </button>

          {/* Memory */}
          <button
            type="button"
            onClick={() => onStartTraining('memory')}
            className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/60 hover:bg-zinc-850/80 transition-all text-left group cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
                ~2 min
              </span>
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
              {t.types.memory}
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              {t.dashboard.memoryDesc || (locale === 'fr' ? 'Rétention de séquences courtes' : 'Short-term sequence retention')}
            </p>
            <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono">
              <span className="text-zinc-500">{t.dashboard.lastScore || (locale === 'fr' ? 'Dernier score' : 'Last score')}</span>
              <span className="text-amber-400 font-bold">{getLastScore('memory')}</span>
            </div>
          </button>

          {/* Pattern */}
          <button
            type="button"
            onClick={() => onStartTraining('pattern')}
            className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-purple-500/60 hover:bg-zinc-850/80 transition-all text-left group cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Brain className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
                ~2 min
              </span>
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
              {t.types.pattern}
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              {t.dashboard.patternDesc || (locale === 'fr' ? 'Suites logiques & progressions' : 'Logic sequences & progressions')}
            </p>
            <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono">
              <span className="text-zinc-500">{t.dashboard.lastScore || (locale === 'fr' ? 'Dernier score' : 'Last score')}</span>
              <span className="text-purple-400 font-bold">{getLastScore('pattern')}</span>
            </div>
          </button>

          {/* Quiz */}
          <button
            type="button"
            onClick={() => onStartTraining('quiz')}
            className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-blue-500/60 hover:bg-zinc-850/80 transition-all text-left group cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <HelpCircle className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
                ~2 min
              </span>
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
              {t.types.quiz}
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              {t.dashboard.quizDesc || (locale === 'fr' ? 'Raisonnement verbal & culture' : 'Verbal reasoning & knowledge')}
            </p>
            <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono">
              <span className="text-zinc-500">{t.dashboard.lastScore || (locale === 'fr' ? 'Dernier score' : 'Last score')}</span>
              <span className="text-blue-400 font-bold">{getLastScore('quiz')}</span>
            </div>
          </button>
        </div>
      </div>

      {/* 4. Recent Performances Section */}
      <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-zinc-100">
              {t.dashboard.recentPerformances || (locale === 'fr' ? 'Dernières performances' : 'Recent performances')}
            </h2>
          </div>
          <button
            type="button"
            onClick={onViewHistory}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>{t.dashboard.viewHistory}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentAttempts.length === 0 ? (
          <div className="py-8 text-center text-zinc-500 text-xs">
            {t.dashboard.noRecent}
          </div>
        ) : (
          <div className="space-y-2">
            {recentAttempts.map((attempt) => (
              <div
                key={attempt.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-850/60 border border-zinc-800/80 text-xs"
              >
                <div className="flex items-center gap-3">
                  {attempt.challengeType && (
                    <Badge variant="type" type={attempt.challengeType} />
                  )}
                  <span className="font-semibold text-zinc-200">
                    {attempt.challengeTitle || attempt.challengeId}
                  </span>
                  {attempt.isDailyChallenge && (
                    <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">
                      Daily
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono font-bold text-zinc-200">
                    {attempt.percentage}%
                  </span>
                  <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    +{attempt.xpEarned} XP
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
