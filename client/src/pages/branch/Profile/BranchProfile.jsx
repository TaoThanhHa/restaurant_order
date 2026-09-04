import { useEffect, useState } from "react";
import { Lock, User, Mail, Building2, Building } from "lucide-react";

import Button from "../../../components/Button/Button";
import userService from "../../../services/user.service";

export default function CashierProfile() {

    const [user, setUser] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const [form, setForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {

        const loadProfile = async () => {

            try {

                const res = await userService.getProfile();

                setUser(res.data);

            } catch (err) {

                alert(
                    err.response?.data?.message ||
                    err.message
                );

            }

        };

        loadProfile();
    }, []);

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (
            !form.currentPassword ||
            !form.newPassword ||
            !form.confirmPassword
        ) {
            alert("Vui lòng nhập đầy đủ thông tin.");
            return;
        }

        if (form.newPassword.length < 6) {
            alert(
                "Mật khẩu mới phải có ít nhất 6 ký tự."
            );
            return;
        }

        if (
            form.newPassword !==
            form.confirmPassword
        ) {
            alert(
                "Xác nhận mật khẩu không khớp."
            );
            return;
        }

        try {

            setLoading(true);

            await userService.changePassword({

                currentPassword:
                    form.currentPassword,

                newPassword:
                    form.newPassword,

            });

            alert("Đổi mật khẩu thành công.");

            setForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });

        } catch (err) {

            alert(
                err.response?.data?.message ||
                err.message
            );

        } finally {

            setLoading(false);

        }

    };

    if (!user) {
        return (
            <div className="p-6 text-gray-500">
                Đang tải thông tin...
            </div>
        );
    }

    return (

        <div className="p-6">

            <div className="mx-auto max-w-3xl">

                <h1 className="mb-6 text-2xl font-bold">
                    Thông tin tài khoản
                </h1>

                {/* THÔNG TIN */}

                <div className="rounded-2xl bg-white p-6 shadow-sm">

                    {/* <div className="mb-6 flex items-center gap-4">

                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-500">
                            <User size={28} />
                        </div>

                        <div>

                            <h2 className="text-lg font-bold">
                                {user.branch?.name}
                            </h2>

                            <p className="text-sm text-gray-500">
                                Tài khoản Cashier
                            </p> 

                        </div>

                    </div> */}

                    <div className="grid gap-4 md:grid-cols-3">

                        {/* USERNAME */}

                         <div className="rounded-xl border p-4">

                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <User size={16} />
                                Tên 
                            </div>

                            <div className="mt-2 font-semibold">
                                {user.username}
                            </div>

                        </div> 

                        {/* EMAIL */}

                        <div className="rounded-xl border p-4">

                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Mail size={16} />
                                Email
                            </div>

                            <div className="mt-2 font-semibold">
                                {user.email}
                            </div>

                        </div>

                        {/* BRANCH */}

                        <div className="rounded-xl border p-4">

                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Building2 size={16} />
                                Chi nhánh
                            </div>

                            <div className="mt-2 font-semibold">
                                {user.branch?.name ||
                                    "Chưa phân chi nhánh"}
                            </div>

                        </div>

                        {/* STATUS */}

                        {/* <div className="rounded-xl border p-4">

                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Building size={16} />
                                Trạng thái
                            </div>

                            <div className="mt-2">

                                <span
                                    className={`rounded-full px-3 py-1 text-sm font-semibold ${
                                        user.isActive
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                    }`}
                                >
                                    {user.isActive
                                        ? "Đang hoạt động"
                                        : "Đã khóa"}
                                </span>

                            </div>

                        </div> */}

                    </div>

                </div>

                {/* ĐỔI MẬT KHẨU */}

                <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">

                    <div className="mb-5 flex items-center gap-2">

                        <Lock size={20} />

                        <h2 className="text-lg font-bold">
                            Đổi mật khẩu
                        </h2>

                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-4"
                    >

                        <input
                            type="password"
                            name="currentPassword"
                            value={form.currentPassword}
                            onChange={handleChange}
                            placeholder="Mật khẩu hiện tại"
                            className="w-full rounded-lg border px-4 py-2 outline-none focus:border-red-500"
                        />

                        <input
                            type="password"
                            name="newPassword"
                            value={form.newPassword}
                            onChange={handleChange}
                            placeholder="Mật khẩu mới"
                            className="w-full rounded-lg border px-4 py-2 outline-none focus:border-red-500"
                        />

                        <input
                            type="password"
                            name="confirmPassword"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            placeholder="Xác nhận mật khẩu mới"
                            className="w-full rounded-lg border px-4 py-2 outline-none focus:border-red-500"
                        />

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full"
                        >
                            {loading
                                ? "Đang xử lý..."
                                : "Đổi mật khẩu"}
                        </Button>

                    </form>

                </div>

            </div>

        </div>

    );
}