import { z } from 'zod';

export const ReactionContentSchema = z.object({
  prompt: z.string().optional(),
  minDelayMs: z.number().int().positive().default(1000),
  maxDelayMs: z.number().int().positive().default(3000),
  targetAction: z.enum(['click', 'tap', 'spacebar']).default('click'),
});

export const ReactionAnswerKeySchema = z.object({
  // Reaction game does not have static correct answer, but can specify minimum valid human reaction time
  minValidReactionMs: z.number().int().default(100),
});

export const ReactionSubmissionSchema = z.object({
  reactionTimeMs: z.number().int().nonnegative(),
  durationMs: z.number().int().nonnegative(),
  isFalseStart: z.boolean().default(false),
  clientTimestamp: z.number().optional(),
});

export type ReactionContent = z.infer<typeof ReactionContentSchema>;
export type ReactionAnswerKey = z.infer<typeof ReactionAnswerKeySchema>;
export type ReactionSubmission = z.infer<typeof ReactionSubmissionSchema>;
