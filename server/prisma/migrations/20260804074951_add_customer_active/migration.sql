-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "name" DROP NOT NULL;
