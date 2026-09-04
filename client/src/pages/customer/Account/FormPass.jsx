import {
    ArrowLeft,
    Lock,
} from "lucide-react";

import { useState } from "react";

import Button from "../../../components/Button/Button";
import Input from "../../../components/Input/Input";
import customerService from "../../../services/customer.service";

export default function FormPass({
    onBack,
    onSuccess,
}) {

    const [form, setForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (field) => (e) => {

        setForm(prev => ({
            ...prev,
            [field]: e.target.value,
        }));

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!form.currentPassword) {
            alert("Vui lòng nhập mật khẩu hiện tại.");
            return;
        }

        if (!form.newPassword) {
            alert("Vui lòng nhập mật khẩu mới.");
            return;
        }

        if (form.newPassword !== form.confirmPassword) {
            alert("Mật khẩu xác nhận không khớp.");
            return;
        }

        try {

            setLoading(true);

            await customerService.changePassword({
                currentPassword: form.currentPassword,
                newPassword: form.newPassword,
            });

            alert("Đổi mật khẩu thành công.");

            onSuccess();

        } catch (err) {

            alert(
                err.response?.data?.message ||
                err.message ||
                "Không thể đổi mật khẩu."
            );

        } finally {

            setLoading(false);

        }

    };

    return (
        <div className="min-h-screen bg-[var(--color-background)]">

            <div className="bg-[var(--color-primary)] px-5 py-4 shadow-sm">

                <div className="flex items-center gap-3">

                    <button
                        type="button"
                        onClick={onBack}
                        className="rounded-full pt-1 text-white hover:bg-gray-100"
                    >
                        <ArrowLeft size={30} />
                    </button>

                    <h1 className="text-xl font-bold text-white">
                        Đổi mật khẩu
                    </h1>

                </div>

            </div>

            <div className="p-5">

                <form
                    onSubmit={handleSubmit}
                    className="rounded-3xl bg-white p-6 shadow-sm"
                >

                    <div className="space-y-5">

                        <Input
                            type="password"
                            icon={<Lock size={18} />}
                            placeholder="Mật khẩu hiện tại"
                            value={form.currentPassword}
                            onChange={handleChange(
                                "currentPassword"
                            )}
                        />

                        <Input
                            type="password"
                            icon={<Lock size={18} />}
                            placeholder="Mật khẩu mới"
                            value={form.newPassword}
                            onChange={handleChange(
                                "newPassword"
                            )}
                        />

                        <Input
                            type="password"
                            icon={<Lock size={18} />}
                            placeholder="Xác nhận mật khẩu mới"
                            value={form.confirmPassword}
                            onChange={handleChange(
                                "confirmPassword"
                            )}
                        />

                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="mt-6 w-full"
                    >
                        {loading
                            ? "Đang cập nhật..."
                            : "Đổi mật khẩu"
                        }
                    </Button>

                </form>

            </div>

        </div>
    );
}