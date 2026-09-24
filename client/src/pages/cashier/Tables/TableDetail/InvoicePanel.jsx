import { useState } from "react";
import { Trash } from "lucide-react";
import Button from "../../../../components/Button/Button";
import orderService from "../../../../services/order.service";
import PaymentModal from "./PaymentModal";
import { printKitchenOrder} from "../../../../../utils/printKitchenOrder";

const STATUS = {
    PENDING: {
        text: "Chờ gửi bếp",
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

const mergeItems = items => {
    const map = new Map();

    for (const item of items) {
        const foodId = Number(item.food?.id || item.foodId);
        const note = item.note?.trim() || "";
        const price = Number(item.price || 0);
        const status = item.status || "";

        const key = [
            foodId,
            status,
            note,
            price,
        ].join("|");

        const existing = map.get(key);

        if (existing) {
            existing.quantity += Number(item.quantity || 0);
            existing.itemIds.push(item.id);
        } else {
            map.set(key, {
                ...item,
                foodId,
                quantity: Number(item.quantity || 0),
                itemIds: [item.id],
            });
        }
    }

    return Array.from(map.values());
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
    const [loading, setLoading] = useState(false);

    if (!order?.id) {
        return (
            <div className="flex h-full items-center justify-center text-gray-400">
                Chọn một đơn để xem chi tiết
            </div>
        );
    }

    const orderId = Number(order.id);
    const currentOrderCode = order.orderCode || `#${orderId}`;

    const orderItems = Array.isArray(order.orderItems)
        ? order.orderItems.filter(item => item.status !== "CANCELLED")
        : [];

    const oldItems = mergeItems(
        orderItems.filter(item => item.status !== "PENDING")
    );

    const newItems = mergeItems(
        orderItems.filter(item => item.status === "PENDING")
    );

    const canCancelItem = item =>
        ["PENDING", "PREPARING"].includes(item.status);

    const canPayment =
        orderItems.length > 0 &&
        orderItems.every(item => item.status === "SERVED");

    const total = orderItems.reduce(
        (sum, item) =>
            sum +
            Number(item.price || 0) *
            Number(item.quantity || 0),
        0
    );

    const newItemQuantity = newItems.reduce(
        (sum, item) => sum + Number(item.quantity || 0), 0
    );

    const status =
        STATUS[order.status] || {
            text: order.status,
            className: "bg-gray-100 text-gray-700",
        };

    const handlePreparing = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            await orderService.confirmItems(orderId);

            const orderRes = await orderService.getById(orderId);
            const fullOrder = orderRes?.data || orderRes;

            printKitchenOrder(fullOrder);

            if (reload) {
                await reload();
            }
        } catch (err) {
            setErrorMessage(
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                "Không thể gửi đơn vào bếp."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleServed = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            await orderService.closeOrder(
                orderId,
                "SERVED"
            );

            if (reload) {
                await reload();
            }
        } catch (err) {
            setErrorMessage(
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                "Không thể cập nhật trạng thái phục vụ."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveItem = async itemId => {
        try {
            setLoading(true);
            setErrorMessage("");

            await orderService.removeItem(orderId, itemId);

            setConfirmAction(null);

            if (reload) {
                await reload(false);
            }
        } catch (err) {
            setConfirmAction(null);

            setErrorMessage(
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                "Không thể hủy món."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            await orderService.closeOrder(orderId, "CANCELLED");

            setConfirmAction(null);

            if (reload) {
                await reload();
            }
        } catch (err) {
            setConfirmAction(null);

            setErrorMessage(
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                "Không thể hủy đơn."
            );
        } finally {
            setLoading(false);
        }
    };

    const requestCancelItem = item => {
        setErrorMessage("");

        setConfirmAction({
            type: "ITEM",
            itemId: item.id,
            itemName: item.food?.name || "món ăn",
            quantity: item.quantity,
        });
    };

    {/* const requestCancelOrder = () => {
        setErrorMessage("");

        setConfirmAction({
            type: "ORDER",
            orderId,
            orderCode: currentOrderCode,
        });
    }; */}

    const handleConfirmAction = async () => {
        if (!confirmAction) return;

        if (confirmAction.type === "ITEM") {
            await handleRemoveItem( confirmAction.itemId );
            return;
        }

        if (confirmAction.type === "ORDER") {
            await handleCancelOrder();
        }
    };

    const renderItem = (item, isNew = false) => {
        const foodId = Number(
            item.food?.id || item.foodId
        );

        const itemKey = [
            orderId,
            foodId,
            item.status,
            item.note?.trim() || "",
            Number(item.price || 0),
        ].join("-");

        return (
            <div
                key={itemKey}
                className={`mb-3 flex items-center justify-between rounded-lg border p-3 ${
                    isNew ? "border-2 border-yellow-300 bg-yellow-50" : ""
                }`}
            >
                <div>
                    <div className="font-medium">
                        {item.food?.name || "Món ăn"}
                    </div>

                    {item.note && (
                        <div className="text-xs text-gray-500">
                            Ghi chú: {item.note}
                        </div>
                    )}

                    {/* <div className="mt-1">
                        <span
                            className={'rounded-full px-2 py-1 text-xs font-medium ${ STATUS[item.status]?.className ||  "bg-gray-100 text-gray-700" }'}
                        >
                            {isNew
                                ? "Chờ gửi bếp"
                                : STATUS[item.status]?.text ||
                                  item.status}
                        </span>
                    </div> */}
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center text-right">
                        <div>
                            x {item.quantity}
                        </div>

                        <div className="text-sm text-blue-500 ml-4">
                            {Number( item.price || 0 ).toLocaleString()} đ
                        </div>
                    </div>

                    {canCancelItem(item) && (
                        <button
                            type="button"
                            disabled={loading}
                            onClick={() => requestCancelItem(item)}
                            className="rounded-lg p-2 text-red-500 hover:bg-red-100 disabled:opacity-50"
                            title="Hủy món"
                        >
                            <Trash size={16} />
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-full flex-col pt-2">
            <div className="border-b pb-3 pl-4 pr-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold">
                            Đơn {currentOrderCode}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            {order.customer?.name || "Khách"}
                        </p>

                    </div>

                    <div className="grid items-center justify-between">
                        <span className={`mb-2 rounded-full px-3 py-1 text-sm font-semibold ${status.className}`}>
                            {status.text}
                        </span>

                        {order.status !== "COMPLETED" &&
                            order.status !== "CANCELLED" && (
                                <Button className="w-[150px]" disabled={loading} onClick={() => onAddFood(order) } >
                                    + Thêm món
                                </Button>
                            )}
                    </div>
                </div>
            </div>

            {errorMessage && (
                <div className="mx-4 mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {errorMessage}
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-5">
                {oldItems.length > 0 && (
                    <>
                        <h3 className="mb-3 font-semibold">
                            Món đã gửi bếp
                        </h3>

                        {oldItems.map(item =>
                            renderItem(item, false)
                        )}
                    </>
                )}

                {newItems.length > 0 && (
                    <>
                        <div className="my-5 border-t" />

                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="font-semibold text-yellow-600">
                                Món mới
                            </h3>

                            <span className="rounded-full bg-red-500 px-2 py-1 text-xs text-white">
                                {newItemQuantity} món
                            </span>
                        </div>

                        {newItems.map(item =>
                            renderItem(item, true)
                        )}
                    </>
                )}

                {orderItems.length === 0 && (
                    <div className="flex h-full items-center justify-center text-sm text-gray-400">
                        Đơn hàng chưa có món.
                    </div>
                )}
            </div>

            <div className="border-t pl-5 pr-5">
                <div className="mb-2 mt-2 flex items-center justify-between">
                    <span className="font-semibold">
                        Tổng tiền
                    </span>

                    <span className="text-lg font-bold text-red-500">
                        {total.toLocaleString()}đ
                    </span>
                </div>

                {order.status === "PENDING" &&
                    newItems.length > 0 && (
                        <Button
                            disabled={loading}
                            className="mt-2 w-full !bg-green-500"
                            onClick={handlePreparing}
                        >
                            {loading ? "Đang gửi..." : "Gửi bếp"}
                        </Button>
                    )}

                {order.status === "PREPARING" && (
                    <Button
                        disabled={loading}
                        className="mt-2 w-full !bg-blue-500"
                        onClick={handleServed}
                    >
                        {loading ? "Đang cập nhật..." : "Phục vụ"}
                    </Button>
                )}

                {canPayment && (
                    <>
                        <Button
                            disabled={loading}
                            className="mt-2 w-full bg-green-600 hover:bg-green-700"
                            onClick={() => setOpenPayment(true)}
                        >
                            Thanh toán
                        </Button>

                        <PaymentModal
                            open={openPayment}
                            onClose={() => setOpenPayment(false)}
                            order={order}
                            reload={reload}
                            table={table}
                        />
                    </>
                )}

                {/* {order.status !== "COMPLETED" &&
                    order.status !== "CANCELLED" &&
                    !orderItems.some(
                        item => item.status === "SERVED"
                    ) && (
                        <button
                            type="button"
                            disabled={loading}
                            onClick={requestCancelOrder}
                            className="mt-3 w-full rounded-lg border border-red-200 py-2 text-sm font-medium text-red-500 hover:bg-red-50 disabled:opacity-50"
                        >
                            Hủy đơn
                        </button>
                    )
                        } */}

                <div className="h-3" />
            </div>

            {confirmAction && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
                    onClick={() =>
                        !loading &&
                        setConfirmAction(null)
                    }
                >
                    <div
                        className="w-[400px] rounded-xl bg-white p-5 shadow-xl"
                        onClick={event => event.stopPropagation()}
                    >
                        <h3 className="text-lg font-bold">
                            Xác nhận hủy
                        </h3>

                        {confirmAction.type === "ITEM" ? (
                            <p className="mt-3 text-sm text-gray-600">
                                Bạn có chắc muốn hủy món{" "}
                                <span className="font-semibold text-gray-800">
                                    {confirmAction.itemName}
                                </span>
                                {confirmAction.quantity > 1 && ` x${confirmAction.quantity}`} ?
                            </p>
                        ) : (
                            <p className="mt-3 text-sm text-gray-600">
                                Bạn có chắc muốn hủy đơn{" "}
                                <span className="font-semibold text-gray-800">
                                    {currentOrderCode}
                                </span>
                                ?
                                <br />
                                Tất cả món chưa phục vụ sẽ được hủy.
                            </p>
                        )}

                        <div className="mt-5 flex justify-end gap-3">
                            <Button
                                disabled={loading}
                                className="!bg-gray-200 !text-gray-700 hover:!bg-gray-300"
                                onClick={() => setConfirmAction(null)}
                            >
                                Không
                            </Button>

                            <Button
                                disabled={loading}
                                className="!bg-red-500"
                                onClick={handleConfirmAction}
                            >
                                {loading ? "Đang xử lý..." : "Xác nhận hủy"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}