import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

import useAuth from "../../hooks/useAuth";
import ServiceRequestBell from "./ServiceRequestBell";
import OrderNotificationBell from "./OrderNotificationBell";

export default function Header() {
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    const roleName = user?.role?.name || user?.role || "";
    const isCashier = roleName === "CASHIER";
    const branchId = user?.branchId || user?.branch?.id || null;

    const getHeaderName = () => {
        if (roleName === "CASHIER") {
            const cashierName = user?.username || user?.name || "Thu ngân";
            const branchName = user?.branch?.name || "Chưa có chi nhánh";
            return cashierName + " - " + branchName;
        }

        if (roleName === "BRANCH") {
            return user?.branch?.name || "Chi nhánh";
        }

        if (roleName === "ADMIN") {
            return "Toàn hệ thống";
        }

        return user?.branch?.name || "Toàn hệ thống";
    };

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    return (
        <header className="flex h-16 items-center justify-end bg-[var(--color-primary)] px-4 text-white shadow-sm sm:px-6">

            <div className="flex items-center gap-2 sm:gap-4">
                {isCashier && branchId && (
                    <div className="flex items-center gap-1 rounded-xl px-1 py-1 backdrop-blur-sm">
                        <OrderNotificationBell branchId={branchId} />
                        <ServiceRequestBell branchId={branchId} />
                    </div>
                )}

                <div className="hidden h-8 w-px bg-white/20 sm:block" />

                <div className="flex max-w-[180px] items-center rounded-xl px-3 py-2 backdrop-blur-sm sm:max-w-none">
                    <span className="truncate text-sm font-medium sm:text-[15px]">
                        {getHeaderName()}
                    </span>
                </div>

                <button
                    type="button"
                    onClick={handleLogout}
                    className="group flex h-10 items-center justify-center gap-2 rounded-xl bg-white px-3 text-sm font-semibold text-red-700 shadow-sm transition hover:bg-red-50 hover:shadow-md sm:px-4"
                    title="Đăng xuất"
                >
                    <LogOut
                        size={18}
                        className="transition-transform group-hover:-translate-x-0.5"
                    />
                    <span className="hidden sm:inline">Đăng xuất</span>
                </button>
            </div>
        </header>
    );
}