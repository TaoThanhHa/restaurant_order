import { X, Users, ShoppingBag } from "lucide-react";

export default function CustomerMergeOrderModal({
    open,
    orders = [],
    table,
    loading,
    onMerge,
    onNewOrder,
    onClose,
}) {

    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">

            <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">

                {/* HEADER */}

                <div className="flex items-center justify-between border-b px-5 py-4">

                    <div>
                        <h2 className="text-lg font-bold text-gray-800">
                            Bàn đang có đơn
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            {table?.tableNumber
                                ? `Bàn ${table.tableNumber}`
                                : "Bàn hiện tại"
                            }
                        </p>
                    </div>

                    <button
                        type="button"
                        disabled={loading}
                        onClick={onClose}
                        className="rounded-full p-2 hover:bg-gray-100"
                    >
                        <X size={20} />
                    </button>

                </div>

                {/* CONTENT */}

                <div className="max-h-[450px] overflow-y-auto p-5">

                    <p className="mb-4 text-sm text-gray-600">
                        Bạn muốn thêm món vào đơn nào?
                    </p>

                    <div className="space-y-3">

                        {orders.map(order => (

                            <div
                                key={order.id}
                                className="rounded-xl border p-4"
                            >

                                <div className="flex items-start justify-between gap-3">

                                    <div>

                                        <div className="font-bold text-gray-800">
                                            {order.orderCode}
                                        </div>

                                        <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">

                                            <span className="flex items-center gap-1">
                                                <ShoppingBag
                                                    size={14}
                                                />

                                                {order.itemCount || 0} món
                                            </span>

                                            <span className="flex items-center gap-1">
                                                <Users
                                                    size={14}
                                                />

                                                {order.customerCount || 0} khách
                                            </span>

                                        </div>

                                    </div>

                                    <div className="text-right">

                                        <div className="font-semibold text-red-500">
                                            {Number(
                                                order.totalAmount || 0
                                            ).toLocaleString()}
                                            đ
                                        </div>

                                    </div>

                                </div>

                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={() =>
                                        onMerge(order)
                                    }
                                    className="
                                        mt-3
                                        w-full
                                        rounded-lg
                                        bg-blue-600
                                        py-2
                                        text-sm
                                        font-semibold
                                        text-white
                                        hover:bg-blue-700
                                        disabled:cursor-not-allowed
                                        disabled:opacity-50
                                    "
                                >
                                    {loading
                                        ? "Đang xử lý..."
                                        : `Gộp vào ${order.orderCode}`
                                    }
                                </button>

                            </div>

                        ))}

                    </div>

                    {/* DIVIDER */}

                    <div className="my-5 flex items-center gap-3">

                        <div className="h-px flex-1 bg-gray-200" />

                        <span className="text-xs text-gray-400">
                            HOẶC
                        </span>

                        <div className="h-px flex-1 bg-gray-200" />

                    </div>

                    {/* NEW ORDER */}

                    <button
                        type="button"
                        disabled={loading}
                        onClick={onNewOrder}
                        className="
                            w-full
                            rounded-lg
                            border
                            border-orange-500
                            bg-orange-50
                            py-2.5
                            text-sm
                            font-semibold
                            text-orange-600
                            hover:bg-orange-100
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >
                        {loading
                            ? "Đang xử lý..."
                            : "Tách riêng - Tạo đơn mới"
                        }
                    </button>

                </div>

            </div>

        </div>
    );
}