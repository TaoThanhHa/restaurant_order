-- CreateEnum
CREATE TYPE "DepositStatus" AS ENUM ('NOT_REQUIRED', 'PENDING', 'PAID', 'REFUNDED', 'FORFEITED', 'APPLIED');

-- CreateEnum
CREATE TYPE "DepositPaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- AlterTable
ALTER TABLE "reservations" ADD COLUMN     "checked_in_at" TIMESTAMP(3),
ADD COLUMN     "checked_out_at" TIMESTAMP(3),
ADD COLUMN     "deposit_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "deposit_required" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deposit_status" "DepositStatus" NOT NULL DEFAULT 'NOT_REQUIRED',
ADD COLUMN     "pre_order_amount" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "restaurants" ADD COLUMN     "base_url" TEXT;

-- CreateTable
CREATE TABLE "reservation_items" (
    "id" SERIAL NOT NULL,
    "reservation_id" INTEGER NOT NULL,
    "food_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservation_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservation_deposits" (
    "id" SERIAL NOT NULL,
    "reservation_id" INTEGER NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL,
    "payment_account_id" INTEGER,
    "payment_code" TEXT,
    "status" "DepositPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservation_deposits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reservation_items_reservation_id_idx" ON "reservation_items"("reservation_id");

-- CreateIndex
CREATE INDEX "reservation_items_food_id_idx" ON "reservation_items"("food_id");

-- CreateIndex
CREATE INDEX "reservation_deposits_reservation_id_idx" ON "reservation_deposits"("reservation_id");

-- CreateIndex
CREATE INDEX "reservation_deposits_payment_account_id_idx" ON "reservation_deposits"("payment_account_id");

-- CreateIndex
CREATE INDEX "reservations_customer_phone_idx" ON "reservations"("customer_phone");

-- AddForeignKey
ALTER TABLE "reservation_items" ADD CONSTRAINT "reservation_items_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_items" ADD CONSTRAINT "reservation_items_food_id_fkey" FOREIGN KEY ("food_id") REFERENCES "foods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_deposits" ADD CONSTRAINT "reservation_deposits_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_deposits" ADD CONSTRAINT "reservation_deposits_payment_account_id_fkey" FOREIGN KEY ("payment_account_id") REFERENCES "payment_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
