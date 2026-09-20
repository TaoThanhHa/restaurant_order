import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import { Utensils, LayoutDashboard, Table2, UtensilsCrossed, Users, ShoppingBag, Layers3, ReceiptText, ChartNoAxesCombined, User, } from "lucide-react";

import adminService from "../../services/admin.service";

import "./SidebarSingle.css";

export default function SidebarSingle() {
    const [restaurant, setRestaurant] = useState({
        name: "Làng Tre",
        logo: "",
    });

    const SERVER_URL =
        import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") || "";

    const getImageUrl = (url) => {
        if (!url) return "";

        if (
            url.startsWith("http://") ||
            url.startsWith("https://")
        ) {
            return url;
        }

        return `${SERVER_URL}${url}`;
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
                console.error(
                    "LOAD RESTAURANT ERROR:",
                    error
                );
            }
        };

        loadRestaurant();
    }, []);

    const menus = [
        {
            name: "Dashboard",
            path: "/admin/dashboardsingle",
            icon: <LayoutDashboard size={20} />,
        },
        /* {
            name: "Bàn ăn",
            path: "/admin/tables",
            icon: <Table2 size={20} />,
        }, */
        {
            name: "Tầng bàn",
            path: "/admin/floors",
            icon: <Layers3 size={20} />,
        },
        {
            name: "Thực đơn",
            path: "/admin/foods",
            icon: <UtensilsCrossed size={20} />,
        },
        /* {
            name: "Đơn mang về",
            path: "/admin/take-away",
            icon: <ShoppingBag size={20} />,
        }, */
        {
            name: "Nhân viên",
            path: "/admin/employees",
            icon: <Users size={20} />,
        },
        {
            name: "Thống kê",
            path: "/admin/statistics",
            icon: <ChartNoAxesCombined size={20} />,
        },
        {
            name: "Hóa đơn",
            path: "/admin/order-history",
            icon: <ReceiptText size={20} />,
        },
        {
            name: "Khách hàng thành viên",
            path: "/admin/customers",
            icon: <Users size={20} />,
        },
        {
            name: "Thông tin",
            path: "/admin/profile",
            icon: <User size={20} />,
        },
    ];

    return (
        <aside className="sidebar_single">
            <div className="sidebar_single-top">
                <div className="sidebar_single-logo">
                    {restaurant.logo ? (
                        <img
                            src={getImageUrl(restaurant.logo)}
                            alt={restaurant.name}
                        />
                    ) : (
                        <Utensils size={22} />
                    )}
                </div>

                <h2>{restaurant.name}</h2>
            </div>

            <div className="sidebar_single-menu">
                {menus.map((menu) => (
                    <NavLink
                        key={menu.path}
                        to={menu.path}
                        className={({ isActive }) =>
                            `menu_single ${
                                isActive
                                    ? "menu_single_active"
                                    : ""
                            }`
                        }
                    >
                        <span className="menu_single-icon">
                            {menu.icon}
                        </span>

                        <span className="menu_single-text">
                            {menu.name}
                        </span>
                    </NavLink>
                ))}
            </div>
        </aside>
    );
}