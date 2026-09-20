/*
  Warnings:

  - A unique constraint covering the columns `[device_id]` on the table `customers` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "device_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "customers_device_id_key" ON "customers"("device_id");
