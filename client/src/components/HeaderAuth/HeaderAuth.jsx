import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { LogOut } from "lucide-react";
import "./HeaderAuth.css";
import ServiceRequestBell from "./ServiceRequestBell";
import OrderNotificationBell  from "./OrderNotificationBell";

export default function Header() {
    const navigate = useNavigate();
    const { logout, user } = useAuth();

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

                <span>
                    {user?.branch?.name ||
                        "Toàn hệ thống"}
                </span>

                <OrderNotificationBell />
                <ServiceRequestBell />

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