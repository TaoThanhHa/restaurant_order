import { useState } from "react";
import Button from "../../../components/Button/Button";
import orderService from "../../../services/order.service";
import { printInvoice } from "../../../../utils/printInvoice";
import NotiModal from "../../../components/NotiModal/NotiModal";

export default function InvoicePanelTakeAway({
    cart,
    setCart,
}) {
    const [phone, setPhone] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("CASH");

    const [noti, setNoti] = useState({
        open: false,
        type: "error",
        message: "",
    });

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    // NOTIFICATION
    

    const showNoti = (message, type = "error") => {
        setNoti({
            open: true,
            type,
            message,
        });
    };

    const closeNoti = () => {
        setNoti({
            open: false,
            type: "error",
            message: "",
        });
    };

    
    // TĂNG
    

    const increase = (id) => {
        setCart(
            cart.map(item =>
                item.id === id
                    ? {
                        ...item,
                        quantity: item.quantity + 1,
                    }
                    : item
            )
        );
    };

    
    // GIẢM
    

    const decrease = (id) => {
        setCart(
            cart
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

    
    // XÓA
    

    const remove = (id) => {
        setCart(
            cart.filter(item => item.id !== id)
        );
    };

    
    // SUBMIT
    

    const handleSubmit = async () => {

        // Không có món
        if (!cart || cart.length === 0) {
            showNoti("Chưa chọn món. Vui lòng chọn ít nhất một món.");
            return;
        }

        try {

            const res =
                await orderService.createTakeAway({
                    phone: phone.trim() || null,
                    paymentMethod,

                    items: cart.map(item => ({
                        foodId: item.id,
                        quantity: item.quantity,
                        note: item.note,
                    })),
                });

            // Lấy order vừa tạo
            const order = res.data.data;

            // In hóa đơn
            printInvoice(order, paymentMethod);

            setCart([]);
            setPhone("");

            showNoti(
                "Thanh toán thành công.",
                "success"
            );

        } catch (err) {

            console.error(
                "TAKE AWAY PAYMENT ERROR:",
                err.response?.data || err
            );

            showNoti(
                err.response?.data?.message ||
                err.message ||
                "Không thể thanh toán."
            );
        }
    };

    return (
        <div className="flex h-full flex-col rounded-3xl bg-white">

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
                    <div
                        key={item.id}
                        className="mb-2 rounded-xl border p-2"
                    >
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
                                            onClick={() =>
                                                decrease(item.id)
                                            }
                                            className="!bg-white !text-gray-600"
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
                                            className="!bg-white !text-gray-600"
                                        >
                                            +
                                        </Button>

                                    </div>

                                    <div className="mt-2 font-semibold text-blue-600">
                                        {(
                                            item.price *
                                            item.quantity
                                        ).toLocaleString()}đ
                                    </div>

                                </div>

                                <Button
                                    className="h-2 !text-red-500 !bg-white"
                                    onClick={() =>
                                        remove(item.id)
                                    }
                                >
                                    X
                                </Button>

                            </div>

                        </div>
                    </div>
                ))}

            </div>

            {/* FOOTER */}

            <div className="border-t p-2">

                {/* KHÁCH HÀNG */}
                <div className="flex">
                <div className="mb-5">

                    <label className="mb-2 block font-semibold">
                        Số điện thoại
                    </label>

                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) =>
                            setPhone(e.target.value)
                        }
                        placeholder="Nhập số điện thoại"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                    />

                </div>

                {/* THANH TOÁN */}

                <div className="mb-2">

                        <button
                            type="button"
                            onClick={() =>
                                setPaymentMethod("CASH")
                            }
                            className={`rounded-lg border p-1 transition text-s mb-3 w-30 ${
                                paymentMethod === "CASH"
                                    ? "border-red-500 bg-red-500 text-white"
                                    : "border-gray-300 hover:bg-gray-50"
                            }`}
                        >
                            Tiền mặt
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                setPaymentMethod("BANKING")
                            }
                            className={`rounded-lg border p-1 transition text-s w-30 ${
                                paymentMethod === "BANKING"
                                    ? "border-blue-500 bg-blue-500 text-white"
                                    : "border-gray-300 hover:bg-gray-50"
                            }`}
                        >
                            Chuyển khoản
                        </button>


                </div>
                </div>

                {/* TOTAL */}

                <div className="mb-1 flex items-center justify-between">

                    <span className="font-semibold">
                        Tổng tiền
                    </span>

                    <span className="text-l font-bold text-red-500">
                        {total.toLocaleString()}đ
                    </span>

                </div>

                {/* BUTTON */}

                <Button
                    className="w-full"
                    onClick={handleSubmit}
                >
                    Thanh toán
                </Button>

            </div>

            {/* NOTIFICATION MODAL */}

            <NotiModal
                open={noti.open}
                type={noti.type}
                message={noti.message}
                onClose={closeNoti}
            />

        </div>
    );
}