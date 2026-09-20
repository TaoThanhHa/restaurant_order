import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import { Utensils, LayoutDashboard, Building2, Table2, UtensilsCrossed, Users, ChartNoAxesCombined, User, } from "lucide-react";

import adminService from "../../services/admin.service";
import "./Siderbar.css";

export default function Sidebar() {

    const [restaurant, setRestaurant] = useState({
        name: "Làng Tre",
        logo: "",
    });
    const SERVER_URL = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") || "";

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
        <aside className="sidebar_auth">
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

            <div className="sidebar_auth-menu">

                {menus.map((menu) => (

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