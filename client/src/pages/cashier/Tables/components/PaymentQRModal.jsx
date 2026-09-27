import { useState } from "react";
import { CheckCircle2, Copy, X } from "lucide-react";

import Button from "../../../../components/Button/Button";
import NotiModal from "../../../../components/NotiModal/NotiModal";
import paymentService from "../../../../services/payment.service";
import { printInvoice } from "../../../../../utils/printInvoice";

export default function PaymentQRModal({
    open,
    onClose,
    payment,
    printableOrder,
    reload,
}) {
    const [confirming, setConfirming] = useState(false);
    const [noti, setNoti] = useState({
        open: false,
        type: "error",
        message: "",
    });

    if (!open || !payment) return null;

    const showError = message => {
        setNoti({
            open: true,
            type: "error",
            message,
        });
    };

    const handleConfirmPayment = async () => {
        if (!payment?.id) {
            showError("Không tìm thấy thông tin thanh toán.");
            return;
        }

        try {
            setConfirming(true);

            await paymentService.confirmPayment(payment.id);

            printInvoice(printableOrder, "BANKING");

            onClose();
            await reload();
        } catch (err) {
            showError(
                err.response?.data?.message ||
                    err.message ||
                    "Không thể xác nhận thanh toán."
            );
        } finally {
            setConfirming(false);
        }
    };

    const copyPaymentContent = async () => {
        if (!payment?.paymentCode) return;

        try {
            await navigator.clipboard.writeText(payment.paymentCode);

            setNoti({
                open: true,
                type: "success",
                message: "Đã sao chép nội dung chuyển khoản.",
            });
        } catch {
            showError("Không thể sao chép nội dung chuyển khoản.");
        }
    };

    const amount = Number(
        payment.bankAmount || payment.totalAmount || 0
    );

    return (
        <>
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
                <div className="max-h-[calc(100vh-50px)] w-full max-w-3xl overflow-y-auto rounded-xl bg-white">
                    <div className="flex items-center justify-between border-b p-5">
                        <h2 className="text-xl font-bold">
                            Thanh toán chuyển khoản
                        </h2>

                        <Button type="button" onClick={onClose}>
                            <X />
                        </Button>
                    </div>

                    <div className="p-5">
                        <div className=" flex justify-between rounded-lg bg-gray-50 p-4">
                            <div className="flex justify-between gap-3">
                                <span>Mã đơn hàng</span>

                                <strong>
                                    {payment.orderCode ||
                                        `#${payment.orderId}`}
                                </strong>
                            </div>

                            <div className="mt-2 flex justify-between gap-3">
                                <span>Số tiền</span>

                                <strong className="text-xl text-red-600">
                                    {Number.isFinite(amount)
                                        ? amount.toLocaleString("vi-VN")
                                        : "0"}
                                    đ
                                </strong>
                            </div>
                        </div>

                        <div className="mt-6">
                            <div className="flex flex-col items-center">
                                <div className="rounded-xl border bg-white p-3 shadow-sm">
                                    {payment.qrUrl ? (
                                        <img
                                            src={payment.qrUrl}
                                            alt="QR thanh toán"
                                            className="h-64 w-64 object-contain"
                                        />
                                    ) : (
                                        <div className="flex h-64 w-64 items-center justify-center text-gray-500">
                                            Không có mã QR
                                        </div>
                                    )}
                                </div>

                                <p className="mt-3 text-center text-sm text-gray-500">
                                    Quét mã bằng ứng dụng ngân hàng
                                </p>

                                <div>
                                    <label className="mb-1 block text-sm font-semibold">
                                        Nội dung chuyển khoản
                                    </label>

                                    <div className="flex gap-2">
                                        <div className="flex-1 rounded-lg border bg-gray-50 px-3 py-2 font-semibold">
                                            {payment.paymentCode || "-"}
                                        </div>

                                        <Button
                                            type="button"
                                            onClick={copyPaymentContent}
                                        >
                                            <Copy size={18} />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/*<div className="space-y-4">
                                 <div>
                                    <label className="mb-1 block text-sm font-semibold">
                                        Ngân hàng
                                    </label>

                                    <div className="rounded-lg border bg-gray-50 px-3 py-2">
                                        {payment.paymentAccount?.bankCode ||
                                            "-"}
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-semibold">
                                        Số tài khoản
                                    </label>

                                    <div className="rounded-lg border bg-gray-50 px-3 py-2">
                                        {payment.paymentAccount
                                            ?.accountNumber || "-"}
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-semibold">
                                        Chủ tài khoản
                                    </label>

                                    <div className="rounded-lg border bg-gray-50 px-3 py-2">
                                        {payment.paymentAccount?.accountName ||
                                            "-"}
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-semibold">
                                        Số tiền
                                    </label>

                                    <div className="rounded-lg border bg-gray-50 px-3 py-2 font-bold text-red-600">
                                        {Number.isFinite(amount)
                                            ? amount.toLocaleString("vi-VN")
                                            : "0"}
                                        đ
                                    </div>
                                </div> 

                                
                            </div>*/}
                        </div>

                        <div className="mt-6 rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-800">
                            <strong>Lưu ý:</strong> Chỉ xác nhận thanh toán sau
                            khi kiểm tra giao dịch đã thực sự vào tài khoản nhà
                            hàng.
                        </div>
                    </div>

                    <div className="flex gap-3 border-t p-5">
                        <Button
                            type="button"
                            className="flex-1"
                            onClick={onClose}
                            disabled={confirming}
                        >
                            Đóng
                        </Button>

                        <Button
                            type="button"
                            className="flex-1"
                            onClick={handleConfirmPayment}
                            disabled={confirming}
                        >
                            <CheckCircle2
                                size={18}
                                className="mr-2 inline"
                            />

                            {confirming
                                ? "Đang xác nhận..."
                                : "Đã nhận tiền - Xác nhận"}
                        </Button>
                    </div>
                </div>
            </div>

            <NotiModal
                open={noti.open}
                type={noti.type}
                message={noti.message}
                onClose={() =>
                    setNoti(prev => ({
                        ...prev,
                        open: false,
                    }))
                }
            />
        </>
    );
}