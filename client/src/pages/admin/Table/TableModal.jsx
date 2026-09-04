import { useEffect, useState } from "react";
import { X, RefreshCw, QrCode } from "lucide-react";
import QRCode from "qrcode";

import Button from "../../../components/Button/Button";
import NotiModal from "../../../components/NotiModal/NotiModal";

import tableService from "../../../services/table.service";

const EMPTY_FORM = {
    tableNumber: "",
    floorId: "",
    capacity: 4,
    qrCode: "",
};

export default function TableModal({
    open,
    floors = [],
    table = null,
    onClose,
    reload,
}) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [qrImage, setQrImage] = useState("");

    const [notification, setNotification] = useState({
        open: false,
        type: "warning",
        title: "",
        message: "",
    });

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

    const getErrorMessage = (
        error,
        fallback = "Đã xảy ra lỗi."
    ) =>
        error?.response?.data?.message ||
        error?.message ||
        fallback;

    // GENERATE QR CODE
    const generateQR = () => `QR-${Date.now().toString(36).toUpperCase()}`;

    // CUSTOMER URL

    const getCustomerUrl = (qrCode) => {
        if (!qrCode) return "";

        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const frontendUrl = apiUrl.replace(/\/api\/?$/, "");

        return `${frontendUrl}/customer/account/${qrCode}`;
    };

    // INIT FORM

    useEffect(() => {
        if (!open) return;

        if (table) {
            setForm({
                tableNumber: table.tableNumber ?? "",
                floorId: table.floorId ?? "",
                capacity: table.capacity || 4,
                qrCode: table.qrCode || "",
            });

            return;
        }

        setForm({
            tableNumber: "",
            floorId: floors[0]?.id ?? "",
            capacity: 4,
            qrCode: generateQR(),
        });
    }, [open, table, floors]);

    // GENERATE QR IMAGE
    useEffect(() => {
        if (!open || !form.qrCode) {
            setQrImage("");
            return;
        }

        const customerUrl = getCustomerUrl(form.qrCode);

        QRCode.toDataURL(customerUrl, {
            width: 300,
            margin: 2,
        })
            .then(setQrImage)
            .catch((error) => {
                console.error("QR ERROR:", error);

                setQrImage("");

                showNotification({
                    type: "error",
                    title: "Không thể tạo QR",
                    message:
                        "Không thể tạo hình ảnh QR Code. Vui lòng thử lại.",
                });
            });
    }, [open, form.qrCode]);

    // CHANGE FORM
    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // SAVE TABLE
    const handleSubmit = async () => {
        if (!form.tableNumber) {
            showNotification({
                type: "warning",
                title: "Thiếu số bàn",
                message: "Vui lòng nhập số bàn.",
            });
            return;
        }

        if ( !form.capacity || Number(form.capacity) < 1) {
            showNotification({
                type: "warning",
                title: "Số người không hợp lệ",
                message:
                    "Số người tối đa phải lớn hơn hoặc bằng 1.",
            });
            return;
        }

        if (!form.floorId) {
            showNotification({
                type: "warning",
                title: "Chưa chọn tầng",
                message: "Vui lòng chọn tầng cho bàn.",
            });
            return;
        }

        try {
            const data = {
                tableNumber: Number(form.tableNumber),
                floorId: Number(form.floorId),
                capacity: Number(form.capacity),
            };

            if (table) {
                await tableService.update(
                    table.id,
                    data
                );

                showNotification({
                    type: "success",
                    title: "Cập nhật thành công",
                    message: "Thông tin bàn đã được cập nhật.",
                });
            } else {
                await tableService.create(data);

                showNotification({
                    type: "success",
                    title: "Thêm bàn thành công",
                    message: "Bàn mới đã được thêm thành công.",
                });
            }

            await reload();
            onClose();
        } catch (error) {
            console.error("Lỗi lưu bàn:", error);

            showNotification({
                type: "error",
                title: table
                    ? "Không thể cập nhật bàn"
                    : "Không thể thêm bàn",
                message: getErrorMessage(
                    error,
                    "Đã xảy ra lỗi khi lưu thông tin bàn."
                ),
            });
        }
    };

    // REGENERATE QR
    const handleRegenerateQR = () => {
        setForm((prev) => ({
            ...prev,
            qrCode: generateQR(),
        }));
    };

    // DOWNLOAD QR
    const handleDownloadQR = () => {
        if (!qrImage) {
            showNotification({
                type: "warning",
                title: "Chưa có QR Code",
                message:
                    "Vui lòng chờ QR Code được tạo trước khi tải.",
            });
            return;
        }

        const link = document.createElement("a");

        link.href = qrImage;
        link.download = `QR-Ban-${form.tableNumber || "table"}.png`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // CLOSE
    const handleClose = () => {
        closeNotification();
        onClose();
    };

    if (!open) return null;

    const customerUrl = getCustomerUrl(form.qrCode);

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5 backdrop-blur-[2px]">
                <div
                    className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl"
                    onClick={(event) => event.stopPropagation()}
                >
                    {/* HEADER */}
                    <div className="flex items-center justify-between border-b p-5">
                        <h2 className="text-xl font-bold text-gray-800">
                            {table ? "Chỉnh sửa bàn" : "Thêm bàn"}
                        </h2>

                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* BODY */}
                    <div className="space-y-5 p-6">
                        {/* TẦNG */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Tầng
                            </label>

                            <select
                                name="floorId"
                                value={form.floorId}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 p-3 outline-none transition focus:border-[var(--color-border)]"
                            >
                                <option value="">
                                    Chọn tầng
                                </option>

                                {floors.map((floor) => (
                                    <option
                                        key={floor.id}
                                        value={floor.id}
                                    >
                                        {floor.name || `Tầng ${floor.floorNumber}`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* SỐ BÀN */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Số bàn
                            </label>

                            <input
                                type="number"
                                min="1"
                                name="tableNumber"
                                value={form.tableNumber}
                                onChange={handleChange}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                        handleSubmit();
                                    }
                                }}
                                className="w-full rounded-lg border border-gray-300 p-3 outline-none transition focus:border-[var(--color-border)]"
                                placeholder="Ví dụ: 1"
                            />
                        </div>

                        {/* SỐ NGƯỜI */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Số người tối đa
                            </label>

                            <input
                                type="number"
                                min="1"
                                name="capacity"
                                value={form.capacity}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 p-3 outline-none transition focus:border-[var(--color-border)]"
                                placeholder="Ví dụ: 4"
                            />
                        </div>

                        {/* QR CODE */}
                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <label className="text-sm font-semibold text-gray-700">
                                    QR Code
                                </label>

                                <button
                                    type="button"
                                    onClick={
                                        handleRegenerateQR
                                    }
                                    className="flex items-center gap-1 text-sm text-gray-500 transition hover:text-gray-900"
                                >
                                    <RefreshCw size={16}/>
                                    Tạo lại
                                </button>
                            </div>

                            <input
                                readOnly
                                value={form.qrCode}
                                className="w-full rounded-lg border border-gray-300 bg-gray-100 p-3 text-sm text-gray-600 outline-none"
                            />
                        </div>

                        {/* QR PREVIEW */}
                        {qrImage && (
                            <div className="rounded-xl border bg-gray-50 p-4">
                                <div className="mb-3 flex items-center justify-center gap-2 font-semibold text-gray-700">
                                    <QrCode size={18} />
                                    QR gọi món
                                </div>

                                <div className="flex justify-center">
                                    <img
                                        src={qrImage}
                                        alt="QR Code"
                                        className="h-56 w-56 rounded-lg bg-white p-2"
                                    />
                                </div>

                                <div className="mt-3 break-all rounded-lg bg-white p-3 text-xs text-gray-500">
                                    {customerUrl}
                                </div>

                                <Button
                                    type="button"
                                    className="mt-3 w-full"
                                    onClick={handleDownloadQR}
                                >
                                    Tải QR Code
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* FOOTER */}
                    <div className="flex justify-end gap-3 border-t p-5">
                        <Button
                            type="button"
                            className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                            onClick={handleClose}
                        >
                            Hủy
                        </Button>

                        <Button
                            type="button"
                            onClick={handleSubmit}
                        >
                            {table ? "Lưu thay đổi" : "Thêm bàn"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* NOTIFICATION */}
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