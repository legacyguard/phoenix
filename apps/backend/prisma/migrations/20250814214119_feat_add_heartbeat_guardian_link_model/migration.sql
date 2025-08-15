-- CreateTable
CREATE TABLE "public"."HeartbeatGuardianLink" (
    "id" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userSettingsId" TEXT NOT NULL,
    "guardianId" TEXT NOT NULL,

    CONSTRAINT "HeartbeatGuardianLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HeartbeatGuardianLink_userSettingsId_idx" ON "public"."HeartbeatGuardianLink"("userSettingsId");

-- CreateIndex
CREATE INDEX "HeartbeatGuardianLink_guardianId_idx" ON "public"."HeartbeatGuardianLink"("guardianId");

-- CreateIndex
CREATE UNIQUE INDEX "HeartbeatGuardianLink_userSettingsId_guardianId_key" ON "public"."HeartbeatGuardianLink"("userSettingsId", "guardianId");

-- AddForeignKey
ALTER TABLE "public"."HeartbeatGuardianLink" ADD CONSTRAINT "HeartbeatGuardianLink_userSettingsId_fkey" FOREIGN KEY ("userSettingsId") REFERENCES "public"."UserSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HeartbeatGuardianLink" ADD CONSTRAINT "HeartbeatGuardianLink_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "public"."Guardian"("id") ON DELETE CASCADE ON UPDATE CASCADE;
