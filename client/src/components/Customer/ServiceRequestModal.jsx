import { useState } from "react";
import { X, BellRing } from "lucide-react";

import serviceRequestService from "../../services/serviceRequest.service";
import NotiModal from "../../components/NotiModal/NotiModal";

export default function ServiceRequestModal({
    open,
    table,
    onClose,
    onSuccess,
}) {
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const [notification, setNotification] = useState({
        open: false,
        type: "success",
        title: "",
        message: "",
    });

    const showNotification = (
        type,
        message,
        title = ""
    ) => {
        setNotification({
            open: true,
            type,
            title,
            message,
        });
    };

    const closeNotification = () => {
        setNotification((prev) => ({
            ...prev,
            open: false,
        }));
    };

    const handleSubmit = async () => {
        if (!message.trim()) {
            showNotification(
                "warning",
                "Vui lòng nhập yêu cầu cần nhân viên hỗ trợ."
            );

            return;
        }

        if (!table?.qrCode) {
            showNotification(
                "error",
                "Không xác định được thông tin bàn."
            );

            return;
        }

        try {
            setLoading(true);

            const res = await serviceRequestService.create({
                qrCode: table.qrCode,
                message: message.trim(),
            });

            setMessage("");

            if (onSuccess) {
                onSuccess(res?.data);
            }

            onClose();

            showNotification(
                "success",
                "Đã gửi yêu cầu. Nhân viên sẽ hỗ trợ bạn trong thời gian sớm nhất."
            );
        } catch (error) {
            showNotification(
                "error",
                error.response?.data?.message ||
                    error.message ||
                    "Không thể gửi yêu cầu. Vui lòng thử lại."
            );
        } finally {
            setLoading(false);
        }
    };

    if (!open) {
        return (
            <NotiModal
                open={notification.open}
                type={notification.type}
                title={notification.title}
                message={notification.message}
                onClose={closeNotification}
            />
        );
    }

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
                    {/* HEADER */}

                    <div className="flex items-center justify-between border-b p-5">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-orange-100 p-2 text-orange-600">
                                <BellRing size={22} />
                            </div>

                            <div>
                                <h2 className="font-bold">
                                    Gọi nhân viên
                                </h2>

                                <p className="text-xs text-gray-500">
                                    Bàn {table?.tableNumber}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg p-2 hover:bg-gray-100"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* BODY */}

                    <div className="p-5">
                        <label className="mb-2 block font-semibold">
                            Bạn cần nhân viên hỗ trợ gì?
                        </label>

                        <textarea
                            value={message}
                            onChange={(e) =>
                                setMessage(e.target.value)
                            }
                            rows={4}
                            maxLength={500}
                            placeholder="Ví dụ: Cho tôi thêm 2 chai nước..."
                            className="w-full resize-none rounded-xl border p-3 outline-none focus:border-orange-500"
                        />

                        <p className="mt-1 text-right text-xs text-gray-400">
                            {message.length}/500
                        </p>
                    </div>

                    {/* FOOTER */}

                    <div className="flex gap-3 border-t p-5">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 rounded-xl bg-gray-100 py-3 font-semibold transition hover:bg-gray-200 disabled:opacity-60"
                        >
                            Hủy
                        </button>

                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex-1 rounded-xl bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
                        >
                            {loading
                                ? "Đang gửi..."
                                : "Gửi yêu cầu"}
                        </button>
                    </div>
                </div>
            </div>

            <NotiModal
                open={notification.open}
                type={notification.type}
                title={notification.title}
                message={notification.message}
                onClose={closeNotification}
            />
        </>
    );
}