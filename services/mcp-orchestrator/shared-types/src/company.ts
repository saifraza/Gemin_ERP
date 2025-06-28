import { z } from 'zod';

export const CompanySchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  address: z.any(),
  phone: z.string(),
  email: z.string().email(),
  website: z.string().optional(),
  logo: z.string().optional(),
});

export type Company = z.infer<typeof CompanySchema>;