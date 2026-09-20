import { ArrowLeft, Package, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import Button from "../../../components/Button/Button";
import Input from "../../../components/Input/Input";
import NotiModal from "../../../components/NotiModal/NotiModal";

import inventoryService from "../../../services/inventory.service";

const UNIT_LABELS = {
    KG: "Kg",
    G: "Gram",
    L: "Lít",
    ML: "Ml",
    PIECE: "Cái",
    PACK: "Gói",
};

export default function InventoryImport() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const ingredientIdFromUrl =
        searchParams.get("ingredientId");

    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        ingredientId: ingredientIdFromUrl || "",
        quantity: "",
        note: "",
    });

    const [error, setError] = useState("");

    const [noti, setNoti] = useState({
        open: false,
        type: "success",
        message: "",
    });

    useEffect(() => {
        loadIngredients();
    }, []);

    const loadIngredients = async () => {
        try {
            setLoading(true);
            setError("");

            const response =
                await inventoryService.getAllIngredients();

            setIngredients(
                response?.data || []
            );
        } catch (err) {
            console.error(
                "LOAD INGREDIENTS ERROR:",
                err
            );

            setError(
                err.response?.data?.message ||
                    "Không thể tải danh sách nguyên liệu."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (error) {
            setError("");
        }
    };

    const selectedIngredient =
        ingredients.find(
            (item) =>
                Number(item.id) ===
                Number(formData.ingredientId)
        );

    const formatNumber = (value) => {
        return Number(value || 0).toLocaleString(
            "vi-VN",
            {
                maximumFractionDigits: 3,
            }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!formData.ingredientId) {
            setError(
                "Vui lòng chọn nguyên liệu."
            );
            return;
        }

        const quantity =
            Number(formData.quantity);

        if (
            !Number.isFinite(quantity) ||
            quantity <= 0
        ) {
            setError(
                "Số lượng nhập phải lớn hơn 0."
            );
            return;
        }

        try {
            setSaving(true);

            await inventoryService.importInventory({
                ingredientId:
                    Number(formData.ingredientId),
                quantity,
                note:
                    formData.note.trim() ||
                    undefined,
            });

            setNoti({
                open: true,
                type: "success",
                message:
                    "Nhập kho thành công.",
            });
        } catch (err) {
            console.error(
                "IMPORT INVENTORY ERROR:",
                err
            );

            setError(
                err.response?.data?.message ||
                    "Nhập kho thất bại."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleSuccessClose = () => {
        setNoti({
            open: false,
            type: "success",
            message: "",
        });

        navigate("/warehouse");
    };

    return (
        <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
            {/* HEADER */}
            <header className="flex h-16 items-center justify-between border-b bg-[var(--color-primary)] px-6 text-white shadow-sm">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() =>
                            navigate("/warehouse")
                        }
                        className="rounded-lg p-2 transition hover:bg-white/10"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <span className="text-lg font-bold">
                        Nhập kho
                    </span>
                </div>
            </header>

            {/* CONTENT */}
            <main className="mx-auto max-w-3xl p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">
                        Nhập nguyên liệu
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Thêm số lượng nguyên liệu vào
                        kho của chi nhánh.
                    </p>
                </div>

                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >
                        {/* INGREDIENT */}
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Nguyên liệu
                            </label>

                            <select
                                name="ingredientId"
                                value={
                                    formData.ingredientId
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={loading}
                                className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)]"
                            >
                                <option value="">
                                    -- Chọn nguyên liệu --
                                </option>

                                {ingredients.map(
                                    (item) => (
                                        <option
                                            key={
                                                item.id
                                            }
                                            value={
                                                item.id
                                            }
                                        >
                                            {item.name}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        {/* CURRENT STOCK */}
                        {selectedIngredient && (
                            <div className="rounded-xl border bg-gray-50 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                                        <Package
                                            size={20}
                                        />
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Tồn kho hiện tại
                                        </p>

                                        <p className="font-semibold">
                                            {formatNumber(
                                                selectedIngredient.stockQuantity
                                            )}{" "}
                                            {
                                                UNIT_LABELS[
                                                    selectedIngredient
                                                        .unit
                                                ] ||
                                                selectedIngredient.unit
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* QUANTITY */}
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Số lượng nhập
                            </label>

                            <div className="flex items-center gap-3">
                                <Input
                                    type="number"
                                    name="quantity"
                                    value={
                                        formData.quantity
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    min="0"
                                    step="0.001"
                                    placeholder="Nhập số lượng"
                                    className="flex-1"
                                />

                                {selectedIngredient && (
                                    <span className="min-w-16 text-sm text-gray-500">
                                        {
                                            selectedIngredient.unit
                                        }
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* NOTE */}
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Ghi chú
                                <span className="ml-1 font-normal text-gray-400">
                                    (không bắt buộc)
                                </span>
                            </label>

                            <textarea
                                name="note"
                                value={
                                    formData.note
                                }
                                onChange={
                                    handleChange
                                }
                                rows={4}
                                placeholder="Ví dụ: Nhập hàng từ nhà cung cấp A..."
                                className="w-full resize-none rounded-lg border px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
                            />
                        </div>

                        {/* ERROR */}
                        {error && (
                            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        {/* ACTIONS */}
                        <div className="flex justify-end gap-3 border-t pt-5">
                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        "/warehouse"
                                    )
                                }
                                disabled={saving}
                                className="rounded-lg border px-5 py-2.5 text-sm font-medium transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Hủy
                            </button>

                            <Button
                                type="submit"
                                disabled={
                                    saving ||
                                    loading
                                }
                                className="flex items-center gap-2"
                            >
                                <Save size={18} />

                                {saving
                                    ? "Đang nhập..."
                                    : "Xác nhận nhập kho"}
                            </Button>
                        </div>
                    </form>
                </div>
            </main>

            {/* SUCCESS */}
            {noti.open && (
                <NotiModal
                    type={noti.type}
                    message={noti.message}
                    onClose={
                        handleSuccessClose
                    }
                />
            )}
        </div>
    );
}