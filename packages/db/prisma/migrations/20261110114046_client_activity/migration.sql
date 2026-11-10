-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "adminEmailedAt" TIMESTAMP(3),
ADD COLUMN     "clientEmailedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ClientActivity" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "actor" TEXT NOT NULL DEFAULT 'client',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClientActivity_clientId_createdAt_idx" ON "ClientActivity"("clientId", "createdAt");

-- CreateIndex
CREATE INDEX "ClientActivity_createdAt_idx" ON "ClientActivity"("createdAt");

-- AddForeignKey
ALTER TABLE "ClientActivity" ADD CONSTRAINT "ClientActivity_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
