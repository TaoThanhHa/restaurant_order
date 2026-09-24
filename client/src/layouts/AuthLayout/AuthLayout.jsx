import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Button from "../../components/Button/Button";
import Header from "../../components/HeaderAuth/HeaderAuth";
import SidebarAuth from "../../components/SidebarAuth/SidebarAuth";
import Sidebar from "../../components/Sidebar/Sidebar";
import SidebarSingle from "../../components/SidebarSingle/SidebarSingle";

import useAuth from "../../hooks/useAuth";

export default function AuthLayout() {
    const { user } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const isAdmin = user?.role === "ADMIN";
    const isSingle = user?.restaurantMode === "SINGLE";

    const renderSidebar = () => {
        if (isAdmin) {
            return isSingle ? <SidebarSingle /> : <Sidebar />;
        }

        return <SidebarAuth />;
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[var(--color-background)]">
            {/* Desktop Sidebar */}
            <aside className="fixed left-0 top-0 z-30 hidden h-screen w-[200px] lg:block">
                {renderSidebar()}
            </aside>

            {/* Mobile / Tablet Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Mobile / Tablet Sidebar */}
            <aside
                className={`fixed left-0 top-0 z-50 h-screen w-[200px] transform transition-transform duration-300 lg:hidden ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="relative h-full">
                    {renderSidebar()}

                    <Button
                        type="button"
                        onClick={() => setSidebarOpen(false)}
                        className="absolute right-2 top-3 z-10"
                    >
                        <X size={18} />
                    </Button>
                </div>
            </aside>

            {/* Content */}
            <div className="flex h-screen min-h-0 min-w-0 w-full flex-col overflow-hidden lg:ml-[200px] lg:w-[calc(100%-200px)]">
                {/* Mobile / Tablet Menu Button */}
                <Button
                    type="button"
                    onClick={() => setSidebarOpen(true)}
                    className="fixed left-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-lg lg:hidden"
                >
                    <Menu size={22} />
                </Button>

                <Header />

                <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-3 py-2 sm:px-4 lg:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
