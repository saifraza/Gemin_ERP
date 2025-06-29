import type { PrismaClient } from '@prisma/client';

export interface HonoEnv {
  Variables: {
    db: PrismaClient;
    user?: {
      id: string;
      username: string;
      email: string;
      role: string;
      companyId: string;
    };
  };
}