import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import {Utensils,} from "lucide-react";

import restaurantService from "../../services/restaurant.service";
import "./SidebarAuth.css";

export default function Sidebar() {

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

    const menus = [
        {
            name: "Tổng quan",
            path: "/cashier/dashboard",
        },
        {
            name: "Bàn ăn",
            path: "/cashier/tables",
        },
        {
            name: "Thực đơn",
            path: "/cashier/foods",
        },
        {
            name: "Đơn mang về",
            path: "/cashier/take-away",
        },
        {
            name: "Hóa đơn",
            path: "/cashier/order-history",
        },
        {
            name: "Thông tin",
            path: "/cashier/profile",
        },
    ];

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
                        {menu.name}
                    </NavLink>

                ))}

            </div>

        </aside>

    );
}