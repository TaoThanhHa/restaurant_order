import { useEffect, useState } from "react";
import { Pencil, Trash2, Check, X, Plus } from "lucide-react";

import Button from "../../../../components/Button/Button";
import categoryService from "../../../../services/category.service";

export default function CategoryManagement() {

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState("");

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setLoading(true);
        try {
            const res = await categoryService.getAll();
            setCategories(res.data.data);
        } catch (err) {
            alert(
                err.response?.data?.message ||
                err.message
            );
        }
        setLoading(false);
    };

    // CREATE
    const handleCreate = async () => {
        if (!name.trim()) {
            alert("Nhập tên danh mục.");
            return;
        }

        try {
            await categoryService.create({
                name,
            });

            setName("");
            loadCategories();

        } catch (err) {
            alert(
                err.response?.data?.message ||
                err.message
            );
        }
    };

    // EDIT
    const startEdit = (category) => {
        setEditingId(category.id);
        setEditingName(category.name);
    };
    // SAVE
    const saveEdit = async () => {
        if (!editingName.trim()) {
            alert("Tên danh mục không được để trống.");
            return;
        }
        try {
            await categoryService.update(
                editingId,
                {
                    name: editingName,
                }
            );

            setEditingId(null);
            setEditingName("");
            loadCategories();

        } catch (err) {
            alert(
                err.response?.data?.message ||
                err.message
            );
        }
    };

    // DELETE
    const removeCategory = async (id) => {
        if (
            !window.confirm(
                "Xóa danh mục này?"
            )
        ) {
            return;
        }
        try {
            await categoryService.remove(id);
            loadCategories();
        } catch (err) {
            alert(
                err.response?.data?.message ||
                err.message
            );
        }
    };
    // RENDER
    return (
        <div className="flex h-full flex-col">

            <div className="border-b bg-[var(--color-background)] p-6">
                <h2 className="text-xl font-bold text-[var(--color-text)]">
                    Quản lý danh mục
                </h2>

                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                    Có {categories.length} danh mục
                </p>

                <div className="mt-5 flex gap-3">
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Tên danh mục..."
                        className="flex-1 rounded-lg border px-4 py-2 outline-none focus:border-blue-500"
                    />

                    <Button onClick={handleCreate} className="flex items-center gap-2">
                        <Plus size={18} />
                        Thêm
                    </Button>
                </div>
            </div>

            {/* List */}
            <div className="bg-[var(--color-background)] flex-1 overflow-y-auto hide-scrollbar p-6">
                {loading ? (
                    <div className="text-center text-gray-400">
                        Đang tải...
                    </div>
                ) : categories.length === 0 ? (
                    <div className="rounded-xl border bg-[var(--color-background)] p-8 text-center text-[var(--color-text-muted)]">
                        Chưa có danh mục.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {categories.map(category => (

                            <div
                                key={category.id}
                                className="flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm"
                            >

                                {editingId === category.id ? (
                                    <input
                                        value={editingName}
                                        onChange={(e) =>
                                            setEditingName(
                                                e.target.value
                                            )
                                        }
                                        className="flex-1 rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
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
                                                onClick={() => {
                                                    setEditingId(null);
                                                    setEditingName("");
                                                }}
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
    );
}