import { useState } from "react";
import {
    CalendarDays,
    Users,
    User,
    Phone,
    FileText,
    X,
} from "lucide-react";

export default function ReservationForm({ onClose, onSubmit, loading }) {
    const [form, setForm] = useState({
        customerName: "",
        customerPhone: "",
        numberOfGuests: 2,
        reservationTime: "",
        note: "",
    });

    const handleChange = e => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = e => {
        e.preventDefault();

        onSubmit({
            ...form,
            numberOfGuests: Number(form.numberOfGuests),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">
                            Tạo đặt bàn
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Nhập thông tin khách hàng
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 p-6">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Tên khách hàng
                        </label>
                        <div className="relative">
                            <User
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                required
                                name="customerName"
                                value={form.customerName}
                                onChange={handleChange}
                                placeholder="Nguyễn Văn A"
                                className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Số điện thoại
                        </label>
                        <div className="relative">
                            <Phone
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                required
                                name="customerPhone"
                                value={form.customerPhone}
                                onChange={handleChange}
                                placeholder="0987654321"
                                className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Số khách
                        </label>
                        <div className="relative">
                            <Users
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                required
                                min="1"
                                type="number"
                                name="numberOfGuests"
                                value={form.numberOfGuests}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Thời gian đặt bàn
                        </label>
                        <div className="relative">
                            <CalendarDays
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                required
                                type="datetime-local"
                                name="reservationTime"
                                value={form.reservationTime}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Ghi chú
                        </label>
                        <div className="relative">
                            <FileText
                                size={18}
                                className="absolute left-3 top-3 text-gray-400"
                            />
                            <textarea
                                name="note"
                                value={form.note}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Ví dụ: khách có trẻ nhỏ..."
                                className="w-full resize-none rounded-xl border border-gray-200 py-2.5 pl-10 pr-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 border-t pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                        >
                            Hủy
                        </button>

                        <button
                            disabled={loading}
                            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? "Đang tạo..." : "Tạo đặt bàn"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}