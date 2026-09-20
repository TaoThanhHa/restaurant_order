import { useEffect, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";

import Button from "../../../../components/Button/Button";
import NotiModal from "../../../../components/NotiModal/NotiModal";
import uploadService from "../../../../services/upload.service";

export default function FoodFormModal({
    open,
    mode = "create",
    food = null,
    categories = [],
    branches = [],
    restaurantMode = "SINGLE",
    onClose,
    onSave,
}) {
    const fileInputRef = useRef(null);

    const emptyForm = {
        name: "",
        categoryId: "",
        price: "",
        description: "",
        image: "",
        status: "AVAILABLE",
        branchFoods: [],
    };

    const [form, setForm] = useState(emptyForm);
    const [preview, setPreview] = useState("");
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState({
        open: false,
        type: "success",
        title: "",
        message: "",
    });

    const isMulti = restaurantMode === "MULTI";

    const showNotification = ({
        type = "success",
        title = "",
        message = "",
    }) => {
        setNotification({ open: true, type, title, message });
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

        if (food) {
            setForm({
                name: food.name || "",
                categoryId: food.categoryId || "",
                price: Number(food.price) || "",
                description: food.description || "",
                image: food.image || "",
                status: food.status || "AVAILABLE",
                branchFoods: isMulti
                    ? food.branchFoods?.map(item => ({
                          branchId: item.branchId,
                          status: item.status,
                      })) || []
                    : [],
            });

            setPreview(
                food.image
                    ? `http://localhost:5000${food.image}`
                    : ""
            );
        } else {
            setForm(emptyForm);
            setPreview("");
        }

        setSaving(false);
    }, [food, open, restaurantMode]);

    if (!open) return null;

    const handleChange = e => {
        const { name, value } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImage = async e => {
        const file = e.target.files?.[0];

        if (!file) return;

        setPreview(URL.createObjectURL(file));

        try {
            const res = await uploadService.uploadFood(file);

            setForm(prev => ({
                ...prev,
                image: res.data.data,
            }));
        } catch (err) {
            console.error("UPLOAD FOOD IMAGE ERROR:", err);

            showNotification({
                type: "error",
                title: "Không thể tải ảnh",
                message:
                    err.response?.data?.message ||
                    err.message ||
                    "Đã xảy ra lỗi khi tải ảnh món ăn.",
            });
        }
    };

    const toggleBranch = branchId => {
        setForm(prev => {
            const existed = prev.branchFoods.some(
                item => Number(item.branchId) === Number(branchId)
            );

            return {
                ...prev,
                branchFoods: existed
                    ? prev.branchFoods.filter(
                          item =>
                              Number(item.branchId) !== Number(branchId)
                      )
                    : [
                          ...prev.branchFoods,
                          {
                              branchId,
                              status: "AVAILABLE",
                          },
                      ],
            };
        });
    };

    const handleBranchStatusChange = (branchId, status) => {
        setForm(prev => ({
            ...prev,
            branchFoods: prev.branchFoods.map(item =>
                Number(item.branchId) === Number(branchId)
                    ? { ...item, status }
                    : item
            ),
        }));
    };

    const handleSubmit = async () => {
        if (saving) return;

        if (!form.name.trim()) {
            showNotification({
                type: "warning",
                title: "Thiếu thông tin",
                message: "Vui lòng nhập tên món.",
            });
            return;
        }

        if (!form.categoryId) {
            showNotification({
                type: "warning",
                title: "Thiếu thông tin",
                message: "Vui lòng chọn danh mục.",
            });
            return;
        }

        if (!form.price || Number(form.price) <= 0) {
            showNotification({
                type: "warning",
                title: "Giá không hợp lệ",
                message: "Vui lòng nhập giá món lớn hơn 0.",
            });
            return;
        }

        if (isMulti && form.branchFoods.length === 0) {
            showNotification({
                type: "warning",
                title: "Thiếu chi nhánh",
                message: "Vui lòng chọn ít nhất một chi nhánh.",
            });
            return;
        }

        const data = {
            ...form,
            price: Number(form.price),
            branchIds: isMulti
                ? form.branchFoods.map(item => item.branchId)
                : [],
            branchFoods: isMulti ? form.branchFoods : [],
        };

        try {
            setSaving(true);
            await onSave(data);
        } catch (err) {
            console.error("SAVE FOOD ERROR:", err);

            showNotification({
                type: "error",
                title: "Không thể lưu món",
                message:
                    err.response?.data?.message ||
                    err.message ||
                    "Đã xảy ra lỗi khi lưu món ăn.",
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                <div className="hide-scrollbar max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
                    <div className="flex items-center justify-between border-b px-6 py-4">
                        <h2 className="text-2xl font-bold text-[var(--color-text)]">
                            {mode === "create"
                                ? "Tạo món mới"
                                : "Chỉnh sửa món"}
                        </h2>

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="rounded-lg p-2 transition hover:bg-gray-100 disabled:opacity-50"
                        >
                            <X size={22} />
                        </button>
                    </div>

                    <div className="grid grid-cols-3 gap-8 p-6">
                        <div>
                            <div
                                onClick={() =>
                                    !saving &&
                                    fileInputRef.current?.click()
                                }
                                className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 transition hover:border-blue-500 hover:bg-blue-50"
                            >
                                {preview ? (
                                    <img
                                        src={preview}
                                        alt=""
                                        className="h-full w-full rounded-xl object-cover"
                                    />
                                ) : (
                                    <>
                                        <ImagePlus
                                            size={60}
                                            className="text-[var(--color-text-muted)]"
                                        />
                                        <p className="mt-3 text-[var(--color-text)]">
                                            Chọn ảnh món ăn
                                        </p>
                                    </>
                                )}
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={handleImage}
                            />
                        </div>

                        <div className="col-span-2 space-y-5">
                            <div>
                                <label className="mb-2 block font-semibold">
                                    Tên món
                                </label>
                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    disabled={saving}
                                    className="w-full rounded-lg border p-3 outline-none focus:border-blue-500 disabled:bg-gray-100"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block font-semibold">
                                    Danh mục
                                </label>
                                <select
                                    name="categoryId"
                                    value={form.categoryId}
                                    onChange={handleChange}
                                    disabled={saving}
                                    className="w-full rounded-lg border p-3 outline-none focus:border-blue-500 disabled:bg-gray-100"
                                >
                                    <option value="">
                                        -- Chọn danh mục --
                                    </option>

                                    {categories.map(category => (
                                        <option
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block font-semibold">
                                    Giá
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={form.price}
                                    onChange={handleChange}
                                    disabled={saving}
                                    className="w-full rounded-lg border p-3 outline-none focus:border-blue-500 disabled:bg-gray-100"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block font-semibold">
                                    Mô tả
                                </label>
                                <textarea
                                    rows={4}
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    disabled={saving}
                                    className="w-full rounded-lg border p-3 outline-none focus:border-blue-500 disabled:bg-gray-100"
                                />
                            </div>

                            {isMulti && (
                                <div>
                                    <label className="mb-3 block font-semibold">
                                        Chi nhánh
                                    </label>

                                    <div className="space-y-4">
                                        {branches.map(branch => {
                                            const item =
                                                form.branchFoods.find(
                                                    branchFood =>
                                                        Number(
                                                            branchFood.branchId
                                                        ) ===
                                                        Number(branch.id)
                                                );

                                            const checked = Boolean(item);

                                            return (
                                                <div
                                                    key={branch.id}
                                                    className="rounded-lg border p-3"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <label className="flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={
                                                                    checked
                                                                }
                                                                disabled={saving}
                                                                onChange={() =>
                                                                    toggleBranch(
                                                                        branch.id
                                                                    )
                                                                }
                                                            />
                                                            {branch.name}
                                                        </label>

                                                        {checked && (
                                                            <select
                                                                value={
                                                                    item.status
                                                                }
                                                                disabled={saving}
                                                                onChange={e =>
                                                                    handleBranchStatusChange(
                                                                        branch.id,
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                className="rounded border px-2 py-1"
                                                            >
                                                                <option value="AVAILABLE">
                                                                    Còn kinh doanh
                                                                </option>
                                                                <option value="INACTIVE">
                                                                    Ngừng kinh doanh
                                                                </option>
                                                            </select>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 border-t px-6 py-4">
                        <Button
                            type="button"
                            className="!bg-gray-400"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Hủy
                        </Button>

                        <Button
                            onClick={handleSubmit}
                            disabled={saving}
                        >
                            {saving
                                ? "Đang lưu..."
                                : mode === "create"
                                  ? "Tạo món"
                                  : "Lưu thay đổi"}
                        </Button>
                    </div>
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
