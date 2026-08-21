import Button from "../../../../components/Button/Button";
import orderService from "../../../../services/order.service";
import customerOrderService from "../../../../services/customerOrder.service";
import { X } from "lucide-react";

export default function InvoicePanelOrder({
    cart,
    setCart,
    table,
    order,
    reload,
    onBack,
    mode = "cashier",
    qrCode,
}) {

    const total = cart.reduce(
        (sum, item) =>
            sum + item.price * item.quantity,
        0
    );

    const increase = (id) => {

        setCart(
            cart.map(item =>
                item.id === id
                    ? {
                        ...item,
                        quantity: item.quantity + 1
                    }
                    : item
            )
        );

    };

    const decrease = (id) => {

        setCart(
            cart
                .map(item =>
                    item.id === id
                        ? {
                            ...item,
                            quantity: item.quantity - 1
                        }
                        : item
                )
                .filter(item => item.quantity > 0)
        );

    };

    const remove = (id) => {

        setCart(
            cart.filter(item => item.id !== id)
        );

    };

    const handleSubmit = async () => {

        if (cart.length === 0) {
            alert("Chưa chọn món.");
            return;
        }

        try {

            //////////////////////////////////////////////////
            // CUSTOMER
            //////////////////////////////////////////////////

            if (mode === "customer") {

                if (!qrCode) {
                    throw new Error(
                        "Không xác định được bàn."
                    );
                }

                const items = cart.map(item => ({
                    foodId: item.id,
                    quantity: item.quantity,
                    note: item.note || null,
                }));

                await customerOrderService.create({
                    tableId: qrCode,
                    items,
                });

                alert(
                    order
                        ? "Đã thêm món vào đơn."
                        : "Đã gửi món cho thu ngân."
                );

                setCart([]);

                if (reload) {
                    await reload();
                }

                onBack();

                return;
            }

            //////////////////////////////////////////////////
            // CASHIER
            //////////////////////////////////////////////////

            let orderId;

            if (order) {

                orderId = order.id;

            } else {

                console.log("table:", table);
                console.log(
                    "customers:",
                    table?.customers
                );

                let customerId;

                if (
                    !table?.customers ||
                    table.customers.length === 0
                ) {

                    throw new Error(
                        "Bàn chưa có khách."
                    );

                } else {

                    customerId =
                        table.customers[0].id;

                }

                const res =
                    await orderService.create({
                        customerId,
                    });

                orderId =
                    res.data.data.id;
            }

            //////////////////////////////////////////////////
            // CASHIER ADD ITEM
            //////////////////////////////////////////////////

            for (const item of cart) {

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

            await reload();

            onBack();

        } catch (err) {

            alert(
                err.response?.data?.message ||
                err.message
            );

        }

    };

    return (

        <div className="flex h-full flex-col">

            <div className="border-b p-3">

                <h2 className="text-xl font-bold">

                    {mode === "customer"
                        ? "Giỏ hàng"
                        : order
                            ? "Thêm món"
                            : "Tạo Order"
                    }

                </h2>

                <p className="text-sm text-gray-500">
                    {cart.length} món đã chọn
                </p>

                {mode === "customer" && (
                    <button
                        type="button"
                        onClick={onBack}
                        className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    >
                        <X size={22} />
                    </button>
                )}

            </div>

            <div className="flex-1 overflow-y-auto p-5">

                {cart.length === 0 && (

                    <div className="text-center text-gray-400">
                        Chưa có món nào.
                    </div>

                )}

                {cart.map(item => (

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
                                        {item.price.toLocaleString()}đ
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
                                            onClick={() =>
                                                increase(item.id)
                                            }
                                        >
                                            +
                                        </Button>

                                    </div>

                                    <div className="font-semibold text-blue-600">
                                        {(
                                            item.price *
                                            item.quantity
                                        ).toLocaleString()}đ
                                    </div>

                                </div>

                            </div>

                            <Button
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
                    onClick={handleSubmit}
                >

                    {mode === "customer"
                        ? order
                            ? "Thêm món"
                            : "Gửi món"
                        : order
                            ? "Thêm món"
                            : "Tạo đơn"
                    }

                </Button>

            </div>

        </div>

    );

}