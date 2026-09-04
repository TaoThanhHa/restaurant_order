import { useEffect, useState } from "react";
import { X } from "lucide-react";

import Button from "../../../components/Button/Button";
import NotiModal from "../../../components/NotiModal/NotiModal";
import staffService from "../../../services/staff.service";

const INITIAL_FORM = {
    username: "",
    email: "",
    role: "ORDER",
};

const ROLE_OPTIONS = [
    {
        value: "CASHIER",
        label: "Thu ngân",
    },
    {
        value: "ORDER",
        label: "Nhân viên order",
    },
    {
        value: "KITCHEN",
        label: "Nhân viên bếp",
    },
    {
        value: "WAREHOUSE",
        label: "Nhân viên kho",
    },
];

export default function StaffFormModal({
    open,
    onClose,
    reload,
    branchId,
    staff,
}) {
    const [form, setForm] = useState(INITIAL_FORM);
    const [loading, setLoading] = useState(false);

    const [notification, setNotification] = useState({
        open: false,
        type: "success",
        title: "",
        message: "",
    });

    useEffect(() => {
        if (!open) return;

        setForm(
            staff ? {
                username: staff.username || "",
                email: staff.email || "",
                role: staff.role?.name || "ORDER",
            } : { ...INITIAL_FORM }
        );
    }, [staff, open]);

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

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!branchId) {
            showNotification(
                "error",
                "Không xác định được chi nhánh."
            );
            return;
        }

        const payload = {
            username: form.username.trim(),
            email: form.email.trim().toLowerCase(),
            role: form.role,
        };

        if (!payload.username) {
            showNotification(
                "warning",
                "Vui lòng nhập tên tài khoản."
            );
            return;
        }

        if (!payload.email) {
            showNotification(
                "warning",
                "Vui lòng nhập email."
            );
            return;
        }

        try {
            setLoading(true);

            if (staff) {
                await staffService.update(
                    branchId,
                    staff.id,
                    payload
                );

                await reload();
                onClose();

                showNotification(
                    "success",
                    "Cập nhật nhân viên thành công."
                );
            } else {
                await staffService.create(
                    branchId,
                    payload
                );

                await reload();
                onClose();

                showNotification(
                    "success",
                    "Tạo nhân viên thành công. Thông tin đăng nhập đã được gửi qua email."
                );
            }
        } catch (err) {
            console.error(
                "STAFF SUBMIT ERROR:",
                err
            );

            showNotification(
                "error",
                err.response?.data?.message ||
                    err.message ||
                    "Có lỗi xảy ra khi lưu nhân viên."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (loading) return;

        setForm({ ...INITIAL_FORM });
        onClose();
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
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                onMouseDown={(e) => {
                    if ( e.target ===  e.currentTarget && !loading
                    ) {
                        handleClose();
                    }
                }}
            >
                <div
                    className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl"
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    {/* HEADER */}
                    <div className="flex items-center justify-between border-b p-5">
                        <div>
                            <h2 className="text-xl font-bold">
                                {staff
                                    ? "Cập nhật nhân viên"
                                    : "Thêm nhân viên"}
                            </h2>

                            {!staff && (
                                <p className="mt-1 text-sm text-gray-500">
                                    Mật khẩu tạm thời sẽ
                                    được gửi qua email.
                                </p>
                            )}
                        </div>

                        <button
                            type="button"
                            disabled={loading}
                            onClick={handleClose}
                            className="rounded-lg p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <X size={22} />
                        </button>
                    </div>

                    {/* FORM */}
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5 p-5"
                    >
                        {/* USERNAME */}
                        <div>
                            <label className="mb-1 block font-medium">
                                Tên tài khoản *
                            </label>

                            <input
                                type="text"
                                name="username"
                                value={form.username}
                                onChange={handleChange}
                                disabled={loading}
                                placeholder="Nhập tên tài khoản"
                                autoComplete="username"
                                className="w-full rounded-lg border p-3 outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] disabled:bg-gray-100"
                                required
                            />
                        </div>

                        {/* EMAIL */}
                        <div>
                            <label className="mb-1 block font-medium">
                                Email *
                            </label>

                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                disabled={loading}
                                placeholder="example@gmail.com"
                                autoComplete="email"
                                className="w-full rounded-lg border p-3 outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] disabled:bg-gray-100"
                                required
                            />
                        </div>

                        {/* ROLE */}
                        <div>
                            <label className="mb-1 block font-medium">
                                Chức vụ *
                            </label>

                            <select
                                name="role"
                                value={form.role}
                                onChange={handleChange}
                                disabled={loading}
                                className="w-full rounded-lg border p-3 outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] disabled:bg-gray-100"
                            >
                                {ROLE_OPTIONS.map(
                                    (role) => (
                                        <option
                                            key={ role.value }
                                            value={ role.value }
                                        >
                                            { role.label }
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        {/* BUTTONS */}
                        <div className="flex justify-end gap-3 border-t pt-5">
                            <Button
                                type="button"
                                disabled={loading}
                                className="!bg-gray-400"
                                onClick={handleClose}
                            >
                                Hủy
                            </Button>

                            <Button
                                type="submit"
                                disabled={loading}
                            >
                                {loading
                                    ? "Đang lưu..."
                                    : staff
                                    ? "Cập nhật"
                                    : "Tạo nhân viên"}
                            </Button>
                        </div>
                    </form>
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