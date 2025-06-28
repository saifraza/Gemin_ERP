import { z } from 'zod';

export const AIRequestSchema = z.object({
  prompt: z.string(),
  context: z.any().optional(),
  model: z.enum(['gemini', 'claude', 'gpt4', 'auto']).optional(),
  temperature: z.number().optional(),
  maxTokens: z.number().optional(),
});

export type AIRequest = z.infer<typeof AIRequestSchema>;