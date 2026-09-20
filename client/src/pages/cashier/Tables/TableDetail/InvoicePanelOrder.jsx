import { useState } from "react";
import Button from "../../../../components/Button/Button";
import orderService from "../../../../services/order.service";
import customerOrderService from "../../../../services/customerOrder.service";
import { X, Plus, Minus } from "lucide-react";
import CustomerMergeOrderModal from "../../../customer/Order/CustomerMergeOrderModal";
import NotiModal from "../../../../components/NotiModal/NotiModal";
import cartService from "../../../../services/cart.service";

export default function InvoicePanelOrder({
    cart = [],
    setCart,
    table,
    order,
    reload,
    onBack,
    mode = "cashier",
    qrCode,
}) {
    const [sending, setSending] = useState(false);
    const [openMerge, setOpenMerge] = useState(false);
    const [existingOrders, setExistingOrders] = useState([]);
    const [notiModal, setNotiModal] = useState({
        open: false,
        type: "success",
        title: "",
        message: "",
    });

    const safeCart = Array.isArray(cart) ? cart : [];

    const total = safeCart.reduce(
        (sum, item) =>
            sum +
            Number(item.price || 0) *
            Number(item.quantity || 0),
        0
    );

    const updateCart = res => {
    const cartData = res?.data || res;
    const items = cartData?.items || [];

    setCart(
        items.map(item => ({
            id: item.food.id,
            cartItemId: item.id,
            foodId: item.food.id,
            name: item.food.name,
            image: item.food.image
                ? `${import.meta.env.VITE_API_URL.replace("/api", "")}${item.food.image}`
                : "https://placehold.co/400x400?text=Food",
            price: Number(item.food.price),
            quantity: item.quantity,
            note: item.note || "",
        }))
    );
};

const increase = async item => {
    if (mode !== "customer") {
        setCart(
            safeCart.map(x =>
                x.id === item.id
                    ? {
                        ...x,
                        quantity: x.quantity + 1,
                    }
                    : x
            )
        );
        return;
    }

    try {
        setSending(true);

        const guestToken = localStorage.getItem("guestToken");

        const res = await cartService.updateItem(
            item.cartItemId,
            {
                guestToken,
                quantity: item.quantity + 1,
            }
        );

        updateCart(res);
    } catch (err) {
        setNotiModal({
            open: true,
            type: "error",
            title: "Không thể cập nhật",
            message:
                err.response?.data?.message ||
                err.message ||
                "Không thể tăng số lượng.",
        });
    } finally {
        setSending(false);
    }
};

const decrease = async item => {
    if (mode !== "customer") {
        setCart(
            safeCart
                .map(x =>
                    x.id === item.id
                        ? {
                            ...x,
                            quantity: x.quantity - 1,
                        }
                        : x
                )
                .filter(x => x.quantity > 0)
        );
        return;
    }

    if (item.quantity <= 1) {
        await remove(item);
        return;
    }

    try {
        setSending(true);

        const guestToken = localStorage.getItem("guestToken");

        const res = await cartService.updateItem(
            item.cartItemId,
            {
                guestToken,
                quantity: item.quantity - 1,
            }
        );

        updateCart(res);
    } catch (err) {
        setNotiModal({
            open: true,
            type: "error",
            title: "Không thể cập nhật",
            message:
                err.response?.data?.message ||
                err.message ||
                "Không thể giảm số lượng.",
        });
    } finally {
        setSending(false);
    }
};

const remove = async item => {
    if (mode !== "customer") {
        setCart(
            safeCart.filter(x => x.id !== item.id)
        );
        return;
    }

    try {
        setSending(true);

        const guestToken = localStorage.getItem("guestToken");

        const res = await cartService.removeItem(
            item.cartItemId,
            guestToken
        );

        updateCart(res);
    } catch (err) {
        setNotiModal({
            open: true,
            type: "error",
            title: "Không thể xóa món",
            message:
                err.response?.data?.message ||
                err.message ||
                "Không thể xóa món khỏi giỏ.",
        });
    } finally {
        setSending(false);
    }
};

    const createCustomerOrder = async ({
        orderId = null,
        newOrder = false,
    } = {}) => {

        if (!safeCart.length) {
            setNotiModal({
                open: true,
                type: "warning",
                title: "Chưa có món",
                message: "Vui lòng chọn ít nhất một món trước khi gửi.",
            });
            return;
        }

        if (!qrCode) {
            setNotiModal({
                open: true,
                type: "error",
                title: "Không xác định được bàn",
                message: "Không thể xác định bàn hiện tại. Vui lòng quét lại mã QR.",
            });
            return;
        }

        try {

            setSending(true);

            const items = safeCart.map(item => ({
                foodId: item.id,
                quantity: item.quantity,
                note: item.note || null,
            }));

            const payload = {
                tableId: qrCode,
                items,
            };

            if (orderId) {
                payload.orderId = orderId;
            }

            if (newOrder) {
                payload.newOrder = true;
            }

            console.log(
                "CUSTOMER ORDER PAYLOAD:",
                payload
            );

            const res =
                await customerOrderService.create(
                    payload
                );

            setCart([]);
            setOpenMerge(false);
            setExistingOrders([]);

            if (reload) {
                await reload();
            }

            setNotiModal({
                open: true,
                type: "success",
                title: "Đặt món thành công",
                message: orderId
                    ? "Các món đã được thêm vào đơn hàng."
                    : newOrder
                        ? "Đã tạo đơn hàng mới thành công."
                        : "Đã gửi món thành công.",
            });

            return res;

        } catch (err) {

            console.error(
                "CUSTOMER ORDER ERROR:",
                err.response?.data || err
            );

            const status = err.response?.status;
            const data = err.response?.data;

            if (
                status === 409 &&
                data?.code === "ACTIVE_ORDER_EXISTS"
            ) {
                const orders = data?.data?.orders || [];

                if (!orders.length) {
                    setNotiModal({
                        open: true,
                        type: "warning",
                        title: "Bàn đang có đơn",
                        message:
                            data?.message ||
                            "Bàn hiện đang có đơn hàng.",
                    });
                    return;
                }

                setExistingOrders(orders);
                setOpenMerge(true);

                return;
            }

            setNotiModal({
                open: true,
                type: "error",
                title: "Không thể gửi món",
                message:
                    data?.message ||
                    err.message ||
                    "Đã xảy ra lỗi khi gửi món. Vui lòng thử lại.",
            });

        } finally {
            setSending(false);
        }
    };

    const handleMergeOrder = async (
        selectedOrder
    ) => {

        if (!selectedOrder) {
            return;
        }

        await createCustomerOrder({
            orderId:
                selectedOrder.id,
        });
    };

    const handleNewOrder = async () => {
        await createCustomerOrder({
            newOrder: true,
        });
    };

    const handleSubmit = async () => {
        if (!safeCart.length) {
            setNotiModal({
                open: true,
                type: "warning",
                title: "Chưa có món",
                message: "Vui lòng chọn món trước khi tạo đơn.",
            });
            return;
        }

        if (mode === "customer") {
            await createCustomerOrder();
            return;
        }

        if (!order?.id) {
            setNotiModal({
                open: true,
                type: "error",
                title: "Không xác định được đơn",
                message: "Vui lòng chọn đơn hàng trước khi thêm món.",
            });
            return;
        }

        try {
            setSending(true);

            console.log("ADD FOOD TO ORDER:", {
                orderId: order.id,
                cart: safeCart,
            });

            for (const item of safeCart) {
                await orderService.addItem(order.id, {
                    foodId: item.id,
                    quantity: item.quantity,
                    note: item.note || null,
                });
            }

            setCart([]);

            if (reload) { await reload(); }
            if (onBack) { onBack(); }
        } catch (err) {
            console.error(
                "BRANCH ORDER ERROR:",
                err.response?.data || err
            );

            setNotiModal({
                open: true,
                type: "error",
                title: "Không thể thêm món",
                message:
                    err.response?.data?.message ||
                    err.message ||
                    "Đã xảy ra lỗi khi thêm món.",
            });
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex h-full flex-col">
            <div className="border-b p-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold">
                            {mode === "customer"
                                ? "Giỏ hàng"
                                : order
                                    ? "Thêm món"
                                    : "Tạo Order"
                            }
                        </h2>
                        <p className="text-sm text-gray-500">
                            {safeCart.length} món đã chọn
                        </p>
                    </div>

                    {mode === "customer" && (
                        <Button
                            type="button"
                            onClick={onBack}
                            className="rounded-full p-2 !bg-white !text-black"
                        >
                            <X size={22} />
                        </Button>
                    )}
                </div>
            </div>

            {/* CART */}
            <div className="flex-1 overflow-y-auto p-5">
                {safeCart.length === 0 && (
                    <div className="text-center text-gray-400">
                        Chưa có món nào.
                    </div>
                )}

                {safeCart.map(item => (
                    <div
                        key={item.id}
                        className="mb-3 rounded-lg border p-2"
                    >
                        <div className="flex gap-3">
                            <div className="flex flex-1 text-left">
                                <div className="flex-1">
                                    <div className="font-semibold">
                                        {item.name}
                                    </div>

                                    <div className="text-sm text-gray-500">
                                        {Number(item.price || 0).toLocaleString()}đ
                                    </div>

                                    {item.note && (
                                        <div className="mt-1 text-xs italic text-gray-500">
                                            📝 {item.note}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-1 text-sm font-semibold">
                                    <div className="flex items-center gap-2 h-6">
                                        <Button
                                            className="!bg-white !text-black"
                                            disabled={sending}
                                            onClick={() => decrease(item)}
                                        >
                                            <Minus size={12} />
                                        </Button>

                                        <span className="w-8 text-center">
                                            {item.quantity}
                                        </span>

                                        <Button
                                            disabled={sending}
                                            className="!bg-white !text-black"
                                            onClick={() =>increase(item)}
                                        >
                                            <Plus size={12} />
                                        </Button>
                                    </div>

                                    <div className="text-center font-semibold text-blue-600">
                                        {(
                                            Number(item.price || 0) *
                                            Number(item.quantity || 0)
                                        ).toLocaleString()}đ
                                    </div>
                                </div>
                            </div>

                            <Button
                                disabled={sending}
                                className="h-9 !text-red-500 !bg-white"
                                onClick={() =>remove(item)}
                            >
                                X
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="border-t p-3">
                <div className="mb-4 flex justify-between">
                    <span className="font-semibold">
                        Tổng tiền
                    </span>

                    <span className="font-bold text-red-500">
                        {total.toLocaleString()}đ
                    </span>
                </div>

                <Button
                    className="w-full"
                    disabled={sending}
                    onClick={handleSubmit}
                >
                    {sending
                        ? "Đang xử lý..."
                        : mode === "customer"
                            ? order
                                ? "Thêm món"
                                : "Gửi món"
                            : order
                                ? "Thêm món"
                                : "Tạo đơn"
                    }
                </Button>
            </div>

            {/* MERGE MODAL */}

            {mode === "customer" && (
                <CustomerMergeOrderModal
                    open={openMerge}
                    orders={existingOrders}
                    table={table}
                    loading={sending}
                    onMerge={handleMergeOrder}
                    onNewOrder={handleNewOrder}
                    onClose={() => {if (!sending) {setOpenMerge(false);}}}
                />
            )}

            <NotiModal
                open={notiModal.open}
                type={notiModal.type}
                title={notiModal.title}
                message={notiModal.message}
                onClose={() => {
                    setNotiModal({
                        open: false,
                        type: "success",
                        title: "",
                        message: "",
                    });

                    if (notiModal.type === "success" && onBack) {
                        onBack();
                    }
                }}
            />

        </div>
    );
}