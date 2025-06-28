-- CreateEnum
CREATE TYPE "AccessLevel" AS ENUM ('HQ', 'FACTORY', 'DIVISION');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "accessLevel" "AccessLevel" NOT NULL DEFAULT 'FACTORY';

-- AlterTable
ALTER TABLE "ActivityLog" ADD COLUMN "factoryId" TEXT;

-- CreateTable
CREATE TABLE "FactoryAccess" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "permissions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FactoryAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FactoryAccess_userId_idx" ON "FactoryAccess"("userId");

-- CreateIndex
CREATE INDEX "FactoryAccess_factoryId_idx" ON "FactoryAccess"("factoryId");

-- CreateIndex
CREATE UNIQUE INDEX "FactoryAccess_userId_factoryId_key" ON "FactoryAccess"("userId", "factoryId");

-- CreateIndex
CREATE INDEX "ActivityLog_factoryId_createdAt_idx" ON "ActivityLog"("factoryId", "createdAt");

-- AddForeignKey
ALTER TABLE "FactoryAccess" ADD CONSTRAINT "FactoryAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FactoryAccess" ADD CONSTRAINT "FactoryAccess_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "Factory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;