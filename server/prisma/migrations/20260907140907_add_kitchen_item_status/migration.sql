/*
  Warnings:

  - You are about to drop the `branch_ingredients` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `food_ingredients` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ingredients` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `inventory_transactions` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "KitchenMode" AS ENUM ('SCREEN', 'PRINT');

-- CreateEnum
CREATE TYPE "KitchenItemStatus" AS ENUM ('WAITING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "branch_ingredients" DROP CONSTRAINT "branch_ingredients_branch_id_fkey";

-- DropForeignKey
ALTER TABLE "branch_ingredients" DROP CONSTRAINT "branch_ingredients_ingredient_id_fkey";

-- DropForeignKey
ALTER TABLE "food_ingredients" DROP CONSTRAINT "food_ingredients_food_id_fkey";

-- DropForeignKey
ALTER TABLE "food_ingredients" DROP CONSTRAINT "food_ingredients_ingredient_id_fkey";

-- DropForeignKey
ALTER TABLE "inventory_transactions" DROP CONSTRAINT "inventory_transactions_branch_id_fkey";

-- DropForeignKey
ALTER TABLE "inventory_transactions" DROP CONSTRAINT "inventory_transactions_ingredient_id_fkey";

-- AlterTable
ALTER TABLE "branches" ADD COLUMN     "kitchenMode" "KitchenMode" NOT NULL DEFAULT 'PRINT';

-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "kitchen_completed_at" TIMESTAMP(3),
ADD COLUMN     "kitchen_ready_at" TIMESTAMP(3),
ADD COLUMN     "kitchen_sent_at" TIMESTAMP(3),
ADD COLUMN     "kitchen_status" "KitchenItemStatus" NOT NULL DEFAULT 'WAITING';

-- DropTable
DROP TABLE "branch_ingredients";

-- DropTable
DROP TABLE "food_ingredients";

-- DropTable
DROP TABLE "ingredients";

-- DropTable
DROP TABLE "inventory_transactions";

-- DropEnum
DROP TYPE "IngredientType";

-- DropEnum
DROP TYPE "IngredientUnit";

-- DropEnum
DROP TYPE "InventoryTransactionType";
