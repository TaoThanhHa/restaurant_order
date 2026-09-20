/*
  Warnings:

  - You are about to drop the column `expired_at` on the `customers` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[restaurant_id,email]` on the table `customers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[restaurant_id,phone]` on the table `customers` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "customers_device_id_key";

-- DropIndex
DROP INDEX "customers_email_key";

-- DropIndex
DROP INDEX "customers_phone_key";

-- AlterTable
ALTER TABLE "customers" DROP COLUMN "expired_at",
ADD COLUMN     "expiredAt" TIMESTAMP(3),
ADD COLUMN     "restaurant_id" INTEGER;

-- CreateIndex
CREATE INDEX "customers_restaurant_id_idx" ON "customers"("restaurant_id");

-- CreateIndex
CREATE INDEX "customers_restaurant_id_device_id_idx" ON "customers"("restaurant_id", "device_id");

-- CreateIndex
CREATE UNIQUE INDEX "customers_restaurant_id_email_key" ON "customers"("restaurant_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "customers_restaurant_id_phone_key" ON "customers"("restaurant_id", "phone");

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
