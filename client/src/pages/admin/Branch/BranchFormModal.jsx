import { useEffect, useState } from "react";
import { X } from "lucide-react";

import Button from "../../../components/Button/Button";
import NotiModal from "../../../components/NotiModal/NotiModal";
import branchService from "../../../services/branch.service";

export default function BranchFormModal({
    open,
    onClose,
    reload,
    branch,
}) {
    const [form, setForm] = useState({
        name: "",
        address: "",
        email: "",
        phone: "",
    });

    const [loading, setLoading] = useState(false);

    const [notification, setNotification] = useState({
        open: false,
        type: "success",
        title: "",
        message: "",
    });

    // NOTIFICATION
    const showNotification = ({
        type = "success",
        title = "",
        message = "",
    }) => {
        setNotification({
            open: true,
            type,
            title,
            message,
        });
    };

    const closeNotification = () => {
        setNotification({
            open: false,
            type: "success",
            title: "",
            message: "",
        });
    };

    useEffect(() => {
        if (!open) return;

        if (branch) {
            setForm({
                name: branch.name || "",
                address: branch.address || "",
                email: branch.email || "",
                phone: branch.phone || "",
            });
        } else {
            setForm({
                name: "",
                address: "",
                email: "",
                phone: "",
            });
        }
    }, [branch, open]);

    // INPUT
    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // SAVE
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            if (branch) {
                const emailChanged = branch.email !== form.email;
                await branchService.update( branch.id, form);
                await reload();
                onClose();

                if (emailChanged) {
                    showNotification({
                        type: "success",
                        title: "Cập nhật thành công",
                        message:
                            "Đã cập nhật chi nhánh. Email đăng nhập đã thay đổi, hệ thống đã tạo mật khẩu mới và gửi tới email mới.",
                    });
                } else {
                    showNotification({
                        type: "success",
                        title: "Cập nhật thành công",
                        message:
                            "Thông tin chi nhánh đã được cập nhật.",
                    });
                }
            } else {
                await branchService.create(form);
                await reload();
                onClose();

                showNotification({
                    type: "success",
                    title: "Tạo chi nhánh thành công",
                    message:
                        "Chi nhánh đã được tạo. Thông tin đăng nhập đã được gửi tới email của chi nhánh.",
                });
            }
        } catch (err) {
            console.log(err);

            showNotification({
                type: "error",
                title: "Không thể lưu",
                message:
                    err.response?.data?.message ||
                    err.message ||
                    "Đã xảy ra lỗi khi lưu thông tin chi nhánh.",
            });
        } finally {
            setLoading(false);
        }
    };

    // RENDER
    if (!open) {
        return (
            <NotiModal
                open={notification.open}
                type={notification.type}
                title={notification.title}
                message={notification.message}
                onClose={closeNotification}
            />
        );
    }

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
                    {/* HEADER */}
                    <div className="flex items-center justify-between border-b p-5">
                        <h2 className="text-xl font-bold">
                            {branch
                                ? "Cập nhật chi nhánh"
                                : "Thêm chi nhánh"}
                        </h2>

                        <button
                            type="button"
                            disabled={loading}
                            onClick={onClose}
                            className="rounded-lg p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                        >
                            <X />
                        </button>
                    </div>

                    {/* FORM */}
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5 p-5"
                    >
                        {/* NAME */}

                        <div>
                            <label className="mb-1 block font-medium">
                                Tên chi nhánh *
                            </label>

                            <input
                                name="name"
                                disabled={loading}
                                value={form.name}
                                onChange={handleChange}
                                className="w-full rounded-lg border p-3 outline-none transition focus:border-[var(--color-primary)] disabled:bg-gray-100"
                                required
                            />
                        </div>

                        {/* ADDRESS */}
                        <div>
                            <label className="mb-1 block font-medium">
                                Địa chỉ
                            </label>

                            <input
                                name="address"
                                disabled={loading}
                                value={form.address}
                                onChange={handleChange}
                                className="w-full rounded-lg border p-3 outline-none transition focus:border-[var(--color-primary)] disabled:bg-gray-100"
                            />
                        </div>

                        {/* EMAIL */}
                        <div>
                            <label className="mb-1 block font-medium">
                                Email *
                            </label>

                            <input
                                type="email"
                                name="email"
                                disabled={loading}
                                value={form.email}
                                onChange={handleChange}
                                className="w-full rounded-lg border p-3 outline-none transition focus:border-[var(--color-primary)] disabled:bg-gray-100"
                                required
                            />
                        </div>

                        {/* PHONE */}
                        <div>
                            <label className="mb-1 block font-medium">
                                Số điện thoại
                            </label>

                            <input
                                name="phone"
                                disabled={loading}
                                value={form.phone}
                                onChange={handleChange}
                                className="w-full rounded-lg border p-3 outline-none transition focus:border-[var(--color-primary)] disabled:bg-gray-100"
                            />
                        </div>

                        {/* BUTTON */}
                        <div className="flex justify-end gap-3">
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
                                    : branch
                                    ? "Cập nhật"
                                    : "Thêm mới"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            {/* NOTIFICATION */}
            <NotiModal
                open={notification.open}
                type={notification.type}
                title={notification.title}
                message={notification.message}
                onClose={closeNotification}
            />
        </>
    );
}