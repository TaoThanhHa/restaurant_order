-- AlterTable
ALTER TABLE "users" ADD COLUMN     "restaurant_id" INTEGER;

-- CreateIndex
CREATE INDEX "users_restaurant_id_idx" ON "users"("restaurant_id");

-- CreateIndex
CREATE INDEX "users_branch_id_idx" ON "users"("branch_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
