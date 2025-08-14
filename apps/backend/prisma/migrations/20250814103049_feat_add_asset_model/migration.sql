/*
  Warnings:

  - The values [FINANCIAL,DIGITAL,PERSONAL_ITEM,LEGAL_DOCUMENT] on the enum `AssetType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to alter the column `value` on the `Asset` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(19,4)`.
  - Made the column `value` on table `Asset` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."AssetType_new" AS ENUM ('REAL_ESTATE', 'VEHICLE', 'DIGITAL_ASSET', 'INVESTMENT', 'OTHER');
ALTER TABLE "public"."Asset" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "public"."Asset" ALTER COLUMN "type" TYPE "public"."AssetType_new" USING ("type"::text::"public"."AssetType_new");
ALTER TYPE "public"."AssetType" RENAME TO "AssetType_old";
ALTER TYPE "public"."AssetType_new" RENAME TO "AssetType";
DROP TYPE "public"."AssetType_old";
COMMIT;

-- AlterTable
ALTER TABLE "public"."Asset" ALTER COLUMN "type" DROP DEFAULT,
ALTER COLUMN "value" SET NOT NULL,
ALTER COLUMN "value" SET DATA TYPE DECIMAL(19,4);
