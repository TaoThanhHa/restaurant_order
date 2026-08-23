import { LogOut, User } from "lucide-react";
import { Outlet, useNavigate, Link } from "react-router-dom";

import useAuth from "../../hooks/useAuth";

export default function OrderLayout() {

    const { user, logout } = useAuth();
    const navigate = useNavigate();

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

                <Link to={`/cashier/table`} className="font-bold text-lg">
                    Gọi món
                </Link>

                <div className="flex items-center gap-4">

                    <div className="flex items-center gap-2">

                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-500">
                            <User size={18} />
                        </div>

                        <div>
                            <button
                                type="button"
                                onClick={() => navigate("/cashier/profile")}
                                className="
                                    text-sm font-medium
                                    cursor-pointer
                                    hover:text-[var(--color-primary)]
                                    transition
                                "
                            >
                                {user?.username}
                            </button>
                        </div>

                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                        <LogOut size={18} />
                        Đăng xuất
                    </button>

                </div>

            </header>

            {/* CONTENT */}
            <main className="p-5">
                <Outlet />
            </main>

        </div>
    );
}