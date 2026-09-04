import { useEffect, useState } from "react";
import { X } from "lucide-react";

import Button from "../../../components/Button/Button";
import NotiModal from "../../../components/NotiModal/NotiModal";

export default function FloorModal({
    open,
    floor,
    onClose,
    onSave,
}) {
    const [floorNumber, setFloorNumber] = useState("");

    const [notification, setNotification] = useState({
        open: false,
        type: "warning",
        title: "",
        message: "",
    });

    // INIT FORM
    useEffect(() => {
        if (!open) return;

        setFloorNumber( floor?.floorNumber?.toString() || "");
    }, [open, floor]);

    // NOTIFICATION
    const showNotification = ({
        type = "warning",
        title,
        message,
    }) => {
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

    // SUBMIT
    const handleSubmit = () => {
        const value = Number(floorNumber);

        if (!floorNumber.trim()) {
            showNotification({
                type: "warning",
                title: "Thiếu thông tin",
                message: "Vui lòng nhập số tầng.",
            });
            return;
        }

        if (!Number.isInteger(value) || value <= 0) {
            showNotification({
                type: "warning",
                title: "Số tầng không hợp lệ",
                message: "Số tầng phải là số nguyên lớn hơn 0.",
            });
            return;
        }

        onSave({
            floorNumber: value,
        });
    };

    if (!open) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5 backdrop-blur-[2px]">
                <div
                    className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* HEADER */}
                    <div className="flex items-center justify-between border-b p-5">
                        <h2 className="text-xl font-bold text-gray-800">
                            {floor ? "Chỉnh sửa tầng" : "Thêm tầng"}
                        </h2>

                        <button
                            type="button"
                            onClick={onClose}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* BODY */}
                    <div className="space-y-5 p-5">
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Số tầng
                            </label>

                            <input
                                type="number"
                                min="1"
                                value={floorNumber}
                                onChange={(e) => setFloorNumber( e.target.value)}
                                placeholder="Ví dụ: 1"
                                className="w-full rounded-lg border border-gray-300 p-3 outline-none transition focus:border-[var(--color-border)]"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleSubmit();
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* FOOTER */}
                    <div className="flex justify-end gap-3 border-t p-5">
                        <Button
                            type="button"
                            className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                            onClick={onClose}
                        >
                            Hủy
                        </Button>

                        <Button
                            type="button"
                            onClick={handleSubmit}
                        >
                            {floor ? "Lưu thay đổi"  : "Thêm tầng"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* VALIDATION NOTIFICATION */}
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