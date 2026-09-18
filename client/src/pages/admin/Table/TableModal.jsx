import { useEffect, useState } from "react";
import {
    X,
    RefreshCw,
    QrCode,
} from "lucide-react";
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
    onSuccess,
}) {
    const [form, setForm] =
        useState(EMPTY_FORM);

    const [qrImage, setQrImage] =
        useState("");

    const [notification, setNotification] =
        useState({
            open: false,
            type: "warning",
            title: "",
            message: "",
        });

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
    ) => {
        return (
            error?.response?.data?.message ||
            error?.message ||
            fallback
        );
    };

    const generateQR = () => {
        return `QR-${Date.now()
            .toString(36)
            .toUpperCase()}`;
    };

    const getCustomerUrl = (qrCode) => {
        if (!qrCode) return "";

        const apiUrl =
            import.meta.env.VITE_API_URL ||
            "http://localhost:5000/api";

        const frontendUrl = apiUrl.replace(
            /\/api\/?$/,
            ""
        );

        return `${frontendUrl}/customer/account/${qrCode}`;
    };

    /*
     * Chỉ khởi tạo form khi:
     * - modal mở
     * - chuyển sang bàn khác
     *
     * Không thêm `floors` vào dependency.
     *
     * Vì sau khi update:
     * reload()
     *   ↓
     * floors thay đổi
     *
     * Nếu floors nằm trong dependency,
     * form sẽ bị reset về dữ liệu cũ.
     */
    useEffect(() => {
        if (!open) return;

        closeNotification();

        if (table) {
            setForm({
                tableNumber:
                    table.tableNumber ?? "",
                floorId:
                    table.floorId ?? "",
                capacity:
                    table.capacity ?? 4,
                qrCode:
                    table.qrCode || "",
            });

            return;
        }

        setForm({
            tableNumber: "",
            floorId:
                floors[0]?.id ?? "",
            capacity: 4,
            qrCode: generateQR(),
        });
    }, [open, table?.id]);

    /*
     * Tạo QR image.
     */
    useEffect(() => {
        if (!open || !form.qrCode) {
            setQrImage("");
            return;
        }

        const customerUrl =
            getCustomerUrl(
                form.qrCode
            );

        QRCode.toDataURL(
            customerUrl,
            {
                width: 300,
                margin: 2,
            }
        )
            .then((url) => {
                setQrImage(url);
            })
            .catch((error) => {
                console.error(
                    "QR ERROR:",
                    error
                );

                setQrImage("");

                showNotification({
                    type: "error",
                    title: "Không thể tạo QR",
                    message:
                        "Không thể tạo hình ảnh QR Code. Vui lòng thử lại.",
                });
            });
    }, [
        open,
        form.qrCode,
    ]);

    /*
     * Thay đổi form.
     *
     * Không ép Number ở đây.
     * Input sẽ giữ đúng giá trị người dùng nhập.
     */
    const handleChange = (event) => {
        const {
            name,
            value,
        } = event.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    /*
     * Lưu bàn.
     */
    const handleSubmit = async () => {
        /*
         * Validate số bàn.
         */
        if (
            form.tableNumber === "" ||
            Number(form.tableNumber) < 1
        ) {
            showNotification({
                type: "warning",
                title: "Số bàn không hợp lệ",
                message:
                    "Số bàn phải lớn hơn hoặc bằng 1.",
            });

            return;
        }

        /*
         * Validate số người.
         *
         * KHÔNG yêu cầu chia hết cho 4.
         *
         * 1, 2, 3, 4, 5, 6, 7, 8...
         * đều hợp lệ.
         */
        if (
            form.capacity === "" ||
            Number(form.capacity) < 1
        ) {
            showNotification({
                type: "warning",
                title: "Số người không hợp lệ",
                message:
                    "Số người tối đa phải lớn hơn hoặc bằng 1.",
            });

            return;
        }

        /*
         * Validate tầng.
         */
        if (!form.floorId) {
            showNotification({
                type: "warning",
                title: "Chưa chọn tầng",
                message:
                    "Vui lòng chọn tầng cho bàn.",
            });

            return;
        }

        try {
            const data = {
                tableNumber:
                    Number(form.tableNumber),

                floorId:
                    Number(form.floorId),

                capacity:
                    Number(form.capacity),
            };

            console.log("TABLE SAVE DATA:",data);

            if (table) {
                await tableService.update(
                    table.id,
                    data
                );

                /*
                 * Reload dữ liệu mới.
                 */
                await reload();

                /*
                 * Đóng modal.
                 */
                onClose();

                /*
                 * Notification nằm ở parent.
                 * Vì vậy khi TableModal đóng,
                 * notification vẫn hiển thị.
                 */
                onSuccess?.({
                    type: "success",
                    title: "Cập nhật thành công",
                    message:
                        "Thông tin bàn đã được cập nhật.",
                });

                return;
            }

            /*
             * CREATE
             */
            await tableService.create(data);

            await reload();

            onClose();

            onSuccess?.({
                type: "success",
                title: "Thêm bàn thành công",
                message:
                    "Bàn mới đã được thêm thành công.",
            });
        } catch (error) {
            console.error(
                "Lỗi lưu bàn:",
                error
            );

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

    /*
     * Tạo lại QR.
     */
    const handleRegenerateQR = () => {
        setForm((prev) => ({
            ...prev,
            qrCode: generateQR(),
        }));
    };

    /*
     * Download QR.
     */
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

        const link =
            document.createElement("a");

        link.href = qrImage;

        link.download = `QR-Ban-${
            form.tableNumber ||
            "table"
        }.png`;

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);
    };

    /*
     * Đóng modal.
     */
    const handleClose = () => {
        closeNotification();

        setForm(EMPTY_FORM);
        setQrImage("");

        onClose();
    };

    if (!open) {
        return null;
    }

    const customerUrl =
        getCustomerUrl(
            form.qrCode
        );

    return (
        <>
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5 backdrop-blur-[2px]"
                onClick={handleClose}
            >
                <div
                    className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl"
                    onClick={(event) =>
                        event.stopPropagation()
                    }
                >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b p-5">
                        <h2 className="text-xl font-bold text-gray-800">
                            {table
                                ? "Chỉnh sửa bàn"
                                : "Thêm bàn"}
                        </h2>

                        <button
                            type="button"
                            onClick={
                                handleClose
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="space-y-5 p-6">
                        {/* Tầng */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Tầng
                            </label>

                            <select
                                name="floorId"
                                value={
                                    form.floorId
                                }
                                onChange={
                                    handleChange
                                }
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-blue-500"
                            >
                                <option value="">
                                    -- Chọn tầng --
                                </option>

                                {floors.map(
                                    (floor) => (
                                        <option
                                            key={
                                                floor.id
                                            }
                                            value={
                                                floor.id
                                            }
                                        >
                                            {floor.name ||
                                                `Tầng ${floor.floorNumber}`}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        {/* Số bàn */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Số bàn
                            </label>

                            <input
                                type="number"
                                name="tableNumber"
                                min="1"
                                value={
                                    form.tableNumber
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Nhập số bàn"
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
                            />
                        </div>

                        {/* Số người tối đa */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Số người tối đa
                            </label>

                            <input
                                type="number"
                                name="capacity"
                                min="1"
                                value={
                                    form.capacity
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Nhập số người tối đa"
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
                            />

                            <p className="mt-1 text-xs text-gray-400">
                                Có thể nhập bất kỳ số
                                người nào từ 1 trở lên.
                            </p>
                        </div>

                        {/* QR */}
                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <label className="block text-sm font-medium text-gray-700">
                                    QR Code
                                </label>

                                <button
                                    type="button"
                                    onClick={
                                        handleRegenerateQR
                                    }
                                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                                >
                                    <RefreshCw
                                        size={15}
                                    />

                                    Tạo lại
                                </button>
                            </div>

                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                                {qrImage ? (
                                    <div className="flex flex-col items-center">
                                        <img
                                            src={
                                                qrImage
                                            }
                                            alt="QR Code"
                                            className="h-[220px] w-[220px]"
                                        />

                                        <p className="mt-3 break-all text-center text-xs text-gray-500">
                                            {
                                                customerUrl
                                            }
                                        </p>

                                        <button
                                            type="button"
                                            onClick={
                                                handleDownloadQR
                                            }
                                            className="mt-3 flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
                                        >
                                            <QrCode
                                                size={
                                                    16
                                                }
                                            />

                                            Tải QR Code
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex h-[220px] items-center justify-center text-sm text-gray-400">
                                        Đang tạo QR
                                        Code...
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 border-t p-5">
                        <Button
                            type="button"
                            onClick={
                                handleClose
                            }
                        >
                            Hủy
                        </Button>

                        <Button
                            type="button"
                            onClick={
                                handleSubmit
                            }
                        >
                            {table
                                ? "Lưu thay đổi"
                                : "Thêm bàn"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Notification lỗi / validation */}
            <NotiModal
                open={
                    notification.open
                }
                type={
                    notification.type
                }
                title={
                    notification.title
                }
                message={
                    notification.message
                }
                onClose={
                    closeNotification
                }
            />
        </>
    );
}