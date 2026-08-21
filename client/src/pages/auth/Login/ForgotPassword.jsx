import { useState } from "react";
import { Mail, Lock, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Input from "../../../components/Input/Input";
import Button from "../../../components/Button/Button";

import styles from "../Login/Login.module.css";

import authService from "../../../services/auth.service";

export default function ForgotPassword() {

    const navigate = useNavigate();

    const [step, setStep] = useState(1);

    const [form, setForm] = useState({
        email: "",
        otp: "",
        password: "",
        confirmPassword: "",
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {

        const { name, value } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: value,
        }));

    };


    const handleSendOtp = async () => {

        if (!form.email.trim()) {
            return alert("Vui lòng nhập email.");
        }

        try {

            setLoading(true);

            await authService.forgotPassword(form.email);

            alert("OTP đã được gửi.");

            setStep(2);

        } catch (err) {

            alert(
                err.response?.data?.message ||
                err.message
            );

        } finally {

            setLoading(false);

        }

    };

    //////////////////////////////////////////////////////

    const handleResetPassword = async () => {

        if (!form.otp.trim()) {
            return alert("Nhập OTP.");
        }

        if (!form.password.trim()) {
            return alert("Nhập mật khẩu.");
        }

        if (form.password !== form.confirmPassword) {
            return alert("Mật khẩu xác nhận không khớp.");
        }

        // await authService.resetPassword(form);

        try {

            setLoading(true);

            await authService.resetPassword({
                email: form.email,
                otp: form.otp,
                password: form.password,
            });

            alert("Đổi mật khẩu thành công.");

            navigate("/login");

        } catch (err) {

            alert(
                err.response?.data?.message ||
                err.message
            );

        } finally {

            setLoading(false);

        }

        navigate("/login");

    };

    return (

        <section className="flex justify-center py-20">

            <div className={styles.loginCard}>

                <h2 className={styles.loginTitle}>

                    Quên mật khẩu

                </h2>

                {
                    step === 1 && (

                        <div className="space-y-8">

                            <div className="flex items-center gap-5">

                                <label className="w-30">

                                    Email

                                </label>

                                <Input
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    icon={<Mail size={18}/>}
                                    placeholder="Nhập email chi nhánh"
                                />

                            </div>

                            <Button
                                onClick={handleSendOtp}
                                disabled={loading}
                            >

                                {
                                    loading
                                    ? "Đang gửi..."
                                    : "Gửi mã OTP"
                                }

                            </Button>

                        </div>

                    )
                }

                {
                    step === 2 && (

                        <div className="space-y-6">

                            <div className="flex items-center gap-5">

                                <label className="w-30">

                                    OTP

                                </label>

                                <Input
                                    name="otp"
                                    value={form.otp}
                                    onChange={handleChange}
                                    icon={<ShieldCheck size={18}/>}
                                    placeholder="Nhập OTP"
                                />

                            </div>

                            <div className="flex items-center gap-5">

                                <label className="w-30">

                                    Mật khẩu

                                </label>

                                <Input
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    icon={<Lock size={18}/>}
                                    placeholder="Mật khẩu mới"
                                />

                            </div>

                            <div className="flex items-center gap-5">

                                <label className="w-30">

                                    Xác nhận

                                </label>

                                <Input
                                    type="password"
                                    name="confirmPassword"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    icon={<Lock size={18}/>}
                                    placeholder="Nhập lại mật khẩu"
                                />

                            </div>

                            <Button
                                onClick={handleResetPassword}
                            >

                                Đổi mật khẩu

                            </Button>

                        </div>

                    )
                }

                <button
                    onClick={() => navigate("/login")}
                    className="mt-8 text-sm text-blue-600 hover:underline"
                >
                    ← Quay lại đăng nhập
                </button>

            </div>

        </section>

    );

}