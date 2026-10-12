-- CreateTable
CREATE TABLE "sepay_transactions" (
    "id" SERIAL NOT NULL,
    "sepay_id" BIGINT NOT NULL,
    "payment_id" INTEGER,
    "account_number" TEXT NOT NULL,
    "transfer_type" TEXT NOT NULL,
    "transfer_amount" DECIMAL(12,2) NOT NULL,
    "payment_code" TEXT,
    "content" TEXT,
    "reference_code" TEXT,
    "processing_status" TEXT NOT NULL DEFAULT 'RECEIVED',
    "raw_payload" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sepay_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sepay_transactions_sepay_id_key" ON "sepay_transactions"("sepay_id");

-- CreateIndex
CREATE INDEX "sepay_transactions_payment_id_idx" ON "sepay_transactions"("payment_id");

-- CreateIndex
CREATE INDEX "sepay_transactions_payment_code_idx" ON "sepay_transactions"("payment_code");

-- AddForeignKey
ALTER TABLE "sepay_transactions" ADD CONSTRAINT "sepay_transactions_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
