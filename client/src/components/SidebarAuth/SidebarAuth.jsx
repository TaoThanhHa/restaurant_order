import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
    Utensils,
    Table2,
    UtensilsCrossed,
    ShoppingBag,
    Layers3,
    Users,
    ReceiptText,
    User,
    LayoutDashboard,
    ChartNoAxesCombined,
} from "lucide-react";

import restaurantService from "../../services/restaurant.service";
import useAuth from "../../hooks/useAuth";

export default function Sidebar() {
    const { user } = useAuth();

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
                const res = await restaurantService.getInfo();
                const data = res?.message;

                setRestaurant({
                    name: data?.name || "Làng Tre",
                    logo: data?.logo || "",
                });
            } catch (error) {
                console.error("LOAD RESTAURANT ERROR:", error);
            }
        };

        loadRestaurant();
    }, []);

    const roleName = user?.role?.name || user?.role || "";

    const menus = [
        {
            name: "Bàn ăn",
            path: "/branch/tables",
            icon: <Table2 size={20} />,
            cashierOnly: true,
        },
        {
            name: "Thực đơn",
            path: "/branch/foods",
            icon: <UtensilsCrossed size={20} />,
            cashierOnly: true,
        },
        {
            name: "Đơn mang về",
            path: "/branch/take-away",
            icon: <ShoppingBag size={20} />,
            cashierOnly: true,
        },
        {
            name: "Dashboard",
            path: "/branch/dashboard",
            icon: <LayoutDashboard size={20} />,
            branchOnly: true,
        },
        {
            name: "Tầng bàn",
            path: "/branch/table",
            icon: <Layers3 size={20} />,
            branchOnly: true,
        },
        {
            name: "Nhân viên",
            path: "/branch/employee",
            icon: <Users size={20} />,
            branchOnly: true,
        },
        {
            name: "Thống kê",
            path: "/branch/statistics",
            icon: <ChartNoAxesCombined size={20} />,
            branchOnly: true,
        },
        {
            name: "Hóa đơn",
            path: "/branch/order-history",
            icon: <ReceiptText size={20} />,
            allRoles: true,
        },
        {
            name: "Thông tin",
            path: "/branch/profile",
            icon: <User size={20} />,
            allRoles: true,
        },
    ];

    const visibleMenus = menus.filter((menu) => {
        if (menu.allRoles) return true;
        if (menu.branchOnly) return roleName === "BRANCH";
        if (menu.cashierOnly) return roleName === "CASHIER";
        return false;
    });

    return (
        <aside className="flex h-full w-50 flex-col bg-[var(--color-primary)] text-[var(--color-secondary)] ">
            <div className="p-3 text-center">
                <div className="mx-auto h-10 w-10 overflow-hidden rounded-xl">
                    {restaurant.logo ? (
                        <img
                            src={getImageUrl(restaurant.logo)}
                            alt={restaurant.name}
                            className="h-full w-full rounded-lg object-cover"
                        />
                    ) : (
                        <Utensils
                            size={22}
                            className="mx-auto mt-2 text-white"
                        />
                    )}
                </div>

                <h2 className="mt-2 truncate text-lg font-bold text-white">
                    {restaurant.name}
                </h2>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4">
                <div className="space-y-2">
                    {visibleMenus.map((menu) => (
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