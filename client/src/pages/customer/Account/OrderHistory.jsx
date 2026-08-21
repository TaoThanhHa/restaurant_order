import {
    ArrowLeft,
    ChevronRight,
    ReceiptText,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import {
    useNavigate,
    useParams,
} from "react-router-dom";

import customerAuthService from "../../../services/customerAuth.service";

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

    PAID: {
        text: "Đã thanh toán",
        className: "bg-green-100 text-green-700",
    },

    CANCELLED: {
        text: "Đã hủy",
        className: "bg-red-100 text-red-700",
    },
};

export default function CustomerOrderHistory() {

    const navigate = useNavigate();
    const { qrCode } = useParams();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const [selectedOrder, setSelectedOrder] =
        useState(null);


    useEffect(() => {

        const loadHistory = async () => {

            try {

                const res =
                    await customerAuthService.profile();

                setProfile(res.data);

            } catch (error) {

                console.error(
                    "Không lấy được lịch sử đơn hàng:",
                    error
                );

            } finally {

                setLoading(false);

            }

        };

        loadHistory();

    }, []);


    /*
     * Lấy các order của customer.
     *
     * Lịch sử chỉ lấy những đơn đã hoàn thành
     * hoặc đã thanh toán.
     */
    const orders = useMemo(() => {

        if (!profile?.orderMembers) {
            return [];
        }

        const result =
            profile.orderMembers
                .map(member => member.order)
                .filter(Boolean)
                .filter(order =>
                    [
                        "PAID",
                        "COMPLETED",
                    ].includes(order.status)
                )
                .sort(
                    (a, b) =>
                        new Date(b.createdAt) -
                        new Date(a.createdAt)
                );

        return result;

    }, [profile]);


    if (loading) {

        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-100">

                <div className="text-gray-500">
                    Đang tải lịch sử đơn hàng...
                </div>

            </div>
        );

    }


    if (!profile) {

        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-100">

                <div className="text-gray-500">
                    Không thể tải lịch sử đơn hàng.
                </div>

            </div>
        );

    }


    return (

        <div className="min-h-screen bg-slate-100 pb-8">

            {/* HEADER */}

            <div className="sticky top-0 z-10 bg-[#4f7d4f] px-5 py-4 shadow-sm">

                <div className="flex items-center gap-3">

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                `/customer/account/${qrCode}`
                            )
                        }
                        className="rounded-full text-white hover:bg-gray-100"
                    >

                        <ArrowLeft size={30} />

                    </button>

                    <div>

                        <h1 className="text-xl font-bold text-white">
                            Lịch sử đơn hàng
                        </h1>

                        <p className="text-sm text-white">
                            Các đơn hàng của bạn
                        </p>

                    </div>

                </div>

            </div>


            {/* CONTENT */}

            <div className="p-5">

                {orders.length === 0 ? (

                    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">

                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm">

                            <ReceiptText
                                size={36}
                                className="text-gray-400"
                            />

                        </div>

                        <h2 className="mt-5 text-lg font-semibold">
                            Chưa có đơn hàng
                        </h2>

                        <p className="mt-2 text-sm text-gray-500">
                            Các đơn hàng đã thanh toán sẽ xuất hiện ở đây.
                        </p>

                    </div>

                ) : (

                    <div className="space-y-4">

                        {orders.map(order => (

                            <OrderHistoryCard
                                key={order.id}
                                order={order}
                                onClick={() =>
                                    setSelectedOrder(order)
                                }
                            />

                        ))}

                    </div>

                )}

            </div>


            {/* DETAIL */}

            {selectedOrder && (

                <OrderDetailModal
                    order={selectedOrder}
                    onClose={() =>
                        setSelectedOrder(null)
                    }
                />

            )}

        </div>

    );
}


/* =====================================================
   ORDER CARD
===================================================== */

function OrderHistoryCard({
    order,
    onClick,
}) {

    const status =
        STATUS[order.status] || {
            text: order.status,
            className: "bg-gray-100 text-gray-700",
        };


    const total =
        order.orderItems?.reduce(
            (sum, item) =>
                sum +
                Number(item.price) *
                item.quantity,
            0
        ) || 0;


    const itemCount =
        order.orderItems?.reduce(
            (sum, item) =>
                sum + item.quantity,
            0
        ) || 0;


    return (

        <button
            type="button"
            onClick={onClick}
            className="w-full rounded-3xl bg-white p-5 text-left shadow-sm transition hover:shadow-md"
        >

            <div className="flex items-start justify-between gap-4">

                <div className="flex min-w-0 items-center gap-3">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eef6ee] text-[#4f7d4f]">

                        <ReceiptText size={21} />

                    </div>

                    <div className="min-w-0">

                        <div className="font-bold">
                            Đơn #{order.orderCode || order.id}
                        </div>

                        <div className="mt-1 text-xs text-gray-500">
                            {formatDate(order.createdAt)}
                        </div>

                    </div>

                </div>


                <ChevronRight
                    size={20}
                    className="mt-2 shrink-0 text-gray-400"
                />

            </div>


            <div className="mt-4 flex items-center justify-between border-t pt-4">

                <div>

                    <div className="text-sm text-gray-500">
                        {itemCount} món
                    </div>

                    <span
                        className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                    >
                        {status.text}
                    </span>

                </div>


                <div className="text-right">

                    <div className="text-xs text-gray-500">
                        Tổng tiền
                    </div>

                    <div className="mt-1 text-lg font-bold text-red-500">
                        {total.toLocaleString()}đ
                    </div>

                </div>

            </div>

        </button>

    );
}


/* =====================================================
   DETAIL MODAL
===================================================== */

function OrderDetailModal({
    order,
    onClose,
}) {

    const total =
        order.orderItems?.reduce(
            (sum, item) =>
                sum +
                Number(item.price) *
                item.quantity,
            0
        ) || 0;


    const status =
        STATUS[order.status] || {
            text: order.status,
            className: "bg-gray-100 text-gray-700",
        };


    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

            <div className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white">

                {/* HEADER */}

                <div className="border-b p-5">

                    <div className="flex items-center justify-between">

                        <div>

                            <h2 className="text-xl font-bold">
                                Đơn #{order.orderCode || order.id}
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                {formatDate(order.createdAt)}
                            </p>

                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-full px-3 py-2 text-gray-500 hover:bg-gray-100"
                        >
                            ✕
                        </button>

                    </div>

                    <span
                        className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                    >
                        {status.text}
                    </span>

                </div>


                {/* ITEMS */}

                <div className="flex-1 overflow-y-auto p-5">

                    <h3 className="mb-3 font-semibold">
                        Các món đã gọi
                    </h3>

                    <div className="space-y-3">

                        {order.orderItems?.map(item => (

                            <div
                                key={item.id}
                                className="rounded-2xl border p-4"
                            >

                                <div className="flex justify-between gap-4">

                                    <div>

                                        <div className="font-semibold">
                                            {item.food?.name}
                                        </div>

                                        {item.note && (

                                            <div className="mt-1 text-xs text-gray-500">
                                                Ghi chú: {item.note}
                                            </div>

                                        )}

                                    </div>

                                    <div className="text-right">

                                        <div className="font-medium">
                                            x{item.quantity}
                                        </div>

                                        <div className="mt-1 text-sm text-gray-500">
                                            {Number(item.price).toLocaleString()}đ
                                        </div>

                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>

                </div>


                {/* TOTAL */}

                <div className="border-t p-5">

                    <div className="flex items-center justify-between">

                        <span className="font-semibold">
                            Tổng tiền
                        </span>

                        <span className="text-xl font-bold text-red-500">
                            {total.toLocaleString()}đ
                        </span>

                    </div>

                </div>

            </div>

        </div>

    );
}


function formatDate(date) {

    if (!date) {
        return "";
    }

    return new Date(date).toLocaleString(
        "vi-VN",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }
    );

}