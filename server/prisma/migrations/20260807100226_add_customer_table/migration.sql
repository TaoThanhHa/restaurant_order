-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "table_id" INTEGER;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "tables"("id") ON DELETE SET NULL ON UPDATE CASCADE;
