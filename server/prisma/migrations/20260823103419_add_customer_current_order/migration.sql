-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "currentOrderId" INTEGER;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_currentOrderId_fkey" FOREIGN KEY ("currentOrderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
