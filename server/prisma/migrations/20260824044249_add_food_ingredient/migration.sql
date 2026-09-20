-- CreateEnum
CREATE TYPE "IngredientUnit" AS ENUM ('KG', 'G', 'L', 'ML', 'PIECE', 'PACK');

-- CreateEnum
CREATE TYPE "InventoryTransactionType" AS ENUM ('IMPORT', 'EXPORT', 'ADJUSTMENT', 'WASTE');

-- CreateTable
CREATE TABLE "food_ingredients" (
    "id" SERIAL NOT NULL,
    "food_id" INTEGER NOT NULL,
    "ingredient_id" INTEGER NOT NULL,
    "quantity" DECIMAL(12,3) NOT NULL,

    CONSTRAINT "food_ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingredients" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "unit" "IngredientUnit" NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branch_ingredients" (
    "id" SERIAL NOT NULL,
    "branch_id" INTEGER NOT NULL,
    "ingredient_id" INTEGER NOT NULL,
    "quantity" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "min_quantity" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "branch_ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_transactions" (
    "id" SERIAL NOT NULL,
    "branch_id" INTEGER NOT NULL,
    "ingredient_id" INTEGER NOT NULL,
    "type" "InventoryTransactionType" NOT NULL,
    "quantity" DECIMAL(12,3) NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "food_ingredients_food_id_idx" ON "food_ingredients"("food_id");

-- CreateIndex
CREATE INDEX "food_ingredients_ingredient_id_idx" ON "food_ingredients"("ingredient_id");

-- CreateIndex
CREATE UNIQUE INDEX "food_ingredients_food_id_ingredient_id_key" ON "food_ingredients"("food_id", "ingredient_id");

-- CreateIndex
CREATE INDEX "branch_ingredients_branch_id_idx" ON "branch_ingredients"("branch_id");

-- CreateIndex
CREATE INDEX "branch_ingredients_ingredient_id_idx" ON "branch_ingredients"("ingredient_id");

-- CreateIndex
CREATE UNIQUE INDEX "branch_ingredients_branch_id_ingredient_id_key" ON "branch_ingredients"("branch_id", "ingredient_id");

-- CreateIndex
CREATE INDEX "inventory_transactions_branch_id_idx" ON "inventory_transactions"("branch_id");

-- CreateIndex
CREATE INDEX "inventory_transactions_ingredient_id_idx" ON "inventory_transactions"("ingredient_id");

-- CreateIndex
CREATE INDEX "inventory_transactions_created_at_idx" ON "inventory_transactions"("created_at");

-- AddForeignKey
ALTER TABLE "food_ingredients" ADD CONSTRAINT "food_ingredients_food_id_fkey" FOREIGN KEY ("food_id") REFERENCES "foods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_ingredients" ADD CONSTRAINT "food_ingredients_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch_ingredients" ADD CONSTRAINT "branch_ingredients_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch_ingredients" ADD CONSTRAINT "branch_ingredients_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
