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

export default function CurrentOrderCard({ order }) {

    if (!order) {
        return (
            <div className="rounded-3xl bg-white p-6 shadow">
                <h3 className="text-xl font-bold">
                    Đơn hiện tại
                </h3>

                <p className="mt-3 text-gray-400">
                    Bạn chưa có đơn đang đặt.
                </p>
            </div>
        );
    }

    const status =
        STATUS[order.status] || {
            text: order.status,
            className: "bg-gray-100 text-gray-700",
        };

    const total = order.orderItems?.reduce(
        (sum, item) =>
            sum +
            Number(item.price) *
            Number(item.quantity),
        0
    ) || 0;

    return (
        <div className="rounded-3xl bg-white p-6 shadow">
            {/* HEADER */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold">
                        Đơn hiện tại
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                        #{order.orderCode || order.id}
                    </p>
                </div>

                <span  className={`rounded-full px-3 py-1 text-sm font-semibold ${status.className}`}>
                    {status.text}
                </span>
            </div>

            {/* ITEMS */}
            <div className="mt-5 space-y-3">

                {order.orderItems?.map((item) => (

                    <div
                        key={item.id}
                        className="flex items-center justify-between rounded-xl border p-3"
                    >

                        <div className="min-w-0">
                            <div className="font-medium">
                                {item.food?.name}
                            </div>

                            {item.note && (
                                <div className="mt-1 text-xs text-gray-500">
                                    Ghi chú: {item.note}
                                </div>
                            )}
                        </div>

                        <div className="ml-4 text-right">
                            <div className="font-medium">
                                x{item.quantity}
                            </div>

                            <div className="text-sm text-gray-500">
                                {Number(item.price).toLocaleString()}đ
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* TOTAL */}
            <div className="mt-5 flex items-center justify-between border-t pt-4">
                <span className="font-semibold">
                    Tổng tiền
                </span>

                <span className="text-xl font-bold text-red-500">
                    {total.toLocaleString()}đ
                </span>
            </div>
        </div>
    );
}