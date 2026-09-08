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

import "./SidebarAuth.css";

export default function Sidebar() {

    const { user } = useAuth();

    const [restaurant, setRestaurant] = useState({
        name: "Làng Tre",
        logo: "",
    });

    const SERVER_URL =
        import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") || "";

    const getImageUrl = (url) => {
        if (!url) {
            return "";
        }

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
                const res = await restaurantService.getInfo();
                const data = res?.message;

                setRestaurant({
                    name: data?.name || "Làng Tre",
                    logo: data?.logo || "",
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

    // ==========================================
    // ROLE
    // ==========================================

    const roleName =
        user?.role?.name ||
        user?.role ||
        "";

    // ==========================================
    // MENU
    // ==========================================

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

    // ==========================================
    // LỌC MENU THEO ROLE
    // ==========================================

    const visibleMenus = menus.filter((menu) => {

        if (menu.allRoles) {
            return true;
        }

        if (menu.branchOnly) {
            return roleName === "BRANCH";
        }

        if (menu.cashierOnly) {
            return roleName === "CASHIER";
        }

        return false;
    });

    return (
        <aside className="sidebar_auth">

            {/* RESTAURANT */}
            <div className="sidebar_auth-top">

                <div className="w-[40px] h-[40px] p-1 flex items-center justify-center">

                    {restaurant.logo ? (
                        <img
                            src={getImageUrl(restaurant.logo)}
                            alt={restaurant.name}
                            className="w-full h-full object-cover rounded-lg"
                        />
                    ) : (
                        <Utensils size={22} />
                    )}

                </div>

                <h2>
                    {restaurant.name}
                </h2>

            </div>

            {/* MENU */}
            <div className="sidebar_auth-menu">

                {visibleMenus.map((menu) => (

                    <NavLink
                        key={menu.path}
                        to={menu.path}
                        className={({ isActive }) =>
                            `menu_auth ${
                                isActive
                                    ? "menu_auth_active"
                                    : ""
                            }`
                        }
                    >

                        <span className="menu_auth-icon">
                            {menu.icon}
                        </span>

                        <span className="menu_auth-text">
                            {menu.name}
                        </span>

                    </NavLink>

                ))}

            </div>

        </aside>
    );
}
