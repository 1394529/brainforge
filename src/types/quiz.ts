import { z } from 'zod';

export const QuizOptionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
});

export const QuizContentSchema = z.object({
  question: z.string().min(1),
  options: z.array(QuizOptionSchema).min(2).max(6),
});

export const QuizAnswerKeySchema = z.object({
  correctOptionId: z.string().min(1),
});

export const QuizSubmissionSchema = z.object({
  selectedOptionId: z.string().min(1),
  durationMs: z.number().int().nonnegative(),
});

export type QuizOption = z.infer<typeof QuizOptionSchema>;
export type QuizContent = z.infer<typeof QuizContentSchema>;
export type QuizAnswerKey = z.infer<typeof QuizAnswerKeySchema>;
export type QuizSubmission = z.infer<typeof QuizSubmissionSchema>;
