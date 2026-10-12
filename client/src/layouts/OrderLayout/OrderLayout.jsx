import { LogOut, User } from "lucide-react";
import { Outlet, useNavigate, Link } from "react-router-dom";

import useAuth from "../../hooks/useAuth";
import Button from "../../components/Button/Button";

import ServiceRequestBell from "../../components/HeaderAuth/ServiceRequestBell";
import OrderNotificationBell from "../../components/HeaderAuth/OrderNotificationBell";

export default function OrderLayout() {

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const branchId = user?.branchId || user?.branch?.id || null;

    const handleLogout = () => {
        logout();
        navigate("/login", {
            replace: true,
        });
    };

    return (
        <div className="min-h-screen bg-[var(--color-background)]">

            {/* HEADER ORDER */}
            <header className="flex h-16 items-center justify-between border-b bg-[var(--color-primary)] px-6 shadow-sm text-white">

                <Link to={`/order/tables`} className="font-bold text-lg">
                    Gọi món
                </Link>

                <div className="flex items-center gap-4">

                    <div className="flex items-center gap-2">
                        {branchId && (
                            <div className="flex items-center gap-1 rounded-xl px-1 py-1 backdrop-blur-sm">
                                <OrderNotificationBell branchId={branchId} />
                                <ServiceRequestBell branchId={branchId} />
                            </div>
                        )}
                        
                        <div>
                            <button
                                type="button"
                                onClick={() => navigate("/branch/profile")}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-500"
                            >
                                <User size={18} />
                            </button>
                        </div>

                    </div>

                    <Button
                        type="button"
                        onClick={handleLogout}
                        className="bg-red-700 mt-2"
                    >
                        <LogOut size={18} />
                        Đăng xuất
                    </Button>

                </div>

            </header>

            {/* CONTENT */}
            <main className="p-5">
                <Outlet />
            </main>

        </div>
    );
}