import { GoogleGenAI } from '@google/genai';
import { AIProvider } from './AIProvider';
import { MockAIProvider } from './MockAIProvider';
import {
  CoachContext,
  CoachResponse,
  CoachResponseSchema,
  SessionFeedbackContext,
} from '../../../../types';
import { Logger } from '../../../logger';

export class GeminiProvider implements AIProvider {
  public readonly name = 'GeminiProvider';
  private client: GoogleGenAI | null = null;
  private fallbackProvider = new MockAIProvider();

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        this.client = new GoogleGenAI({ apiKey });
      } catch (err: any) {
        Logger.error('Failed to initialize GoogleGenAI client', { error: err.message });
      }
    }
  }

  public async generateCoachInsight(context: CoachContext): Promise<CoachResponse> {
    if (!this.client || !process.env.GEMINI_API_KEY) {
      Logger.info('Gemini API key not configured, using deterministic fallback');
      return this.fallbackProvider.generateCoachInsight(context);
    }

    const isFr = context.language === 'fr';

    const systemInstruction = `You are BrainForge AI Coach.
Your role is to provide concise, encouraging and data-grounded coaching based only on BrainForge gameplay performance.

SAFETY & COMPLIANCE RULES:
- Do NOT diagnose health or cognitive conditions.
- Do NOT infer IQ, brain health, or intelligence.
- Do NOT make medical, psychological, or clinical claims.
- Do NOT invent user data or fabricate trends.
- If there is insufficient data or cold start, explicitly state that more challenges are needed.
- Use only the provided structured context.
- Keep text concise, positive, and focused on short (5-minute) cognitive workouts.

LANGUAGE RULE:
${
  isFr
    ? 'The target language is FRENCH. Respond 100% in French. Do not include English words in your text.'
    : 'The target language is ENGLISH. Respond 100% in English. Do not include French words in your text.'
}

OUTPUT FORMAT:
Return exclusively valid JSON matching this exact schema:
{
  "summary": string (1-2 concise sentences summarizing recent performance and consistency),
  "strengths": string[] (up to 3 observed gameplay strengths with specific category names),
  "focusAreas": string[] (up to 2 categories or skills that would benefit from practice),
  "recommendations": [
    {
      "type": "practice_skill" | "maintain_strength" | "increase_difficulty" | "return_to_activity" | "daily_goal",
      "skill": string,
      "challengeType": "quiz" | "pattern" | "memory" | "reaction",
      "difficulty": number (1 to 5),
      "reason": string,
      "priority": "high" | "medium" | "low"
    }
  ],
  "encouragement": string (1 motivational, positive sentence),
  "confidence": "high" | "medium" | "low",
  "dailyGoal": string (actionable goal for today)
}`;

    const prompt = `Here is the structured performance context of the player:
${JSON.stringify(context, null, 2)}

Provide the structured coaching response in valid JSON.`;

    try {
      // 8 second timeout for AI calls
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await this.client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          systemInstruction,
        },
      });

      clearTimeout(timeoutId);

      const text = response.text?.trim();
      if (!text) {
        throw new Error('AI_INVALID_RESPONSE: Empty response text from Gemini');
      }

      // Parse JSON
      const parsed = JSON.parse(text);

      // Validate with Zod schema
      const validation = CoachResponseSchema.safeParse(parsed);
      if (!validation.success) {
        Logger.warn('Gemini response did not conform to CoachResponseSchema, falling back', {
          issues: validation.error.issues,
        });
        return this.fallbackProvider.generateCoachInsight(context);
      }

      // Merge suggested challenge from context if available
      const result: CoachResponse = {
        ...validation.data,
        suggestedChallenge: context.recommendations[0]?.suggestedChallengeId
          ? {
              id: context.recommendations[0].suggestedChallengeId,
              title: context.recommendations[0].suggestedChallengeTitle || 'Challenge',
              type: context.recommendations[0].challengeType,
              difficulty: context.recommendations[0].difficulty,
              reason: context.recommendations[0].reason,
            }
          : validation.data.suggestedChallenge,
      };

      return result;
    } catch (error: any) {
      Logger.warn('Gemini generateCoachInsight failed, falling back to deterministic provider', {
        error: error.message,
      });
      return this.fallbackProvider.generateCoachInsight(context);
    }
  }

  public async generateSessionFeedback(context: SessionFeedbackContext): Promise<string> {
    if (!this.client || !process.env.GEMINI_API_KEY) {
      return this.fallbackProvider.generateSessionFeedback(context);
    }

    const isFr = context.language === 'fr';
    const systemInstruction = `You are BrainForge AI Coach.
Provide exactly ONE short sentence (max 20 words) of encouraging, performance-grounded feedback right after a challenge session.
No medical or intelligence claims.
Language: ${isFr ? 'FRENCH only' : 'ENGLISH only'}.`;

    const prompt = `Session data:
- Challenge Type: ${context.challengeType}
- Difficulty: ${context.difficulty}
- Score: ${context.scorePercentage}%
- User Average: ${context.userAverageScore}%
- Is Personal Best: ${context.isPersonalBest}`;

    try {
      const response = await this.client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
        },
      });

      const text = response.text?.trim();
      return text || this.fallbackProvider.generateSessionFeedback(context);
    } catch {
      return this.fallbackProvider.generateSessionFeedback(context);
    }
  }
}
