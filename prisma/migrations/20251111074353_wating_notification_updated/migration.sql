/*
  Warnings:

  - A unique constraint covering the columns `[userId,listingId,type]` on the table `WaitingNotification` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('CANCEL_RESERVATION', 'PURCHASE_REQUEST');

-- DropIndex
DROP INDEX "public"."WaitingNotification_listingId_idx";

-- DropIndex
DROP INDEX "public"."WaitingNotification_userId_listingId_key";

-- AlterTable
ALTER TABLE "WaitingNotification" ADD COLUMN     "buyerId" TEXT,
ADD COLUMN     "transactionId" TEXT,
ADD COLUMN     "type" "NotificationType" NOT NULL DEFAULT 'CANCEL_RESERVATION';

-- CreateIndex
CREATE INDEX "WaitingNotification_userId_type_idx" ON "WaitingNotification"("userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "WaitingNotification_userId_listingId_type_key" ON "WaitingNotification"("userId", "listingId", "type");

-- AddForeignKey
ALTER TABLE "WaitingNotification" ADD CONSTRAINT "WaitingNotification_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaitingNotification" ADD CONSTRAINT "WaitingNotification_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
