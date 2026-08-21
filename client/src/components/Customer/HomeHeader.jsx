import { User } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

export default function HomeHeader({
    profile,
    table,
}) {

    const navigate = useNavigate();

    const displayName =
        profile?.name ||
        "Khách hàng";

    const avatarLetter =
        displayName.charAt(0).toUpperCase();

    const handleAccount = () => {
        if (!table?.qrCode) {
            return;
        }

        // Khách chưa đăng nhập
        if (profile?.isGuest) {
            navigate(`/customer/login/${table.qrCode}`);
            return;
        }

        // Khách đã đăng nhập
        navigate(`/customer/account/${table.qrCode}`);
    };

    return (

        <header className="bg-[#4f7d4f] px-5 py-2 shadow-sm">

            <div className="mt-3 flex items-center justify-between">

                {/* THÔNG TIN BÀN */}

                <div>

                    <Link
                        to={`/customer/home/${table.qrCode}`}
                        className="text-[28px] font-bold text-white"
                    >
                        Làng Tre
                    </Link>

                    <p className="text-sm text-white pt-2">

                        {table?.branchName && (
                            <>
                                {table.branchName}
                                {" • "}
                            </>
                        )}

                        Bàn {table?.tableNumber || "..."}

                    </p>

                </div>


                {/* ACCOUNT */}

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