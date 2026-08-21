import {
    Lock,
    Mail,
    ArrowLeft
} from "lucide-react";

import { useState } from "react";
import {
    useNavigate,
    useParams
} from "react-router-dom";

import styles from "./Customer.module.css";

import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";

import customerAuthService from "../../services/customerAuth.service";

export default function CustomerLogin() {

    const navigate = useNavigate();

    const { qrCode } = useParams();

    const [form, setForm] = useState({
        identifier: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);


    const handleChange = (field) => (e) => {

        setForm(prev => ({
            ...prev,
            [field]: e.target.value,
        }));

    };


    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!qrCode) {
            alert("Không xác định được bàn.");
            return;
        }

        if (!form.identifier.trim()) {
            alert(
                "Vui lòng nhập email hoặc số điện thoại."
            );
            return;
        }

        if (!form.password) {
            alert("Vui lòng nhập mật khẩu.");
            return;
        }


        try {

            setLoading(true);

            const res =
                await customerAuthService.login({

                    identifier:
                        form.identifier.trim(),

                    password:
                        form.password,

                    tableId: qrCode,

                });


            const data = res.data;


            if (!data?.token) {
                throw new Error(
                    "Đăng nhập thành công nhưng không nhận được token."
                );
            }


            // -----------------------------------------
            // TOKEN
            // -----------------------------------------

            localStorage.setItem(
                "customerToken",
                data.token
            );


            // -----------------------------------------
            // BÀN HIỆN TẠI
            // -----------------------------------------

            if (data.table) {

                localStorage.setItem(
                    "customerTable",
                    JSON.stringify(data.table)
                );

            }


            // -----------------------------------------
            // HOME BÀN HIỆN TẠI
            // -----------------------------------------

            navigate(
                `/customer/home/${data.table?.qrCode || qrCode}`,
                {
                    replace: true,
                }
            );


        } catch (err) {

            console.error(
                "Đăng nhập thất bại:",
                err
            );

            alert(
                err.response?.data?.message ||
                err.message ||
                "Đăng nhập thất bại."
            );

        } finally {

            setLoading(false);

        }

    };


    return (

        <div
            className={`flex min-h-screen items-center justify-center px-4 ${styles.section}`}
        >

            <div className="w-full max-w-sm rounded-3xl bg-white/90 p-8 shadow-2xl backdrop-blur">


                {/* BACK */}

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            `/customer/${qrCode}`
                        )
                    }
                    className="flex items-center gap-2 text-gray-600 hover:text-[#4f7d4f]"
                >

                    <ArrowLeft size={18} />

                    Quay lại

                </button>


                {/* TITLE */}

                <h1 className="mt-6 text-center text-3xl font-bold">

                    Đăng nhập

                </h1>


                <p className="mt-2 text-center text-gray-500">

                    Đăng nhập để lưu lịch sử đơn hàng

                </p>


                {/* FORM */}

                <form
                    onSubmit={handleSubmit}
                    className="mt-8"
                >

                    <div className="space-y-5">

                        <Input
                            icon={<Mail size={18} />}
                            placeholder="Email hoặc số điện thoại"
                            value={form.identifier}
                            onChange={handleChange(
                                "identifier"
                            )}
                        />


                        <Input
                            type="password"
                            icon={<Lock size={18} />}
                            placeholder="Mật khẩu"
                            value={form.password}
                            onChange={handleChange(
                                "password"
                            )}
                        />

                    </div>


                    {/* FORGOT */}

                    <div className="mt-3 text-right">

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    `/customer/forgot/${qrCode}`
                                )
                            }
                            className="text-sm text-[#4f7d4f] hover:underline"
                        >

                            Quên mật khẩu?

                        </button>

                    </div>


                    {/* LOGIN */}

                    <div className="mt-8">

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full"
                        >

                            {loading
                                ? "Đang đăng nhập..."
                                : "Đăng nhập"
                            }

                        </Button>

                    </div>

                </form>


                {/* REGISTER */}

                <div className="mt-8 text-center">

                    <span className="text-gray-500">

                        Chưa có tài khoản?

                    </span>


                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                `/customer/register/${qrCode}`
                            )
                        }
                        className="ml-2 font-semibold text-[#4f7d4f]"
                    >

                        Đăng ký

                    </button>

                </div>

            </div>

        </div>

    );

}