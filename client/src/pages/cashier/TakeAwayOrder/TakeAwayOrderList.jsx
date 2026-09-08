import { PackageCheck } from "lucide-react";
import Button from "../../../components/Button/Button";

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

export default function TakeAwayOrderList({
    orders = [],
    selectedOrder,
    onSelectOrder,
    onCreateOrder,
}) {
    return (
        <div className="flex h-full flex-col">
            {/* HEADER */}
            <div className="flex items-center justify-between border-b p-4">
                <div className="flex items-center gap-3">
                    <PackageCheck size={28} />

                    <div>
                        <h2 className="text-xl font-bold">
                            Đơn mang về
                        </h2>

                        <p className="text-sm text-gray-500">
                            {orders.length} đơn đang chế biến
                        </p>
                    </div>
                </div>

                <Button
                    className="w-[100px]"
                    onClick={onCreateOrder}
                >
                    + Order
                </Button>
            </div>



            {/* LIST */}

            <div className="flex-1 overflow-y-auto">

                {orders.length === 0 && (
                    <div className="p-10 text-center text-gray-400">
                        Không có đơn mang về đang chế biến.
                    </div>
                )}

                {orders.map(order => {

                    const status =
                        STATUS[order.status] ||
                        STATUS.PREPARING;

                    const customer =
                        order.orderMembers?.[0]?.customer;

                    const totalItems =
                        order.orderItems?.reduce(
                            (sum, item) =>
                                sum + item.quantity,
                            0
                        ) || 0;

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
                                    selectedOrder?.id === order.id
                                        ? "border-l-4 border-l-[#4f7d4f] bg-orange-50"
                                        : ""
                                }
                            `}
                        >

                            {/* ORDER CODE */}

                            <div className="flex items-center justify-between">

                                <span className="font-semibold">
                                    {order.orderCode ||
                                        `Đơn #${order.id}`}
                                </span>

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

                            </div>

                            {/* CUSTOMER */}

                            <div className="mt-2 text-sm text-gray-600">
                                👤 {customer?.name || "Khách"}
                            </div>

                            {/* PHONE */}

                            {customer?.phone && (
                                <div className="mt-1 text-sm text-gray-500">
                                    📞 {customer.phone}
                                </div>
                            )}

                            {/* ITEMS */}

                            <div className="mt-3 flex items-center justify-between">

                                <span className="text-xs text-gray-400">
                                    {totalItems} món
                                </span>

                                <span className="font-semibold text-red-500">
                                    {Number(
                                        order.totalAmount || 0
                                    ).toLocaleString()}đ
                                </span>

                            </div>

                        </div>
                    );
                })}

            </div>

        </div>
    );
}