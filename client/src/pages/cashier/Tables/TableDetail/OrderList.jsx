import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Button from "../../../../components/Button/Button";
import orderService from "../../../../services/order.service";

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

export default function OrderList({
    table,
    orders = [],
    selectedOrder,
    onSelectOrder,
    onCreateOrder,
    onMergeOrders,
    reload,
}) {
    const navigate = useNavigate();

    const [cancelOrder, setCancelOrder] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const totalOrders = orders.length;

    const getPendingItems = (order) => {
        return (order.orderItems || []).filter(
            (item) => item.status === "PENDING"
        ).length;
    };

    // Kiểm tra đơn có món đã phục vụ chưa
    const hasServedItem = (order) => {
        return (order.orderItems || []).some(
            (item) => item.status === "SERVED"
        );
    };

    // Chỉ cho hủy đơn khi chưa có món được phục vụ
    const canCancelOrder = (order) => {
        if (
            order.status === "COMPLETED" ||
            order.status === "CANCELLED"
        ) {
            return false;
        }

        return !hasServedItem(order);
    };

    // Mở xác nhận hủy đơn
    const requestCancelOrder = (order, event) => {
        event.stopPropagation();

        setErrorMessage("");

        if (!canCancelOrder(order)) {
            setErrorMessage(
                "Không thể hủy đơn vì đơn đã có món được phục vụ."
            );
            return;
        }

        setCancelOrder(order);
    };

    // Hủy đơn
    const handleCancelOrder = async () => {
        if (!cancelOrder) {
            return;
        }

        try {
            setLoading(true);
            setErrorMessage("");

            await orderService.closeOrder(
                cancelOrder.id,
                "CANCELLED"
            );

            setCancelOrder(null);

            if (reload) {
                await reload();
            }
        } catch (err) {
            setErrorMessage(
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                "Không thể hủy đơn."
            );

            setCancelOrder(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-full flex-col">

            {/* HEADER */}
            <div className="m-4 flex items-center justify-between">

                <div className="flex items-center gap-4">

                    <div className="mb-4">
                        <button
                            onClick={() =>
                                navigate("/branch/tables")
                            }
                            className="flex items-center gap-2 text-sm text-gray-500 transition hover:text-[var(--color-primary)]"
                        >
                            <ArrowLeft size={25} />
                        </button>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold">
                            Bàn {table.tableNumber}
                        </h2>

                        <p className="text-sm text-gray-500">
                            {totalOrders} đơn đang hoạt động
                        </p>
                    </div>

                </div>

                <div className="flex gap-2">

                    {orders.length > 1 && (
                        <Button
                            className="w-[100px]"
                            onClick={onMergeOrders}
                        >
                            Gộp đơn
                        </Button>
                    )}

                    <Button
                        className="flex w-[90px] items-center justify-center"
                        onClick={onCreateOrder}
                    >
                        + Order
                    </Button>

                </div>

            </div>

            {/* ERROR */}
            {errorMessage && (
                <div className="mx-4 mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {errorMessage}
                </div>
            )}

            {/* ORDER LIST */}
            <div className="flex-1 overflow-y-auto">

                {orders.length === 0 && (
                    <div className="p-10 text-center text-gray-400">
                        Chưa có đơn nào.
                    </div>
                )}

                {orders.map((order) => {

                    const status =
                        STATUS[order.status] || {
                            text: order.status,
                            className:
                                "bg-gray-100 text-gray-700",
                        };

                    const pendingItems =
                        getPendingItems(order);

                    const canCancel =
                        canCancelOrder(order);

                    return (
                        <div
                            key={order.id}
                            onClick={() =>
                                onSelectOrder(order)
                            }
                            className={`
                                cursor-pointer
                                border-b
                                p-4
                                transition
                                hover:bg-gray-50
                                ${
                                    selectedOrder?.id ===
                                    order.id
                                        ? "border-l-4 border-l-[#4f7d4f] bg-blue-50"
                                        : ""
                                }
                            `}
                        >

                            {/* ORDER CODE + PENDING */}
                            <div className="flex items-center justify-between">

                                <span className="font-semibold">
                                    {order.orderCode ||
                                        `Đơn #${order.id}`}
                                </span>

                                {pendingItems > 0 && (
                                    <span className="animate-pulse rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
                                        +{pendingItems}
                                    </span>
                                )}

                            </div>

                            {/* CUSTOMER */}
                            <div className="mt-2 text-sm text-gray-600">
                                👤{" "}
                                {order.customer?.name ||
                                    "Khách"}
                            </div>

                            {/* STATUS + FOOD COUNT */}
                            <div className="mt-3 flex items-center justify-between">

                                <span
                                    className={`
                                        rounded-full
                                        px-2
                                        py-1
                                        text-xs
                                        font-semibold
                                        ${status.className}
                                    `}
                                >
                                    {status.text}
                                </span>

                                <span className="text-xs text-gray-400">
                                    {
                                        (
                                            order.orderItems ||
                                            []
                                        ).filter(
                                            (item) =>
                                                item.status !==
                                                "CANCELLED"
                                        ).length
                                    }{" "}
                                    món
                                </span>

                            </div>

                            {/* ACTION */}
                            {canCancel && (
                                <div className="mt-3 flex justify-end">

                                    <button
                                        type="button"
                                        onClick={(event) =>
                                            requestCancelOrder(
                                                order,
                                                event
                                            )
                                        }
                                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50"
                                    >
                                        Hủy đơn
                                    </button>

                                </div>
                            )}

                        </div>
                    );
                })}

            </div>

            {/* CONFIRM CANCEL MODAL */}
            {cancelOrder && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
                    onClick={() =>
                        !loading &&
                        setCancelOrder(null)
                    }
                >
                    <div
                        className="w-[400px] rounded-xl bg-white p-5 shadow-xl"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <h3 className="text-lg font-bold">
                            Xác nhận hủy đơn
                        </h3>

                        <p className="mt-3 text-sm text-gray-600">
                            Bạn có chắc muốn hủy đơn{" "}
                            <span className="font-semibold text-gray-800">
                                {cancelOrder.orderCode ||
                                    `#${cancelOrder.id}`}
                            </span>
                            ?
                        </p>

                        <p className="mt-2 text-sm text-red-500">
                            Tất cả món trong đơn sẽ được
                            hủy.
                        </p>

                        <div className="mt-5 flex justify-end gap-3">

                            <Button
                                className="!bg-gray-200 !text-gray-700 hover:!bg-gray-300"
                                disabled={loading}
                                onClick={() =>
                                    setCancelOrder(null)
                                }
                            >
                                Không
                            </Button>

                            <Button
                                className="!bg-red-500"
                                disabled={loading}
                                onClick={
                                    handleCancelOrder
                                }
                            >
                                {loading
                                    ? "Đang hủy..."
                                    : "Xác nhận hủy"}
                            </Button>

                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}