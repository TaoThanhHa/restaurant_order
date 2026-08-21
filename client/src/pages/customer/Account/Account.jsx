import {
    ArrowLeft,
    User,
    Phone,
    Mail,
    Lock,
    ChevronRight,
    Pencil,
    LogOut,
    ReceiptText,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import customerAuthService from "../../../services/customerAuth.service";
import useCustomerAuth from "../../../hooks/useCustomerAuth";

import FormName from "./FormName";
import FormPhone from "./FormPhone";
import FormMail from "./FormMail";
import FormPass from "./FormPass";

export default function CustomerAccount() {

    const navigate = useNavigate();
    const { qrCode } = useParams();

    const { logout } = useCustomerAuth();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);


    // =================================================
    // LOAD PROFILE
    // =================================================

    useEffect(() => {

        const loadProfile = async () => {

            try {

                const res =
                    await customerAuthService.profile();

                setProfile(res.data);

            } catch (error) {

                console.error(
                    "Không lấy được thông tin tài khoản:",
                    error
                );

            } finally {

                setLoading(false);

            }

        };

        loadProfile();

    }, []);


    // =================================================
    // LOGOUT
    // =================================================

    const handleLogout = () => {

        logout();

        navigate(
            `/customer/${qrCode}`,
            {
                replace: true,
            }
        );

    };


    // =================================================
    // LOADING
    // =================================================

    if (loading) {

        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-100">

                <div className="text-gray-500">
                    Đang tải...
                </div>

            </div>
        );

    }


    // =================================================
    // PROFILE ERROR
    // =================================================

    if (!profile) {

        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-100">

                <div className="text-gray-500">
                    Không thể tải thông tin tài khoản.
                </div>

            </div>
        );

    }


    // =================================================
    // EDIT NAME
    // =================================================

    if (editing === "name") {

        return (
            <FormName
                profile={profile}

                onBack={() =>
                    setEditing(null)
                }

                onSuccess={(updatedProfile) => {

                    setProfile(updatedProfile);

                    setEditing(null);

                }}
            />
        );

    }


    // =================================================
    // EDIT PHONE
    // =================================================

    if (editing === "phone") {

        return (
            <FormPhone
                profile={profile}

                onBack={() =>
                    setEditing(null)
                }

                onSuccess={(updatedProfile) => {

                    setProfile(updatedProfile);

                    setEditing(null);

                }}
            />
        );

    }


    // =================================================
    // EDIT EMAIL
    // =================================================

    if (editing === "email") {

        return (
            <FormMail
                profile={profile}

                onBack={() =>
                    setEditing(null)
                }

                onSuccess={(updatedProfile) => {

                    setProfile(updatedProfile);

                    setEditing(null);

                }}
            />
        );

    }


    // =================================================
    // CHANGE PASSWORD
    // =================================================

    if (editing === "password") {

        return (
            <FormPass

                onBack={() =>
                    setEditing(null)
                }

                onSuccess={() =>
                    setEditing(null)
                }

            />
        );

    }


    // =================================================
    // ACCOUNT
    // =================================================

    return (

        <div className="min-h-screen bg-slate-100 pb-8">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="bg-[#4f7d4f] px-5 py-4 shadow-sm">

                <div className="flex items-center gap-3">

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                `/customer/home/${qrCode}`
                            )
                        }
                        className="rounded-full mt-1 font-bold text-white hover:bg-gray-100"
                    >

                        <ArrowLeft size={30} />

                    </button>

                    <h1 className="text-xl font-bold text-white">
                        Thông tin tài khoản
                    </h1>

                </div>

            </div>


            <div className="space-y-4 p-5">


                {/* =================================================
                    PROFILE
                ================================================= */}

                <div className="rounded-3xl bg-white p-6 shadow-sm">

                    <div className="flex flex-col items-center">

                        {/* AVATAR */}

                        <div className="h-24 w-24 overflow-hidden rounded-full bg-gray-200">

                            {profile.avatar ? (

                                <img
                                    src={profile.avatar}
                                    alt="Avatar"
                                    className="h-full w-full object-cover"
                                />

                            ) : (

                                <div className="flex h-full w-full items-center justify-center">

                                    <User
                                        size={42}
                                        className="text-gray-500"
                                    />

                                </div>

                            )}

                        </div>


                        {/* NAME */}

                        <h2 className="mt-4 text-xl font-bold">

                            {profile.name ||
                                "Khách hàng"}

                        </h2>


                        {/* EMAIL */}

                        {profile.email && (

                            <p className="mt-1 text-sm text-gray-500">

                                {profile.email}

                            </p>

                        )}

                    </div>

                </div>


                {/* =================================================
                    THÔNG TIN CÁ NHÂN
                ================================================= */}

                <div className="rounded-3xl bg-white p-5 shadow-sm">

                    <h2 className="mb-4 text-lg font-bold">

                        Thông tin cá nhân

                    </h2>


                    {/* NAME */}

                    <AccountRow
                        icon={<User size={19} />}
                        label="Họ và tên"
                        value={
                            profile.name ||
                            "Chưa cập nhật"
                        }
                        onEdit={() =>
                            setEditing("name")
                        }
                    />


                    {/* PHONE */}

                    <AccountRow
                        icon={<Phone size={19} />}
                        label="Số điện thoại"
                        value={
                            profile.phone ||
                            "Chưa cập nhật"
                        }
                        onEdit={() =>
                            setEditing("phone")
                        }
                    />


                    {/* EMAIL */}

                    <AccountRow
                        icon={<Mail size={19} />}
                        label="Email"
                        value={
                            profile.email ||
                            "Chưa cập nhật"
                        }
                        onEdit={() =>
                            setEditing("email")
                        }
                    />


                    {/* PASSWORD */}

                    <AccountRow
                        icon={<Lock size={19} />}
                        label="Mật khẩu"
                        value="••••••••"
                        onEdit={() =>
                            setEditing("password")
                        }
                    />

                </div>


                {/* =================================================
                    HISTORY
                ================================================= */}

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            `/customer/history/${qrCode}`
                        )
                    }
                    className="
                        flex w-full
                        items-center justify-between
                        rounded-3xl
                        bg-white
                        p-5
                        text-left
                        shadow-sm
                        transition
                        hover:bg-gray-50
                    "
                >

                    <div className="flex items-center gap-4">

                        <div className="
                            flex h-11 w-11
                            items-center justify-center
                            rounded-full
                            bg-[#eef6ee]
                            text-[#4f7d4f]
                        ">

                            <ReceiptText size={22} />

                        </div>


                        <div>

                            <div className="font-semibold">

                                Lịch sử đơn hàng

                            </div>

                            <div className="text-sm text-gray-500">

                                Xem các đơn hàng đã thanh toán

                            </div>

                        </div>

                    </div>


                    <ChevronRight
                        size={22}
                        className="text-gray-400"
                    />

                </button>


                {/* =================================================
                    LOGOUT
                ================================================= */}

                <button
                    type="button"
                    onClick={handleLogout}
                    className="
                        flex w-full
                        items-center gap-4
                        rounded-3xl
                        bg-white
                        p-5
                        text-left
                        text-red-500
                        shadow-sm
                    "
                >

                    <div className="
                        flex h-11 w-11
                        items-center justify-center
                        rounded-full
                        bg-red-50
                    ">

                        <LogOut size={21} />

                    </div>


                    <span className="font-semibold">

                        Đăng xuất

                    </span>

                </button>

            </div>

        </div>

    );

}


// =================================================
// ACCOUNT ROW
// =================================================

function AccountRow({
    icon,
    label,
    value,
    onEdit,
}) {

    return (

        <div className="
            flex items-center gap-3
            border-b py-4
            last:border-b-0
        ">

            <div className="text-gray-500">

                {icon}

            </div>


            <div className="min-w-0 flex-1">

                <div className="text-xs text-gray-500">

                    {label}

                </div>


                <div className="mt-1 truncate font-medium">

                    {value}

                </div>

            </div>


            {onEdit && (

                <button
                    type="button"
                    onClick={onEdit}
                    className="
                        flex h-9 w-9 shrink-0
                        items-center justify-center
                        rounded-full
                        text-gray-400
                        transition
                        hover:bg-[#eef6ee]
                        hover:text-[#4f7d4f]
                    "
                    title={`Chỉnh sửa ${label.toLowerCase()}`}
                >

                    <Pencil size={17} />

                </button>

            )}

        </div>

    );

}