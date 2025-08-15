-- AlterTable
ALTER TABLE "public"."UserSettings" ADD COLUMN     "notificationChannels" TEXT[] DEFAULT ARRAY[]::TEXT[];
