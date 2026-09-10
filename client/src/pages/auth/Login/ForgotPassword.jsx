import { useState } from "react";
import { Mail, Lock, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Input from "../../../components/Input/Input";
import Button from "../../../components/Button/Button";
import NotiModal from "../../../components/NotiModal/NotiModal";

import styles from "./Login.module.css";

import authService from "../../../services/auth.service";

console.log("AUTH SERVICE:", authService);
console.log("VERIFY OTP:", authService.verifyOtp);
export default function ForgotPassword() {
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        email: "",
        otp: "",
        password: "",
        confirmPassword: "",
    });

    const [noti, setNoti] = useState({
        open: false,
        type: "success",
        title: "",
        message: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const showNoti = (type, title, message) => {
        setNoti({
            open: true,
            type,
            title,
            message,
        });
    };

    const closeNoti = () => {
        setNoti((prev) => ({
            ...prev,
            open: false,
        }));
    };

    const handleSendOtp = async () => {
        if (!form.email.trim()) {
            showNoti(
                "warning",
                "Thiếu thông tin",
                "Vui lòng nhập email."
            );
            return;
        }

        try {
            setLoading(true);

            await authService.forgotPassword(
                form.email.trim()
            );

            showNoti(
                "success",
                "Gửi OTP thành công",
                "Mã OTP đã được gửi đến email của bạn."
            );

            setStep(2);
        } catch (err) {
            showNoti(
                "error",
                "Không thể gửi OTP",
                err.response?.data?.message ||
                    err.message ||
                    "Đã xảy ra lỗi. Vui lòng thử lại."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!form.otp.trim()) {
            showNoti(
                "warning",
                "Thiếu thông tin",
                "Vui lòng nhập mã OTP."
            );
            return;
        }

        try {
            setLoading(true);

            await authService.verifyOtp({
                email: form.email.trim(),
                otp: form.otp.trim(),
            });

            showNoti(
                "success",
                "Xác thực thành công",
                "OTP hợp lệ. Bạn có thể đặt mật khẩu mới."
            );

            setStep(3);
        } catch (err) {
            showNoti(
                "error",
                "Xác thực thất bại",
                err.response?.data?.message ||
                    err.message ||
                    "OTP không hợp lệ."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!form.password.trim()) {
            showNoti(
                "warning",
                "Thiếu thông tin",
                "Vui lòng nhập mật khẩu mới."
            );
            return;
        }

        if (form.password.length < 6) {
            showNoti(
                "warning",
                "Mật khẩu chưa hợp lệ",
                "Mật khẩu phải có ít nhất 6 ký tự."
            );
            return;
        }

        if (!form.confirmPassword.trim()) {
            showNoti(
                "warning",
                "Thiếu thông tin",
                "Vui lòng xác nhận mật khẩu."
            );
            return;
        }

        if (form.password !== form.confirmPassword) {
            showNoti(
                "warning",
                "Mật khẩu không khớp",
                "Mật khẩu xác nhận không giống mật khẩu mới."
            );
            return;
        }

        try {
            setLoading(true);

            await authService.resetPassword({
                email: form.email.trim(),
                otp: form.otp.trim(),
                password: form.password,
            });

            showNoti(
                "success",
                "Đổi mật khẩu thành công",
                "Mật khẩu của bạn đã được cập nhật. Vui lòng đăng nhập lại."
            );

            setTimeout(() => {
                navigate("/login");
            }, 1200);
        } catch (err) {
            showNoti(
                "error",
                "Đổi mật khẩu thất bại",
                err.response?.data?.message ||
                    err.message ||
                    "Đã xảy ra lỗi. Vui lòng thử lại."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <section className={`${styles.bg} flex flex-col justify-center items-center`}>
                <div className={styles.loginCard}>
                    <h2 className={styles.loginTitle}>
                        Quên mật khẩu
                    </h2>

                    {step === 1 && (
                        <div className="space-y-8">
                            <div className="flex items-center mb-7">
                                <label className="w-20 shrink-0">
                                    Email
                                </label>

                                <Input
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    className="flex-1"
                                    icon={<Mail size={20} />}
                                    placeholder="Nhập mail của bạn"
                                />
                            </div>

                            <div className="flex justify-center">
                                <Button
                                    className={styles.btnLogin}
                                    onClick={handleSendOtp}
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Đang gửi..."
                                        : "Gửi mã OTP"}
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-8">
                            <div className="flex items-center mb-7">
                                <label className="w-20 shrink-0">
                                    OTP
                                </label>

                                <Input
                                    name="otp"
                                    value={form.otp}
                                    onChange={handleChange}
                                    className="flex-1"
                                    icon={<ShieldCheck size={20} />}
                                    placeholder="Nhập mã OTP"
                                />
                            </div>

                            <div className="flex justify-center">
                                <Button
                                    className={styles.btnLogin}
                                    onClick={handleVerifyOtp}
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Đang xác thực..."
                                        : "Xác nhận OTP"}
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-8">
                            <div className="flex items-center mb-7">
                                <label className="w-20 shrink-0">
                                    Mật khẩu
                                </label>

                                <Input
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    className="flex-1"
                                    icon={<Lock size={20} />}
                                    placeholder="Mật khẩu mới"
                                />
                            </div>

                            <div className="flex items-center mb-7">
                                <label className="w-20 shrink-0">
                                    Xác nhận
                                </label>

                                <Input
                                    type="password"
                                    name="confirmPassword"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    className="flex-1"
                                    icon={<Lock size={20} />}
                                    placeholder="Nhập lại mật khẩu"
                                />
                            </div>

                            <div className="flex justify-center">
                                <Button
                                    className={styles.btnLogin}
                                    onClick={handleResetPassword}
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Đang cập nhật..."
                                        : "Đổi mật khẩu"}
                                </Button>
                            </div>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="mt-8 text-sm text-blue-600 hover:underline"
                    >
                        ← Quay lại đăng nhập
                    </button>
                </div>
            </section>

            <NotiModal
                open={noti.open}
                type={noti.type}
                title={noti.title}
                message={noti.message}
                onClose={closeNoti}
            />
        </>
    );
}