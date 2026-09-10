import { useState } from "react";

import Button from "../../../../components/Button/Button";
import orderService from "../../../../services/order.service";
import PaymentModal from "./PaymentModal";
import { printKitchenOrder } from "../../../../../utils/printKitchenOrder";

const STATUS = {
    PENDING: {
        text: "Chờ xác nhận",
        className: "bg-yellow-100 text-yellow-700",
    },
    CONFIRMED: {
        text: "Đã xác nhận",
        className: "bg-blue-100 text-blue-700",
    },
    PREPARING: {
        text: "Đang chế biến",
        className: "bg-orange-100 text-orange-700",
    },
    SERVED: {
        text: "Đã phục vụ",
        className: "bg-green-100 text-green-700",
    },
    COMPLETED: {
        text: "Hoàn thành",
        className: "bg-gray-100 text-gray-700",
    },
    CANCELLED: {
        text: "Đã hủy",
        className: "bg-red-100 text-red-700",
    },
};

export default function InvoicePanel({
    order,
    reload,
    onAddFood,
    table,
}) {
    const [openPayment, setOpenPayment] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    if (!order) {
        return (
            <div className="flex h-full items-center justify-center text-gray-400">
                Chọn một đơn để xem chi tiết
            </div>
        );
    }

    const currentOrderCode = order.orderCode || "";

    const orderItems = (order.orderItems || []).filter(
        (item) => item.status !== "CANCELLED"
    );


    const oldItems = orderItems.filter(
        (item) => item.status !== "PENDING"
    );

    const newItems = orderItems.filter(
        (item) => item.status === "PENDING"
    );


    const canCancelItem = (item) => {
        return [
            "PENDING",
            "CONFIRMED",
            "PREPARING",
        ].includes(item.status);
    };

    // XÁC NHẬN MÓN MỚI

    const handleConfirm = async () => {
        try {
            setErrorMessage("");

            await orderService.confirmItems(order.id);

            await reload();
        } catch (err) {
            setErrorMessage(
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                "Không thể xác nhận món."
            );
        }
    };

    // BẮT ĐẦU CHẾ BIẾN

    const handlePreparing = async () => {
        try {
            setErrorMessage("");

            const orderRes = await orderService.getById(
                order.id
            );

            const fullOrder = orderRes.data.data;

            await orderService.closeOrder(
                order.id,
                "PREPARING"
            );

            printKitchenOrder(fullOrder);

            await reload();
        } catch (err) {
            setErrorMessage(
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                "Không thể bắt đầu chế biến."
            );
        }
    };

    // PHỤC VỤ

    const handleServed = async () => {
        try {
            setErrorMessage("");

            await orderService.closeOrder(
                order.id,
                "SERVED"
            );

            await reload();
        } catch (err) {
            setErrorMessage(
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                "Không thể cập nhật trạng thái phục vụ."
            );
        }
    };

    // HỦY MÓN

    const handleRemoveItem = async (itemId) => {
        try {
            setErrorMessage("");

            await orderService.removeItem(
                order.id,
                itemId
            );

            setConfirmAction(null);

            await reload();
        } catch (err) {
            setConfirmAction(null);

            setErrorMessage(
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                "Không thể hủy món."
            );
        }
    };

    // HỦY ĐƠN

    const handleCancelOrder = async () => {
        try {
            setErrorMessage("");

            await orderService.closeOrder(
                order.id,
                "CANCELLED"
            );

            setConfirmAction(null);

            await reload();
        } catch (err) {
            setConfirmAction(null);

            setErrorMessage(
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                "Không thể hủy đơn."
            );
        }
    };

    // XÁC NHẬN HỦY MÓN

    const requestCancelItem = (item) => {
        setErrorMessage("");

        setConfirmAction({
            type: "ITEM",
            itemId: item.id,
            itemName: item.food?.name || "món ăn",
        });
    };

    // XỬ LÝ XÁC NHẬN

    const handleConfirmAction = async () => {
        if (!confirmAction) {
            return;
        }

        if (confirmAction.type === "ITEM") {
            await handleRemoveItem(
                confirmAction.itemId
            );

            return;
        }
    };

    // THANH TOÁN

    const canPayment =
        orderItems.length > 0 &&
        orderItems.every(
            (item) => item.status === "SERVED"
        );

    // TỔNG TIỀN

    const total = orderItems.reduce(
        (sum, item) =>
            sum +
            Number(item.price) * item.quantity,
        0
    );

    const status =
        STATUS[order.status] || {
            text: order.status,
            className:
                "bg-gray-100 text-gray-700",
        };

    return (
        <div className="flex h-full flex-col pt-2">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="border-b pl-4 pr-4 pb-3">
                <div className="flex items-center justify-between">

                    <div>
                        <h2 className="text-xl font-bold">
                            Đơn{" "}
                            {currentOrderCode ||
                                "Chưa có đơn"}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            👤{" "}
                            {order.customer?.name ||
                                "Khách"}
                        </p>
                    </div>

                    <div className="grid items-center justify-between">

                        <span
                            className={`mb-2 rounded-full px-3 py-1 text-sm font-semibold ${status.className}`}
                        >
                            {status.text}
                        </span>

                        {order.status !== "COMPLETED" &&
                            order.status !== "CANCELLED" && (
                                <Button
                                    className="w-[150px]"
                                    onClick={() =>
                                        onAddFood(order)
                                    }
                                >
                                    + Thêm món
                                </Button>
                            )}

                    </div>
                </div>
            </div>

            {/* ==================================================
                ERROR
            ================================================== */}

            {errorMessage && (
                <div className="mx-4 mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {errorMessage}
                </div>
            )}

            {/* ==================================================
                DANH SÁCH MÓN
            ================================================== */}

            <div className="flex-1 overflow-y-auto p-5">

                {/* ===============================
                    MÓN ĐÃ XÁC NHẬN
                =============================== */}

                {oldItems.length > 0 && (
                    <>
                        <h3 className="mb-3 font-semibold">
                            Món đã xác nhận
                        </h3>

                        {oldItems.map((item) => (
                            <div
                                key={item.id}
                                className="mb-3 flex items-center justify-between rounded-lg border p-3"
                            >
                                <div>
                                    <div className="font-medium">
                                        {item.food?.name}
                                    </div>

                                    {item.note && (
                                        <div className="text-xs text-gray-500">
                                            Ghi chú:{" "}
                                            {item.note}
                                        </div>
                                    )}

                                    <div className="mt-1">
                                        <span
                                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                                                STATUS[
                                                    item.status
                                                ]?.className ||
                                                "bg-gray-100 text-gray-700"
                                            }`}
                                        >
                                            {STATUS[
                                                item.status
                                            ]?.text ||
                                                item.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">

                                    <div className="text-right">
                                        <div>
                                            x{item.quantity}
                                        </div>

                                        <div className="text-sm text-gray-500">
                                            {Number(
                                                item.price
                                            ).toLocaleString()}
                                            đ
                                        </div>
                                    </div>

                                    {canCancelItem(item) && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                requestCancelItem(
                                                    item
                                                )
                                            }
                                            className="rounded-lg p-2 text-red-500 hover:bg-red-100"
                                            title="Hủy món"
                                        >
                                            🗑
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </>
                )}

                {/* ===============================
                    MÓN MỚI
                =============================== */}

                {newItems.length > 0 && (
                    <>
                        <div className="my-5 border-t" />

                        <div className="mb-3 flex items-center justify-between">

                            <h3 className="font-semibold text-yellow-600">
                                Món mới
                            </h3>

                            <span className="rounded-full bg-red-500 px-2 py-1 text-xs text-white">
                                {newItems.length} món
                            </span>

                        </div>

                        {newItems.map((item) => (
                            <div
                                key={item.id}
                                className="mb-3 flex items-center justify-between rounded-lg border-2 border-yellow-300 bg-yellow-50 p-3"
                            >
                                <div>
                                    <div className="font-medium">
                                        {item.food?.name}
                                    </div>

                                    {item.note && (
                                        <div className="text-xs text-gray-500">
                                            Ghi chú:{" "}
                                            {item.note}
                                        </div>
                                    )}

                                    <div className="mt-1">
                                        <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
                                            Chờ xác nhận
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">

                                    <div className="text-right">
                                        <div>
                                            x{item.quantity}
                                        </div>

                                        <div className="text-sm text-gray-500">
                                            {Number(
                                                item.price
                                            ).toLocaleString()}
                                            đ
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            requestCancelItem(
                                                item
                                            )
                                        }
                                        className="rounded-lg p-2 text-red-500 hover:bg-red-100"
                                        title="Hủy món"
                                    >
                                        🗑
                                    </button>

                                </div>
                            </div>
                        ))}
                    </>

                )}

                {/* ===============================
                    KHÔNG CÓ MÓN
                =============================== */}

                {orderItems.length === 0 && (
                    <div className="flex h-full items-center justify-center text-sm text-gray-400">
                        Đơn hàng chưa có món.
                    </div>
                )}

            </div>

            {/* ==================================================
                FOOTER
            ================================================== */}

            <div className="border-t pl-5 pr-5">

                {/* ===============================
                    TỔNG TIỀN
                =============================== */}

                <div className="mb-2 mt-2 flex items-center justify-between">

                    <span className="font-semibold">
                        Tổng tiền
                    </span>

                    <span className="text-lg font-bold text-red-500">
                        {total.toLocaleString()}đ
                    </span>

                </div>

                {/* ===============================
                    XÁC NHẬN MÓN MỚI
                =============================== */}

                {newItems.length > 0 && (
                    <Button
                        className="mt-2 w-full !bg-red-500"
                        onClick={handleConfirm}
                    >
                        Xác nhận món mới
                    </Button>
                )}

                {/* ===============================
                    BẮT ĐẦU CHẾ BIẾN
                =============================== */}

                {newItems.length === 0 &&
                    order.status === "CONFIRMED" && (
                        <Button
                            className="mt-2 w-full !bg-green-500"
                            onClick={handlePreparing}
                        >
                            Bắt đầu chế biến
                        </Button>
                    )}

                {/* ===============================
                    PHỤC VỤ
                =============================== */}

                {order.status === "PREPARING" && (
                    <Button
                        className="mt-2 w-full !bg-blue-500"
                        onClick={handleServed}
                    >
                        Phục vụ
                    </Button>
                )}

                {/* ===============================
                    THANH TOÁN
                =============================== */}

                {canPayment && (
                    <>
                        <Button
                            className="mt-2 w-full bg-green-600 hover:bg-green-700"
                            onClick={() =>
                                setOpenPayment(true)
                            }
                        >
                            💳 Thanh toán
                        </Button>

                        <PaymentModal
                            open={openPayment}
                            onClose={() =>
                                setOpenPayment(false)
                            }
                            order={order}
                            reload={reload}
                            table={table}
                        />
                    </>
                )}

                <div className="h-3" />
            </div>

            {/* ==================================================
                MODAL XÁC NHẬN HỦY
            ================================================== */}

            {confirmAction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="w-[400px] rounded-xl bg-white p-5 shadow-xl">

                        <h3 className="text-lg font-bold">
                            Xác nhận hủy
                        </h3>

                        {confirmAction.type ===
                        "ITEM" ? (
                            <p className="mt-3 text-sm text-gray-600">
                                Bạn có chắc muốn hủy món{" "}
                                <span className="font-semibold text-gray-800">
                                    {confirmAction.itemName}
                                </span>
                                ?
                            </p>
                        ) : (
                            <p className="mt-3 text-sm text-gray-600">
                                Bạn có chắc muốn hủy đơn{" "}
                                <span className="font-semibold text-gray-800">
                                    {currentOrderCode}
                                </span>
                                ?
                                <br />
                                Tất cả món chưa phục vụ
                                sẽ được hủy.
                            </p>
                        )}

                        <div className="mt-5 flex justify-end gap-3">

                            <Button
                                className="!bg-gray-200 !text-gray-700 hover:!bg-gray-300"
                                onClick={() =>
                                    setConfirmAction(null)
                                }
                            >
                                Không
                            </Button>

                            <Button
                                className="!bg-red-500"
                                onClick={
                                    handleConfirmAction
                                }
                            >
                                Xác nhận hủy
                            </Button>

                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
