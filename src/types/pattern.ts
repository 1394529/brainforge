import { z } from 'zod';

export const PatternOptionSchema = z.union([z.number(), z.string()]);

export const PatternContentSchema = z.object({
  sequence: z.array(PatternOptionSchema).min(3),
  options: z.array(PatternOptionSchema).min(2).max(6),
  hint: z.string().optional(),
});

export const PatternAnswerKeySchema = z.object({
  correctOption: PatternOptionSchema,
});

export const PatternSubmissionSchema = z.object({
  selectedOption: PatternOptionSchema,
  durationMs: z.number().int().nonnegative(),
});

export type PatternContent = z.infer<typeof PatternContentSchema>;
export type PatternAnswerKey = z.infer<typeof PatternAnswerKeySchema>;
export type PatternSubmission = z.infer<typeof PatternSubmissionSchema>;
