import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import { Utensils } from "lucide-react";

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
            name: "Tổng quan",
            path: "/branch/dashboard",
            allRoles: true,
        },
        {
            name: "Bàn ăn",
            path: "/branch/tables",
            cashierOnly: true,
        },
        {
            name: "Thực đơn",
            path: "/branch/foods",
            cashierOnly: true,
        },
        {
            name: "Đơn mang về",
            path: "/branch/take-away",
            cashierOnly: true,
        },
        {
            name: "Nhân viên",
            path: "/branch/employee",
            branchOnly: true,
        },
        {
            name: "Hóa đơn",
            path: "/branch/order-history",
            allRoles: true,
        },
        {
            name: "Thông tin",
            path: "/branch/profile",
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
        if (menu.branchOnly) { return roleName === "BRANCH"; }
        
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
                            src={getImageUrl(
                                restaurant.logo
                            )}
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
                        {menu.name}
                    </NavLink>

                ))}

            </div>

        </aside>

    );
}
