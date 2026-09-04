import { useEffect, useState } from "react";
import { Send, Check } from "lucide-react";

import adminService from "../../../../services/admin.service";
import NotiModal from "../../../../components/NotiModal/NotiModal";

function AccountSection() {
    const [profile, setProfile] = useState(null);
    const [editingEmail, setEditingEmail] = useState(false);
    const [newEmail, setNewEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const [notification, setNotification] = useState({
        open: false,
        type: "success",
        title: "",
        message: "",
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const res = await adminService.getProfile();
            const data = res.data || res;
            setProfile(data);
        } catch (error) {
            console.error(error);
        }
    };

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

    const handleRequestOtp = async () => {
        if (!newEmail.trim()) {
            showNotification({
                type: "warning",
                title: "Thiếu thông tin",
                message: "Vui lòng nhập email mới.",
            });
            return;
        }

        try {
            setLoading(true);

            await adminService.requestChangeEmail(newEmail);

            setOtpSent(true);

            showNotification({
                type: "success",
                title: "Đã gửi OTP",
                message: "Mã OTP đã được gửi đến email mới.",
            });
        } catch (error) {
            showNotification({
                type: "error",
                title: "Không thể gửi OTP",
                message:
                    error.response?.data?.message ||
                    "Không thể gửi OTP.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp.trim()) {
            showNotification({
                type: "warning",
                title: "Thiếu thông tin",
                message: "Vui lòng nhập OTP.",
            });
            return;
        }

        try {
            setLoading(true);

            await adminService.verifyChangeEmail(otp);

            setEditingEmail(false);
            setOtpSent(false);
            setNewEmail("");
            setOtp("");

            await loadProfile();

            showNotification({
                type: "success",
                title: "Đổi email thành công",
                message: "Email đăng nhập đã được cập nhật.",
            });
        } catch (error) {
            showNotification({
                type: "error",
                title: "Xác nhận thất bại",
                message:
                    error.response?.data?.message ||
                    "OTP không hợp lệ.",
            });
        } finally {
            setLoading(false);
        }
    };

    if (!profile) {
        return (
            <section className="rounded-xl border bg-white p-6">
                Đang tải thông tin tài khoản...
            </section>
        );
    }

    return (
        <>
            <section className="rounded-xl border border-[var(--color-border)] bg-white p-6">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-[var(--color-text)]">
                        Tài khoản
                    </h2>

                    <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                        Quản lý thông tin đăng nhập
                    </p>
                </div>

                <div>
                    <label className="mb-2 block font-medium">
                        Email đăng nhập
                    </label>

                    <div className="flex gap-3">
                        <input
                            type="email"
                            value={profile.email || ""}
                            disabled
                            className="flex-1 rounded-lg border bg-gray-100 px-4 py-3"
                        />

                        {!editingEmail && (
                            <button
                                type="button"
                                onClick={() => setEditingEmail(true)}
                                className="rounded-lg bg-[var(--color-primary)] px-4 py-3 text-white"
                            >
                                Sửa email
                            </button>
                        )}
                    </div>
                </div>

                {editingEmail && (
                    <div className="mt-6 rounded-xl border bg-gray-50 p-5">
                        <h3 className="mb-4 font-semibold">
                            Đổi email
                        </h3>

                        <div className="mb-4 flex gap-3">
                            <input
                                type="email"
                                value={newEmail}
                                onChange={(e) =>
                                    setNewEmail(e.target.value)
                                }
                                placeholder="Nhập email mới"
                                className="flex-1 rounded-lg border px-4 py-3 outline-none"
                            />

                            <button
                                type="button"
                                disabled={loading}
                                onClick={handleRequestOtp}
                                className="flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-3 text-white disabled:opacity-50"
                            >
                                <Send size={18} />
                                {loading ? "Đang gửi..." : "Gửi OTP"}
                            </button>
                        </div>

                        {otpSent && (
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) =>
                                        setOtp(e.target.value)
                                    }
                                    placeholder="Nhập mã OTP"
                                    maxLength={6}
                                    className="flex-1 rounded-lg border px-4 py-3 outline-none"
                                />

                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={handleVerifyOtp}
                                    className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-white disabled:opacity-50"
                                >
                                    <Check size={18} />
                                    Xác nhận
                                </button>
                            </div>
                        )}
                    </div>
                )}
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

export default AccountSection;