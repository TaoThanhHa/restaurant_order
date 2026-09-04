/*
  Warnings:

  - You are about to drop the column `created_by` on the `orders` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_created_by_fkey";

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "created_by",
ADD COLUMN     "created_by_customer_id" INTEGER,
ADD COLUMN     "created_by_user_id" INTEGER;

-- CreateIndex
CREATE INDEX "orders_created_by_user_id_idx" ON "orders"("created_by_user_id");

-- CreateIndex
CREATE INDEX "orders_created_by_customer_id_idx" ON "orders"("created_by_customer_id");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_created_by_customer_id_fkey" FOREIGN KEY ("created_by_customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
