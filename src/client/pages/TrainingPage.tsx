import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  ChallengeAttemptResult,
  ChallengeSummary,
  ChallengeType,
  GamificationNotification,
} from '../../types';
import { ChallengeHeader } from '../components/game/ChallengeHeader';
import { ChallengeRenderer } from '../components/game/ChallengeRenderer';
import { ResultCard } from '../components/game/ResultCard';
import { SessionSummary } from '../components/game/SessionSummary';
import {
  Play,
  Settings2,
  Sparkles,
  Brain,
  Zap,
  HelpCircle,
  RotateCcw,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface TrainingPageProps {
  onViewHistory: () => void;
  onBackToDashboard?: () => void;
  preferredType?: ChallengeType;
  initialChallengeId?: string;
  onTriggerNotification?: (notif: GamificationNotification) => void;
}

type TrainingMode = 'config' | 'playing' | 'result' | 'summary';

export const TrainingPage: React.FC<TrainingPageProps> = ({
  onViewHistory,
  onBackToDashboard,
  preferredType,
  initialChallengeId,
  onTriggerNotification,
}) => {
  const { token, refreshProgress } = useAuth();
  const { locale, t } = useLanguage();

  // Configuration state
  const [sessionLength, setSessionLength] = useState<number>(5);
  const [selectedType, setSelectedType] = useState<ChallengeType | 'all'>(preferredType || 'all');

  // Active workout state
  const [mode, setMode] = useState<TrainingMode>('config');
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState<number>(1);
  const [currentChallenge, setCurrentChallenge] = useState<ChallengeSummary | null>(null);
  const [completedResults, setCompletedResults] = useState<ChallengeAttemptResult[]>([]);
  const [currentResult, setCurrentResult] = useState<ChallengeAttemptResult | null>(null);

  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [totalSessionDurationMs, setTotalSessionDurationMs] = useState<number>(0);

  // Loading & error states
  const [isLoadingChallenge, setIsLoadingChallenge] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-launch initialChallengeId if provided (e.g. from AI Coach recommended challenge)
  React.useEffect(() => {
    if (initialChallengeId) {
      setIsLoadingChallenge(true);
      fetch(`/api/challenges/${initialChallengeId}?locale=${locale}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((challengeData) => {
          if (challengeData) {
            setCurrentChallenge(challengeData);
            setCurrentChallengeIndex(1);
            setCompletedResults([]);
            setCurrentResult(null);
            setSessionStartTime(performance.now());
            setMode('playing');
          }
        })
        .catch(console.error)
        .finally(() => setIsLoadingChallenge(false));
    }
  }, [initialChallengeId, locale]);

  // Start a new training session
  const handleStartSession = async () => {
    setMode('playing');
    setCurrentChallengeIndex(1);
    setCompletedResults([]);
    setCurrentResult(null);
    setErrorMessage(null);
    setSessionStartTime(performance.now());
    await fetchNextChallenge(1, []);
  };

  // Fetch next challenge from the backend Challenge Engine
  const fetchNextChallenge = async (index: number, pastResults: ChallengeAttemptResult[]) => {
    setIsLoadingChallenge(true);
    setErrorMessage(null);

    const excludeIds = pastResults.map((r) => r.challenge.id).join(',');
    const typeParam = selectedType !== 'all' ? `&type=${selectedType}` : '';

    try {
      const res = await fetch(
        `/api/challenges/next?locale=${locale}${typeParam}&exclude=${excludeIds}`
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to load challenge');
      }

      const challengeData: ChallengeSummary = await res.json();
      setCurrentChallenge(challengeData);
      setCurrentChallengeIndex(index);
      setMode('playing');
    } catch (err: any) {
      console.error('Error fetching challenge:', err);
      setErrorMessage(err.message || 'Unable to load challenge. Please try again.');
    } finally {
      setIsLoadingChallenge(false);
    }
  };

  // Submit attempt payload to the backend
  const handleSubmitChallenge = async (submissionPayload: unknown) => {
    if (!currentChallenge || !token || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const attemptId = `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    try {
      const res = await fetch(`/api/challenges/${currentChallenge.id}/attempt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          attemptId,
          submission: submissionPayload,
          locale,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Evaluation failed');
      }

      const data = await res.json();
      const attemptResult: ChallengeAttemptResult = data;
      setCurrentResult(attemptResult);
      setCompletedResults((prev) => [...prev, attemptResult]);

      if (data.postAttempt?.notifications && onTriggerNotification) {
        data.postAttempt.notifications.forEach((n: GamificationNotification) => {
          onTriggerNotification(n);
        });
      }

      // Refresh overall player progress in header
      await refreshProgress();

      // Transition to Result Screen
      setMode('result');
    } catch (err: any) {
      console.error('Submission error:', err);
      setErrorMessage(err.message || 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Advance to next challenge or session summary
  const handleAdvance = async () => {
    if (currentChallengeIndex >= sessionLength) {
      // Session completed!
      const totalTime = Math.round(performance.now() - sessionStartTime);
      setTotalSessionDurationMs(totalTime);
      setMode('summary');
    } else {
      // Load next challenge
      const nextIdx = currentChallengeIndex + 1;
      await fetchNextChallenge(nextIdx, completedResults);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* 1. CONFIGURATION VIEW */}
      {mode === 'config' && (
        <div className="max-w-xl mx-auto bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8 animate-fade-in">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-2">
              <Brain className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-100 tracking-tight">
              {t.training.title}
            </h1>
            <p className="text-sm text-zinc-400">
              {t.training.subtitle}
            </p>
          </div>

          {/* Session Length Selection */}
          <div className="space-y-3">
            <label className="text-xs uppercase font-bold text-zinc-400 flex items-center gap-1.5">
              <Settings2 className="w-3.5 h-3.5 text-zinc-500" />
              {t.training.sessionLength}
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[3, 5, 10].map((len) => (
                <button
                  key={len}
                  type="button"
                  onClick={() => setSessionLength(len)}
                  className={`py-3 rounded-xl border text-center transition-all cursor-pointer ${
                    sessionLength === len
                      ? 'bg-emerald-500/15 border-emerald-500/80 text-emerald-300 font-bold ring-2 ring-emerald-500/30'
                      : 'bg-zinc-850 hover:bg-zinc-800 border-zinc-700/80 text-zinc-300 font-medium'
                  }`}
                >
                  <div className="text-lg font-black">{len}</div>
                  <div className="text-[11px] text-zinc-500 uppercase tracking-wider">
                    challenges
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Challenge Type Focus Filter */}
          <div className="space-y-3">
            <label className="text-xs uppercase font-bold text-zinc-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
              {t.training.selectType}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'all', label: t.types.all, icon: Sparkles },
                { id: 'quiz', label: t.types.quiz, icon: HelpCircle },
                { id: 'pattern', label: t.types.pattern, icon: Brain },
                { id: 'memory', label: t.types.memory, icon: Sparkles },
                { id: 'reaction', label: t.types.reaction, icon: Zap },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedType(id as any)}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all text-left cursor-pointer ${
                    selectedType === id
                      ? 'bg-emerald-500/15 border-emerald-500/80 text-emerald-300 font-bold'
                      : 'bg-zinc-850 hover:bg-zinc-800 border-zinc-700/80 text-zinc-300'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-semibold truncate">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <button
            type="button"
            onClick={handleStartSession}
            className="w-full py-4 rounded-xl font-bold text-base text-zinc-950 bg-emerald-400 hover:bg-emerald-300 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>{t.training.startBtn}</span>
          </button>
        </div>
      )}

      {/* 2. PLAYING VIEW */}
      {mode === 'playing' && (
        <div className="max-w-2xl mx-auto">
          {isLoadingChallenge ? (
            <div className="p-16 text-center bg-zinc-900 border border-zinc-800 rounded-3xl space-y-4">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
              <p className="text-sm text-zinc-400">Loading next cognitive challenge...</p>
            </div>
          ) : currentChallenge ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl animate-fade-in">
              {/* Header */}
              <ChallengeHeader
                type={currentChallenge.type}
                skill={currentChallenge.skill}
                difficulty={currentChallenge.difficulty}
                title={currentChallenge.title}
                description={currentChallenge.description}
                currentIndex={currentChallengeIndex}
                totalChallenges={sessionLength}
              />

              {/* Error notification if any */}
              {errorMessage && (
                <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Specific Game UI rendered via ChallengeRenderer */}
              <ChallengeRenderer
                challenge={currentChallenge}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmitChallenge}
              />
            </div>
          ) : (
            <div className="p-8 text-center bg-zinc-900 border border-zinc-800 rounded-3xl space-y-4">
              <p className="text-sm text-zinc-400">No challenge available.</p>
              <button
                type="button"
                onClick={() => setMode('config')}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-200 text-xs font-semibold"
              >
                Return to configuration
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. RESULT VIEW (AFTER EACH CHALLENGE) */}
      {mode === 'result' && currentResult && (
        <ResultCard
          result={currentResult}
          onNext={handleAdvance}
          isLastChallengeInSession={currentChallengeIndex >= sessionLength}
        />
      )}

      {/* 4. SESSION SUMMARY VIEW */}
      {mode === 'summary' && (
        <SessionSummary
          results={completedResults}
          totalDurationMs={totalSessionDurationMs}
          onRestart={() => setMode('config')}
          onViewHistory={onViewHistory}
          onBackToDashboard={onBackToDashboard}
        />
      )}
    </div>
  );
};
