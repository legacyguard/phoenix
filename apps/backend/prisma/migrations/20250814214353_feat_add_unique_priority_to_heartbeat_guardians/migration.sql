/*
  Warnings:

  - A unique constraint covering the columns `[userSettingsId,priority]` on the table `HeartbeatGuardianLink` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "HeartbeatGuardianLink_userSettingsId_priority_key" ON "public"."HeartbeatGuardianLink"("userSettingsId", "priority");
