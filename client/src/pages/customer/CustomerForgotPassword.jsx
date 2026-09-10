import { ArrowLeft, Lock, Mail, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import NotiModal from "../../components/NotiModal/NotiModal";
import customerAuthService from "../../services/customerAuth.service";

import styles from "./Customer.module.css";

export default function CustomerForgotPassword() {
    const navigate = useNavigate();
    const { qrCode } = useParams();

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
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const showNoti = (type, title, message) => {
        setNoti({ open: true, type, title, message });
    };

    const closeNoti = () => {
        setNoti((prev) => ({ ...prev, open: false }));
    };

    const handleSendOtp = async () => {
        if (!form.email.trim()) {
            showNoti("warning", "Thiếu thông tin", "Vui lòng nhập email.");
            return;
        }

        try {
            setLoading(true);
            await customerAuthService.forgotPassword(form.email.trim());

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
            showNoti("warning", "Thiếu thông tin", "Vui lòng nhập mã OTP.");
            return;
        }

        try {
            setLoading(true);
            await customerAuthService.verifyOtp({
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
            showNoti("warning", "Thiếu thông tin", "Vui lòng nhập mật khẩu mới.");
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
            await customerAuthService.resetPassword({
                email: form.email.trim(),
                otp: form.otp.trim(),
                password: form.password,
            });

            showNoti(
                "success",
                "Đổi mật khẩu thành công",
                "Mật khẩu đã được cập nhật. Vui lòng đăng nhập lại."
            );

            setTimeout(() => {
                navigate(`/customer/login/${qrCode}`, { replace: true });
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

    const handleBackLogin = () => {
        navigate(`/customer/login/${qrCode}`);
    };

    return (
        <>
            <div
                className={`flex min-h-screen items-center justify-center px-4 ${styles.section}`}
            >
                <div className="w-full max-w-sm rounded-3xl bg-white/90 p-8 shadow-2xl backdrop-blur">
                    <button
                        type="button"
                        onClick={handleBackLogin}
                        className="flex items-center gap-2 text-gray-600 hover:text-[#4f7d4f]"
                    >
                        <ArrowLeft size={18} />
                        Quay lại đăng nhập
                    </button>

                    <h1 className="mt-6 text-center text-3xl font-bold">
                        Quên mật khẩu
                    </h1>

                    <p className="mt-2 text-center text-gray-500">
                        {step === 1 && "Nhập email để nhận mã OTP"}
                        {step === 2 && "Nhập mã OTP đã được gửi đến email"}
                        {step === 3 && "Tạo mật khẩu mới cho tài khoản"}
                    </p>

                    {step === 1 && (
                        <div className="mt-8">
                            <Input
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                icon={<Mail size={18} />}
                                placeholder="Email"
                            />

                            <div className="mt-8">
                                <Button
                                    type="button"
                                    onClick={handleSendOtp}
                                    disabled={loading}
                                    className="w-full"
                                >
                                    {loading ? "Đang gửi..." : "Gửi mã OTP"}
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="mt-8">
                            <Input
                                name="otp"
                                value={form.otp}
                                onChange={handleChange}
                                icon={<ShieldCheck size={18} />}
                                placeholder="Nhập mã OTP"
                            />

                            <div className="mt-8">
                                <Button
                                    type="button"
                                    onClick={handleVerifyOtp}
                                    disabled={loading}
                                    className="w-full"
                                >
                                    {loading
                                        ? "Đang xác thực..."
                                        : "Xác nhận OTP"}
                                </Button>
                            </div>

                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="mt-5 w-full text-center text-sm text-[#4f7d4f] hover:underline"
                            >
                                Nhập lại email
                            </button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="mt-8 space-y-5">
                            <Input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                icon={<Lock size={18} />}
                                placeholder="Mật khẩu mới"
                            />

                            <Input
                                type="password"
                                name="confirmPassword"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                icon={<Lock size={18} />}
                                placeholder="Nhập lại mật khẩu"
                            />

                            <div className="pt-3">
                                <Button
                                    type="button"
                                    onClick={handleResetPassword}
                                    disabled={loading}
                                    className="w-full"
                                >
                                    {loading
                                        ? "Đang cập nhật..."
                                        : "Đổi mật khẩu"}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

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