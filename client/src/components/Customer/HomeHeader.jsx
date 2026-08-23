import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Utensils } from "lucide-react";

import restaurantService from "../../services/restaurant.service";

export default function HomeHeader({
    profile,
    table,
}) {

    const navigate = useNavigate();

    const [restaurant, setRestaurant] = useState({
        name: "Làng Tre",
        logo: "",
    });

    // ========================================
    // SERVER URL
    // ========================================

    const SERVER_URL =
        import.meta.env.VITE_API_URL?.replace(
            /\/api\/?$/,
            ""
        ) || "";

    // ========================================
    // IMAGE URL
    // ========================================

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

    // ========================================
    // LOAD RESTAURANT
    // ========================================

    useEffect(() => {

        const loadRestaurant = async () => {

            try {

                const res =
                    await restaurantService.getInfo();

                const data = res?.message;

                setRestaurant({
                    name:
                        data?.name ||
                        "Làng Tre",

                    logo:
                        data?.logo ||
                        "",
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

    // ========================================
    // CUSTOMER
    // ========================================

    const displayName =
        profile?.name ||
        "Khách hàng";

    const avatarLetter =
        displayName
            .charAt(0)
            .toUpperCase();

    // ========================================
    // ACCOUNT
    // ========================================

    const handleAccount = () => {

        if (!table?.qrCode) {
            return;
        }

        // Khách chưa đăng nhập
        if (profile?.isGuest) {

            navigate(
                `/customer/login/${table.qrCode}`
            );

            return;
        }

        // Khách đã đăng nhập
        navigate(
            `/customer/account/${table.qrCode}`
        );

    };

    return (

        <header className="bg-[#4f7d4f] px-5 py-2 shadow-sm">

            <div className="mt-3 flex items-center justify-between">

                {/* ========================================
                    RESTAURANT + TABLE
                ======================================== */}

                <div>

                    <Link
                        to={`/customer/home/${table?.qrCode || ""}`}
                        className="flex items-center gap-3 text-white"
                    >

                        {/* LOGO */}

                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-white/20">

                            {restaurant.logo ? (

                                <img
                                    src={getImageUrl(
                                        restaurant.logo
                                    )}
                                    alt={restaurant.name}
                                    className="h-full w-full object-cover"
                                />

                            ) : (

                                <Utensils
                                    size={22}
                                />

                            )}

                        </div>

                        {/* NAME */}

                        <span className="text-[28px] font-bold">

                            {restaurant.name}

                        </span>

                    </Link>


                    {/* TABLE */}

                    <p className="pt-2 text-sm text-white">

                        {table?.branchName && (
                            <>
                                {table.branchName}
                                {" • "}
                            </>
                        )}

                        Bàn{" "}
                        {table?.tableNumber || "..."}

                    </p>

                </div>


                {/* ========================================
                    ACCOUNT
                ======================================== */}

                <button
                    type="button"
                    onClick={handleAccount}
                    className="flex items-center gap-3 rounded-2xl px-2 py-1.5 transition hover:bg-gray-100"
                >

                    {/* DISPLAY NAME */}

                    <div className="text-right">

                        <p className="text-sm font-semibold text-gray-800">

                            {displayName}

                        </p>

                        <p className="text-xs text-white">

                            Tài khoản

                        </p>

                    </div>


                    {/* AVATAR */}

                    <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-[#dcebdc] text-[#4f7d4f]">

                        {profile?.avatar ? (

                            <img
                                src={profile.avatar}
                                alt={displayName}
                                className="h-full w-full object-cover"
                            />

                        ) : (

                            <span className="text-lg font-bold">

                                {avatarLetter}

                            </span>

                        )}

                    </div>

                </button>

            </div>

        </header>

    );

}