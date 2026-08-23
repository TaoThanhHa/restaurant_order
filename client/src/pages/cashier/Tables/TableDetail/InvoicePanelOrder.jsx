import { useState } from "react";
import Button from "../../../../components/Button/Button";
import orderService from "../../../../services/order.service";
import customerOrderService from "../../../../services/customerOrder.service";
import { X } from "lucide-react";
import CustomerMergeOrderModal from "../../../customer/Order/CustomerMergeOrderModal";

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
    

    const safeCart = Array.isArray(cart) ? cart : [];

    const total = safeCart.reduce(
        (sum, item) =>
            sum +
            Number(item.price || 0) *
            Number(item.quantity || 0),
        0
    );

    // ========================================
    // TĂNG SỐ LƯỢNG
    // ========================================

    const increase = (id) => {
        setCart(
            safeCart.map(item =>
                item.id === id
                    ? {
                        ...item,
                        quantity: item.quantity + 1,
                    }
                    : item
            )
        );
    };

    // ========================================
    // GIẢM SỐ LƯỢNG
    // ========================================

    const decrease = (id) => {
        setCart(
            safeCart
                .map(item =>
                    item.id === id
                        ? {
                            ...item,
                            quantity: item.quantity - 1,
                        }
                        : item
                )
                .filter(item => item.quantity > 0)
        );
    };

    // ========================================
    // XÓA MÓN
    // ========================================

    const remove = (id) => {
        setCart(
            safeCart.filter(item => item.id !== id)
        );
    };

    // ========================================
    // CUSTOMER CREATE ORDER
    // ========================================

    const createCustomerOrder = async ({
        orderId = null,
        newOrder = false,
    } = {}) => {

        if (!safeCart.length) {
            alert("Chưa chọn món.");
            return;
        }

        if (!qrCode) {
            throw new Error("Không xác định được bàn.");
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

            if (orderId) {
                alert("Đã thêm món vào đơn.");
            } else if (newOrder) {
                alert("Đã tạo đơn riêng.");
            } else {
                alert("Đã gửi món.");
            }

            if (onBack) {
                onBack();
            }

            return res;

        } catch (err) {

            console.error(
                "CUSTOMER ORDER ERROR:",
                err.response?.data || err
            );

            const status =
                err.response?.status;

            const data =
                err.response?.data;

            // ==========================================
            // BÀN ĐANG CÓ NHIỀU ORDER
            // ==========================================

            if (
                status === 409 &&
                data?.code === "ACTIVE_ORDER_EXISTS"
            ) {

                const orders =
                    data?.data?.orders || [];

                if (!orders.length) {
                    alert(
                        data?.message ||
                        "Bàn đang có đơn hàng."
                    );
                    return;
                }

                setExistingOrders(orders);
                setOpenMerge(true);

                return;
            }

            alert(
                data?.message ||
                err.message ||
                "Không thể tạo đơn."
            );

        } finally {
            setSending(false);
        }
    };

    // ========================================
    // GỘP ORDER
    // ========================================

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

    // ========================================
    // TẠO ORDER RIÊNG
    // ========================================

    const handleNewOrder = async () => {
        await createCustomerOrder({
            newOrder: true,
        });
    };

    // ========================================
    // SUBMIT
    // ========================================

    const handleSubmit = async () => {

    if (!safeCart.length) {
        alert("Chưa chọn món.");
        return;
    }

    // ====================================
    // CUSTOMER
    // ====================================

    if (mode === "customer") {
        await createCustomerOrder();
        return;
    }

    // ====================================
    // CASHIER
    // ====================================

    try {

        setSending(true);

        let orderId;

        if (order) {

            orderId = order.id;

        } else {

            console.log("table:", table);

            console.log(
                "customers:",
                table?.customers
            );

            if (
                !table?.customers ||
                table.customers.length === 0
            ) {
                throw new Error(
                    "Bàn chưa có khách."
                );
            }

            const customerId =
                table.customers[0].id;

            const res =
                await orderService.create({
                    customerId,
                });

            orderId =
                res.data.data.id;
        }

        // ====================================
        // CASHIER ADD ITEM
        // ====================================

        for (const item of safeCart) {

            await orderService.addItem(
                orderId,
                {
                    foodId: item.id,
                    quantity: item.quantity,
                    note: item.note || null,
                }
            );
        }

        setCart([]);

        if (reload) {
            await reload();
        }

        if (onBack) {
            onBack();
        }

    } catch (err) {

        console.error(
            "CASHIER ORDER ERROR:",
            err.response?.data ||
            err
        );

        alert(
            err.response?.data?.message ||
            err.message ||
            "Không thể tạo đơn."
        );

    } finally {

        setSending(false);
    }
};

    return (
        <div className="flex h-full flex-col">

            {/* HEADER */}

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
                        <button
                            type="button"
                            onClick={onBack}
                            className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                        >
                            <X size={22} />
                        </button>
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
                                        {Number(
                                            item.price || 0
                                        ).toLocaleString()}đ
                                    </div>

                                    {item.note && (
                                        <div className="mt-1 text-xs italic text-gray-500">
                                            📝 {item.note}
                                        </div>
                                    )}

                                </div>

                                <div className="mt-1 text-sm font-semibold">

                                    <div className="flex items-center gap-2">

                                        <Button
                                            disabled={sending}
                                            onClick={() =>
                                                decrease(item.id)
                                            }
                                        >
                                            -
                                        </Button>

                                        <span className="w-8 text-center">
                                            {item.quantity}
                                        </span>

                                        <Button
                                            disabled={sending}
                                            onClick={() =>
                                                increase(item.id)
                                            }
                                        >
                                            +
                                        </Button>

                                    </div>

                                    <div className="font-semibold text-blue-600">
                                        {(
                                            Number(item.price || 0) *
                                            Number(item.quantity || 0)
                                        ).toLocaleString()}đ
                                    </div>

                                </div>

                            </div>

                            <Button
                                disabled={sending}
                                className="h-9 text-red-500"
                                onClick={() =>
                                    remove(item.id)
                                }
                            >
                                X
                            </Button>

                        </div>

                    </div>

                ))}

            </div>

            {/* FOOTER */}

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
                    disabled={
                        sending ||
                        safeCart.length === 0
                    }
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
                    onClose={() => {
                        if (!sending) {
                            setOpenMerge(false);
                        }
                    }}
                />
            )}

        </div>
    );
}