import { useEffect, useState } from "react";
import { ScrollText, Clock, Eye, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import orderService from "../../services/order.service";

export default function OrderNotificationBell() {
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [open, setOpen] = useState(false);

    const loadOrders = async () => {
        try {
            const res = await orderService.getPendingOrders();

            const data = Array.isArray(res?.data?.data)
                ? res.data.data
                : Array.isArray(res?.data)
                    ? res.data
                    : [];

            setOrders(
                data.filter(
                    (order) => order?.status === "PENDING"
                )
            );
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

        navigate("/branch/order-history");
    };

    const formatDate = (date) => {
        const value = new Date(date);

        return date && !Number.isNaN(value.getTime())
            ? value.toLocaleString("vi-VN")
            : "--";
    };

    const pendingCount = orders.length;

    return (
        <div className="relative">
            {/* BELL */}
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100"
                title="Đơn hàng mới"
            >
                <ScrollText size={21} />

                {pendingCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white">
                        {pendingCount > 99
                            ? "99+"
                            : pendingCount}
                    </span>
                )}
            </button>

            {/* DROPDOWN */}
            {open && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setOpen(false)}
                    />

                    <div className="absolute right-0 top-12 z-50 w-[400px] overflow-hidden rounded-2xl border bg-white shadow-2xl">
                        {/* HEADER */}
                        <div className="flex items-center justify-between border-b px-4 py-3">
                            <div>
                                <h3 className="font-bold text-gray-800">
                                    Đơn hàng mới
                                </h3>

                                <p className="text-xs text-gray-500">
                                    {pendingCount > 0
                                        ? `${pendingCount} đơn đang chờ xác nhận`
                                        : "Không có đơn mới"}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="rounded-lg p-2 hover:bg-gray-100"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* CONTENT */}
                        <div className="max-h-[500px] overflow-y-auto">
                            {orders.length === 0 ? (
                                <div className="px-5 py-10 text-center text-gray-400">
                                    <ScrollText
                                        size={32}
                                        className="mx-auto mb-3"
                                    />

                                    <p>Chưa có đơn mới</p>
                                </div>
                            ) : (
                                orders.map((order) => {
                                    const table = order?.session?.table;
                                    const itemCount = order?.orderItems?.length || 0;

                                    return (
                                        <div
                                            key={order.id}
                                            className="border-b p-4 last:border-b-0 bg-gray-100 m-2"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="font-bold text-gray-800">
                                                        {order.orderCode || `Đơn #${order.id}`}
                                                    </p>

                                                    <p className="mt-1 text-sm font-semibold text-gray-700">
                                                        {table?.tableNumber
                                                            ? `Bàn ${table.tableNumber}`
                                                            : "Mang về"}
                                                    </p>
                                                </div>

                                                <span className="shrink-0 rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-600">
                                                    Chờ xác nhận
                                                </span>
                                            </div>

                                            <div className="mt-3">
                                                <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700">
                                                    {itemCount} món
                                                </span>
                                            </div>

                                            <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                                                <Clock size={13} />

                                                {formatDate(
                                                    order.createdAt
                                                )}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleViewOrder(order)}
                                                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 py-2 text-sm font-semibold text-white hover:bg-green-700"
                                            >
                                                <Eye size={16} />
                                                Xem đơn
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
