import { z } from 'zod';

export const EventSchema = z.object({
  id: z.string(),
  type: z.string(),
  source: z.string(),
  timestamp: z.string(),
  data: z.any(),
  metadata: z.record(z.any()).optional(),
});

export type Event = z.infer<typeof EventSchema>;