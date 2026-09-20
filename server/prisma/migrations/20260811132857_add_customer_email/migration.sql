-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "emailOtp" TEXT,
ADD COLUMN     "emailOtpExpiresAt" TIMESTAMP(3);
