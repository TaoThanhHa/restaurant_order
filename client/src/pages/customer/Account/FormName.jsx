import {
    ArrowLeft,
    User,
    Camera,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";

import Button from "../../../components/Button/Button";
import Input from "../../../components/Input/Input";
import customerService from "../../../services/customer.service";

export default function FormName({
    profile,
    onBack,
    onSuccess,
}) {

    const [name, setName] = useState(
        profile?.name || ""
    );

    const [avatar, setAvatar] = useState(
        profile?.avatar || null
    );

    const [avatarFile, setAvatarFile] = useState(null);

    const [loading, setLoading] = useState(false);

    const fileInputRef = useRef(null);


    // =================================================
    // CHỌN AVATAR
    // =================================================

    const handleAvatarChange = (e) => {

        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        // Kiểm tra loại file
        if (!file.type.startsWith("image/")) {

            alert("Vui lòng chọn file hình ảnh.");

            return;
        }

        // Giới hạn 5MB
        if (file.size > 5 * 1024 * 1024) {

            alert("Ảnh không được vượt quá 5MB.");

            return;
        }

        setAvatarFile(file);

        // Preview
        const previewUrl =
            URL.createObjectURL(file);

        setAvatar(previewUrl);

    };


    // =================================================
    // SUBMIT
    // =================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!name.trim()) {

            alert(
                "Vui lòng nhập họ và tên."
            );

            return;
        }

        try {

            setLoading(true);


            /*
             * Gửi FormData vì có file avatar.
             */

            const formData = new FormData();

            formData.append(
                "name",
                name.trim()
            );


            if (avatarFile) {

                formData.append(
                    "avatar",
                    avatarFile
                );

            }


            const res =
                await customerService.updateProfile(
                    formData
                );


            alert(
                "Cập nhật thông tin thành công."
            );


            onSuccess(
                res.data
            );


        } catch (err) {

            console.error(
                "Cập nhật thông tin thất bại:",
                err
            );

            alert(
                err.response?.data?.message ||
                err.message ||
                "Không thể cập nhật thông tin."
            );

        } finally {

            setLoading(false);

        }

    };


    // =================================================
    // CLEAN OBJECT URL
    // =================================================

    useEffect(() => {

        return () => {

            if (
                avatar &&
                avatar.startsWith("blob:")
            ) {

                URL.revokeObjectURL(avatar);

            }

        };

    }, [avatar]);


    return (

        <div className="min-h-screen bg-slate-100">


            {/* HEADER */}

            <div className="bg-[#4f7d4f] px-5 py-4 shadow-sm">

                <div className="flex items-center gap-3">

                    <button
                        type="button"
                        onClick={onBack}
                        className="rounded-full pt-1 text-white hover:bg-gray-100"
                    >

                        <ArrowLeft size={30} />

                    </button>

                    <h1 className="text-xl font-bold text-white">
                        Chỉnh sửa thông tin
                    </h1>

                </div>

            </div>


            <div className="p-5">

                <form
                    onSubmit={handleSubmit}
                    className="rounded-3xl bg-white p-6 shadow-sm"
                >


                    {/* AVATAR */}

                    <div className="mb-7 flex flex-col items-center">

                        <button
                            type="button"
                            onClick={() =>
                                fileInputRef.current?.click()
                            }
                            className="
                                group relative
                                h-24 w-24
                                overflow-hidden
                                rounded-full
                                bg-gray-200
                            "
                        >

                            {avatar ? (

                                <img
                                    src={avatar}
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

                            <div className="
                                absolute inset-0
                                flex items-center justify-center
                                bg-black/40
                                opacity-0
                                transition
                                group-hover:opacity-100
                            ">

                                <Camera
                                    size={25}
                                    className="text-white"
                                />

                            </div>

                        </button>


                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                        />


                        <p className="mt-2 text-xs text-gray-500">
                            Nhấn vào ảnh để thay đổi
                        </p>

                    </div>


                    {/* NAME */}

                    <Input
                        icon={<User size={18} />}
                        value={name}
                        onChange={(e) =>
                            setName(e.target.value)
                        }
                        placeholder="Họ và tên"
                    />


                    {/* SUBMIT */}

                    <Button
                        type="submit"
                        disabled={loading}
                        className="mt-6 w-full"
                    >

                        {loading
                            ? "Đang cập nhật..."
                            : "Lưu thay đổi"
                        }

                    </Button>

                </form>

            </div>

        </div>

    );

}