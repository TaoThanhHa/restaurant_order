import { useState } from "react";
import {
    Lock,
    Save,
} from "lucide-react";

import adminService from "../../../../services/admin.service";

function SecuritySection() {

    const [form, setForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [loading, setLoading] = useState(false);
    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
            alert("Vui lòng nhập đầy đủ thông tin.");
            return;
        }

        if (form.newPassword.length < 6) {
            alert("Mật khẩu mới phải có ít nhất 6 ký tự.");
            return;
        }

        if (form.newPassword !== form.confirmPassword) {
            alert("Mật khẩu xác nhận không khớp.");
            return;
        }

        try {
            setLoading(true);
            await adminService.changePassword({
                currentPassword:form.currentPassword,
                newPassword: form.newPassword,
            });

            alert("Đổi mật khẩu thành công.");

            setForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });

        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Không thể đổi mật khẩu."
            );
        } finally {
            setLoading(false);
        }

    };


    return (
        <section
            className="
                bg-white
                rounded-xl
                border
                border-[var(--color-border)]
                p-6
            "
        >

            <div className="mb-6">

                <h2 className="text-xl font-bold text-[var(--color-text)]">
                    Bảo mật
                </h2>

                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                    Thay đổi mật khẩu đăng nhập
                </p>

            </div>


            <form
                onSubmit={handleSubmit}
                className="max-w-xl"
            >

                {/* CURRENT */}

                <div className="mb-5">

                    <label className="block mb-2 font-medium">
                        Mật khẩu hiện tại
                    </label>

                    <div className="relative">

                        <Lock
                            size={18}
                            className="
                                absolute
                                left-3
                                top-1/2
                                -translate-y-1/2
                                text-gray-400
                            "
                        />

                        <input
                            type="password"
                            name="currentPassword"
                            value={
                                form.currentPassword
                            }
                            onChange={handleChange}
                            className="
                                w-full
                                pl-10
                                pr-4
                                py-3
                                rounded-lg
                                border
                            "
                        />

                    </div>

                </div>


                {/* NEW */}

                <div className="mb-5">

                    <label className="block mb-2 font-medium">
                        Mật khẩu mới
                    </label>

                    <input
                        type="password"
                        name="newPassword"
                        value={form.newPassword}
                        onChange={handleChange}
                        placeholder="Ít nhất 6 ký tự"
                        className="
                            w-full
                            px-4
                            py-3
                            rounded-lg
                            border
                        "
                    />

                </div>


                {/* CONFIRM */}

                <div className="mb-6">

                    <label className="block mb-2 font-medium">
                        Xác nhận mật khẩu mới
                    </label>

                    <input
                        type="password"
                        name="confirmPassword"
                        value={
                            form.confirmPassword
                        }
                        onChange={handleChange}
                        className="
                            w-full
                            px-4
                            py-3
                            rounded-lg
                            border
                        "
                    />

                </div>


                <button
                    type="submit"
                    disabled={loading}
                    className="
                        flex
                        items-center
                        gap-2
                        px-5
                        py-3
                        rounded-lg
                        bg-[var(--color-primary)]
                        text-white
                        disabled:opacity-50
                    "
                >

                    <Save size={18} />

                    {loading
                        ? "Đang cập nhật..."
                        : "Đổi mật khẩu"
                    }

                </button>

            </form>

        </section>
    );
}

export default SecuritySection;