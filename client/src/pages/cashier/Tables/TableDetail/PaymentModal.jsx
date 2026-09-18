import { useEffect, useState } from "react";
import { X } from "lucide-react";

import Button from "../../../../components/Button/Button";
import orderService from "../../../../services/order.service";
import { printInvoice } from "../../../../../utils/printInvoice";

export default function PaymentModal({
    open,
    onClose,
    order,
    reload,
    table,
}) {
    const [phone, setPhone] = useState("");
    const [method, setMethod] = useState("CASH");
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            setPhone(order?.customer?.phone || "");
            setMethod("CASH");
            setErrorMessage("");
        }
    }, [open, order]);

    if (!open) return null;

    const orderItems = (order?.orderItems || []).filter(
        item => item.status !== "CANCELLED"
    );

    const total = orderItems.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0
    );

    const hasCustomer = Boolean(order?.customer?.id);
    const customerPhone = order?.customer?.phone || "";

    const handlePayment = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            await orderService.payment(order.id, {
                paymentMethod: method,
                phone: hasCustomer ? customerPhone : phone.trim() || null,
            });

            const orderRes = await orderService.getById(order.id);
            const fullOrder = orderRes?.data || orderRes;

            const printableOrder = {
                ...fullOrder,
                orderItems: (fullOrder?.orderItems || []).filter(
                    item => item.status !== "CANCELLED"
                ),
            };

            printInvoice(printableOrder, method);

            onClose();
            await reload();
        } catch (err) {
            setErrorMessage(
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                "Không thể thanh toán."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="max-h-[calc(100vh-50px)] overflow-y-auto rounded-xl bg-white p-5">
                <div className="flex items-center justify-between border-b p-5">
                    <h2 className="text-xl font-bold">
                        Thanh toán hóa đơn{" "}
                        {order.orderCode || `#${order.id}`}
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                    >
                        <X />
                    </button>
                </div>

                <div className="p-5">
                    <div className="mb-5">
                        <div>
                            Bàn:{" "}
                            {table?.tableNumber || "Không xác định"}
                        </div>

                        <div>
                            Ngày:{" "}
                            {new Date(order.createdAt).toLocaleString(
                                "vi-VN"
                            )}
                        </div>
                    </div>

                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className="text-center">Tên món</th>
                                <th>SL</th>
                                <th>Đơn giá</th>
                                <th>Thành tiền</th>
                            </tr>
                        </thead>

                        <tbody>
                            {orderItems.map(item => (
                                <tr key={item.id}>
                                    <td>
                                        {item.food?.name || "Món ăn"}
                                    </td>

                                    <td className="text-center">
                                        {item.quantity}
                                    </td>

                                    <td className="text-center">
                                        {Number(
                                            item.price
                                        ).toLocaleString()}
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

                    <div className="flex gap-6">
                        <div className="mt-6 flex-1">
                            <label className="mb-2 block font-semibold">
                                Số điện thoại khách hàng
                            </label>

                            {hasCustomer ? (
                                <div className="rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-gray-700">
                                    {customerPhone}
                                </div>
                            ) : (
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={e =>
                                        setPhone(e.target.value)
                                    }
                                    placeholder="Nhập số điện thoại"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                                    disabled={loading}
                                />
                            )}

                            {hasCustomer && (
                                <p className="mt-1 text-xs text-gray-500">
                                    Số điện thoại từ tài khoản khách hàng
                                </p>
                            )}
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
                                        disabled={loading}
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
                                        disabled={loading}
                                    />
                                    Chuyển khoản
                                </label>
                            </div>
                        </div>
                    </div>

                    {errorMessage && (
                        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            {errorMessage}
                        </div>
                    )}

                    <div className="mt-6 flex justify-between text-xl font-bold">
                        <span>Tổng tiền</span>

                        <span className="text-red-600">
                            {total.toLocaleString()}đ
                        </span>
                    </div>
                </div>

                <div className="border-t p-5">
                    <Button
                        className="w-full"
                        onClick={handlePayment}
                        disabled={loading}
                    >
                        {loading ? "Đang thanh toán..." : "Thanh toán"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
