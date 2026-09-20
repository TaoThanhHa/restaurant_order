/*
  Warnings:

  - A unique constraint covering the columns `[restaurant_id,name]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[restaurant_id,category_id,name]` on the table `foods` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `restaurant_id` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `restaurant_id` to the `foods` table without a default value. This is not possible if the table is not empty.
  - Added the required column `restaurant_id` to the `reservations` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "categories_name_key";

-- DropIndex
DROP INDEX "foods_category_id_name_key";

-- AlterTable
ALTER TABLE "categories" ADD COLUMN "restaurant_id" INTEGER;

-- AlterTable
ALTER TABLE "foods" ADD COLUMN "restaurant_id" INTEGER;

-- AlterTable
ALTER TABLE "reservations" ADD COLUMN "restaurant_id" INTEGER;

UPDATE "categories"
SET "restaurant_id" = 1
WHERE "restaurant_id" IS NULL;

UPDATE "foods"
SET "restaurant_id" = 1
WHERE "restaurant_id" IS NULL;

UPDATE "reservations"
SET "restaurant_id" = 1
WHERE "restaurant_id" IS NULL;

-- Make restaurant_id required
ALTER TABLE "categories"
ALTER COLUMN "restaurant_id" SET NOT NULL;

ALTER TABLE "foods"
ALTER COLUMN "restaurant_id" SET NOT NULL;

ALTER TABLE "reservations"
ALTER COLUMN "restaurant_id" SET NOT NULL;

-- CreateIndex
CREATE INDEX "categories_restaurant_id_idx" ON "categories"("restaurant_id");

-- CreateIndex
CREATE UNIQUE INDEX "categories_restaurant_id_name_key" ON "categories"("restaurant_id", "name");

-- CreateIndex
CREATE INDEX "foods_restaurant_id_idx" ON "foods"("restaurant_id");

-- CreateIndex
CREATE UNIQUE INDEX "foods_restaurant_id_category_id_name_key" ON "foods"("restaurant_id", "category_id", "name");

-- CreateIndex
CREATE INDEX "reservations_restaurant_id_idx" ON "reservations"("restaurant_id");

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "foods" ADD CONSTRAINT "foods_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
