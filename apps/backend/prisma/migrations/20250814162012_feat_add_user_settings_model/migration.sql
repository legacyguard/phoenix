/*
  Warnings:

  - You are about to drop the column `heartbeatGracePeriodDays` on the `UserSettings` table. All the data in the column will be lost.
  - You are about to drop the column `lastHeartbeatAck` on the `UserSettings` table. All the data in the column will be lost.
  - You are about to drop the column `notificationPreferences` on the `UserSettings` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `UserSettings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."UserSettings" DROP COLUMN "heartbeatGracePeriodDays",
DROP COLUMN "lastHeartbeatAck",
DROP COLUMN "notificationPreferences",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isHeartbeatActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastHeartbeatAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
