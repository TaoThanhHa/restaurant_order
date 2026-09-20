import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import customerAuthService from "../../services/customerAuth.service";
import restaurantService from "../../services/restaurant.service";
import useCustomerAuth from "../../hooks/useCustomerAuth";
import { getDeviceId } from "../../../utils/deviceId";
import styles from "./Customer.module.css";

export default function CustomerWelcome() {
    const navigate = useNavigate();
    const { qrCode } = useParams();
    const [table, setTable] = useState(null);
    const [restaurant, setRestaurant] = useState({ name: "Làng Tre", logo: "" });
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [loadingGuest, setLoadingGuest] = useState(false);
    const { login } = useCustomerAuth();

    const SERVER_URL = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") || "";

    const getImageUrl = (url) => {
        if (!url) return "";
        if (url.startsWith("http://") || url.startsWith("https://")) return url;
        return `${SERVER_URL}${url}`;
    };

    useEffect(() => {
        const loadRestaurant = async () => {
            try {
                const res = await restaurantService.getInfo();
                const data = res?.message;
                setRestaurant({ name: data?.name || "Làng Tre", logo: data?.logo || "" });
            } catch (error) {
                console.error("LOAD RESTAURANT ERROR:", error);
            }
        };

        loadRestaurant();
    }, []);

    useEffect(() => {
        const load = async () => {
            try {
                if (!qrCode) throw new Error("Không xác định được mã QR của bàn.");

                const tableRes = await customerAuthService.getTable(qrCode);
                const currentTable = tableRes.data;
                setTable(currentTable);

                const token = localStorage.getItem("customerToken");
                if (!token) return;

                try {
                    const profileRes = await customerAuthService.profile();

                    if (!profileRes?.data) {
                        localStorage.removeItem("customerToken");
                        return;
                    }

                    navigate(`/customer/home/${currentTable.qrCode}`, { replace: true });
                } catch (authError) {
                    console.error("CUSTOMER AUTH ERROR:", authError);
                    localStorage.removeItem("customerToken");
                }
            } catch (error) {
                console.error("CUSTOMER WELCOME ERROR:", error.response?.data || error);
            } finally {
                setCheckingAuth(false);
            }
        };

        load();
    }, [qrCode, navigate]);

    const handleGuest = async () => {
        if (!qrCode) {
            alert("Không xác định được bàn.");
            return;
        }

        try {
            setLoadingGuest(true);

            const res = await customerAuthService.guest({
                deviceId: getDeviceId(),
                tableId: qrCode,
            });

            login(res.data.token, res.data.customer);
            localStorage.setItem("customerToken", res.data.token);
            localStorage.setItem("customerTable", JSON.stringify(res.data.table));

            navigate(`/customer/home/${res.data.table.qrCode}`, { replace: true });
        } catch (error) {
            console.error("GUEST LOGIN ERROR:", error);
            alert(error.response?.data?.message || error.message || "Không thể tiếp tục.");
        } finally {
            setLoadingGuest(false);
        }
    };

    if (checkingAuth) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-gray-500">Đang kiểm tra tài khoản...</div>
            </div>
        );
    }

    return (
        <div className={`flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-4 ${styles.section}`}>
            <div className="w-full max-w-sm rounded-3xl bg-white/90 px-8 py-10 shadow-2xl backdrop-blur">
                <div className="flex justify-center">
                    <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#FEF8F2]">
                        {restaurant.logo ? (
                            <img src={getImageUrl(restaurant.logo)} alt={restaurant.name} className="h-full w-full rounded-full object-cover" />
                        ) : (
                            <span className="text-2xl font-bold text-[var(--color-primary)]">
                                {restaurant.name?.charAt(0)?.toUpperCase()}
                            </span>
                        )}
                    </div>
                </div>

                <h1 className="mt-6 text-center text-3xl font-bold">Chào mừng tới</h1>
                <h2 className="text-center text-3xl font-extrabold text-[var(--color-primary)]">{restaurant.name}</h2>

                <p className="mt-3 text-center text-gray-500">Bạn đang ngồi tại</p>
                <p className="text-center text-xl font-semibold text-[var(--color-primary)]">Bàn {table?.tableNumber || "..."}</p>

                <button
                    type="button"
                    disabled={loadingGuest}
                    onClick={handleGuest}
                    className="mt-8 w-full rounded-2xl bg-[var(--color-primary)] py-4 text-lg font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loadingGuest ? "Đang tiếp tục..." : "Tiếp tục với tư cách khách"}
                </button>

                <div className="my-7 flex items-center gap-3">
                    <div className="h-px flex-1 bg-gray-300" />
                    <span className="text-sm text-gray-400">hoặc</span>
                    <div className="h-px flex-1 bg-gray-300" />
                </div>

                <button
                    type="button"
                    onClick={() => navigate(`/customer/login/${qrCode}`)}
                    className="w-full rounded-2xl border-2 border-[var(--color-primary)] py-3 font-semibold text-[var(--color-primary)] hover:bg-[var(--color-secondary)]"
                >
                    Đăng nhập
                </button>

                <button
                    type="button"
                    onClick={() => navigate(`/customer/register/${qrCode}`)}
                    className="mt-4 w-full rounded-2xl border-2 border-[var(--color-primary)] py-3 font-semibold text-[var(--color-primary)] hover:bg-[var(--color-secondary)]"
                >
                    Đăng ký
                </button>
            </div>
        </div>
    );
}
