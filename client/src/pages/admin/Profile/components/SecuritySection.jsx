import { useState } from "react";
import { Lock, Save } from "lucide-react";

import Button from "../../../../components/Button/Button";
import NotiModal from "../../../../components/NotiModal/NotiModal";
import adminService from "../../../../services/admin.service";

function SecuritySection() {
    const [form, setForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [loading, setLoading] = useState(false);

    const [notification, setNotification] = useState({
        open: false,
        type: "success",
        title: "",
        message: "",
    });

    const showNotification = ({
        type = "success",
        title = "",
        message = "",
    }) => {
        setNotification({
            open: true,
            type,
            title,
            message,
        });
    };

    const closeNotification = () => {
        setNotification({
            open: false,
            type: "success",
            title: "",
            message: "",
        });
    };

    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            !form.currentPassword ||
            !form.newPassword ||
            !form.confirmPassword
        ) {
            showNotification({
                type: "error",
                title: "Thiếu thông tin",
                message: "Vui lòng nhập đầy đủ thông tin.",
            });
            return;
        }

        if (form.newPassword.length < 6) {
            showNotification({
                type: "error",
                title: "Mật khẩu không hợp lệ",
                message: "Mật khẩu mới phải có ít nhất 6 ký tự.",
            });
            return;
        }

        if (form.newPassword !== form.confirmPassword) {
            showNotification({
                type: "error",
                title: "Mật khẩu không khớp",
                message: "Mật khẩu xác nhận không khớp.",
            });
            return;
        }

        try {
            setLoading(true);

            await adminService.changePassword({
                currentPassword: form.currentPassword,
                newPassword: form.newPassword,
            });

            showNotification({
                type: "success",
                title: "Đổi mật khẩu thành công",
                message: "Mật khẩu đăng nhập đã được cập nhật.",
            });

            setForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } catch (error) {
            showNotification({
                type: "error",
                title: "Không thể đổi mật khẩu",
                message:
                    error.response?.data?.message ||
                    "Không thể đổi mật khẩu.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <section className="rounded-xl border border-[var(--color-border)] bg-white p-6">
                <div className="mb-5">
                    <h2 className="text-xl font-bold text-[var(--color-text)]">
                        Bảo mật
                    </h2>

                    <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                        Thay đổi mật khẩu đăng nhập
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="max-w-xl mx-auto"
                >
                    <div className="mb-5">
                        <label className="mb-2 block font-medium">
                            Mật khẩu hiện tại
                        </label>

                        <div className="relative">
                            <Lock
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                                type="password"
                                name="currentPassword"
                                value={form.currentPassword}
                                onChange={handleChange}
                                className="w-full rounded-lg border py-3 pl-10 pr-4"
                            />
                        </div>
                    </div>

                    <div className="mb-5">
                        <label className="mb-2 block font-medium">
                            Mật khẩu mới
                        </label>

                        <input
                            type="password"
                            name="newPassword"
                            value={form.newPassword}
                            onChange={handleChange}
                            placeholder="Ít nhất 6 ký tự"
                            className="w-full rounded-lg border px-4 py-3"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="mb-2 block font-medium">
                            Xác nhận mật khẩu mới
                        </label>

                        <input
                            type="password"
                            name="confirmPassword"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            className="w-full rounded-lg border px-4 py-3"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="mx-auto"
                    >
                        <Save size={18} />

                        {loading
                            ? "Đang cập nhật..."
                            : "Đổi mật khẩu"}
                    </Button>
                </form>
            </section>

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

export default SecuritySection;