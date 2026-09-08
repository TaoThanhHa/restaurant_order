import { useState } from "react";

import Button from "../../../components/Button/Button";
import NotiModal from "../../../components/NotiModal/NotiModal";
import orderService from "../../../services/order.service";
import { printInvoice } from "../../../../utils/printInvoice";

const STATUS = {
    PREPARING: {
        text: "Đang chế biến",
        className: "bg-orange-100 text-orange-700",
    },

    COMPLETED: {
        text: "Đã giao",
        className: "bg-green-100 text-green-700",
    },

    CANCELLED: {
        text: "Đã hủy",
        className: "bg-red-100 text-red-700",
    },
};

export default function InvoicePanelTakeAwayOrder({
    order,
    reload,
}) {

    const [noti, setNoti] = useState({
        open: false,
        type: "error",
        message: "",
    });

    if (!order) {
        return (
            <div className="flex h-full items-center justify-center text-gray-400">
                Chọn một đơn mang về để xem chi tiết
            </div>
        );
    }

    const orderItems =
        (order.orderItems || []).filter(
            item => item.status !== "CANCELLED"
        );

    const customer =
        order.orderMembers?.[0]?.customer;

    const total =
        orderItems.reduce(
            (sum, item) =>
                sum +
                Number(item.price) *
                Number(item.quantity),
            0
        );

    const status =
        STATUS[order.status] ||
        STATUS.PREPARING;

    const showNoti = (
        message,
        type = "error"
    ) => {

        setNoti({
            open: true,
            type,
            message,
        });

    };

    const closeNoti = () => {

        setNoti({
            open: false,
            type: "error",
            message: "",
        });

    };

    // ==========================================
    // ĐÃ GIAO CHO KHÁCH
    // ==========================================

    const handleComplete = async () => {

        try {

            await orderService.closeOrder(
                order.id,
                "COMPLETED"
            );

            await reload();

            showNoti(
                "Đã xác nhận giao đơn cho khách.",
                "success"
            );

        } catch (err) {

            console.error(
                "COMPLETE TAKE AWAY ERROR:",
                err.response?.data || err
            );

            showNoti(
                err.response?.data?.message ||
                err.message ||
                "Không thể hoàn thành đơn."
            );

        }

    };

    // ==========================================
    // IN LẠI HÓA ĐƠN
    // ==========================================

    const handlePrintInvoice = () => {

        try {

            printInvoice(
                order,
                order.payment?.paymentMethod || "CASH"
            );

        } catch (err) {

            showNoti(
                "Không thể in hóa đơn."
            );

        }

    };

    return (

        <div className="flex h-full flex-col">

            {/* HEADER */}

            <div className="border-b p-4">

                <div className="flex items-center justify-between">

                    <div>

                        <h2 className="text-xl font-bold">
                            Đơn {order.orderCode}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            👤 {customer?.name || "Khách"}
                        </p>

                        {customer?.phone && (
                            <p className="text-sm text-gray-500">
                                📞 {customer.phone}
                            </p>
                        )}

                    </div>

                    <span
                        className={`
                            rounded-full
                            px-3
                            py-1
                            text-sm
                            font-semibold
                            ${status.className}
                        `}
                    >
                        {status.text}
                    </span>

                </div>

            </div>

            {/* ITEMS */}

            <div className="flex-1 overflow-y-auto p-5">

                <h3 className="mb-3 font-semibold">
                    Món đã đặt
                </h3>

                {orderItems.map(item => (

                    <div
                        key={item.id}
                        className="mb-3 flex items-center justify-between rounded-lg border p-3"
                    >

                        <div>

                            <div className="font-medium">
                                {item.food?.name}
                            </div>

                            {item.note && (
                                <div className="mt-1 text-xs text-gray-500">
                                    Ghi chú: {item.note}
                                </div>
                            )}

                        </div>

                        <div className="text-right">

                            <div>
                                x{item.quantity}
                            </div>

                            <div className="text-sm text-gray-500">
                                {Number(
                                    item.price
                                ).toLocaleString()}đ
                            </div>

                        </div>

                    </div>

                ))}

            </div>

            {/* FOOTER */}

            <div className="border-t p-5">

                <div className="mb-3 flex items-center justify-between">

                    <span className="font-semibold">
                        Tổng tiền
                    </span>

                    <span className="text-xl font-bold text-red-500">
                        {total.toLocaleString()}đ
                    </span>

                </div>

                {/* THANH TOÁN */}

                <div className="mb-3 rounded-lg bg-green-50 p-3">

                    <div className="flex justify-between text-sm">

                        <span>
                            Thanh toán
                        </span>

                        <span className="font-semibold text-green-600">
                            Đã thanh toán
                        </span>

                    </div>

                    <div className="mt-1 text-xs text-gray-500">
                        {order.payment?.paymentMethod === "BANKING"
                            ? "Chuyển khoản"
                            : "Tiền mặt"}
                    </div>

                </div>

                {/* BUTTONS */}

                <div className="flex gap-2">

                    <Button
                        className="flex-1 !bg-gray-100 !text-gray-700"
                        onClick={handlePrintInvoice}
                    >
                        🖨 In hóa đơn
                    </Button>

                    {order.status === "PREPARING" && (

                        <Button
                            className="flex-1 !bg-green-500"
                            onClick={handleComplete}
                        >
                            ✓ Đã giao khách
                        </Button>

                    )}

                </div>

            </div>

            <NotiModal
                open={noti.open}
                type={noti.type}
                message={noti.message}
                onClose={closeNoti}
            />

        </div>

    );
}