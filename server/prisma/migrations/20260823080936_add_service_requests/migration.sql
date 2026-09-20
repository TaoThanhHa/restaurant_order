-- CreateEnum
CREATE TYPE "ServiceRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "service_requests" (
    "id" SERIAL NOT NULL,
    "branch_id" INTEGER NOT NULL,
    "table_id" INTEGER NOT NULL,
    "customer_id" INTEGER,
    "message" TEXT NOT NULL,
    "status" "ServiceRequestStatus" NOT NULL DEFAULT 'PENDING',
    "handled_by_id" INTEGER,
    "handled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "service_requests_branch_id_idx" ON "service_requests"("branch_id");

-- CreateIndex
CREATE INDEX "service_requests_table_id_idx" ON "service_requests"("table_id");

-- CreateIndex
CREATE INDEX "service_requests_status_idx" ON "service_requests"("status");

-- CreateIndex
CREATE INDEX "service_requests_created_at_idx" ON "service_requests"("created_at");

-- AddForeignKey
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "tables"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_handled_by_id_fkey" FOREIGN KEY ("handled_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
