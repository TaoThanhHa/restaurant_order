import { useState } from "react";
import Button from "../../../components/Button/Button";
import orderService from "../../../services/order.service";
import { printInvoice } from "../../../../utils/printInvoice";

export default function InvoicePanelTakeAway({
    cart,
    setCart,
}) {
    const [phone, setPhone] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("CASH");

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
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
            const res = await orderService.createTakeAway({
                phone: phone.trim() || null,
                paymentMethod,

                items: cart.map(item => ({
                    foodId: item.id,
                    quantity: item.quantity,
                    note: item.note,
                })),
            });

            // Lấy order vừa tạo từ BE
            const order = res.data.data;

            // In hóa đơn
            printInvoice(order, paymentMethod);

            {/* alert("Thanh toán thành công."); */}

            setCart([]);
            setPhone("");

        } catch (err) {
            alert(
                err.response?.data?.message ||
                err.message
            );
        }
    };

    return (

        <div className="flex h-full flex-col bg-white rounded-3xl">

            {/* HEADER */}

            <div className="border-b p-2 text-center">

                <h2 className="text-3xl font-bold">
                    Order mang về
                </h2>

                <p className="mt-2 text-gray-500">
                    {cart.length} món đã chọn
                </p>

            </div>

            {/* DANH SÁCH */}

            <div className="flex-1 overflow-y-auto p-2">

                {cart.length === 0 && (

                    <div className="mt-10 text-center text-gray-400">
                        Chưa có món nào.
                    </div>

                )}

                {cart.map(item => (
                    <div key={item.id} className="mb-2 rounded-xl border p-2">
                        <div className="flex gap-3">
                            <div className="flex flex-1 text-left">
                                <div className="flex-1">

                                    <div className="font-semibold text-l">
                                        {item.name}
                                    </div>

                                    <div className="text-gray-500">
                                        {item.price.toLocaleString()}đ
                                    </div>

                                    {item.note && (

                                        <div className="mt-1 text-xs italic text-gray-500">
                                            📝 {item.note}
                                        </div>

                                    )}
                                </div>

                                <div className="flex flex-col items-center">
                                    <div className="flex items-center gap-2">
                                        <Button
                                            onClick={() => decrease(item.id)}
                                        >
                                            -
                                        </Button>

                                        <span className="w-8 text-center">
                                            {item.quantity}
                                        </span>

                                        <Button
                                            onClick={() => increase(item.id)}
                                        >
                                            +
                                        </Button>

                                    </div>
                                    <div className="mt-3 font-semibold text-blue-600">
                                        {(item.price * item.quantity).toLocaleString()}đ
                                    </div>
                                </div>
                                <Button className="h-9 bg-red-500 text-red-500" onClick={() => remove(item.id)}>
                                        X
                                </Button>

                            </div>
                        </div>
                    </div>

                ))}

            </div>

            {/* FOOTER */}

            <div className="border-t p-2">
            {/* THÔNG TIN KHÁCH HÀNG */}

                <div className="mb-5">

                    <label className="mb-2 block font-semibold">
                        Số điện thoại khách hàng
                    </label>

                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Nhập số điện thoại"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                    />

                </div>

                <div className="mb-5">

                    <div className="mb-2 font-semibold">
                        Hình thức thanh toán
                    </div>

                    <div className="grid grid-cols-2 gap-3">

                        <button
                            onClick={() => setPaymentMethod("CASH")}
                            className={`rounded-lg border p-1 transition text-s ${
                                paymentMethod === "CASH"
                                    ? "border-red-500 bg-red-500 text-white"
                                    : "border-gray-300 hover:bg-gray-50"
                            }`}
                        >
                            Tiền mặt
                        </button>

                        <button
                            onClick={() => setPaymentMethod("BANKING")}
                            className={`rounded-lg border p-1 transition text-s ${
                                paymentMethod === "BANKING"
                                    ? "border-blue-500 bg-blue-500 text-white"
                                    : "border-gray-300 hover:bg-gray-50"
                            }`}
                        >
                            Chuyển khoản
                        </button>

                    </div>

                </div>

                <div className="mb-1 flex items-center justify-between">

                    <span className=" font-semibold">
                        Tổng tiền
                    </span>

                    <span className="text-l font-bold text-red-500">
                        {total.toLocaleString()}đ
                    </span>

                </div>

                <Button
                    className="w-full"
                    onClick={handleSubmit}
                >
                    Thanh toán
                </Button>

            </div>

        </div>

    );

}