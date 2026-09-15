-- CreateEnum
CREATE TYPE "RestaurantMode" AS ENUM ('SINGLE', 'MULTI');

-- AlterTable
ALTER TABLE "restaurants" ADD COLUMN     "mode" "RestaurantMode" NOT NULL DEFAULT 'SINGLE';
