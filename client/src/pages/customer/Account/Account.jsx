import { ArrowLeft, User, Phone, Mail, Lock, ChevronRight, Pencil, LogOut, ReceiptText, Camera, Check, X,} from "lucide-react";

import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import customerAuthService from "../../../services/customerAuth.service";
import customerService from "../../../services/customer.service";
import uploadService from "../../../services/upload.service";

import useCustomerAuth from "../../../hooks/useCustomerAuth";

import Input from "../../../components/Input/Input";
import Button from "../../../components/Button/Button";
import FormMail from "./FormMail";
import FormPass from "./FormPass";

export default function CustomerAccount() {
    const navigate = useNavigate();
    const { qrCode } = useParams();
    const { logout } = useCustomerAuth();

    const fileInputRef = useRef(null);

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const [editing, setEditing] = useState(null);

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");

    const [savingName, setSavingName] = useState(false);
    const [savingPhone, setSavingPhone] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    // SERVER URL
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const SERVER_URL = API_URL.replace(/\/api\/?$/, "");

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

    // LOAD PROFILE
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const res = await customerAuthService.profile();
                const data = res.data;

                setProfile(data);
                setName(data?.name || "");
                setPhone(data?.phone || "");
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

    
    // UPLOAD AVATAR
    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = "";

        if (!file) {  return; }

        // Kiểm tra định dạng
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            alert(
                "Chỉ được chọn ảnh JPG, PNG hoặc WEBP."
            );
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert("Ảnh không được vượt quá 5MB.");
            return;
        }

        try {
            setUploadingAvatar(true);
            const res = await uploadService.uploadCustomerAvatar( file );
            const updatedProfile = res.data;

            setProfile((prev) => ({
                ...prev,
                ...updatedProfile,
            }));

            setName(updatedProfile.name || "");
            setPhone(updatedProfile.phone || "");

            alert(
                "Cập nhật ảnh đại diện thành công."
            );
        } catch (error) {
            console.error(
                "Upload avatar thất bại:",
                error
            );

            alert(
                error.response?.data?.message ||
                    error.message ||
                    "Không thể cập nhật ảnh đại diện."
            );
        } finally {
            setUploadingAvatar(false);
        }
    };

    
    // EDIT NAME
    const handleEditName = () => {
        setName(profile?.name || "");
        setEditing("name");
    };

    
    // SAVE NAME
    const handleSaveName = async () => {
        const value = name.trim();

        if (!value) {
            alert("Vui lòng nhập họ và tên.");
            return;
        }

        if (value === profile?.name) {
            setEditing(null);
            return;
        }

        try {
            setSavingName(true);

            const res = await customerService.updateProfile({ name: value,});

            const updatedProfile = res.data;

            setProfile((prev) => ({
                ...prev,
                ...updatedProfile,
            }));

            setName(updatedProfile.name || "");

            setEditing(null);

            alert(
                "Cập nhật họ và tên thành công."
            );
        } catch (error) {
            console.error(
                "Cập nhật họ tên thất bại:",
                error
            );

            alert(
                error.response?.data?.message ||
                    error.message ||
                    "Không thể cập nhật họ và tên."
            );
        } finally {
            setSavingName(false);
        }
    };
    
    // EDIT PHONE
    const handleEditPhone = () => {
        setPhone(profile?.phone || "");
        setEditing("phone");
    };

    // SAVE PHONE
    const handleSavePhone = async () => {
        const value = phone.trim();

        if (!value) {
            alert(
                "Vui lòng nhập số điện thoại."
            );
            return;
        }

        if (!/^0\d{9,10}$/.test(value)) {
            alert(
                "Số điện thoại không hợp lệ."
            );
            return;
        }

        if (value === profile?.phone) {
            setEditing(null);
            return;
        }

        try {
            setSavingPhone(true);

            const res =
                await customerService.updatePhone({
                    phone: value,
                });

            const updatedProfile = res.data;

            setProfile((prev) => ({
                ...prev,
                ...updatedProfile,
            }));

            setPhone(
                updatedProfile.phone || ""
            );

            setEditing(null);

            alert(
                "Cập nhật số điện thoại thành công."
            );
        } catch (error) {
            console.error(
                "Cập nhật số điện thoại thất bại:",
                error
            );

            alert(
                error.response?.data?.message ||
                    error.message ||
                    "Không thể cập nhật số điện thoại."
            );
        } finally {
            setSavingPhone(false);
        }
    };

    if (editing === "email") {
        return (
            <FormMail
                profile={profile}
                onBack={() => setEditing(null)}
                onSuccess={(updatedProfile) => {
                    setProfile(updatedProfile);
                    setEditing(null);
                }}
            />
        );
    }

    // CHANGE PASSWORD
    if (editing === "password") {
        return (
            <FormPass
                onBack={() => setEditing(null)}
                onSuccess={() => setEditing(null)}
            />
        );

    }

    // CANCEL EDIT
    const handleCancelEdit = () => {
        setName(profile?.name || "");
        setPhone(profile?.phone || "");
        setEditing(null);
    };

    // LOGOUT
    const handleLogout = () => {
        logout();
        navigate( `/customer/${qrCode}`, {replace: true,});
    };

    // LOADING
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-100">
                <div className="text-gray-500">
                    Đang tải...
                </div>
            </div>
        );
    }

    
    // PROFILE ERROR
    

    if (!profile) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-100">
                <div className="text-gray-500">
                    Không thể tải thông tin tài khoản.
                </div>
            </div>
        );
    }

    // CURRENT AVATAR
    const currentAvatar =
        getAvatarUrl(profile.avatar);

    // RENDER
    return (
        <div className="min-h-screen bg-[var(--color-background)] pb-8">
            {/* HEADER*/}

            <div className="bg-[var(--color-primary)] px-5 py-4 shadow-sm">
                <div className="flex items-center gap-3">

                    <button
                        type="button"
                        onClick={() =>
                            navigate(`/customer/home/${qrCode}`)
                        }
                        className="rounded-full pt-1 text-white transition"
                    >
                        <ArrowLeft size={30} />
                    </button>

                    <h1 className="text-xl font-bold text-white">
                        Thông tin tài khoản
                    </h1>

                </div>
            </div>

            <div className="space-y-4 p-5">

                {/* PROFILE CARD*/}

                <div className="rounded-3xl bg-white p-6 shadow-sm">

                    <div className="flex flex-col items-center">

                        {/* AVATAR */}

                        <button
                            type="button"
                            disabled={uploadingAvatar}
                            onClick={() =>
                                fileInputRef.current?.click()
                            }
                            className="group relative h-24 w-24 overflow-hidden rounded-full bg-gray-200 disabled:cursor-wait"
                        >

                            {currentAvatar ? (
                                <img
                                    src={currentAvatar}
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

                            {/* OVERLAY */}

                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">

                                {uploadingAvatar ? (
                                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                ) : (
                                    <Camera
                                        size={25}
                                        className="text-white"
                                    />
                                )}

                            </div>

                        </button>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleAvatarChange}
                            className="hidden"
                        />

                        <p className="mt-2 text-xs text-gray-500">
                            {uploadingAvatar
                                ? "Đang tải ảnh..."
                                : "Nhấn vào ảnh để thay đổi"}
                        </p>

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

                {/* 
                    PERSONAL INFORMATION
                 */}

                <div className="rounded-3xl bg-white p-5 shadow-sm">

                    <h2 className="mb-2 text-lg font-bold">
                        Thông tin cá nhân
                    </h2>

                    {/* 
                        NAME
                     */}

                    {editing === "name" ? (
                        <div className="border-b py-4">

                            <div className="mb-3 flex items-center gap-3">

                                <div className="text-gray-500">
                                    <User size={19} />
                                </div>

                                <div className="text-xs text-gray-500">
                                    Họ và tên
                                </div>

                            </div>

                            <Input
                                icon={
                                    <User size={18} />
                                }
                                value={name}
                                onChange={(e) =>
                                    setName(
                                        e.target.value
                                    )
                                }
                                placeholder="Họ và tên"
                            />

                            <div className="mt-3 flex gap-2">

                                <Button
                                    type="button"
                                    disabled={savingName}
                                    onClick={
                                        handleSaveName
                                    }
                                    className="flex flex-1 items-center justify-center gap-2"
                                >
                                    <Check size={17} />

                                    {savingName
                                        ? "Đang lưu..."
                                        : "Lưu"}
                                </Button>

                                <button
                                    type="button"
                                    disabled={savingName}
                                    onClick={
                                        handleCancelEdit
                                    }
                                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200"
                                >
                                    <X size={18} />
                                </button>

                            </div>

                        </div>
                    ) : (
                        <AccountRow
                            icon={<User size={19} />}
                            label="Họ và tên"
                            value={
                                profile.name ||
                                "Chưa cập nhật"
                            }
                            onEdit={
                                handleEditName
                            }
                        />
                    )}

                    {/* 
                        PHONE
                     */}

                    {editing === "phone" ? (
                        <div className="border-b py-4">

                            <div className="mb-3 flex items-center gap-3">

                                <div className="text-gray-500">
                                    <Phone size={19} />
                                </div>

                                <div className="text-xs text-gray-500">
                                    Số điện thoại
                                </div>

                            </div>

                            <Input
                                icon={
                                    <Phone size={18} />
                                }
                                value={phone}
                                onChange={(e) =>
                                    setPhone(
                                        e.target.value
                                    )
                                }
                                placeholder="Số điện thoại"
                                type="tel"
                            />

                            <div className="mt-3 flex gap-2">

                                <Button
                                    type="button"
                                    disabled={savingPhone}
                                    onClick={
                                        handleSavePhone
                                    }
                                    className="flex flex-1 items-center justify-center gap-2"
                                >
                                    <Check size={17} />

                                    {savingPhone
                                        ? "Đang lưu..."
                                        : "Lưu"}
                                </Button>

                                <button
                                    type="button"
                                    disabled={savingPhone}
                                    onClick={
                                        handleCancelEdit
                                    }
                                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200"
                                >
                                    <X size={18} />
                                </button>

                            </div>

                        </div>
                    ) : (
                        <AccountRow
                            icon={<Phone size={19} />}
                            label="Số điện thoại"
                            value={
                                profile.phone ||
                                "Chưa cập nhật"
                            }
                            onEdit={
                                handleEditPhone
                            }
                        />
                    )}

                    {/* 
                        EMAIL
                     */}

                    <AccountRow
                        icon={<Mail size={19} />}
                        label="Email"
                        value={
                            profile.email ||
                            "Chưa cập nhật"
                        }
                        onEdit={() => {
                            setEditing("email")
                        }}
                    />

                    {/* 
                        PASSWORD
                     */}

                    <AccountRow
                        icon={<Lock size={19} />}
                        label="Mật khẩu"
                        value="••••••••"
                        onEdit={() => {
                            setEditing("password")
                        }}
                    />

                </div>

                {/* 
                    ORDER HISTORY
                 */}

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            `/customer/history/${qrCode}`
                        )
                    }
                    className="flex w-full items-center justify-between rounded-3xl bg-white p-5 text-left shadow-sm transition hover:bg-gray-50"
                >

                    <div className="flex items-center gap-4">

                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eef6ee] text-[#4f7d4f]">
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

                {/* 
                    LOGOUT
                 */}

                <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-4 rounded-3xl bg-white p-5 text-left text-red-500 shadow-sm transition hover:bg-red-50"
                >

                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50">
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


// ACCOUNT ROW


function AccountRow({
    icon,
    label,
    value,
    onEdit,
}) {
    return (
        <div className="flex items-center gap-3 border-b py-4 last:border-b-0">

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
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-[#eef6ee] hover:text-[#4f7d4f]"
                    title={`Chỉnh sửa ${label.toLowerCase()}`}
                >
                    <Pencil size={17} />
                </button>
            )}

        </div>
    );
}