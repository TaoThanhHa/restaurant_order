import { useEffect, useMemo, useState } from "react";
import {
    Package,
    Search,
    Plus,
    AlertTriangle,
    XCircle,
    CheckCircle2,
    RefreshCw,
    Boxes,
} from "lucide-react";

import inventoryService from "../../../services/inventory.service";

export default function Inventory() {
    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("ALL");

    const [showImportModal, setShowImportModal] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const loadIngredients = async () => {
        try {
            setLoading(true);
            setError("");

            const response =
                await inventoryService.getAllIngredients();

            setIngredients(
                response?.data?.data ||
                response?.data ||
                []
            );
        } catch (error) {
            console.error("LOAD INVENTORY ERROR:", error);

            setError(
                error?.response?.data?.message ||
                "Không thể tải dữ liệu kho."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadIngredients();
    }, []);

    const filteredIngredients = useMemo(() => {
        return ingredients.filter((item) => {
            const name = item.name?.toLowerCase() || "";

            const matchSearch =
                name.includes(search.toLowerCase());

            const stock = Number(
                item.stockQuantity ??
                item.quantity ??
                0
            );

            const min = Number(
                item.minQuantity ?? 0
            );

            let matchFilter = true;

            if (filter === "LOW") {
                matchFilter =
                    stock > 0 &&
                    stock <= min;
            }

            if (filter === "OUT") {
                matchFilter = stock <= 0;
            }

            if (filter === "AVAILABLE") {
                matchFilter = stock > min;
            }

            return matchSearch && matchFilter;
        });
    }, [ingredients, search, filter]);

    const statistics = useMemo(() => {
        let low = 0;
        let out = 0;

        ingredients.forEach((item) => {
            const stock = Number(
                item.stockQuantity ??
                item.quantity ??
                0
            );

            const min = Number(
                item.minQuantity ?? 0
            );

            if (stock <= 0) {
                out++;
            } else if (stock <= min) {
                low++;
            }
        });

        return {
            total: ingredients.length,
            low,
            out,
        };
    }, [ingredients]);

    const getStock = (item) => {
        return Number(
            item.stockQuantity ??
            item.quantity ??
            0
        );
    };

    const getStockStatus = (item) => {
        const stock = getStock(item);
        const min = Number(item.minQuantity ?? 0);

        if (stock <= 0) {
            return {
                label: "Hết hàng",
                className:
                    "bg-red-50 text-red-600 border-red-200",
                icon: XCircle,
            };
        }

        if (stock <= min) {
            return {
                label: "Sắp hết",
                className:
                    "bg-orange-50 text-orange-600 border-orange-200",
                icon: AlertTriangle,
            };
        }

        return {
            label: "Đủ hàng",
            className:
                "bg-green-50 text-green-600 border-green-200",
            icon: CheckCircle2,
        };
    };

    const formatNumber = (value) => {
        return Number(value || 0).toLocaleString(
            "vi-VN",
            {
                maximumFractionDigits: 3,
            }
        );
    };

    return (
        <div className="min-h-screen bg-[var(--color-background)] p-6">
            {/* HEADER */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-[var(--color-primary)] text-white flex items-center justify-center">
                            <Package size={23} />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-[var(--color-text)]">
                                Quản lý kho
                            </h1>

                            <p className="text-sm text-gray-500">
                                Theo dõi và nhập nguyên liệu
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={loadIngredients}
                        className="h-10 px-4 rounded-lg border border-[var(--color-border)] bg-white flex items-center gap-2 hover:bg-gray-50"
                    >
                        <RefreshCw size={17} />
                        Làm mới
                    </button>

                    <button
                        onClick={() =>
                            setShowImportModal(true)
                        }
                        className="h-10 px-4 rounded-lg bg-[var(--color-primary)] text-white flex items-center gap-2 hover:bg-[var(--color-primary-hover)]"
                    >
                        <Plus size={18} />
                        Nhập kho
                    </button>
                </div>
            </div>

            {/* ALERT */}
            {error && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-600 flex items-center justify-between">
                    <span>{error}</span>

                    <button
                        onClick={() => setError("")}
                    >
                        <X size={18} />
                    </button>
                </div>
            )}

            {success && (
                <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-600">
                    {success}
                </div>
            )}

            {/* STATISTICS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                    icon={Boxes}
                    title="Tổng nguyên liệu"
                    value={statistics.total}
                    description="Đang quản lý"
                />

                <StatCard
                    icon={AlertTriangle}
                    title="Sắp hết"
                    value={statistics.low}
                    description="Cần kiểm tra"
                    warning
                />

                <StatCard
                    icon={XCircle}
                    title="Hết hàng"
                    value={statistics.out}
                    description="Cần nhập thêm"
                    danger
                />

                <StatCard
                    icon={CheckCircle2}
                    title="Đủ hàng"
                    value={
                        statistics.total -
                        statistics.low -
                        statistics.out
                    }
                    description="Tồn kho ổn định"
                />
            </div>

            {/* TABLE CARD */}
            <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-sm overflow-hidden">
                {/* FILTER */}
                <div className="p-4 border-b border-[var(--color-border)] flex flex-col lg:flex-row gap-3 justify-between">
                    <div className="relative w-full lg:w-80">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            placeholder="Tìm nguyên liệu..."
                            className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 outline-none focus:border-[var(--color-primary)]"
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto">
                        <FilterButton
                            active={filter === "ALL"}
                            onClick={() =>
                                setFilter("ALL")
                            }
                        >
                            Tất cả
                        </FilterButton>

                        <FilterButton
                            active={filter === "AVAILABLE"}
                            onClick={() =>
                                setFilter("AVAILABLE")
                            }
                        >
                            Đủ hàng
                        </FilterButton>

                        <FilterButton
                            active={filter === "LOW"}
                            onClick={() =>
                                setFilter("LOW")
                            }
                        >
                            Sắp hết
                        </FilterButton>

                        <FilterButton
                            active={filter === "OUT"}
                            onClick={() =>
                                setFilter("OUT")
                            }
                        >
                            Hết hàng
                        </FilterButton>
                    </div>
                </div>

                {/* TABLE */}
                {loading ? (
                    <div className="py-20 flex justify-center text-gray-400">
                        Đang tải dữ liệu...
                    </div>
                ) : filteredIngredients.length === 0 ? (
                    <div className="py-20 text-center text-gray-400">
                        <Package
                            size={42}
                            className="mx-auto mb-3 opacity-40"
                        />

                        <p>
                            Không tìm thấy nguyên liệu
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 text-left text-sm text-gray-500">
                                    <th className="px-5 py-3">
                                        #
                                    </th>

                                    <th className="px-5 py-3">
                                        Nguyên liệu
                                    </th>

                                    <th className="px-5 py-3">
                                        Loại
                                    </th>

                                    <th className="px-5 py-3">
                                        Tồn kho
                                    </th>

                                    <th className="px-5 py-3">
                                        Tối thiểu
                                    </th>

                                    <th className="px-5 py-3">
                                        Trạng thái
                                    </th>

                                    <th className="px-5 py-3 text-right">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredIngredients.map(
                                    (item, index) => {
                                        const status =
                                            getStockStatus(item);

                                        const StatusIcon =
                                            status.icon;

                                        return (
                                            <tr
                                                key={item.id}
                                                className="border-t border-gray-100 hover:bg-gray-50"
                                            >
                                                <td className="px-5 py-4 text-gray-500">
                                                    {index + 1}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="font-medium text-[var(--color-text)]">
                                                        {
                                                            item.name
                                                        }
                                                    </div>

                                                    {item.description && (
                                                        <div className="text-xs text-gray-400 mt-1">
                                                            {
                                                                item.description
                                                            }
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="px-5 py-4 text-sm text-gray-600">
                                                    {getIngredientType(
                                                        item.type
                                                    )}
                                                </td>

                                                <td className="px-5 py-4 font-semibold">
                                                    {formatNumber(
                                                        getStock(
                                                            item
                                                        )
                                                    )}{" "}
                                                    {
                                                        item.unit
                                                    }
                                                </td>

                                                <td className="px-5 py-4 text-gray-500">
                                                    {formatNumber(
                                                        item.minQuantity
                                                    )}{" "}
                                                    {
                                                        item.unit
                                                    }
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${status.className}`}
                                                    >
                                                        <StatusIcon
                                                            size={
                                                                14
                                                            }
                                                        />

                                                        {
                                                            status.label
                                                        }
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4 text-right">
                                                    <button
                                                        onClick={() =>
                                                            setShowImportModal(
                                                                true
                                                            )
                                                        }
                                                        className="text-sm font-medium text-[var(--color-primary)] hover:underline"
                                                    >
                                                        Nhập thêm
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    }
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* IMPORT MODAL */}
            {showImportModal && (
                <ImportInventoryModal
                    ingredients={ingredients}
                    onClose={() =>
                        setShowImportModal(false)
                    }
                    onSuccess={(message) => {
                        setShowImportModal(false);
                        setSuccess(message);

                        loadIngredients();

                        setTimeout(
                            () => setSuccess(""),
                            3000
                        );
                    }}
                />
            )}
        </div>
    );
}

/* ========================================
   STAT CARD
======================================== */

function StatCard({
    icon: Icon,
    title,
    value,
    description,
    warning,
    danger,
}) {
    return (
        <div className="bg-white border border-[var(--color-border)] rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-gray-500">
                        {title}
                    </p>

                    <p
                        className={`text-2xl font-bold mt-2 ${
                            danger
                                ? "text-red-600"
                                : warning
                                ? "text-orange-600"
                                : "text-[var(--color-text)]"
                        }`}
                    >
                        {value}
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                        {description}
                    </p>
                </div>

                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[var(--color-primary)]">
                    <Icon size={20} />
                </div>
            </div>
        </div>
    );
}

/* ========================================
   FILTER
======================================== */

function FilterButton({
    active,
    onClick,
    children,
}) {
    return (
        <button
            onClick={onClick}
            className={`px-4 h-9 rounded-lg text-sm whitespace-nowrap transition ${
                active
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
        >
            {children}
        </button>
    );
}

/* ========================================
   IMPORT MODAL
======================================== */

function ImportInventoryModal({
    ingredients,
    onClose,
    onSuccess,
}) {
    const [ingredientId, setIngredientId] =
        useState("");

    const [quantity, setQuantity] =
        useState("");

    const [note, setNote] = useState("");

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const selectedIngredient =
        ingredients.find(
            (item) =>
                Number(item.id) ===
                Number(ingredientId)
        );

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError("");

            /*
             * Lấy branchId từ profile/localStorage
             * tùy cấu trúc auth hiện tại của project.
             */
            const profile = JSON.parse(
                localStorage.getItem("profile") ||
                    "null"
            );

            const branchId =
                profile?.branchId ||
                profile?.data?.branchId;

            if (!branchId) {
                throw new Error(
                    "Không xác định được chi nhánh."
                );
            }

            await inventoryService.importInventory({
                branchId,
                ingredientId,
                quantity,
                note,
            });

            onSuccess(
                "Nhập kho thành công."
            );
        } catch (error) {
            console.error(
                "IMPORT INVENTORY ERROR:",
                error
            );

            setError(
                error?.response?.data?.message ||
                error.message ||
                "Nhập kho thất bại."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl">
                {/* HEADER */}
                <div className="flex items-center justify-between px-5 py-4 border-b">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">
                            Nhập kho
                        </h2>

                        <p className="text-xs text-gray-400 mt-1">
                            Cộng thêm nguyên liệu vào tồn kho
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center"
                    >
                        <X size={19} />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="p-5 space-y-4"
                >
                    {error && (
                        <div className="rounded-lg bg-red-50 border border-red-200 text-red-600 px-3 py-2 text-sm">
                            {error}
                        </div>
                    )}

                    {/* INGREDIENT */}
                    <div>
                        <label className="block text-sm font-medium mb-1.5">
                            Nguyên liệu
                        </label>

                        <select
                            value={ingredientId}
                            onChange={(e) =>
                                setIngredientId(
                                    e.target.value
                                )
                            }
                            className="w-full h-10 px-3 rounded-lg border border-gray-200 outline-none focus:border-[var(--color-primary)]"
                            required
                        >
                            <option value="">
                                -- Chọn nguyên liệu --
                            </option>

                            {ingredients
                                .filter(
                                    (item) =>
                                        item.isActive
                                )
                                .map((item) => (
                                    <option
                                        key={item.id}
                                        value={item.id}
                                    >
                                        {item.name}
                                    </option>
                                ))}
                        </select>
                    </div>

                    {/* CURRENT STOCK */}
                    {selectedIngredient && (
                        <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">
                                    Tồn hiện tại
                                </span>

                                <strong>
                                    {Number(
                                        selectedIngredient.stockQuantity ??
                                            selectedIngredient.quantity ??
                                            0
                                    ).toLocaleString(
                                        "vi-VN"
                                    )}{" "}
                                    {
                                        selectedIngredient.unit
                                    }
                                </strong>
                            </div>
                        </div>
                    )}

                    {/* QUANTITY */}
                    <div>
                        <label className="block text-sm font-medium mb-1.5">
                            Số lượng nhập
                        </label>

                        <div className="relative">
                            <input
                                type="number"
                                min="0.001"
                                step="0.001"
                                value={quantity}
                                onChange={(e) =>
                                    setQuantity(
                                        e.target.value
                                    )
                                }
                                placeholder="Nhập số lượng"
                                className="w-full h-10 px-3 pr-16 rounded-lg border border-gray-200 outline-none focus:border-[var(--color-primary)]"
                                required
                            />

                            {selectedIngredient && (
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                                    {
                                        selectedIngredient.unit
                                    }
                                </span>
                            )}
                        </div>
                    </div>

                    {/* NOTE */}
                    <div>
                        <label className="block text-sm font-medium mb-1.5">
                            Ghi chú
                        </label>

                        <textarea
                            value={note}
                            onChange={(e) =>
                                setNote(
                                    e.target.value
                                )
                            }
                            rows={3}
                            placeholder="VD: Nhập hàng buổi sáng..."
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none resize-none focus:border-[var(--color-primary)]"
                        />
                    </div>

                    {/* ACTION */}
                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 h-10 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                        >
                            Hủy
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 h-10 rounded-lg bg-[var(--color-primary)] text-white font-medium disabled:opacity-50"
                        >
                            {loading
                                ? "Đang nhập..."
                                : "Xác nhận nhập"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ========================================
   INGREDIENT TYPE
======================================== */

function getIngredientType(type) {
    const types = {
        FRESH: "Tươi",
        MEAT: "Thịt",
        SPICE: "Gia vị",
        DRY: "Khô",
        BEVERAGE: "Đồ uống",
        OTHER: "Khác",
    };

    return types[type] || "Khác";
}