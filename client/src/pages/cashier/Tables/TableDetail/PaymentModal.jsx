import { useState } from "react";
import { X } from "lucide-react";
import Button from "../../../../components/Button/Button";
import orderService from "../../../../services/order.service";
import { printInvoice } from "../../../../../utils/printInvoice";

export default function PaymentModal({
    open,
    onClose,
    order,
    reload,
    table
}) {

    const [phone, setPhone] = useState("");
    const [method, setMethod] = useState("CASH");

    if (!open) return null;

    const orderItems = (order?.orderItems || []).filter(
        item => item.status !== "CANCELLED"
    );

    const total = orderItems.reduce(
        (sum, item) =>
            sum + Number(item.price) * item.quantity,
        0
    );

    const handlePayment = async () => {
        try {

            const orderRes = await orderService.getById(order.id);

            const fullOrder = orderRes.data.data;

            const printableOrder = {
                ...fullOrder,
                orderItems: (fullOrder.orderItems || []).filter(
                    item => item.status !== "CANCELLED"
                )
            };

            await orderService.payment(
                order.id,
                {
                    paymentMethod: method,
                    phone: phone.trim() || null,
                }
            );

            printInvoice(
                printableOrder,
                method
            );

            onClose();

            await reload();

        } catch (err) {

            alert(
                err.response?.data?.message ||
                err.message
            );

        }
    };

    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 ">

            <div className="max-h-[calc(100vh-50px)] overflow-y-auto p-5 bg-white rounded-xl">

                <div className="flex items-center justify-between border-b p-5">

                    <h2 className="text-xl font-bold">
                        Thanh toán hóa đơn {order.orderCode || `#${order.id}`}
                    </h2>

                    <button onClick={onClose}>
                        <X />
                    </button>

                </div>

                <div className="p-5">

                    <div className="mb-5">

                        <div>
                            Bàn: {table?.tableNumber || "Không xác định"}
                        </div>

                        <div>
                            Ngày:{" "}
                            {new Date(order.createdAt)
                                .toLocaleString("vi-VN")}
                        </div>

                    </div>

                    <table className="w-full text-sm">

                        <thead>
                            <tr className="border-b">
                                <th className="text-center">
                                    Tên món
                                </th>

                                <th>
                                    SL
                                </th>

                                <th>
                                    Đơn giá
                                </th>

                                <th>
                                    Thành tiền
                                </th>
                            </tr>
                        </thead>

                        <tbody>

                            {orderItems.map(item => (

                                <tr key={item.id}>

                                    <td>
                                        {item.food.name}
                                    </td>

                                    <td className="text-center">
                                        {item.quantity}
                                    </td>

                                    <td className="text-center">
                                        {Number(item.price)
                                            .toLocaleString()}
                                    </td>

                                    <td className="text-center">
                                        {(
                                            Number(item.price) *
                                            item.quantity
                                        ).toLocaleString()}
                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>
                    
                    <div className="flex">       
                    <div className="mt-6 pr-4">

                        <label className="mb-2 block font-semibold">
                            Số điện thoại khách hàng
                        </label>

                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Nhập số điện thoại"
                            className="
                                w-full
                                rounded-lg
                                border
                                border-gray-300
                                px-3
                                py-2
                                outline-none
                                focus:border-blue-500
                            "
                        />

                    </div>
                    <div className="mt-6">

                        <label className="font-semibold">
                            Hình thức thanh toán
                        </label>

                        <div className="mt-3 space-y-2">

                            <label className="flex gap-2">

                                <input
                                    type="radio"
                                    checked={method === "CASH"}
                                    onChange={() =>
                                        setMethod("CASH")
                                    }
                                />

                                Tiền mặt

                            </label>

                            <label className="flex gap-2">

                                <input
                                    type="radio"
                                    checked={method === "BANKING"}
                                    onChange={() =>
                                        setMethod("BANKING")
                                    }
                                />

                                Chuyển khoản

                            </label>

                        </div>

                    </div>
                    </div> 

                    <div className="mt-6 flex justify-between text-xl font-bold">

                        <span>
                            Tổng tiền
                        </span>

                        <span className="text-red-600">
                            {total.toLocaleString()}đ
                        </span>

                    </div>

                </div>

                <div className="border-t p-5">

                    <Button
                        className="w-full"
                        onClick={handlePayment}
                    >
                        Thanh toán
                    </Button>

                </div>

            </div>

        </div>

    );
}