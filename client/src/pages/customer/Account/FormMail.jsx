import {
    ArrowLeft,
    Mail,
    ShieldCheck,
} from "lucide-react";

import { useState } from "react";

import Input from "../../../components/Input/Input";
import Button from "../../../components/Button/Button";

import customerService from "../../../services/customer.service";

export default function FormMail({
    profile,
    onBack,
    onSuccess,
}) {

    const [email, setEmail] = useState(
        profile?.email || ""
    );

    const [otp, setOtp] = useState("");

    const [step, setStep] = useState("email");

    const [loading, setLoading] = useState(false);


    // ============================================
    // GỬI OTP
    // ============================================

    const handleSendOtp = async (e) => {

        e.preventDefault();

        const value = email.trim();

        if (!value) {
            alert("Vui lòng nhập email.");
            return;
        }

        if (value === profile?.email) {
            alert("Email mới phải khác email hiện tại.");
            return;
        }

        try {

            setLoading(true);

            await customerService.sendChangeEmailOtp({
                email: value,
            });

            alert(
                "Mã OTP đã được gửi đến email mới."
            );

            setStep("otp");

        } catch (err) {

            alert(
                err.response?.data?.message ||
                err.message ||
                "Không thể gửi mã OTP."
            );

        } finally {

            setLoading(false);

        }

    };


    // ============================================
    // XÁC NHẬN OTP
    // ============================================

    const handleVerifyOtp = async (e) => {

        e.preventDefault();

        if (!otp.trim()) {

            alert("Vui lòng nhập mã OTP.");

            return;
        }

        try {

            setLoading(true);

            const res =
                await customerService.verifyChangeEmailOtp({
                    email: email.trim(),
                    otp: otp.trim(),
                });

            alert(
                "Đổi email thành công."
            );

            onSuccess(res);

        } catch (err) {

            alert(
                err.response?.data?.message ||
                err.message ||
                "Mã OTP không hợp lệ."
            );

        } finally {

            setLoading(false);

        }

    };


    return (

        <div className="min-h-screen bg-[var(--color-background)]">


            {/* HEADER */}

            <div className="bg-[var(--color-primary)] px-5 py-4 shadow-sm">

                <div className="flex items-center gap-3">

                    <button
                        type="button"
                        onClick={onBack}
                        className="rounded-full pt-1 text-white hover:bg-gray-100"
                    >

                        <ArrowLeft size={30} />

                    </button>

                    <h1 className="text-xl font-bold text-white">
                        Đổi email
                    </h1>

                </div>

            </div>


            <div className="p-5">

                <form
                    onSubmit={
                        step === "email"
                            ? handleSendOtp
                            : handleVerifyOtp
                    }
                    className="rounded-3xl bg-white p-6 shadow-sm"
                >

                    {/* EMAIL */}

                    {step === "email" && (

                        <>

                            <div className="mb-6">

                                <h2 className="text-lg font-bold">
                                    Email mới
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Mã OTP sẽ được gửi đến email mới.
                                </p>

                            </div>


                            <Input
                                type="email"
                                icon={<Mail size={18} />}
                                placeholder="Email mới"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                            />


                            <Button
                                type="submit"
                                disabled={loading}
                                className="mt-6 w-full"
                            >

                                {loading
                                    ? "Đang gửi OTP..."
                                    : "Gửi mã OTP"
                                }

                            </Button>

                        </>

                    )}


                    {/* OTP */}

                    {step === "otp" && (

                        <>

                            <div className="mb-6">

                                <h2 className="text-lg font-bold">
                                    Xác nhận email
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Nhập mã OTP đã gửi đến
                                </p>

                                <p className="mt-1 font-medium text-[#4f7d4f]">
                                    {email}
                                </p>

                            </div>


                            <Input
                                icon={
                                    <ShieldCheck size={18} />
                                }
                                placeholder="Nhập mã OTP"
                                value={otp}
                                onChange={(e) =>
                                    setOtp(e.target.value)
                                }
                            />


                            <Button
                                type="submit"
                                disabled={loading}
                                className="mt-6 w-full"
                            >

                                {loading
                                    ? "Đang xác nhận..."
                                    : "Xác nhận đổi email"
                                }

                            </Button>


                            <button
                                type="button"
                                onClick={() =>
                                    setStep("email")
                                }
                                className="mt-4 w-full text-sm text-gray-500 hover:text-[#4f7d4f]"
                            >

                                Đổi email khác

                            </button>

                        </>

                    )}

                </form>

            </div>

        </div>

    );
}