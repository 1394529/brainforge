import { z } from 'zod';

export const MemoryContentSchema = z.object({
  items: z.array(z.string().min(1)).min(3).max(10),
  displayDurationMs: z.number().int().positive().default(3000),
  recallMode: z.enum(['sequence', 'pairs', 'positions', 'objects']).default('sequence'),
});

export const MemoryAnswerKeySchema = z.object({
  items: z.array(z.string().min(1)),
});

export const MemorySubmissionSchema = z.object({
  recalledSequence: z.array(z.string()),
  durationMs: z.number().int().nonnegative(),
});

export type MemoryContent = z.infer<typeof MemoryContentSchema>;
export type MemoryAnswerKey = z.infer<typeof MemoryAnswerKeySchema>;
export type MemorySubmission = z.infer<typeof MemorySubmissionSchema>;
