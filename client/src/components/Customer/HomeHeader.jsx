import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Utensils } from "lucide-react";

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

    const API_URL =
        import.meta.env.VITE_API_URL ||
        "http://localhost:5000/api";

    const SERVER_URL = API_URL.replace(/\/api\/?$/, "");

    const getImageUrl = (url) => {
        if (!url) { return ""; }
        if (
            url.startsWith("http://") ||
            url.startsWith("https://")
        ) {
            return url;
        }

        return `${SERVER_URL}${url}`;
    };

    
    // AVATAR URL
    const getAvatarUrl = (avatar) => {
        if (!avatar) {
            return null;
        }

        if (avatar.startsWith("http")) {
            return avatar;
        }

        return `${SERVER_URL}${avatar}`;
    };

    useEffect(() => {
        const loadRestaurant = async () => {
            try {
                const res =  await restaurantService.getInfo();
                const data = res?.message;

                setRestaurant({
                    name: data?.name ||  "Làng Tre",
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

    // CUSTOMER
    const displayName = profile?.name || "Khách hàng";
    const avatarLetter = displayName.charAt(0).toUpperCase();

    const currentAvatar = useMemo(
        () => getAvatarUrl(
            profile?.avatar
        ),
        [profile?.avatar]
    );

    // ACCOUNT
    const handleAccount = () => {
        if (!table?.qrCode) {
            return;
        }
        if (profile?.isGuest) {
            navigate(`/customer/login/${table.qrCode}`);
            return;
        }

        navigate(`/customer/account/${table.qrCode}`);
    };

    return (
        <header className="bg-[var(--color-primary)] px-5 py-2 shadow-sm">
            <div className="mt-3 flex items-center justify-between">

                {/*RESTAURANT + TABLE */}
                <div>
                    <Link
                        to={'/customer/home/${table?.qrCode || ""}'}
                        className="flex items-center gap-3 text-white"
                    >
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
                                <Utensils size={22} />
                            )}

                        </div>

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

                {/* ACCOUNT */}

                <button
                    type="button"
                    onClick={handleAccount}
                    className="flex items-center gap-3 rounded-2xl px-2 py-1.5 transition "
                >

                    <div className="text-right">
                        <p className="text-sm font-semibold text-white">
                            {displayName}
                        </p>

                        <p className="text-xs text-white/80">
                            Tài khoản
                        </p>
                    </div>

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#dcebdc] text-[#4f7d4f]">
                        {currentAvatar ? (
                            <img
                                src={currentAvatar}
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