import { useEffect, useState } from "react";
import { X } from "lucide-react";

import Button from "../../../../components/Button/Button";
import NotiModal from "../../../../components/NotiModal/NotiModal";
import orderService from "../../../../services/order.service";
import paymentService from "../../../../services/payment.service";
import { printInvoice } from "../../../../../utils/printInvoice";
import PaymentQRModal from "../components/PaymentQRModal";

export default function PaymentModal({
    open,
    onClose,
    order,
    reload,
    table,
}) {
    const [phone, setPhone] = useState("");
    const [method, setMethod] = useState("CASH");
    const [payment, setPayment] = useState(null);
    const [loading, setLoading] = useState(false);
    const [noti, setNoti] = useState({
        open: false,
        type: "error",
        message: "",
    });

    useEffect(() => {
        if (!open) return;

        const customer = order?.customer;

        if (customer && !customer.isGuest) {
            setPhone(customer.phone || "");
        } else {
            setPhone("");
        }

        setMethod("CASH");
        setPayment(null);
        setLoading(false);
    }, [order, open]);

    if (!open) return null;

    const orderItems = (order?.orderItems || []).filter(
        item => item.status !== "CANCELLED"
    );

    const total = orderItems.reduce(
        (sum, item) =>
            sum + Number(item.price) * Number(item.quantity),
        0
    );

    const registeredCustomer =
        order?.customer && !order.customer.isGuest
            ? order.customer
            : null;

    const canEditPhone = !registeredCustomer;

    const showError = message => {
        setNoti({
            open: true,
            type: "error",
            message,
        });
    };

    const handleCreatePayment = async () => {
        try {
            setLoading(true);

            const orderRes = await orderService.getById(order.id);
            const fullOrder = orderRes?.data || orderRes;

            const printableOrder = {
                ...fullOrder,
                orderItems: (fullOrder?.orderItems || []).filter(
                    item => item.status !== "CANCELLED"
                ),
            };

            if (method === "CASH") {
                await paymentService.createPayment({
                    orderId: order.id,
                    paymentMethod: "CASH",
                    phone: phone.trim() || null,
                });

                printInvoice(printableOrder, "CASH");

                onClose();
                await reload();
                return;
            }

            const response = await paymentService.createPayment({
                orderId: order.id,
                paymentMethod: "BANKING",
            });

            const paymentData = response?.data || response;

            setPayment({
                ...paymentData,
                printableOrder,
            });
        } catch (err) {
            showError(
                err.response?.data?.message ||
                    err.message ||
                    "Không thể tạo thanh toán."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="max-h-[calc(100vh-50px)] w-full max-w-3xl overflow-y-auto rounded-xl bg-white">
                    <div className="flex items-center justify-between border-b p-5">
                        <h2 className="text-xl font-bold">
                            Thanh toán hóa đơn{" "}
                            {order.orderCode || `#${order.id}`}
                        </h2>

                        <Button type="button" onClick={onClose}>
                            <X />
                        </Button>
                    </div>

                    <div className="p-5">
                        <div className="mb-5">
                            <div>
                                Bàn:{" "}
                                {table?.tableNumber || "Không xác định"}
                            </div>

                            <div>
                                Ngày:{" "}
                                {new Date(
                                    order.createdAt
                                ).toLocaleString("vi-VN")}
                            </div>
                        </div>

                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="py-2 text-center">
                                        Tên món
                                    </th>
                                    <th>SL</th>
                                    <th>Đơn giá</th>
                                    <th>Thành tiền</th>
                                </tr>
                            </thead>

                            <tbody>
                                {orderItems.map(item => (
                                    <tr
                                        key={item.id}
                                        className="border-b"
                                    >
                                        <td className="py-2">
                                            {item.food?.name || "Món ăn"}
                                        </td>

                                        <td className="text-center">
                                            {item.quantity}
                                        </td>

                                        <td className="text-center">
                                            {Number(
                                                item.price
                                            ).toLocaleString("vi-VN")}
                                        </td>

                                        <td className="text-center">
                                            {(
                                                Number(item.price) *
                                                Number(item.quantity)
                                            ).toLocaleString("vi-VN")}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block font-semibold">
                                    Số điện thoại khách hàng
                                </label>

                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={e =>
                                        setPhone(e.target.value)
                                    }
                                    placeholder={
                                        canEditPhone
                                            ? "Nhập số điện thoại"
                                            : ""
                                    }
                                    readOnly={!canEditPhone}
                                    className={`w-full rounded-lg border px-3 py-2 outline-none ${
                                        canEditPhone
                                            ? "border-gray-300 focus:border-blue-500"
                                            : "cursor-not-allowed bg-gray-100 text-gray-600"
                                    }`}
                                />
                            </div>

                            <div>
                                <label className="font-semibold">
                                    Hình thức thanh toán
                                </label>

                                <div className="mt-3 space-y-3">
                                    <label className="flex cursor-pointer gap-2">
                                        <input
                                            type="radio"
                                            checked={method === "CASH"}
                                            onChange={() =>
                                                setMethod("CASH")
                                            }
                                        />
                                        Tiền mặt
                                    </label>

                                    <label className="flex cursor-pointer gap-2">
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

                        <div className="mt-6 flex justify-between border-t pt-5 text-xl font-bold">
                            <span>Tổng tiền</span>

                            <span className="text-red-600">
                                {total.toLocaleString("vi-VN")}đ
                            </span>
                        </div>
                    </div>

                    <div className="border-t p-5">
                        <Button
                            className="w-full"
                            onClick={handleCreatePayment}
                            disabled={loading}
                        >
                            {loading
                                ? "Đang xử lý..."
                                : method === "BANKING"
                                ? "Tạo mã QR thanh toán"
                                : "Thanh toán"}
                        </Button>
                    </div>
                </div>
            </div>

            <PaymentQRModal
                open={!!payment}
                onClose={() => setPayment(null)}
                payment={payment}
                printableOrder={payment?.printableOrder}
                reload={reload}
                onPaymentSuccess={onClose}
            />

            <NotiModal
                open={noti.open}
                type={noti.type}
                message={noti.message}
                onClose={() =>
                    setNoti(prev => ({
                        ...prev,
                        open: false,
                    }))
                }
            />
        </>
    );
}