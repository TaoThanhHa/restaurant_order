import { useCallback, useEffect, useState } from "react";
import { Check, ChefHat, Clock3, Loader2, LogOut, PackageCheck, RefreshCw, User, Utensils, } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/Button/Button";

import kitchenService from "../../services/kitchen.service";
import useAuth from "../../hooks/useAuth";

const TABS = {
    WAITING: "waiting",
    COMPLETED: "completed",
};

const formatTime = (date) => {
    if (!date) return "--:--";

    return new Date(date).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
    });
};

function KitchenOrderCard({
    order,
    tab,
    onStartOrder,
    onCompleteOrder,
    loadingOrders,
}) {
    const isWaiting = tab === TABS.WAITING;
    const isPreparing = tab === "preparing";
    const isCompleted = tab === TABS.COMPLETED;

    const loading = !!loadingOrders[order.id];

    const isTakeAway = order.orderType === "TAKE_AWAY";

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">

            {/* HEADER */}
            <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-lg font-bold text-gray-900">
                            #{order.orderCode}
                        </span>

                        {isTakeAway ? (
                            <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-600">
                                Mang về
                            </span>
                        ) : (
                            <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-600">
                                Tại bàn
                            </span>
                        )}
                    </div>

                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                        {order.table && (
                            <span>
                                Bàn {order.table.tableNumber}
                            </span>
                        )}

                        {order.createdByCustomer?.name && (
                            <span>
                                {order.createdByCustomer.name}
                            </span>
                        )}

                        <span>
                            {formatTime(order.createdAt)}
                        </span>
                    </div>
                </div>
            </div>

            {/* ORDER NOTE */}
            {order.note && (
                <div className="mb-3 rounded-lg bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
                    <span className="font-semibold">
                        Ghi chú:
                    </span>{" "}
                    {order.note}
                </div>
            )}

            {/* ITEMS */}
            <div className="space-y-2">
                {order.items?.map((item) => {
                    const completed =
                        item.kitchenStatus === "COMPLETED";

                    return (
                        <div
                            key={item.id}
                            className={`
                                rounded-xl border p-3
                                ${
                                    completed
                                        ? "border-green-200 bg-green-50"
                                        : "border-gray-100 bg-gray-50"
                                }
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <div className="min-w-0 flex flex-1 items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="font-semibold text-gray-900">
                                            {item.foodName}
                                        </div>

                                        {item.note && (
                                            <div className="mt-1 truncate text-xs text-red-500">
                                                {item.note}
                                            </div>
                                        )}
                                    </div>

                                    <div className="shrink-0 text-sm font-semibold text-gray-500">
                                        × {item.quantity}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ACTION */}
            {!isCompleted && (
                <button
                    type="button"
                    disabled={loading}
                    onClick={() => {
                        if (isWaiting) {
                            onStartOrder(order.id);
                            return;
                        }

                        if (isPreparing) {
                            onCompleteOrder(order.id);
                        }
                    }}
                    className={`
                        mt-4 flex w-full
                        items-center justify-center
                        gap-2 rounded-xl px-4 py-3
                        text-sm font-bold
                        transition
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                        ${
                            isPreparing
                                ? "bg-green-600 text-white hover:bg-green-700"
                                : "bg-orange-500 text-white hover:bg-orange-600"
                        }
                    `}
                >
                    {loading ? (
                        <>
                            <Loader2
                                size={18}
                                className="animate-spin"
                            />
                            Đang xử lý...
                        </>
                    ) : isPreparing ? (
                        <>
                            <Check size={18} />
                            Hoàn thành đơn
                        </>
                    ) : (
                        <>
                            <ChefHat size={18} />
                            Bắt đầu chế biến
                        </>
                    )}
                </button>
            )}
        </div>
    );
}

function EmptyState({
    title,
    description,
    compact = false,
}) {
    return (
        <div
            className={`
                flex flex-col items-center justify-center
                text-center
                ${compact ? "min-h-[140px]" : "min-h-[300px]"}
            `}
        >
            <PackageCheck
                size={compact ? 36 : 48}
                className="mb-3 text-gray-300"
            />

            <p className="font-medium text-gray-500">
                {title}
            </p>

            <p className="mt-1 text-sm text-gray-400">
                {description}
            </p>
        </div>
    );
}


function PriorityItems({ orders }) {
    const priorityItems = orders
        .flatMap((order) =>
            (order.items || [])
                .filter(
                    (item) =>
                        item.kitchenStatus === "PREPARING"
                )
                .map((item) => ({
                    ...item,
                    orderCode: order.orderCode,
                    orderId: order.id,
                    orderType: order.orderType,
                    table: order.table,
                    createdAt:
                        item.createdAt ||
                        order.createdAt,
                }))
        )
        .sort((a, b) => {
            const timeA = a.createdAt
                ? new Date(a.createdAt).getTime()
                : 0;

            const timeB = b.createdAt
                ? new Date(b.createdAt).getTime()
                : 0;

            if (timeA !== timeB) {
                return timeA - timeB;
            }

            return a.id - b.id;
        });

    return (
        <div className="flex min-h-0 flex-1 flex-col rounded-2xl border bg-white p-4 shadow-sm">

            {/* HEADER */}
            <div className="mb-4 flex shrink-0 items-center justify-between">
                <div className="flex items-center gap-2">
                    <Utensils
                        size={20}
                        className="text-[var(--color-primary)]"
                    />

                    <h2 className="font-bold text-gray-900">
                        Món ưu tiên
                    </h2>
                </div>

                <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                    {priorityItems.length} món
                </span>
            </div>

            {/* EMPTY */}
            {priorityItems.length === 0 ? (
                <div className="flex min-h-0 flex-1 items-center justify-center">
                    <div className="text-center">
                        <PackageCheck
                            size={40}
                            className="mx-auto mb-2 text-gray-300"
                        />

                        <p className="font-medium text-gray-500">
                            Chưa có món đang chế biến
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                            Món đang chế biến sẽ xuất hiện ở đây.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                    {priorityItems.map((item, index) => {
                        const isTakeAway =
                            item.orderType === "TAKE_AWAY";

                        const theme = isTakeAway
                            ? {
                                  border: "border-red-200",
                                  bg: "bg-red-50/60",
                                  numberBg: "bg-red-100",
                                  numberText: "text-red-600",
                                  typeBg: "bg-red-100",
                                  typeText: "text-red-600",
                              }
                            : {
                                  border: "border-green-200",
                                  bg: "bg-green-50/60",
                                  numberBg: "bg-green-100",
                                  numberText: "text-green-600",
                                  typeBg: "bg-green-100",
                                  typeText: "text-green-600",
                              };

                        return (
                            <div
                                key={item.id}
                                className={`
                                    flex items-center gap-3
                                    rounded-xl border p-3
                                    ${theme.border}
                                    ${theme.bg}
                                `}
                            >
                                {/* NUMBER */}
                                <div
                                    className={`
                                        flex h-9 w-9 shrink-0
                                        items-center justify-center
                                        rounded-lg
                                        text-sm font-bold
                                        ${theme.numberBg}
                                        ${theme.numberText}
                                    `}
                                >
                                    {index + 1}
                                </div>

                                {/* CONTENT */}
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="truncate font-semibold text-gray-900">
                                            {item.foodName}
                                        </div>

                                        <span className="shrink-0 text-sm font-bold text-gray-700">
                                            × {item.quantity}
                                        </span>
                                    </div>

                                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                                        <span>
                                            #{item.orderCode}
                                        </span>

                                        {isTakeAway ? (
                                            <span
                                                className={`
                                                    rounded-full px-2 py-0.5
                                                    font-semibold
                                                    ${theme.typeBg}
                                                    ${theme.typeText}
                                                `}
                                            >
                                                Mang về
                                            </span>
                                        ) : (
                                            item.table && (
                                                <span
                                                    className={`
                                                        rounded-full px-2 py-0.5
                                                        font-semibold
                                                        ${theme.typeBg}
                                                        ${theme.typeText}
                                                    `}
                                                >
                                                    Bàn{" "}
                                                    {
                                                        item
                                                            .table
                                                            .tableNumber
                                                    }
                                                </span>
                                            )
                                        )}

                                        <span>
                                            {formatTime(
                                                item.createdAt
                                            )}
                                        </span>
                                    </div>

                                    {item.note && (
                                        <div className="mt-1 truncate text-left text-xs text-red-500">
                                            Ghi chú:{" "}
                                            {item.note}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default function Kitchen() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] =
        useState(TABS.WAITING);

    const [waiting, setWaiting] = useState([]);
    const [preparing, setPreparing] = useState([]);
    const [completed, setCompleted] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingOrders, setLoadingOrders] =
        useState({});

    const handleLogout = () => {
        logout();

        navigate("/login", {
            replace: true,
        });
    };

    const loadData = useCallback(
        async (showLoading = true) => {
            try {
                if (showLoading) {
                    setLoading(true);
                } else {
                    setRefreshing(true);
                }

                const [
                    pendingRes,
                    preparingRes,
                    completedRes,
                ] = await Promise.all([
                    kitchenService.getPending(),
                    kitchenService.getPreparing(),
                    kitchenService.getCompleted(),
                ]);

                setWaiting(
                    pendingRes?.data || []
                );

                setPreparing(
                    preparingRes?.data || []
                );

                setCompleted(
                    completedRes?.data || []
                );
            } catch (error) {
                console.error(
                    "KITCHEN LOAD ERROR:",
                    error
                );
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        []
    );

    useEffect(() => {
        loadData();
    }, [loadData]);


    useEffect(() => {
        const token =
            localStorage.getItem("token");

        if (!token) return;

        const API_URL =
            import.meta.env.VITE_API_URL ||
            "http://localhost:5000/api";

        const eventSource = new EventSource(
            `${API_URL}/events/branch?token=${encodeURIComponent(
                token
            )}`
        );

        const handleOrderUpdate = (event) => {
            console.log(
                "KITCHEN ORDER UPDATED:",
                event.data
            );

            loadData(false);
        };

        eventSource.addEventListener(
            "order.updated",
            handleOrderUpdate
        );

        eventSource.onerror = (error) => {
            console.error(
                "SSE BRANCH ERROR:",
                error
            );
        };

        return () => {
            eventSource.removeEventListener(
                "order.updated",
                handleOrderUpdate
            );

            eventSource.close();
        };
    }, [loadData]);

    const startOrder = async (orderId) => {
        try {
            setLoadingOrders((current) => ({
                ...current,
                [orderId]: true,
            }));

            await kitchenService.startOrder(
                orderId
            );

            await loadData(false);
        } catch (error) {
            console.error(
                "KITCHEN START ORDER ERROR:",
                error
            );
        } finally {
            setLoadingOrders((current) => ({
                ...current,
                [orderId]: false,
            }));
        }
    };

    const completeOrder = async (orderId) => {
        try {
            setLoadingOrders((current) => ({
                ...current,
                [orderId]: true,
            }));

            await kitchenService.completeOrder(
                orderId
            );

            await loadData(false);
        } catch (error) {
            console.error(
                "KITCHEN COMPLETE ORDER ERROR:",
                error
            );
        } finally {
            setLoadingOrders((current) => ({
                ...current,
                [orderId]: false,
            }));
        }
    };

    const showCompleted =
        activeTab === TABS.COMPLETED;

    return (
        <div className="min-h-screen bg-[var(--color-background)]">

            <header className="flex h-16 items-center justify-between border-b bg-[var(--color-primary)] px-6 text-white shadow-sm">

                {/* LEFT */}
                <Link
                    to="/branch/kitchen"
                    className="flex items-center gap-2 text-lg font-bold"
                >
                    <ChefHat size={22} />

                    <span>Bếp</span>
                </Link>

                {/* RIGHT */}
                <div className="flex items-center gap-4">

                    {/* USER */}
                    <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                            <User size={18} />
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/branch/profile"
                                )
                            }
                            className="cursor-pointer text-sm font-medium transition hover:opacity-80"
                        >
                            {user?.username}
                        </button>
                    </div>

                    {/* LOGOUT */}
                    <Button
                        type="button"
                        onClick={handleLogout}
                        className="!bg-red-700 mt-2"
                    >
                        <LogOut size={18} />
                        Đăng xuất
                    </Button>

                </div>
            </header>


            <div className="border-b bg-white px-5">
                <div className="flex gap-6">

                    {/* ĐANG XỬ LÝ */}
                    <button
                        type="button"
                        onClick={() =>
                            setActiveTab(
                                TABS.WAITING
                            )
                        }
                        className={`
                            relative py-3 text-sm font-semibold
                            transition
                            ${
                                activeTab ===
                                TABS.WAITING
                                    ? "text-[var(--color-primary)]"
                                    : "text-gray-500 hover:text-gray-700"
                            }
                        `}
                    >
                        Đơn đang xử lý

                        <span
                            className={`
                                ml-2 rounded-full px-2 py-0.5
                                text-xs
                                ${
                                    activeTab ===
                                    TABS.WAITING
                                        ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                                        : "bg-gray-100 text-gray-500"
                                }
                            `}
                        >
                            {waiting.length +
                                preparing.length}
                        </span>

                        {activeTab ===
                            TABS.WAITING && (
                            <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[var(--color-primary)]" />
                        )}
                    </button>

                    {/* HOÀN THÀNH */}
                    <button
                        type="button"
                        onClick={() =>
                            setActiveTab(
                                TABS.COMPLETED
                            )
                        }
                        className={`
                            relative py-3 text-sm font-semibold
                            transition
                            ${
                                activeTab ===
                                TABS.COMPLETED
                                    ? "text-green-600"
                                    : "text-gray-500 hover:text-gray-700"
                            }
                        `}
                    >
                        Hoàn thành

                        <span
                            className={`
                                ml-2 rounded-full px-2 py-0.5
                                text-xs
                                ${
                                    activeTab ===
                                    TABS.COMPLETED
                                        ? "bg-green-100 text-green-600"
                                        : "bg-gray-100 text-gray-500"
                                }
                            `}
                        >
                            {completed.length}
                        </span>

                        {activeTab ===
                            TABS.COMPLETED && (
                            <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-green-500" />
                        )}
                    </button>

                </div>
            </div>

            {/* =================================================
                CONTENT
            ================================================= */}

            <main className="h-[calc(100vh-105px)] min-h-0 p-5">

                {loading ? (

                    <div className="flex h-full items-center justify-center">
                        <div className="flex items-center gap-3 text-gray-500">
                            <Loader2
                                size={22}
                                className="animate-spin"
                            />

                            Đang tải dữ liệu...
                        </div>
                    </div>

                ) : showCompleted ? (

                    /* =================================================
                       HOÀN THÀNH
                    ================================================= */

                    <section className="flex h-full min-h-0 flex-col rounded-2xl border bg-white p-4 shadow-sm">

                        <div className="mb-4 flex shrink-0 items-center justify-between">

                            <div className="flex items-center gap-2">
                                <Check
                                    size={20}
                                    className="text-green-600"
                                />

                                <h2 className="font-bold text-gray-900">
                                    Đơn đã hoàn thành
                                </h2>
                            </div>

                            <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-600">
                                {completed.length} đơn
                            </span>

                        </div>

                        {completed.length === 0 ? (

                            <div className="min-h-0 flex-1 overflow-auto">
                                <EmptyState
                                    title="Chưa có đơn hoàn thành"
                                    description="Các đơn đã hoàn thành sẽ xuất hiện ở đây."
                                />
                            </div>

                        ) : (

                            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

                                    {completed.map(
                                        (order) => (
                                            <KitchenOrderCard
                                                key={
                                                    order.id
                                                }
                                                order={
                                                    order
                                                }
                                                tab={
                                                    TABS.COMPLETED
                                                }
                                                loadingOrders={
                                                    loadingOrders
                                                }
                                                onStartOrder={
                                                    startOrder
                                                }
                                                onCompleteOrder={
                                                    completeOrder
                                                }
                                            />
                                        )
                                    )}

                                </div>
                            </div>

                        )}

                    </section>

                ) : (

                    /* =================================================
                       3 CỘT BẰNG NHAU
                    ================================================= */

                    <div className="grid h-full min-h-0 grid-cols-1 gap-5 xl:grid-cols-3">

                        {/* =================================================
                           1. ĐƠN ĐANG CHỜ
                        ================================================= */}

                        <section className="flex min-h-0 flex-col rounded-2xl border bg-white p-4 shadow-sm">

                            <div className="mb-4 flex shrink-0 items-center justify-between">

                                <div className="flex items-center gap-2">
                                    <Clock3
                                        size={20}
                                        className="text-orange-500"
                                    />

                                    <h2 className="font-bold text-gray-900">
                                        Đơn đang chờ
                                    </h2>
                                </div>

                                <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-600">
                                    {waiting.length} đơn
                                </span>

                            </div>

                            {waiting.length === 0 ? (

                                <div className="min-h-0 flex-1 overflow-auto">
                                    <EmptyState
                                        compact
                                        title="Không có đơn đang chờ"
                                        description="Đơn mới được gửi xuống bếp sẽ xuất hiện ở đây."
                                    />
                                </div>

                            ) : (

                                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">

                                    {waiting.map(
                                        (order) => (
                                            <KitchenOrderCard
                                                key={
                                                    order.id
                                                }
                                                order={
                                                    order
                                                }
                                                tab={
                                                    TABS.WAITING
                                                }
                                                loadingOrders={
                                                    loadingOrders
                                                }
                                                onStartOrder={
                                                    startOrder
                                                }
                                                onCompleteOrder={
                                                    completeOrder
                                                }
                                            />
                                        )
                                    )}

                                </div>

                            )}

                        </section>

                        <section className="flex min-h-0">
                            <PriorityItems
                                orders={preparing}
                            />
                        </section>

                        <section className="flex min-h-0 flex-col rounded-2xl border bg-white p-4 shadow-sm">

                            <div className="mb-4 flex shrink-0 items-center justify-between">

                                <div className="flex items-center gap-2">
                                    <ChefHat
                                        size={20}
                                        className="text-[var(--color-primary)]"
                                    />

                                    <h2 className="font-bold text-gray-900">
                                        Đang chế biến
                                    </h2>
                                </div>

                                <span className="rounded-full bg-[var(--color-primary)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--color-primary)]">
                                    {preparing.length}{" "}
                                    đơn
                                </span>

                            </div>

                            {preparing.length === 0 ? (

                                <div className="min-h-0 flex-1 overflow-auto">
                                    <EmptyState
                                        compact
                                        title="Chưa có đơn đang chế biến"
                                        description="Đơn được bếp bắt đầu chế biến sẽ xuất hiện ở đây."
                                    />
                                </div>

                            ) : (

                                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">

                                    {preparing.map(
                                        (order) => (
                                            <KitchenOrderCard
                                                key={
                                                    order.id
                                                }
                                                order={
                                                    order
                                                }
                                                tab="preparing"
                                                loadingOrders={
                                                    loadingOrders
                                                }
                                                onStartOrder={
                                                    startOrder
                                                }
                                                onCompleteOrder={
                                                    completeOrder
                                                }
                                            />
                                        )
                                    )}

                                </div>

                            )}

                        </section>

                    </div>
                )}
            </main>
        </div>
    );
}
