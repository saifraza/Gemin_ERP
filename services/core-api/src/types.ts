import pkg from '@prisma/client';
type PrismaClient = InstanceType<typeof pkg.PrismaClient>;

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