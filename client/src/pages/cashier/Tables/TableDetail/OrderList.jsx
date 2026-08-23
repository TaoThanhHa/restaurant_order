import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Button from "../../../../components/Button/Button";

const STATUS = {
    PENDING: {
        text: "Chờ xác nhận",
        className: "bg-yellow-100 text-yellow-700"
    },
    CONFIRMED: {
        text: "Đã xác nhận",
        className: "bg-blue-100 text-blue-700"
    },
    PREPARING: {
        text: "Đang chế biến",
        className: "bg-orange-100 text-orange-700"
    },
    SERVED: {
        text: "Đã phục vụ",
        className: "bg-green-100 text-green-700"
    },
    COMPLETED: {
        text: "Hoàn thành",
        className: "bg-gray-100 text-gray-700"
    },
    CANCELLED: {
        text: "Đã hủy",
        className: "bg-red-100 text-red-700"
    }
};

export default function OrderList({
    table,
    orders = [],
    selectedOrder,
    onSelectOrder,
    onCreateOrder,
    onMergeOrders
}) {
    const navigate = useNavigate();
    const totalOrders = orders.length;

    const getPendingItems = (order) => {
        return order.orderItems.filter(
            item => item.status === "PENDING"
        ).length;
    };

    return (

        <div className="flex h-full flex-col">
            <div className="flex items-center justify-between m-4">
                <div className="mb-4">
                    <button
                        onClick={() => navigate("/cashier/tables")}
                        className=" flex items-center gap-2 text-sm text-gray-500 transition hover:text-[var(--color-primary)]"
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
                            className="w-[90px] flex justify-center items-center"
                            onClick={onCreateOrder}
                        >
                            + Order
                        </Button>

                    </div>

            </div>

            <div className="flex-1 overflow-y-auto">

                {orders.length === 0 && (

                    <div className="p-10 text-center text-gray-400">
                        Chưa có đơn nào.
                    </div>

                )}

                {orders.map(order => {

                    const status = STATUS[order.status];
                    const pendingItems = getPendingItems(order);

                    return (

                        <div
                            key={order.id}
                            onClick={() => onSelectOrder(order)}
                            className={`
                                cursor-pointer
                                border-b
                                p-4
                                transition
                                hover:bg-gray-50
                                ${
                                    selectedOrder?.id === order.id
                                        ? "bg-blue-50 border-l-4 border-l-[#4f7d4f]"
                                        : ""
                                }
                            `}
                        >

                            <div className="flex items-center justify-between">

                                <span className="font-semibold">
                                    {order.orderCode || `Đơn #${order.id}`}
                                </span>

                                {pendingItems > 0 && (

                                    <span className="animate-pulse rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
                                        +{pendingItems}
                                    </span>

                                )}

                            </div>

                            <div className="mt-2 text-sm text-gray-600">
                                👤 {order.customer?.name || "Khách"}
                            </div>

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
                                    {order.orderItems.length} món
                                </span>

                            </div>

                        </div>

                    );

                })}

            </div>

        </div>

    );

}