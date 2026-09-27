/*
  Warnings:

  - You are about to drop the column `paid_at` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `branch_id` on the `reservations` table. All the data in the column will be lost.
  - You are about to drop the column `cancelled_at` on the `reservations` table. All the data in the column will be lost.
  - You are about to drop the column `checked_in_at` on the `reservations` table. All the data in the column will be lost.
  - You are about to drop the column `completed_at` on the `reservations` table. All the data in the column will be lost.
  - You are about to drop the column `created_by_id` on the `reservations` table. All the data in the column will be lost.
  - You are about to drop the column `duration_minutes` on the `reservations` table. All the data in the column will be lost.
  - You are about to drop the column `no_show_at` on the `reservations` table. All the data in the column will be lost.
  - You are about to drop the column `reminder_called_at` on the `reservations` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "reservations" DROP CONSTRAINT "reservations_branch_id_fkey";

-- DropForeignKey
ALTER TABLE "reservations" DROP CONSTRAINT "reservations_created_by_id_fkey";

-- DropIndex
DROP INDEX "reservations_branch_id_idx";

-- DropIndex
DROP INDEX "reservations_created_by_id_idx";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "paid_at",
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "payment_account_id" INTEGER;

-- AlterTable
ALTER TABLE "reservations" DROP COLUMN "branch_id",
DROP COLUMN "cancelled_at",
DROP COLUMN "checked_in_at",
DROP COLUMN "completed_at",
DROP COLUMN "created_by_id",
DROP COLUMN "duration_minutes",
DROP COLUMN "no_show_at",
DROP COLUMN "reminder_called_at";

-- CreateTable
CREATE TABLE "payment_accounts" (
    "id" SERIAL NOT NULL,
    "restaurant_id" INTEGER NOT NULL,
    "bank_code" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "account_name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branch_payment_accounts" (
    "branch_id" INTEGER NOT NULL,
    "payment_account_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "branch_payment_accounts_pkey" PRIMARY KEY ("branch_id","payment_account_id")
);

-- CreateIndex
CREATE INDEX "payment_accounts_restaurant_id_idx" ON "payment_accounts"("restaurant_id");

-- CreateIndex
CREATE INDEX "payment_accounts_restaurant_id_is_active_idx" ON "payment_accounts"("restaurant_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "payment_accounts_restaurant_id_account_number_key" ON "payment_accounts"("restaurant_id", "account_number");

-- CreateIndex
CREATE INDEX "branch_payment_accounts_payment_account_id_idx" ON "branch_payment_accounts"("payment_account_id");

-- CreateIndex
CREATE INDEX "payments_payment_account_id_idx" ON "payments"("payment_account_id");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_payment_account_id_fkey" FOREIGN KEY ("payment_account_id") REFERENCES "payment_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_accounts" ADD CONSTRAINT "payment_accounts_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch_payment_accounts" ADD CONSTRAINT "branch_payment_accounts_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch_payment_accounts" ADD CONSTRAINT "branch_payment_accounts_payment_account_id_fkey" FOREIGN KEY ("payment_account_id") REFERENCES "payment_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
