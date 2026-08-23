import { useEffect, useState } from "react";
import { X } from "lucide-react";

import Button from "../../../components/Button/Button";
import staffService from "../../../services/staff.service";

export default function StaffFormModal({
    open,
    onClose,
    reload,
    branchId,
    staff,
}) {
    const [form, setForm] = useState({
        username: "",
        email: "",
        role: "ORDER",
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) return;

        if (staff) {
            setForm({
                username: staff.username || "",
                email: staff.email || "",
                role: staff.role?.name || "ORDER",
            });
        } else {
            setForm({
                username: "",
                email: "",
                role: "ORDER",
            });
        }
    }, [staff, open]);

    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            if (staff) {
                await staffService.update(
                    branchId,
                    staff.id,
                    form
                );

                alert("Cập nhật nhân viên thành công.");
            } else {
                await staffService.create(
                    branchId,
                    form
                );

                alert(
                    "Tạo nhân viên thành công. Thông tin đăng nhập đã được gửi qua email."
                );
            }

            await reload();
            onClose();
        } catch (err) {
            console.error(err);

            alert(
                err.response?.data?.message ||
                err.message ||
                "Có lỗi xảy ra."
            );
        } finally {
            setLoading(false);
        }
    };

    if (!open) {
        return null;
    }

    return (
        <div
            className="
                fixed inset-0 z-50
                flex items-center justify-center
                bg-black/40
                p-4
            "
            onMouseDown={(e) => {
                if (e.target === e.currentTarget && !loading) {
                    onClose();
                }
            }}
        >
            <div
                className="
                    w-full max-w-lg
                    rounded-xl
                    bg-white
                    shadow-xl
                    max-h-[90vh]
                    overflow-y-auto
                "
            >
                {/* HEADER */}
                <div
                    className="
                        flex items-center justify-between
                        border-b
                        p-5
                    "
                >
                    <h2 className="text-xl font-bold">
                        {staff
                            ? "Cập nhật nhân viên"
                            : "Thêm nhân viên"}
                    </h2>

                    <button
                        type="button"
                        disabled={loading}
                        onClick={onClose}
                        className="
                            rounded-lg p-1
                            text-gray-500
                            hover:bg-gray-100
                            hover:text-gray-800
                            disabled:opacity-40
                        "
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* FORM */}
                <form
                    onSubmit={handleSubmit}
                    className="space-y-5 p-5"
                >
                    {/* USERNAME */}
                    <div>
                        <label
                            className="
                                mb-1 block
                                font-medium
                            "
                        >
                            Tên tài khoản *
                        </label>

                        <input
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            disabled={loading}
                            className="
                                w-full
                                rounded-lg
                                border
                                p-3
                                outline-none
                                focus:border-[var(--color-primary)]
                                focus:ring-1
                                focus:ring-[var(--color-primary)]
                                disabled:bg-gray-100
                            "
                            required
                        />
                    </div>

                    {/* EMAIL */}
                    <div>
                        <label
                            className="
                                mb-1 block
                                font-medium
                            "
                        >
                            Email *
                        </label>

                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            disabled={loading}
                            className="
                                w-full
                                rounded-lg
                                border
                                p-3
                                outline-none
                                focus:border-[var(--color-primary)]
                                focus:ring-1
                                focus:ring-[var(--color-primary)]
                                disabled:bg-gray-100
                            "
                            required
                        />
                    </div>

                    {/* ROLE */}
                    <div>
                        <label
                            className="
                                mb-1 block
                                font-medium
                            "
                        >
                            Chức vụ *
                        </label>

                        <select
                            name="role"
                            value={form.role}
                            onChange={handleChange}
                            disabled={loading}
                            className="
                                w-full
                                rounded-lg
                                border
                                p-3
                                outline-none
                                focus:border-[var(--color-primary)]
                                focus:ring-1
                                focus:ring-[var(--color-primary)]
                                disabled:bg-gray-100
                            "
                        >
                            <option value="ORDER">
                                Nhân viên order
                            </option>

                            <option value="KITCHEN">
                                Nhân viên bếp
                            </option>
                        </select>
                    </div>

                    {/* BUTTON */}
                    <div
                        className="
                            flex
                            justify-end
                            gap-3
                        "
                    >
                        <Button
                            type="button"
                            disabled={loading}
                            className="!bg-gray-400"
                            onClick={onClose}
                        >
                            Hủy
                        </Button>

                        <Button
                            type="submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Đang lưu..."
                                : staff
                                    ? "Cập nhật"
                                    : "Tạo nhân viên"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}