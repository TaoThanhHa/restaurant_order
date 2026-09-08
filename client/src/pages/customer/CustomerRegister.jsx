import {
    ArrowLeft,
    Lock,
    Mail,
    Phone,
    User,
} from "lucide-react";

import { useState } from "react";
import {
    useNavigate,
    useParams,
} from "react-router-dom";

import styles from "./Customer.module.css";

import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";

import customerAuthService from "../../services/customerAuth.service";
import { getDeviceId } from "../../../utils/deviceId";


export default function CustomerRegister() {

    const navigate = useNavigate();

    const { qrCode } = useParams();


    const [form, setForm] = useState({

        name: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: "",

    });


    const [loading, setLoading] =
        useState(false);


    // ======================================================
    // CHANGE
    // ======================================================

    const handleChange = (field) => (e) => {

        setForm(prev => ({

            ...prev,

            [field]: e.target.value,

        }));

    };


    // ======================================================
    // SUBMIT
    // ======================================================

    const handleSubmit = async (e) => {

        e.preventDefault();


        // --------------------------------------------------
        // QR CODE
        // --------------------------------------------------

        if (!qrCode) {

            alert(
                "Không xác định được bàn."
            );

            return;

        }


        // --------------------------------------------------
        // NAME
        // --------------------------------------------------

        if (!form.name.trim()) {

            alert(
                "Vui lòng nhập họ và tên."
            );

            return;

        }


        // --------------------------------------------------
        // PHONE
        // --------------------------------------------------

        if (!form.phone.trim()) {

            alert(
                "Vui lòng nhập số điện thoại."
            );

            return;

        }


        // --------------------------------------------------
        // EMAIL
        // --------------------------------------------------

        if (!form.email.trim()) {

            alert(
                "Vui lòng nhập email."
            );

            return;

        }


        // --------------------------------------------------
        // PASSWORD
        // --------------------------------------------------

        if (!form.password) {

            alert(
                "Vui lòng nhập mật khẩu."
            );

            return;

        }


        if (form.password.length < 6) {

            alert(
                "Mật khẩu phải có ít nhất 6 ký tự."
            );

            return;

        }


        // --------------------------------------------------
        // CONFIRM PASSWORD
        // --------------------------------------------------

        if (
            form.password !==
            form.confirmPassword
        ) {

            alert(
                "Mật khẩu nhập lại không khớp."
            );

            return;

        }


        try {

            setLoading(true);


            // ==================================================
            // REGISTER
            // ==================================================

            const res =
                await customerAuthService.register({

                    name:
                        form.name.trim(),

                    phone:
                        form.phone.trim(),

                    email:
                        form.email
                            .trim()
                            .toLowerCase(),

                    password:
                        form.password,

                    tableId:
                        qrCode,

                    // QUAN TRỌNG:
                    // Dùng cùng deviceId với Guest
                    deviceId:
                        getDeviceId(),

                });


            const data =
                res.data;


            // ==================================================
            // TOKEN
            // ==================================================

            if (!data?.token) {

                throw new Error(
                    "Đăng ký thành công nhưng không nhận được token."
                );

            }


            localStorage.setItem(
                "customerToken",
                data.token
            );


            // ==================================================
            // TABLE
            // ==================================================

            if (data.table) {

                localStorage.setItem(
                    "customerTable",
                    JSON.stringify(
                        data.table
                    )
                );

            }


            // ==================================================
            // HOME
            // ==================================================

            navigate(
                `/customer/home/${
                    data.table?.qrCode ||
                    qrCode
                }`,
                {
                    replace: true,
                }
            );


        } catch (err) {

            console.error(
                "Đăng ký thất bại:",
                err
            );


            alert(
                err.response?.data?.message ||
                err.message ||
                "Đăng ký thất bại."
            );


        } finally {

            setLoading(false);

        }

    };


    // ======================================================
    // RENDER
    // ======================================================

    return (

        <div
            className={`
                min-h-screen
                flex
                items-center
                justify-center
                px-4
                ${styles.section}
            `}
        >

            <div
                className="
                    w-full
                    max-w-sm
                    rounded-3xl
                    bg-white/90
                    p-8
                    shadow-2xl
                    backdrop-blur
                "
            >

                {/* BACK */}

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            `/customer/${qrCode}`
                        )
                    }
                    className="
                        flex
                        items-center
                        gap-2
                        text-gray-600
                        hover:text-[#4f7d4f]
                    "
                >

                    <ArrowLeft size={18} />

                    Quay lại

                </button>


                {/* TITLE */}

                <h1
                    className="
                        mt-6
                        text-center
                        text-3xl
                        font-bold
                    "
                >

                    Đăng ký

                </h1>


                {/* FORM */}

                <form
                    onSubmit={handleSubmit}
                    className="
                        mt-8
                        space-y-5
                    "
                >

                    <Input
                        icon={
                            <User size={18} />
                        }
                        placeholder="Họ và tên"
                        value={form.name}
                        onChange={
                            handleChange("name")
                        }
                    />


                    <Input
                        icon={
                            <Phone size={18} />
                        }
                        placeholder="Số điện thoại"
                        value={form.phone}
                        onChange={
                            handleChange("phone")
                        }
                    />


                    <Input
                        type="email"
                        icon={
                            <Mail size={18} />
                        }
                        placeholder="Email"
                        value={form.email}
                        onChange={
                            handleChange("email")
                        }
                    />


                    <Input
                        type="password"
                        icon={
                            <Lock size={18} />
                        }
                        placeholder="Mật khẩu"
                        value={form.password}
                        onChange={
                            handleChange("password")
                        }
                    />


                    <Input
                        type="password"
                        icon={
                            <Lock size={18} />
                        }
                        placeholder="Nhập lại mật khẩu"
                        value={
                            form.confirmPassword
                        }
                        onChange={
                            handleChange(
                                "confirmPassword"
                            )
                        }
                    />


                    <div className="pt-3">

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full"
                        >

                            {loading
                                ? "Đang đăng ký..."
                                : "Đăng ký"
                            }

                        </Button>

                    </div>

                </form>


                {/* LOGIN */}

                <div
                    className="
                        mt-8
                        text-center
                    "
                >

                    <span className="text-gray-500">

                        Đã có tài khoản?

                    </span>


                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                `/customer/login/${qrCode}`
                            )
                        }
                        className="
                            ml-2
                            font-semibold
                            text-[#4f7d4f]
                        "
                    >

                        Đăng nhập

                    </button>

                </div>

            </div>

        </div>

    );

}