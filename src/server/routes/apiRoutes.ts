import express, { Request, Response } from 'express';
import { z } from 'zod';
import { Database } from '../db';
import { AuthService } from '../auth/authService';
import { ChallengeEngine } from '../engine/ChallengeEngine';
import { GamificationEventEngine } from '../engine/GamificationEventEngine';
import { ChallengeType, Locale, RequirementType } from '../../types';
import { Logger } from '../logger';
import { EmailService } from '../services/emailService';
import { DateUtils } from '../utils/dateUtils';
import { CoachService } from '../services/coach/CoachService';

export const apiRouter = express.Router();

// Middleware: Authenticate user from Bearer token
export const authenticate = (req: Request, res: Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  const user = AuthService.verifyToken(authHeader);

  if (!user) {
    res.status(401).json({ error: 'Unauthorized: Invalid or expired session' });
    return;
  }

  (req as any).user = user;
  next();
};

// Middleware: Require Admin role
export const requireAdmin = (req: Request, res: Response, next: express.NextFunction) => {
  const user = (req as any).user;
  if (!user || user.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden: Admin role privileges required' });
    return;
  }
  next();
};

// ===================== AUTH ROUTES =====================

apiRouter.post('/auth/signup', (req: Request, res: Response) => {
  const { displayName, email, password, confirmPassword } = req.body;
  try {
    const result = AuthService.signup({
      displayName,
      email,
      password,
      confirmPassword,
    });
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Signup failed' });
  }
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const result = AuthService.login(email, password);
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message || 'Authentication failed' });
  }
});

apiRouter.post('/auth/google', (req: Request, res: Response) => {
  const { email, name } = req.body;
  try {
    const result = AuthService.googleAuth(email, name);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Google authentication failed' });
  }
});

apiRouter.post('/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const result = AuthService.requestPasswordReset(email);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Password reset request failed' });
  }
});

apiRouter.post('/auth/reset-password', (req: Request, res: Response) => {
  const { token, newPassword, confirmPassword } = req.body;
  try {
    const result = AuthService.resetPassword(token, newPassword, confirmPassword);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Password reset failed' });
  }
});

apiRouter.post('/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  AuthService.logout(authHeader);
  res.json({ message: 'Signed out successfully' });
});

apiRouter.post('/auth/change-password', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { currentPassword, newPassword, confirmPassword } = req.body;
  try {
    const result = AuthService.changePassword(user.id, currentPassword, newPassword, confirmPassword);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to update password' });
  }
});

apiRouter.get('/auth/me', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  const db = Database.getInstance();
  const progress = db.getUserProgress(user.id);
  res.json({ user, progress });
});

apiRouter.patch('/auth/profile', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { displayName } = req.body;
  if (!displayName || displayName.trim().length < 2) {
    res.status(400).json({ error: 'Display name must be at least 2 characters long' });
    return;
  }
  const db = Database.getInstance();
  const updated = db.updateProfile(user.id, { displayName });
  res.json({ user: updated });
});

// ===================== CHALLENGE ROUTES =====================

/**
 * Fetch the next challenge for the player without leaking answer_key
 */
apiRouter.get('/challenges/next', (req: Request, res: Response) => {
  const type = req.query.type as ChallengeType | undefined;
  const difficultyStr = req.query.difficulty as string | undefined;
  const difficulty = difficultyStr ? parseInt(difficultyStr, 10) : undefined;
  const locale = (req.query.locale as Locale) || 'en';
  const exclude = req.query.exclude ? String(req.query.exclude).split(',') : [];

  const db = Database.getInstance();
  const challenge = db.getNextChallenge({ type, difficulty, excludeIds: exclude });

  if (!challenge) {
    res.status(404).json({ error: 'No challenges available for the specified criteria' });
    return;
  }

  Logger.log('challenge_started', { challengeId: challenge.id, type: challenge.type });
  const clientChallenge = ChallengeEngine.toClientChallenge(challenge, locale);
  res.json(clientChallenge);
});

/**
 * Fetch a specific challenge by ID (sanitized, no answer key)
 */
apiRouter.get('/challenges/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const locale = (req.query.locale as Locale) || 'en';

  const db = Database.getInstance();
  const challenge = db.getChallenge(id);

  if (!challenge) {
    res.status(404).json({ error: `Challenge not found: ${id}` });
    return;
  }

  const clientChallenge = ChallengeEngine.toClientChallenge(challenge, locale);
  res.json(clientChallenge);
});

/**
 * Submit an attempt for a challenge.
 * Executes: Adapter validation -> ScoringEngine -> GamificationEngine -> Atomic DB write
 */
apiRouter.post('/challenges/:id/attempt', authenticate, (req: Request, res: Response) => {
  const { id } = req.params;
  const user = (req as any).user;
  const { submission, attemptId, locale = 'en' } = req.body;

  if (!submission) {
    res.status(400).json({ error: 'Submission payload is required' });
    return;
  }

  const generatedAttemptId = attemptId || `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const db = Database.getInstance();
  const challenge = db.getChallenge(id);

  if (!challenge) {
    res.status(404).json({ error: `Challenge not found: ${id}` });
    return;
  }

  try {
    const currentProgress = db.getUserProgress(user.id);
    Logger.log('challenge_submitted', { userId: user.id, challengeId: challenge.id, attemptId: generatedAttemptId });

    // 1. Process attempt through ChallengeEngine pipeline
    const { score, gamification, attemptResult } = ChallengeEngine.processAttempt({
      attemptId: generatedAttemptId,
      challenge,
      submission,
      previousTotalXp: currentProgress.totalXp,
      locale: locale as Locale,
    });

    // 2. Process complete V1.4 Gamification sequence (Idempotent atomic write, streak, achievements)
    const postResult = GamificationEventEngine.handlePostAttempt({
      userId: user.id,
      challengeId: challenge.id,
      version: challenge.version,
      score,
      baseXpEarned: gamification.xpEarned,
      isDailyChallenge: false,
      attemptId: generatedAttemptId,
      attemptResult,
      locale: locale as Locale,
    });

    Logger.log('challenge_completed', {
      userId: user.id,
      challengeId: challenge.id,
      percentage: score.percentage,
      xpEarned: postResult.attemptResult.gamification.xpEarned,
    });

    // 3. Return full result including notifications and unlocked achievements
    res.json({
      ...postResult.attemptResult,
      postAttempt: {
        userStreak: postResult.userStreak,
        unlockedAchievements: postResult.unlockedAchievements,
        notifications: postResult.notifications,
      },
    });
  } catch (error: any) {
    if (error.message?.includes('already been processed')) {
      res.status(409).json({ error: error.message });
      return;
    }
    res.status(400).json({ error: error.message || 'Invalid challenge attempt' });
  }
});

// ===================== V1.4 DAILY CHALLENGE ROUTES =====================

apiRouter.get('/daily', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  const db = Database.getInstance();
  const profile = db.getProfile(user.id);
  const timezone = profile?.timezone || 'Europe/Paris';
  const todayStr = DateUtils.getDateString(new Date(), timezone);

  const status = db.getUserDailyChallengeStatus(user.id, todayStr);
  res.json(status);
});

apiRouter.post('/daily/attempt', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  const db = Database.getInstance();
  const profile = db.getProfile(user.id);
  const timezone = profile?.timezone || 'Europe/Paris';
  const todayStr = DateUtils.getDateString(new Date(), timezone);

  const status = db.getUserDailyChallengeStatus(user.id, todayStr);
  if (status.isCompleted) {
    res.status(409).json({
      error: 'Le défi du jour a déjà été complété pour aujourd’hui.',
      completedAttempt: status.completedAttempt,
    });
    return;
  }

  if (!status.challenge) {
    res.status(404).json({ error: 'Aucun défi du jour programmé pour cette date.' });
    return;
  }

  const { submission, attemptId, locale = 'fr' } = req.body;
  if (!submission) {
    res.status(400).json({ error: 'Submission payload is required' });
    return;
  }

  const rawChallenge = db.getChallenge(status.challenge.id);
  if (!rawChallenge) {
    res.status(404).json({ error: 'Challenge not found' });
    return;
  }

  const generatedAttemptId = attemptId || `att-daily-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const currentProgress = db.getUserProgress(user.id);

  try {
    // 1. Process attempt
    const { score, gamification, attemptResult } = ChallengeEngine.processAttempt({
      attemptId: generatedAttemptId,
      challenge: rawChallenge,
      submission,
      previousTotalXp: currentProgress.totalXp,
      locale: locale as Locale,
    });

    // 2. Gamification Event Pipeline with isDailyChallenge = true
    const postResult = GamificationEventEngine.handlePostAttempt({
      userId: user.id,
      challengeId: rawChallenge.id,
      version: rawChallenge.version,
      score,
      baseXpEarned: gamification.xpEarned,
      isDailyChallenge: true,
      attemptId: generatedAttemptId,
      attemptResult,
      locale: locale as Locale,
    });

    res.json({
      ...postResult.attemptResult,
      postAttempt: {
        userStreak: postResult.userStreak,
        dailyBonusXpAwarded: postResult.dailyBonusXpAwarded,
        unlockedAchievements: postResult.unlockedAchievements,
        notifications: postResult.notifications,
      },
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Invalid daily attempt' });
  }
});

// ===================== V1.4 STREAK & ACHIEVEMENTS ROUTES =====================

apiRouter.get('/streak', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  const db = Database.getInstance();
  const streak = db.getUserStreak(user.id);
  res.json(streak);
});

apiRouter.get('/achievements', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  const db = Database.getInstance();
  const achievements = db.getAchievementsWithStatus(user.id);
  res.json(achievements);
});

// ===================== V1.4 LEADERBOARD & STATS ROUTES =====================

apiRouter.get('/leaderboard', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  const timeframe = (req.query.timeframe as 'weekly' | 'all_time') || 'weekly';
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

  const db = Database.getInstance();
  const leaderboard = db.getLeaderboard({
    timeframe,
    currentUserId: user.id,
    limit,
  });

  res.json(leaderboard);
});

apiRouter.get('/stats', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  const db = Database.getInstance();
  const stats = db.getUserStats(user.id);
  res.json(stats);
});

apiRouter.put('/profile/privacy', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { showInLeaderboard, timezone, displayName } = req.body;

  const db = Database.getInstance();
  const updated = db.updateProfile(user.id, {
    showInLeaderboard,
    timezone,
    displayName,
  });

  res.json(updated);
});

// ===================== PROGRESS & GAMIFICATION ROUTES =====================

apiRouter.get('/progress', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  const db = Database.getInstance();
  const progress = db.getUserProgress(user.id);
  res.json(progress);
});

apiRouter.get('/progress/ledger', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  const db = Database.getInstance();
  const transactions = db.getXpTransactions(user.id);
  res.json(transactions);
});

// ===================== HISTORY ROUTES =====================

apiRouter.get('/history', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  const type = req.query.type as ChallengeType | undefined;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

  const db = Database.getInstance();
  const history = db.getChallengeAttempts(user.id, { type, limit });
  res.json(history);
});

// ===================== ADMIN ROUTES (PROTECTED) =====================

apiRouter.get('/admin/challenges', authenticate, requireAdmin, (_req: Request, res: Response) => {
  const db = Database.getInstance();
  const rawChallenges = db.getAllChallengesRaw();
  // Safe summary for admin view
  const summary = rawChallenges.map((c) => ({
    id: c.id,
    type: c.type,
    skill: c.skill,
    difficulty: c.difficulty,
    status: c.status,
    titleEn: c.titleEn,
    titleFr: c.titleFr,
    version: c.version,
  }));
  res.json({ total: summary.length, challenges: summary });
});

apiRouter.get('/admin/users', authenticate, requireAdmin, (_req: Request, res: Response) => {
  const db = Database.getInstance();
  const profiles = db.getAllProfiles();
  const userStats = profiles.map((p) => {
    const progress = db.getUserProgress(p.id);
    const attempts = db.getChallengeAttempts(p.id);
    return {
      id: p.id,
      email: p.email,
      username: p.username,
      displayName: p.displayName,
      role: p.role,
      createdAt: p.createdAt,
      totalXp: progress.totalXp,
      currentLevel: progress.currentLevel,
      attemptsCount: attempts.length,
    };
  });
  res.json({ totalUsers: userStats.length, users: userStats });
});

// Admin: Daily Challenges
apiRouter.get('/admin/daily', authenticate, requireAdmin, (_req: Request, res: Response) => {
  const db = Database.getInstance();
  const dailyList = db.getAllDailyChallenges();
  res.json({ total: dailyList.length, dailyChallenges: dailyList });
});

apiRouter.post('/admin/daily', authenticate, requireAdmin, (req: Request, res: Response) => {
  const { challengeId, challengeDate, difficulty = 2, bonusXp = 25 } = req.body;
  if (!challengeId || !challengeDate) {
    res.status(400).json({ error: 'challengeId and challengeDate (YYYY-MM-DD) are required' });
    return;
  }
  const db = Database.getInstance();
  try {
    const record = db.setDailyChallenge({
      challengeId,
      challengeDate,
      difficulty,
      bonusXp,
    });
    res.json({ success: true, dailyChallenge: record });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Admin: Achievements
apiRouter.get('/admin/achievements', authenticate, requireAdmin, (_req: Request, res: Response) => {
  const db = Database.getInstance();
  const achievements = db.getAllAchievements(false);
  res.json({ total: achievements.length, achievements });
});

apiRouter.post('/admin/achievements', authenticate, requireAdmin, (req: Request, res: Response) => {
  const { code, name, nameFr, description, descriptionFr, icon, category, requirementType, requirementValue, xpBonus, isActive } = req.body;
  if (!code) {
    res.status(400).json({ error: 'Achievement code is required' });
    return;
  }
  const db = Database.getInstance();
  const record = db.createOrUpdateAchievement({
    code,
    name,
    nameFr,
    description,
    descriptionFr,
    icon,
    category,
    requirementType,
    requirementValue,
    xpBonus,
    isActive,
  });
  res.json({ success: true, achievement: record });
});

apiRouter.patch('/admin/achievements/:id/toggle', authenticate, requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { isActive } = req.body;
  const db = Database.getInstance();
  const updated = db.toggleAchievementActive(id, Boolean(isActive));
  if (!updated) {
    res.status(404).json({ error: 'Achievement not found' });
    return;
  }
  res.json({ success: true, achievement: updated });
});

// ===================== CONTACT FORM ROUTE =====================

export const ContactSchema = z.object({
  name: z.string()
    .trim()
    .min(1, { message: 'Veuillez saisir votre nom.' })
    .max(100, { message: 'Le nom ne peut dépasser 100 caractères.' }),
  email: z.string()
    .trim()
    .email({ message: 'Veuillez saisir une adresse e-mail valide.' })
    .max(150, { message: "L'adresse e-mail est trop longue." }),
  subject: z.string()
    .trim()
    .min(1, { message: 'Veuillez sélectionner un sujet.' })
    .max(100, { message: 'Le sujet ne peut dépasser 100 caractères.' }),
  message: z.string()
    .trim()
    .min(10, { message: 'Votre message doit contenir au moins 10 caractères.' })
    .max(3000, { message: 'Votre message ne peut dépasser 3000 caractères.' }),
  honeypot: z.string().optional(),
});

apiRouter.post('/contact', async (req: Request, res: Response) => {
  // 1. Rate limiting by IP
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown-ip';
  const isAllowed = EmailService.checkRateLimit(clientIp, 5, 10 * 60 * 1000);
  if (!isAllowed) {
    res.status(429).json({
      error: 'Trop de requêtes. Veuillez patienter quelques minutes avant de renvoyer un message.',
    });
    return;
  }

  // 2. Validate request body with Zod
  const validation = ContactSchema.safeParse(req.body);
  if (!validation.success) {
    const issues = validation.error.issues;
    const firstError = issues[0]?.message || 'Données de formulaire invalides.';
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of issues) {
      const field = String(issue.path[0] || 'general');
      if (!fieldErrors[field]) fieldErrors[field] = [];
      fieldErrors[field].push(issue.message);
    }
    res.status(400).json({ error: firstError, errors: fieldErrors });
    return;
  }

  try {
    const { name, email, subject, message, honeypot } = validation.data;
    const result = await EmailService.sendContactMessage({
      name,
      email,
      subject,
      message,
      honeypot,
      ip: clientIp,
    });

    res.status(200).json({
      success: true,
      message: 'Message envoyé avec succès.',
      submessage: 'Merci pour votre message. Nous avons bien reçu votre demande.',
      messageId: result.messageId,
    });
  } catch (err: any) {
    Logger.error('Failed to process contact message', { error: err.message });
    res.status(500).json({
      error: "Impossible d'envoyer votre message pour le moment. Veuillez réessayer plus tard.",
    });
  }
});

// ===================== V1.5 AI COACH & PERSONALISATION ROUTES =====================

/**
 * GET /api/coach/summary
 * Retrieves player's personalized AI Coach analysis, strengths, focus areas, and suggestions.
 */
apiRouter.get('/coach/summary', authenticate, async (req: Request, res: Response) => {
  const user = (req as any).user;
  const lang = (req.query.lang as 'fr' | 'en') || 'fr';

  try {
    const coachService = CoachService.getInstance();
    const result = await coachService.getCoachSummary(user.id, lang, false);
    res.json(result);
  } catch (err: any) {
    Logger.error('Failed to get coach summary', { userId: user.id, error: err.message });
    res.status(500).json({ error: 'Failed to retrieve AI coach analysis' });
  }
});

/**
 * GET /api/coach/recommendations
 * Retrieves lightweight recommendations and suggested challenge.
 */
apiRouter.get('/coach/recommendations', authenticate, async (req: Request, res: Response) => {
  const user = (req as any).user;
  const lang = (req.query.lang as 'fr' | 'en') || 'fr';

  try {
    const coachService = CoachService.getInstance();
    const result = await coachService.getCoachSummary(user.id, lang, false);
    res.json({
      recommendations: result.insight?.recommendations || [],
      suggestedChallenge: result.insight?.suggestedChallenge,
      profile: result.profile,
      isColdStart: result.isColdStart,
    });
  } catch (err: any) {
    Logger.error('Failed to get coach recommendations', { userId: user.id, error: err.message });
    res.status(500).json({ error: 'Failed to retrieve recommendations' });
  }
});

/**
 * POST /api/coach/refresh
 * Forces recalculation of AI Coach insights (subject to rate limiting).
 */
apiRouter.post('/coach/refresh', authenticate, async (req: Request, res: Response) => {
  const user = (req as any).user;
  const lang = (req.body?.lang as 'fr' | 'en') || (req.query.lang as 'fr' | 'en') || 'fr';

  try {
    const coachService = CoachService.getInstance();
    const result = await coachService.getCoachSummary(user.id, lang, true);
    res.json(result);
  } catch (err: any) {
    Logger.error('Failed to refresh coach insight', { userId: user.id, error: err.message });
    res.status(500).json({ error: 'Failed to refresh AI coach analysis' });
  }
});

/**
 * POST /api/coach/feedback & POST /api/coach/session-feedback
 * Generates instant encouraging feedback tip right after completing an exercise.
 */
const handleSessionFeedback = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { challengeType, difficulty, scorePercentage, durationMs, lang } = req.body;

  try {
    const coachService = CoachService.getInstance();
    const feedback = await coachService.getSessionFeedback(
      user.id,
      challengeType || 'quiz',
      Number(difficulty) || 1,
      Number(scorePercentage) || 0,
      Number(durationMs) || 0,
      lang || 'fr'
    );
    res.json({ feedback });
  } catch (err: any) {
    Logger.error('Failed to generate session feedback', { userId: user.id, error: err.message });
    res.status(500).json({ error: 'Failed to generate feedback' });
  }
};

apiRouter.post('/coach/feedback', authenticate, handleSessionFeedback);
apiRouter.post('/coach/session-feedback', authenticate, handleSessionFeedback);

/**
 * GET /api/coach/preferences
 * Returns user's coach settings (enabled on/off, language, frequency).
 */
apiRouter.get('/coach/preferences', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  const db = Database.getInstance();
  const prefs = db.getCoachPreferences(user.id);
  res.json(prefs);
});

/**
 * PATCH & POST /api/coach/preferences
 * Updates user's coach settings.
 */
const handleUpdatePreferences = (req: Request, res: Response) => {
  const user = (req as any).user;
  const db = Database.getInstance();
  const current = db.getCoachPreferences(user.id);

  const { enabled, preferredFrequency, preferredLanguage } = req.body;

  const updated = {
    ...current,
    enabled: typeof enabled === 'boolean' ? enabled : current.enabled,
    preferredFrequency: preferredFrequency || current.preferredFrequency,
    preferredLanguage: preferredLanguage || current.preferredLanguage,
    updatedAt: new Date().toISOString(),
  };

  db.saveCoachPreferences(updated);
  res.json(updated);
};

apiRouter.patch('/coach/preferences', authenticate, handleUpdatePreferences);
apiRouter.post('/coach/preferences', authenticate, handleUpdatePreferences);

