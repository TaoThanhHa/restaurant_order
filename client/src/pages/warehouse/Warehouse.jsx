import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    User,
    LogOut,
    Package,
    AlertTriangle,
    Search,
    Plus,
    Boxes,
    History,
} from "lucide-react";

import authService from "../../services/auth.service";
import inventoryService from "../../services/inventory.service";

export default function Warehouse() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState("stock");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);

            const profile = await authService.getProfile();
            setUser(profile?.data || profile);

            const response =
                await inventoryService.getAllIngredients();

            setIngredients(
                response?.data || []
            );
        } catch (error) {
            console.error(
                "LOAD WAREHOUSE ERROR:",
                error
            );
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        authService.logout();
        navigate("/login");
    };

    const filteredIngredients = useMemo(() => {
        const keyword = search
            .trim()
            .toLowerCase();

        if (!keyword) {
            return ingredients;
        }

        return ingredients.filter((item) =>
            item.name
                ?.toLowerCase()
                .includes(keyword)
        );
    }, [ingredients, search]);

    const totalIngredients =
        ingredients.length;

    const lowStock = ingredients.filter(
        (item) =>
            Number(item.stockQuantity || 0) <=
            Number(item.minQuantity || 0) &&
            Number(item.stockQuantity || 0) > 0
    ).length;

    const outOfStock = ingredients.filter(
        (item) =>
            Number(item.stockQuantity || 0) <= 0
    ).length;

    const formatNumber = (value) => {
        return Number(value || 0)
            .toLocaleString("vi-VN", {
                maximumFractionDigits: 3,
            });
    };

    const getStockStatus = (item) => {
        const quantity =
            Number(item.stockQuantity || 0);

        const min =
            Number(item.minQuantity || 0);

        if (quantity <= 0) {
            return {
                text: "Hết hàng",
                className:
                    "bg-red-100 text-red-700",
            };
        }

        if (quantity <= min) {
            return {
                text: "Sắp hết",
                className:
                    "bg-yellow-100 text-yellow-700",
            };
        }

        return {
            text: "Đủ hàng",
            className:
                "bg-green-100 text-green-700",
        };
    };

    return (
        <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">

            {/* HEADER */}
            <header className="flex h-16 items-center justify-between border-b bg-[var(--color-primary)] px-6 shadow-sm text-white">

                <Link
                    to="/warehouse"
                    className="text-lg font-bold"
                >
                    Quản lý kho
                </Link>

                <div className="flex items-center gap-4">

                    <div className="flex items-center gap-2">

                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-500">
                            <User size={18} />
                        </div>

                        <div>
                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        "/warehouse/profile"
                                    )
                                }
                                className="
                                    cursor-pointer
                                    text-sm
                                    font-medium
                                    transition
                                    hover:text-[var(--color-accent)]
                                "
                            >
                                {user?.username}
                            </button>
                        </div>

                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="
                            flex items-center gap-2
                            rounded-lg
                            px-3 py-2
                            text-sm
                            text-red-600
                            hover:bg-red-50
                        "
                    >
                        <LogOut size={18} />
                        Đăng xuất
                    </button>

                </div>
            </header>

            {/* CONTENT */}
            <main className="mx-auto max-w-7xl p-6">

                {/* TITLE */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">
                        Quản lý kho
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Theo dõi nguyên liệu và tình trạng tồn kho của chi nhánh.
                    </p>
                </div>

                {/* STATISTICS */}
                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">

                    {/* TOTAL */}
                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">

                            <div>
                                <p className="text-sm text-gray-500">
                                    Tổng nguyên liệu
                                </p>

                                <p className="mt-2 text-2xl font-bold">
                                    {totalIngredients}
                                </p>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                                <Boxes size={22} />
                            </div>

                        </div>
                    </div>

                    {/* LOW STOCK */}
                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">

                            <div>
                                <p className="text-sm text-gray-500">
                                    Sắp hết
                                </p>

                                <p className="mt-2 text-2xl font-bold text-yellow-600">
                                    {lowStock}
                                </p>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-yellow-100 text-yellow-600">
                                <AlertTriangle size={22} />
                            </div>

                        </div>
                    </div>

                    {/* OUT OF STOCK */}
                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">

                            <div>
                                <p className="text-sm text-gray-500">
                                    Hết hàng
                                </p>

                                <p className="mt-2 text-2xl font-bold text-red-600">
                                    {outOfStock}
                                </p>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-100 text-red-600">
                                <Package size={22} />
                            </div>

                        </div>
                    </div>

                </div>

                {/* TOOLBAR */}
                <div className="rounded-xl border bg-white shadow-sm">

                    {/* TABS */}
                    <div className="flex items-center justify-between border-b px-5">

                        <div className="flex gap-6">

                            <button
                                type="button"
                                onClick={() =>
                                    setActiveTab("stock")
                                }
                                className={`
                                    border-b-2
                                    px-1
                                    py-4
                                    text-sm
                                    font-medium
                                    transition
                                    ${
                                        activeTab === "stock"
                                            ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                                            : "border-transparent text-gray-500 hover:text-gray-800"
                                    }
                                `}
                            >
                                Tồn kho
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setActiveTab("ingredients")
                                }
                                className={`
                                    border-b-2
                                    px-1
                                    py-4
                                    text-sm
                                    font-medium
                                    transition
                                    ${
                                        activeTab === "ingredients"
                                            ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                                            : "border-transparent text-gray-500 hover:text-gray-800"
                                    }
                                `}
                            >
                                Nguyên liệu
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setActiveTab("history")
                                }
                                className={`
                                    border-b-2
                                    px-1
                                    py-4
                                    text-sm
                                    font-medium
                                    transition
                                    ${
                                        activeTab === "history"
                                            ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                                            : "border-transparent text-gray-500 hover:text-gray-800"
                                    }
                                `}
                            >
                                Lịch sử kho
                            </button>

                        </div>

                        {/* IMPORT */}
                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/warehouse/import"
                                )
                            }
                            className="
                                mb-2
                                flex
                                items-center
                                gap-2
                                rounded-lg
                                bg-[var(--color-primary)]
                                px-4
                                py-2
                                text-sm
                                font-medium
                                text-white
                                transition
                                hover:bg-[var(--color-primary-hover)]
                            "
                        >
                            <Plus size={18} />
                            Nhập kho
                        </button>

                    </div>

                    {/* SEARCH */}
                    {activeTab !== "history" && (
                        <div className="border-b p-5">

                            <div className="relative max-w-md">

                                <Search
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
                                    type="text"
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Tìm nguyên liệu..."
                                    className="
                                        w-full
                                        rounded-lg
                                        border
                                        py-2.5
                                        pl-10
                                        pr-4
                                        text-sm
                                        outline-none
                                        focus:border-[var(--color-primary)]
                                    "
                                />

                            </div>

                        </div>
                    )}

                    {/* TABLE */}
                    {activeTab === "stock" && (
                        <div className="overflow-x-auto">

                            <table className="w-full text-sm">

                                <thead>
                                    <tr className="border-b bg-gray-50 text-left">

                                        <th className="px-5 py-3 font-medium text-gray-600">
                                            STT
                                        </th>

                                        <th className="px-5 py-3 font-medium text-gray-600">
                                            Nguyên liệu
                                        </th>

                                        <th className="px-5 py-3 font-medium text-gray-600">
                                            Loại
                                        </th>

                                        <th className="px-5 py-3 font-medium text-gray-600">
                                            Tồn kho
                                        </th>

                                        <th className="px-5 py-3 font-medium text-gray-600">
                                            Mức tối thiểu
                                        </th>

                                        <th className="px-5 py-3 font-medium text-gray-600">
                                            Trạng thái
                                        </th>

                                        <th className="px-5 py-3 text-right font-medium text-gray-600">
                                            Thao tác
                                        </th>

                                    </tr>
                                </thead>

                                <tbody>

                                    {loading ? (
                                        <tr>
                                            <td
                                                colSpan="7"
                                                className="px-5 py-10 text-center text-gray-500"
                                            >
                                                Đang tải dữ liệu...
                                            </td>
                                        </tr>
                                    ) : filteredIngredients.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="7"
                                                className="px-5 py-10 text-center text-gray-500"
                                            >
                                                Không có nguyên liệu.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredIngredients.map(
                                            (item, index) => {

                                                const status =
                                                    getStockStatus(
                                                        item
                                                    );

                                                return (
                                                    <tr
                                                        key={
                                                            item.id
                                                        }
                                                        className="border-b last:border-b-0 hover:bg-gray-50"
                                                    >

                                                        <td className="px-5 py-4">
                                                            {index + 1}
                                                        </td>

                                                        <td className="px-5 py-4">
                                                            <div className="font-medium">
                                                                {
                                                                    item.name
                                                                }
                                                            </div>

                                                            {item.description && (
                                                                <div className="mt-1 text-xs text-gray-400">
                                                                    {
                                                                        item.description
                                                                    }
                                                                </div>
                                                            )}
                                                        </td>

                                                        <td className="px-5 py-4">
                                                            {item.type ||
                                                                "Khác"}
                                                        </td>

                                                        <td className="px-5 py-4 font-semibold">
                                                            {formatNumber(
                                                                item.stockQuantity
                                                            )}{" "}
                                                            {item.unit}
                                                        </td>

                                                        <td className="px-5 py-4">
                                                            {formatNumber(
                                                                item.minQuantity
                                                            )}{" "}
                                                            {item.unit}
                                                        </td>

                                                        <td className="px-5 py-4">
                                                            <span
                                                                className={`
                                                                    inline-flex
                                                                    rounded-full
                                                                    px-2.5
                                                                    py-1
                                                                    text-xs
                                                                    font-medium
                                                                    ${status.className}
                                                                `}
                                                            >
                                                                {
                                                                    status.text
                                                                }
                                                            </span>
                                                        </td>

                                                        <td className="px-5 py-4 text-right">

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/warehouse/import?ingredientId=${item.id}`
                                                                    )
                                                                }
                                                                className="
                                                                    rounded-lg
                                                                    px-3
                                                                    py-2
                                                                    text-xs
                                                                    font-medium
                                                                    text-[var(--color-primary)]
                                                                    hover:bg-[var(--color-background)]
                                                                "
                                                            >
                                                                Nhập kho
                                                            </button>

                                                        </td>

                                                    </tr>
                                                );
                                            }
                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>
                    )}

                    {/* INGREDIENTS */}
                    {activeTab === "ingredients" && (
                        <div className="p-5">

                            <div className="mb-4 flex items-center justify-between">

                                <div>
                                    <h2 className="font-semibold">
                                        Danh sách nguyên liệu
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Quản lý các nguyên liệu được sử dụng trong món ăn.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            "/warehouse/ingredients/create"
                                        )
                                    }
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                        rounded-lg
                                        bg-[var(--color-primary)]
                                        px-4
                                        py-2
                                        text-sm
                                        font-medium
                                        text-white
                                    "
                                >
                                    <Plus size={18} />
                                    Thêm nguyên liệu
                                </button>

                            </div>

                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">

                                {filteredIngredients.map(
                                    (item) => (
                                        <div
                                            key={item.id}
                                            className="
                                                rounded-xl
                                                border
                                                p-4
                                                transition
                                                hover:shadow-sm
                                            "
                                        >
                                            <div className="flex items-start justify-between">

                                                <div>
                                                    <h3 className="font-semibold">
                                                        {
                                                            item.name
                                                        }
                                                    </h3>

                                                    <p className="mt-1 text-sm text-gray-500">
                                                        Đơn vị:{" "}
                                                        {
                                                            item.unit
                                                        }
                                                    </p>
                                                </div>

                                                <span
                                                    className={`
                                                        rounded-full
                                                        px-2
                                                        py-1
                                                        text-xs
                                                        ${
                                                            item.isActive
                                                                ? "bg-green-100 text-green-700"
                                                                : "bg-gray-100 text-gray-500"
                                                        }
                                                    `}
                                                >
                                                    {item.isActive
                                                        ? "Đang dùng"
                                                        : "Ngừng dùng"}
                                                </span>

                                            </div>
                                        </div>
                                    )
                                )}

                            </div>

                        </div>
                    )}

                    {/* HISTORY */}
                    {activeTab === "history" && (
                        <div className="flex min-h-60 flex-col items-center justify-center p-8 text-center">

                            <History
                                size={40}
                                className="mb-3 text-gray-300"
                            />

                            <h3 className="font-semibold">
                                Lịch sử kho
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                Phần lịch sử nhập, xuất và điều chỉnh kho sẽ được làm tiếp.
                            </p>

                        </div>
                    )}

                </div>

            </main>
        </div>
    );
}