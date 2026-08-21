import { Coffee } from "lucide-react";
import {
    useNavigate,
    useParams
} from "react-router-dom";
import {
    useEffect,
    useState
} from "react";

import customerAuthService from "../../services/customerAuth.service";
import useCustomerAuth from "../../hooks/useCustomerAuth";

import styles from "./Customer.module.css";


function getDeviceId() {

    let id =
        localStorage.getItem("deviceId");

    if (!id) {

        id = crypto.randomUUID();

        localStorage.setItem(
            "deviceId",
            id
        );

    }

    return id;
}


export default function CustomerWelcome() {

    const navigate = useNavigate();

    const { qrCode } = useParams();

    const [table, setTable] =
        useState(null);

    const [checkingAuth, setCheckingAuth] =
        useState(true);

    const [loadingGuest, setLoadingGuest] =
        useState(false);

    const { login } =
        useCustomerAuth();


    // =================================================
    // KIỂM TRA ĐĂNG NHẬP + LẤY BÀN HIỆN TẠI
    // =================================================

    useEffect(() => {

        const load = async () => {

            try {

                if (!qrCode) {
                    throw new Error(
                        "Không xác định được mã QR của bàn."
                    );
                }


                // -----------------------------------------
                // LẤY BÀN THEO QR HIỆN TẠI
                // -----------------------------------------

                const tableRes =
                    await customerAuthService.getTable(
                        qrCode
                    );

                const currentTable =
                    tableRes.data;

                setTable(currentTable);


                // -----------------------------------------
                // KIỂM TRA CUSTOMER ĐÃ ĐĂNG NHẬP
                // -----------------------------------------

                const token =
                    localStorage.getItem(
                        "customerToken"
                    );

                if (!token) {
                    return;
                }


                // -----------------------------------------
                // TOKEN CÒN HỢP LỆ?
                // -----------------------------------------

                const profileRes =
                    await customerAuthService.profile();


                if (!profileRes.data) {
                    return;
                }


                // -----------------------------------------
                // ĐÃ ĐĂNG NHẬP
                // → VÀO THẲNG HOME BÀN HIỆN TẠI
                // -----------------------------------------

                navigate(
                    `/customer/home/${currentTable.qrCode}`,
                    {
                        replace: true,
                    }
                );


            } catch (err) {

                console.error(
                    "Kiểm tra customer:",
                    err.response?.data ||
                    err
                );

                // Token lỗi / hết hạn
                // Không cho dùng token cũ nữa

                localStorage.removeItem(
                    "customerToken"
                );

            } finally {

                setCheckingAuth(false);

            }

        };


        load();

    }, [qrCode, navigate]);


    // =================================================
    // GUEST
    // =================================================

    const handleGuest = async () => {

        if (!qrCode) {
            alert(
                "Không xác định được bàn."
            );
            return;
        }


        try {

            setLoadingGuest(true);


            const res =
                await customerAuthService.guest({

                    deviceId:
                        getDeviceId(),

                    tableId:
                        qrCode,

                });


            // -----------------------------------------
            // LOGIN CUSTOMER
            // -----------------------------------------

            login(
                res.data.token,
                res.data.customer
            );


            // -----------------------------------------
            // LƯU TOKEN
            // -----------------------------------------

            localStorage.setItem(
                "customerToken",
                res.data.token
            );


            // -----------------------------------------
            // LƯU BÀN HIỆN TẠI
            // -----------------------------------------

            localStorage.setItem(
                "customerTable",
                JSON.stringify(
                    res.data.table
                )
            );


            navigate(
                `/customer/home/${res.data.table.qrCode}`,
                {
                    replace: true,
                }
            );


        } catch (err) {

            console.error(err);

            alert(
                err.response?.data?.message ||
                err.message ||
                "Không thể tiếp tục."
            );

        } finally {

            setLoadingGuest(false);

        }

    };


    // =================================================
    // ĐANG KIỂM TRA
    // =================================================

    if (checkingAuth) {

        return (

            <div className="flex min-h-screen items-center justify-center">

                <div className="text-gray-500">

                    Đang kiểm tra tài khoản...

                </div>

            </div>

        );

    }


    return (

        <div
            className={`flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-4 ${styles.section}`}
        >

            <div className="w-full max-w-sm rounded-3xl bg-white/90 px-8 py-10 shadow-2xl backdrop-blur">


                {/* ICON */}

                <div className="flex justify-center">

                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FEF8F2]">

                        <Coffee
                            size={42}
                            className="text-[#4f7d4f]"
                        />

                    </div>

                </div>


                {/* TITLE */}

                <h1 className="mt-6 text-center text-3xl font-bold">

                    Chào mừng tới

                </h1>


                <h2 className="text-center text-4xl font-extrabold text-[#4f7d4f]">

                    Làng Tre

                </h2>


                {/* TABLE */}

                <p className="mt-3 text-center text-gray-500">

                    Bạn đang ngồi tại

                </p>


                <p className="text-center text-xl font-semibold text-[#4f7d4f]">

                    Bàn{" "}

                    {table?.tableNumber || "..."}

                </p>


                {/* GUEST */}

                <button
                    type="button"
                    disabled={loadingGuest}
                    onClick={handleGuest}
                    className="mt-8 w-full rounded-2xl bg-[#4f7d4f] py-4 text-lg font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >

                    {loadingGuest
                        ? "Đang tiếp tục..."
                        : "Tiếp tục với tư cách khách"
                    }

                </button>


                {/* DIVIDER */}

                <div className="my-7 flex items-center gap-3">

                    <div className="h-px flex-1 bg-gray-300" />

                    <span className="text-sm text-gray-400">

                        hoặc

                    </span>

                    <div className="h-px flex-1 bg-gray-300" />

                </div>


                {/* LOGIN */}

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            `/customer/login/${qrCode}`
                        )
                    }
                    className="w-full rounded-2xl border-2 border-[#4f7d4f] py-3 font-semibold text-[#4f7d4f] hover:bg-green-50"
                >

                    Đăng nhập

                </button>


                {/* REGISTER */}

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            `/customer/register/${qrCode}`
                        )
                    }
                    className="mt-4 w-full rounded-2xl border-2 border-[#4f7d4f] py-3 font-semibold text-[#4f7d4f] hover:bg-green-50"
                >

                    Đăng ký

                </button>

            </div>

        </div>

    );

}