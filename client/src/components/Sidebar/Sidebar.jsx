import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Utensils, LayoutDashboard, Building2, Table2, UtensilsCrossed, Users, ChartNoAxesCombined, User,} from "lucide-react";

import adminService from "../../services/admin.service";

export default function Sidebar() {
    const [restaurant, setRestaurant] = useState({
        name: "Làng Tre",
        logo: "",
    });

    const SERVER_URL =
        import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") || "";

    const getImageUrl = (url) => {
        if (!url) return "";

        if (url.startsWith("http://") || url.startsWith("https://")) {
            return url;
        }

        return SERVER_URL + url;
    };

    useEffect(() => {
        const loadRestaurant = async () => {
            try {
                const res = await adminService.getProfile();
                const data = res?.data || res;

                setRestaurant({
                    name: data?.restaurant?.name || "Làng Tre",
                    logo: data?.restaurant?.logo || "",
                });
            } catch (error) {
                console.error("LOAD RESTAURANT ERROR:", error);
            }
        };

        loadRestaurant();
    }, []);

    const menus = [
        {
            name: "Dashboard",
            path: "/admin/dashboard",
            icon: <LayoutDashboard size={20} />,
        },
        {
            name: "Chi nhánh",
            path: "/admin/branch",
            icon: <Building2 size={20} />,
        },
        {
            name: "Bàn/Tầng",
            path: "/admin/table",
            icon: <Table2 size={20} />,
        },
        {
            name: "Thực đơn",
            path: "/admin/menu",
            icon: <UtensilsCrossed size={20} />,
        },
        {
            name: "Khách hàng thành viên",
            path: "/admin/customers",
            icon: <Users size={20} />,
        },
        {
            name: "Thống kê",
            path: "/admin/statistics",
            icon: <ChartNoAxesCombined size={20} />,
        },
        {
            name: "Thông tin",
            path: "/admin/profile",
            icon: <User size={20} />,
        },
    ];

    return (
        <aside className="flex h-full w-50 flex-col bg-[var(--color-primary)] text-[var(--color-secondary)] shadow-lg">
            <div className="p-3 text-center">
                <div className="mx-auto h-10 w-10 overflow-hidden rounded-xl">
                    {restaurant.logo ? (
                        <img
                            src={getImageUrl(restaurant.logo)}
                            alt={restaurant.name}
                            className="h-full w-full rounded-lg object-cover"
                        />
                    ) : (
                        <Utensils size={22} className="mx-auto" />
                    )}
                </div>

                <h2 className="mt-4 truncate text-xl font-bold text-white">
                    {restaurant.name}
                </h2>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4">
                <div className="space-y-2">
                    {menus.map((menu) => (
                        <NavLink
                            key={menu.path}
                            to={menu.path}
                            className={({ isActive }) =>
                                "group flex min-h-12 w-full items-center gap-3 rounded-xl px-4 text-left no-underline transition-all duration-200 " +
                                (isActive
                                    ? "bg-white !text-[var(--color-primary)] shadow-sm"
                                    : "text-white hover:translate-x-1 hover:bg-white/15")
                            }
                        >
                            <span className="flex w-5 shrink-0 items-center justify-center">
                                {menu.icon}
                            </span>

                            <span className="flex-1 truncate text-sm font-medium">
                                {menu.name}
                            </span>
                        </NavLink>
                    ))}
                </div>
            </nav>
        </aside>
    );
}