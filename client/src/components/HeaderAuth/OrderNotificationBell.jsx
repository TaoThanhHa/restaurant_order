import { useEffect, useState } from "react";
import { ScrollText, Clock, Eye, X,} from "lucide-react";
import { useNavigate } from "react-router-dom";

import orderService from "../../services/order.service";

export default function OrderNotificationBell() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [open, setOpen] = useState(false);

    const loadOrders = async () => {
        try {
            const [
                pendingRes,
                completedKitchenRes,
            ] = await Promise.all([
                orderService.getPendingOrders(),
                orderService.getCompletedKitchenOrders(),
            ]);

            const pendingData =
                Array.isArray(pendingRes?.data?.data)
                    ? pendingRes.data.data
                    : Array.isArray(pendingRes?.data)
                        ? pendingRes.data
                        : [];

            const completedKitchenData =
                Array.isArray(
                    completedKitchenRes?.data?.data
                )
                    ? completedKitchenRes.data.data
                    : Array.isArray(
                        completedKitchenRes?.data
                    )
                        ? completedKitchenRes.data
                        : [];

            const pendingOrders = pendingData
                .filter((order) => order?.status === "PENDING")
                .map((order) => ({
                    ...order,
                    notificationType: "PENDING",
                }));

            const completedKitchenOrders =
                completedKitchenData
                    .filter((order) => {
                        if (order?.status !== "PREPARING") {
                            return false;
                        }
                        return (
                            Array.isArray( order?.orderItems ) &&
                            order.orderItems.some(
                                (item) => item?.kitchenStatus === "COMPLETED" && item?.status !== "CANCELLED"
                            )
                        );
                    })
                    .map((order) => ({
                        ...order,
                        notificationType:
                            "COMPLETED_KITCHEN",
                    }));

            setOrders([
                ...pendingOrders,
                ...completedKitchenOrders,
            ]);
        } catch (error) {
            console.error(
                "LOAD ORDER NOTIFICATION ERROR:",
                error.response?.data || error
            );
        }
    };

    useEffect(() => {
        loadOrders();
        const interval = setInterval(
            loadOrders,
            3000
        );

        return () => clearInterval(interval);
    }, []);

    const handleViewOrder = (order) => {
        setOpen(false);
        const tableId = order?.session?.table?.id;

        if (tableId) {
            navigate(`/branch/tables/${tableId}`);
            return;
        }

        navigate("/branch/take-away");
    };

    const formatDate = (date) => {
        const value = new Date(date);

        return (
            date &&
            !Number.isNaN(value.getTime())
        )
            ? value.toLocaleString("vi-VN")
            : "--";
    };

    const notificationCount = orders.length;

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() =>
                    setOpen(!open)
                }
                className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100"
                title="Thông báo đơn hàng"
            >
                <ScrollText size={21} />

                {notificationCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white">
                        {notificationCount > 99
                            ? "99+"
                            : notificationCount}
                    </span>
                )}
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-40"
                        onClick={() => setOpen(false)}
                    />

                    <div className="absolute right-0 top-12 z-50 w-[400px] overflow-hidden rounded-2xl border bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b px-4 py-3">
                            <div>
                                <h3 className="font-bold text-gray-800">
                                    Thông báo đơn hàng
                                </h3>

                                <p className="text-xs text-gray-500">
                                    {notificationCount >
                                    0
                                        ? `${notificationCount} thông báo`
                                        : "Không có thông báo mới"}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>setOpen(false) }
                                className="rounded-lg p-2 hover:bg-gray-100"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="max-h-[500px] overflow-y-auto">
                            {orders.length ===
                            0 ? (
                                <div className="px-5 py-10 text-center text-gray-400">
                                    <ScrollText size={32} className="mx-auto mb-3"/>
                                    <p> Không có thông báo mới </p>
                                </div>
                            ) : (
                                orders.map(
                                    (order) => {
                                        const table =  order ?.session ?.table;
                                        const itemCount = order  ?.orderItems ?.length ||0;
                                        const isCompletedKitchen = order.notificationType === "COMPLETED_KITCHEN";
                                        const isTakeAway =  order.orderType === "TAKE_AWAY";

                                        return (
                                            <div
                                                key={order.id}
                                                className={`m-2 border-b p-4 last:border-b-0 ${
                                                    isCompletedKitchen
                                                        ? "bg-green-50"
                                                        : "bg-gray-100"
                                                }`}
                                            >

                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="font-bold text-gray-800">
                                                            {order.orderCode || `Đơn #${order.id}`}
                                                        </p>

                                                        <p className="mt-1 text-sm font-semibold text-gray-700">
                                                            {table?.tableNumber ? `Bàn ${table.tableNumber}` : "Mang về"}
                                                        </p>
                                                    </div>

                                                    {isCompletedKitchen ? (
                                                        <span className="shrink-0 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                                                            Đã làm xong
                                                        </span>
                                                    ) : (
                                                        <span className="shrink-0 rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-600">
                                                            Chờ xác nhận
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="mt-3">
                                                    <span className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-gray-700">
                                                        {itemCount}{" "}  món
                                                    </span>
                                                </div>

                                                <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                                                    <Clock size={ 13 }/>
                                                    {formatDate( order.createdAt)}
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() =>handleViewOrder(order)}
                                                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 py-2 text-sm font-semibold text-white hover:bg-green-700"
                                                >
                                                    <Eye size={16} />

                                                    {isCompletedKitchen
                                                        ? isTakeAway
                                                            ? "Hoàn thành - Xem đơn"
                                                            : "Phục vụ khách - Xem đơn"
                                                        : "Xem đơn"}
                                                </button>
                                            </div>
                                        );
                                    }
                                )
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
