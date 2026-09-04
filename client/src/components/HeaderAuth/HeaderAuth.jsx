import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { LogOut } from "lucide-react";

import "./HeaderAuth.css";

import ServiceRequestBell from "./ServiceRequestBell";
import OrderNotificationBell from "./OrderNotificationBell";

export default function Header() {
    const navigate = useNavigate();

    const { logout, user } = useAuth();

    const roleName = user?.role?.name || user?.role || "";
    const isCashier = roleName === "CASHIER";

    const branchId = user?.branchId || user?.branch?.id || null;

    // ==========================================
    // HIỂN THỊ TÊN KHU VỰC / CHI NHÁNH
    // ==========================================

    const getHeaderName = () => {
        // Thu ngân
        if (roleName === "CASHIER") {
            const cashierName =
                user?.username ||
                user?.name ||
                "Thu ngân";

            const branchName =
                user?.branch?.name ||
                "Chưa có chi nhánh";

            return `${cashierName} - ${branchName}`;
        }

        // Nhân viên quản lý chi nhánh
        if (roleName === "BRANCH") {
            return user?.branch?.name || "Chi nhánh";
        }

        // Admin
        if (roleName === "ADMIN") {
            return "Toàn hệ thống";
        }

        return user?.branch?.name || "Toàn hệ thống";
    };

    const handleLogout = () => {
        logout();

        navigate("/login", {
            replace: true,
        });
    };

    return (
        <header className="header">
            <div className="header-left flex items-center justify-center gap-3">
            </div>

            <div className="header-right">

                {/* ==========================================
                    THÔNG BÁO - CHỈ THU NGÂN
                ========================================== */}

                {isCashier && branchId && (
                    <>
                        <OrderNotificationBell
                            branchId={branchId}
                        />

                        <ServiceRequestBell
                            branchId={branchId}
                        />
                    </>
                )}

                {/* ==========================================
                    TÊN USER / CHI NHÁNH
                ========================================== */}

                <span>
                    {getHeaderName()}
                </span>

                {/* ==========================================
                    ĐĂNG XUẤT
                ========================================== */}

                <button
                    type="button"
                    className="flex items-center justify-center gap-2 !bg-red-700 !text-white"
                    onClick={handleLogout}
                >
                    <LogOut size={20} />
                    Đăng xuất
                </button>
            </div>
        </header>
    );
}
