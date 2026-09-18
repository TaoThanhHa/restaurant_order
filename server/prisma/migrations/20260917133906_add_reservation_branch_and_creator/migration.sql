/*
  Warnings:

  - Added the required column `branch_id` to the `reservations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `created_by_id` to the `reservations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "reservations" ADD COLUMN     "branch_id" INTEGER NOT NULL,
ADD COLUMN     "cancelled_at" TIMESTAMP(3),
ADD COLUMN     "checked_in_at" TIMESTAMP(3),
ADD COLUMN     "completed_at" TIMESTAMP(3),
ADD COLUMN     "created_by_id" INTEGER NOT NULL,
ADD COLUMN     "duration_minutes" INTEGER NOT NULL DEFAULT 90,
ADD COLUMN     "no_show_at" TIMESTAMP(3),
ADD COLUMN     "reminder_called_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "reservations_branch_id_idx" ON "reservations"("branch_id");

-- CreateIndex
CREATE INDEX "reservations_created_by_id_idx" ON "reservations"("created_by_id");

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
