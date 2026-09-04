import { useEffect, useState } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";

import Button from "../../../../components/Button/Button";
import NotiModal from "../../../../components/NotiModal/NotiModal";
import categoryService from "../../../../services/category.service";

export default function CategoryManagement() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState("");

    const [notification, setNotification] = useState({
        open: false,
        type: "success",
        title: "",
        message: "",
    });

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

    const getErrorMessage = (err, fallback = "Đã xảy ra lỗi.") =>
        err.response?.data?.message || err.message || fallback;

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setLoading(true);

        try {
            const res = await categoryService.getAll();
            setCategories(res.data.data);
        } catch (err) {
            console.error("LOAD CATEGORIES ERROR:", err);

            showNotification({
                type: "error",
                title: "Không thể tải danh mục",
                message: getErrorMessage(
                    err,
                    "Không thể tải danh sách danh mục."
                ),
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        const categoryName = name.trim();

        if (!categoryName) {
            showNotification({
                type: "warning",
                title: "Thiếu thông tin",
                message: "Vui lòng nhập tên danh mục.",
            });
            return;
        }

        try {
            await categoryService.create({
                name: categoryName,
            });

            setName("");
            await loadCategories();

            showNotification({
                type: "success",
                title: "Thêm thành công",
                message: "Danh mục đã được thêm.",
            });
        } catch (err) {
            console.error("CREATE CATEGORY ERROR:", err);

            showNotification({
                type: "error",
                title: "Không thể thêm danh mục",
                message: getErrorMessage(err),
            });
        }
    };

    const startEdit = (category) => {
        setEditingId(category.id);
        setEditingName(category.name);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditingName("");
    };

    const saveEdit = async () => {
        const categoryName = editingName.trim();

        if (!categoryName) {
            showNotification({
                type: "warning",
                title: "Thiếu thông tin",
                message: "Tên danh mục không được để trống.",
            });
            return;
        }

        try {
            await categoryService.update(editingId, {
                name: categoryName,
            });

            cancelEdit();
            await loadCategories();

            showNotification({
                type: "success",
                title: "Cập nhật thành công",
                message: "Danh mục đã được cập nhật.",
            });
        } catch (err) {
            console.error("UPDATE CATEGORY ERROR:", err);

            showNotification({
                type: "error",
                title: "Không thể cập nhật",
                message: getErrorMessage(err),
            });
        }
    };

    const removeCategory = async (id) => {
        const confirmed = window.confirm("Bạn có chắc muốn xóa danh mục này?");

        if (!confirmed) return;

        try {
            await categoryService.remove(id);
            await loadCategories();

            showNotification({
                type: "success",
                title: "Xóa thành công",
                message: "Danh mục đã được xóa.",
            });
        } catch (err) {
            console.error("DELETE CATEGORY ERROR:", err);

            showNotification({
                type: "error",
                title: "Không thể xóa",
                message: getErrorMessage(err),
            });
        }
    };

    return (
        <>
            <div className="flex h-full flex-col">
                <div className="flex justify-between border-b bg-[var(--color-background)] p-3">
                    <div>
                        <h2 className="text-xl font-bold text-[var(--color-text)]">
                            Quản lý danh mục
                        </h2>

                        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                            Có {categories.length} danh mục
                        </p>
                    </div>

                    <div className="mt-3 flex gap-3">
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Tên danh mục..."
                            className="flex-1 h-10 rounded-lg border px-4 py-2 outline-none focus:border-blue-500"
                        />

                        <Button
                            onClick={handleCreate}
                            className="flex items-center gap-2 h-10"
                        >
                            <Plus size={18} />
                            Thêm
                        </Button>
                    </div>
                </div>

                <div className="hide-scrollbar flex-1 overflow-y-auto bg-[var(--color-background)] p-6">
                    {loading ? (
                        <div className="text-center text-gray-400">
                            Đang tải...
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="rounded-xl border bg-[var(--color-background)] p-8 text-center text-[var(--color-text-muted)]">
                            Chưa có danh mục.
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 xl:grid-cols-3 2xl:grid-cols-4">
                            {categories.map((category) => (
                                <div
                                    key={category.id}
                                    className="flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm"
                                >
                                    {editingId === category.id ? (
                                        <input
                                            value={editingName}
                                            onChange={(e) =>
                                                setEditingName(e.target.value)
                                            }
                                            className="flex-1 w-45 rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
                                        />
                                    ) : (
                                        <div className="font-medium">
                                            {category.name}
                                        </div>
                                    )}

                                    <div className="ml-5 flex gap-2">
                                        {editingId === category.id ? (
                                            <>
                                                <Button
                                                    className="bg-green-600 hover:bg-green-700"
                                                    onClick={saveEdit}
                                                >
                                                    <Check size={18} />
                                                </Button>

                                                <Button
                                                    className="bg-gray-500 hover:bg-gray-600"
                                                    onClick={cancelEdit}
                                                >
                                                    <X size={18} />
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button
                                                    className="bg-yellow-500 hover:bg-yellow-600"
                                                    onClick={() =>
                                                        startEdit(category)
                                                    }
                                                >
                                                    <Pencil size={18} />
                                                </Button>

                                                <Button
                                                    className="bg-red-500 hover:bg-red-600"
                                                    onClick={() =>
                                                        removeCategory(category.id)
                                                    }
                                                >
                                                    <Trash2 size={18} />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

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