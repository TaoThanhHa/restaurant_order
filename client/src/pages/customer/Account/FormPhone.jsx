import {
    ArrowLeft,
    Phone,
    Save,
} from "lucide-react";

import { useState } from "react";

import Input from "../../../components/Input/Input";
import Button from "../../../components/Button/Button";

import customerService from "../../../services/customer.service";

export default function FormPhone({
    profile,
    onBack,
    onSuccess,
}) {

    const [phone, setPhone] = useState(
        profile?.phone || ""
    );

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {

        e.preventDefault();

        const value = phone.trim();

        if (!value) {
            alert("Vui lòng nhập số điện thoại.");
            return;
        }

        // Có thể điều chỉnh regex theo rule của hệ thống
        if (!/^0\d{9,10}$/.test(value)) {
            alert("Số điện thoại không hợp lệ.");
            return;
        }

        if (value === profile?.phone) {
            alert("Số điện thoại chưa thay đổi.");
            return;
        }

        try {

            setLoading(true);

            const res =
                await customerService.updatePhone({
                    phone: value,
                });

            alert("Cập nhật số điện thoại thành công.");

            if (onSuccess) {
                onSuccess(
                    res.data
                );
            }

        } catch (err) {

            console.error(
                "Cập nhật số điện thoại thất bại:",
                err
            );

            alert(
                err.response?.data?.message ||
                err.message ||
                "Không thể cập nhật số điện thoại."
            );

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="min-h-screen bg-slate-100 pb-8">

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
                        Đổi số điện thoại
                    </h1>

                </div>

            </div>


            {/* FORM */}

            <div className="p-5">

                <form
                    onSubmit={handleSubmit}
                    className="rounded-3xl bg-white p-6 shadow-sm"
                >

                    <div className="mb-6">

                        <h2 className="text-lg font-bold">
                            Số điện thoại
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Nhập số điện thoại mới của bạn.
                        </p>

                    </div>


                    <Input
                        icon={<Phone size={18} />}
                        placeholder="Số điện thoại"
                        value={phone}
                        onChange={(e) =>
                            setPhone(e.target.value)
                        }
                    />


                    <div className="mt-6">

                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-2"
                        >

                            <Save size={18} />

                            {loading
                                ? "Đang cập nhật..."
                                : "Lưu thay đổi"
                            }

                        </Button>

                    </div>

                </form>

            </div>

        </div>

    );

}