import { useEffect, useMemo, useState } from "react";
import { TrendingUp, Store, ShoppingBag, Utensils, Trophy, ArrowDown, } from "lucide-react";

import adminService from "../../../services/adminStatistics.service";
import NotiModal from "../../../components/NotiModal/NotiModal";

export default function Statistics() {
    const today = new Date();

    // STATE

    const [statistics, setStatistics] = useState(null);
    const [branches, setBranches] = useState([]);

    const [period, setPeriod] = useState("week");
    const [branchId, setBranchId] = useState("");

    const [selectedDate, setSelectedDate] = useState(
        today.toISOString().split("T")[0]
    );
    const [selectedMonth, setSelectedMonth] = useState(
        today.getMonth() + 1
    );
    const [selectedYear, setSelectedYear] = useState(
        today.getFullYear()
    );
    const [selectedQuarter, setSelectedQuarter] = useState(
        Math.floor(today.getMonth() / 3) + 1
    );

    const [loading, setLoading] = useState(true);

    // NOTIFICATION

    const [notification, setNotification] = useState({
        open: false,
        type: "success",
        title: "",
        message: "",
    });

    const showNotification = (type, title, message) => {
        setNotification({
            open: true,
            type,
            title,
            message,
        });
    };

    const closeNotification = () => {
        setNotification((prev) => ({
            ...prev,
            open: false,
        }));
    };

    // DATE HELPERS

    const formatDateInput = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    const formatDateDisplay = (date) => {
        return date.toLocaleDateString("vi-VN");
    };

    const getMonday = (dateValue) => {
        const date = new Date(`${dateValue}T00:00:00`);
        const day = date.getDay();
        const diff = day === 0 ? -6 : 1 - day;

        date.setDate(date.getDate() + diff);
        date.setHours(0, 0, 0, 0);

        return date;
    };

    const getSunday = (dateValue) => {
        const sunday = new Date(getMonday(dateValue));

        sunday.setDate(sunday.getDate() + 6);

        return sunday;
    };

    // FORMAT MONEY

    const formatMoney = (value) => {
        return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
    };

    // LOAD BRANCHES

    useEffect(() => {
        const loadBranches = async () => {
            try {
                const res = await adminService.getBranches();

                if (res?.success) {
                    setBranches(res.data || []);
                    return;
                }

                setBranches([]);

                showNotification(
                    "warning",
                    "Không có dữ liệu",
                    res?.message || "Không thể lấy danh sách chi nhánh."
                );
            } catch (error) {
                console.error("Lỗi lấy danh sách chi nhánh:", error);

                setBranches([]);

                showNotification(
                    "error",
                    "Không thể tải dữ liệu",
                    error.response?.data?.message ||
                        "Không thể lấy danh sách chi nhánh."
                );
            }
        };

        loadBranches();
    }, []);

    // LOAD STATISTICS

    useEffect(() => {
        const loadStatistics = async () => {
            try {
                setLoading(true);

                const params = {
                    period,
                };

                if (branchId) {
                    params.branchId = branchId;
                }

                // WEEK
                if (period === "week") {
                    params.weekStart = formatDateInput(
                        getMonday(selectedDate)
                    );
                }

                // MONTH
                if (period === "month") {
                    params.year = selectedYear;
                    params.month = selectedMonth;
                }

                // QUARTER
                if (period === "quarter") {
                    params.year = selectedYear;
                    params.quarter = selectedQuarter;
                }

                const res = await adminService.getStatistics(params);

                if (res?.success) {
                    setStatistics(res.data || null);
                    return;
                }

                setStatistics(null);

                showNotification(
                    "warning",
                    "Không có dữ liệu",
                    res?.message || "Không có dữ liệu thống kê cho khoảng thời gian này."
                );
            } catch (error) {
                console.error("Lỗi lấy thống kê:", error);

                setStatistics(null);

                showNotification(
                    "error",
                    "Không thể tải thống kê",
                    error.response?.data?.message ||
                        "Đã xảy ra lỗi khi tải dữ liệu thống kê."
                );
            } finally {
                setLoading(false);
            }
        };

        loadStatistics();
    }, [
        period,
        branchId,
        selectedDate,
        selectedMonth,
        selectedYear,
        selectedQuarter,
    ]);

    // STATISTICS DATA

    const summary = statistics?.summary || {};
    const bestSelling = statistics?.bestSelling || [];
    const leastSelling = statistics?.leastSelling || [];
    const branchRevenue = statistics?.branchRevenue || [];

    // MAX VALUES

    const maxTimeline = useMemo(() => {
        return Math.max(
            ...(statistics?.timeline || []).map((item) =>
                Number(item.total || 0)
            ),
            1
        );
    }, [statistics]);

    const maxCustomer = useMemo(() => {
        return Math.max(
            ...(statistics?.customerTimeline || []).flatMap((item) => [
                Number(item.member || 0),
                Number(item.guest || 0),
            ]),
            1
        );
    }, [statistics]);

    const maxOrderType = useMemo(() => {
        return Math.max(
            ...(statistics?.orderTypeTimeline || []).flatMap((item) => [
                Number(item.dineIn || 0),
                Number(item.takeAway || 0),
            ]),
            1
        );
    }, [statistics]);

    const maxBranch = useMemo(() => {
        return Math.max(
            ...(statistics?.branchRevenue || []).map((item) =>
                Number(item.revenue || 0)
            ),
            1
        );
    }, [statistics]);

    // YEAR LIST

    const years = useMemo(() => {
        return Array.from(
            { length: 6 },
            (_, index) => today.getFullYear() - index
        );
    }, []);

    // LOADING

    if (loading) {
        return (
            <>
                <div className="p-6">
                    <div className="rounded-2xl bg-white p-10 text-center text-gray-500 shadow">
                        Đang tải thống kê...
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

    // EMPTY

    if (!statistics) {
        return (
            <>
                <div className="p-6">
                    <div className="rounded-2xl bg-white p-10 text-center text-gray-500 shadow">
                        Không có dữ liệu thống kê.
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

    // RENDER

    return (
        <>
            <div className="space-y-6 p-3">
                {/* ========================================
                    HEADER
                ======================================== */}

                <div>
                    <h1 className="text-3xl font-bold text-[var(--color-text)]">
                        Thống kê doanh thu
                    </h1>

                    <p className="mt-2 text-[var(--color-text-muted)]">
                        Theo dõi doanh thu và hoạt động kinh doanh.
                    </p>
                </div>

                {/* ========================================
                    FILTER
                ======================================== */}

                <div className="flex flex-wrap items-end gap-4 rounded-2xl bg-white p-5 shadow">
                    {/* CHI NHÁNH */}

                    <div>
                        <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                            Chi nhánh
                        </label>

                        <select
                            value={branchId}
                            onChange={(e) => setBranchId(e.target.value)}
                            className="rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-[var(--color-border)]"
                        >
                            <option value="">
                                Tất cả chi nhánh
                            </option>

                            {branches.map((branch) => (
                                <option
                                    key={branch.id}
                                    value={branch.id}
                                >
                                    {branch.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* PERIOD */}

                    <div>
                        <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                            Thống kê theo
                        </label>

                        <select
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            className="rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-[#7c5736]"
                        >
                            <option value="week">Tuần</option>
                            <option value="month">Tháng</option>
                            <option value="quarter">Quý</option>
                        </select>
                    </div>

                    {/* WEEK */}

                    {period === "week" && (
                        <div className="flex items-end">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                                    Chọn tuần
                                </label>

                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) =>
                                        setSelectedDate(e.target.value)
                                    }
                                    className="rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-[#7c5736]"
                                />
                            </div>

                            <p className="pb-2 pl-4 text-sm text-gray-500">
                                Tuần:{" "}
                                {formatDateDisplay(
                                    getMonday(selectedDate)
                                )}{" "}
                                -{" "}
                                {formatDateDisplay(
                                    getSunday(selectedDate)
                                )}
                            </p>
                        </div>
                    )}

                    {/* MONTH */}

                    {period === "month" && (
                        <>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                                    Tháng
                                </label>

                                <select
                                    value={selectedMonth}
                                    onChange={(e) =>
                                        setSelectedMonth(
                                            Number(e.target.value)
                                        )
                                    }
                                    className="rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-[#7c5736]"
                                >
                                    {Array.from(
                                        { length: 12 },
                                        (_, index) => (
                                            <option
                                                key={index + 1}
                                                value={index + 1}
                                            >
                                                Tháng {index + 1}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                                    Năm
                                </label>

                                <select
                                    value={selectedYear}
                                    onChange={(e) =>
                                        setSelectedYear(
                                            Number(e.target.value)
                                        )
                                    }
                                    className="rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-[#7c5736]"
                                >
                                    {years.map((year) => (
                                        <option
                                            key={year}
                                            value={year}
                                        >
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}

                    {/* QUARTER */}

                    {period === "quarter" && (
                        <>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                                    Quý
                                </label>

                                <select
                                    value={selectedQuarter}
                                    onChange={(e) =>
                                        setSelectedQuarter(
                                            Number(e.target.value)
                                        )
                                    }
                                    className="rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-[#7c5736]"
                                >
                                    <option value={1}>Quý 1</option>
                                    <option value={2}>Quý 2</option>
                                    <option value={3}>Quý 3</option>
                                    <option value={4}>Quý 4</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                                    Năm
                                </label>

                                <select
                                    value={selectedYear}
                                    onChange={(e) =>
                                        setSelectedYear(
                                            Number(e.target.value)
                                        )
                                    }
                                    className="rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-[#7c5736]"
                                >
                                    {years.map((year) => (
                                        <option
                                            key={year}
                                            value={year}
                                        >
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}
                </div>

                {/* ========================================
                    SUMMARY
                ======================================== */}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                    {/* TOTAL */}

                    <div className="rounded-2xl bg-white p-5 shadow">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                                Tổng doanh thu
                            </p>

                            <TrendingUp
                                size={22}
                                className="text-[var(--color-text)]"
                            />
                        </div>

                        <p className="mt-3 text-2xl font-bold text-[var(--color-text)]">
                            {formatMoney(summary.totalRevenue)}
                        </p>
                    </div>

                    {/* DINE IN */}

                    <div className="rounded-2xl bg-white p-5 shadow">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                                Tại chỗ
                            </p>

                            <Utensils
                                size={22}
                                className="text-blue-500"
                            />
                        </div>

                        <p className="mt-3 text-2xl font-bold text-blue-500">
                            {formatMoney(summary.totalDineIn)}
                        </p>
                    </div>

                    {/* TAKE AWAY */}

                    <div className="rounded-2xl bg-white p-5 shadow">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                                Mang về
                            </p>

                            <ShoppingBag
                                size={22}
                                className="text-emerald-500"
                            />
                        </div>

                        <p className="mt-3 text-2xl font-bold text-emerald-500">
                            {formatMoney(summary.totalTakeAway)}
                        </p>
                    </div>

                    {/* ORDER */}

                    <div className="rounded-2xl bg-white p-5 shadow">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                                Số đơn
                            </p>

                            <ShoppingBag
                                size={22}
                                className="text-orange-500"
                            />
                        </div>

                        <p className="mt-3 text-2xl font-bold text-orange-500">
                            {summary.orderCount || 0}
                        </p>
                    </div>

                    {/* AVERAGE */}

                    <div className="rounded-2xl bg-white p-5 shadow">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                                Đơn trung bình
                            </p>

                            <Store
                                size={22}
                                className="text-purple-500"
                            />
                        </div>

                        <p className="mt-3 text-2xl font-bold text-purple-500">
                            {formatMoney(summary.averageOrder)}
                        </p>
                    </div>
                </div>

                {/* ========================================
                    CUSTOMER / ORDER TYPE
                ======================================== */}

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    {/* CUSTOMER */}

                    <div className="rounded-2xl bg-white p-6 shadow">
                        <div className="mb-5">
                            <h2 className="text-xl font-bold text-[var(--color-text)]">
                                Doanh thu theo khách hàng
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Thành viên và vãng lai
                            </p>
                        </div>

                        <div className="mb-5 flex gap-6 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-full bg-[#7c5736]" />
                                Thành viên
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-full bg-gray-300" />
                                Vãng lai
                            </div>
                        </div>

                        <div className="flex h-72 items-end gap-3 overflow-x-auto border-b border-l border-gray-200 px-3">
                            {(statistics.customerTimeline || []).map(
                                (item) => {
                                    const memberHeight =
                                        (Number(item.member || 0) /
                                            maxCustomer) *
                                        100;

                                    const guestHeight =
                                        (Number(item.guest || 0) /
                                            maxCustomer) *
                                        100;

                                    return (
                                        <div
                                            key={item.key}
                                            className="flex h-full min-w-[55px] flex-1 flex-col justify-end"
                                        >
                                            <div className="flex h-full items-end justify-center gap-1">
                                                {/* MEMBER */}

                                                <div
                                                    className="group relative w-2/5 rounded-t bg-[#7c5736]"
                                                    style={{
                                                        height:
                                                            item.member > 0
                                                                ? `${memberHeight}%`
                                                                : "0",
                                                    }}
                                                >
                                                    <div className="pointer-events-none absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white group-hover:block">
                                                        {formatMoney(
                                                            item.member
                                                        )}
                                                    </div>
                                                </div>

                                                {/* GUEST */}

                                                <div
                                                    className="group relative w-2/5 rounded-t bg-gray-300"
                                                    style={{
                                                        height:
                                                            item.guest > 0
                                                                ? `${guestHeight}%`
                                                                : "0",
                                                    }}
                                                >
                                                    <div className="pointer-events-none absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white group-hover:block">
                                                        {formatMoney(
                                                            item.guest
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-2 text-center text-xs text-gray-500">
                                                {item.label}
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    </div>

                    {/* ORDER TYPE */}

                    <div className="rounded-2xl bg-white p-6 shadow">
                        <div className="mb-5">
                            <h2 className="text-xl font-bold text-[var(--color-text)]">
                                So sánh doanh thu tại chỗ, mang về
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Theo thời gian đã chọn
                            </p>
                        </div>

                        <div className="mb-5 flex gap-6 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-full bg-blue-500" />
                                Tại chỗ
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-full bg-emerald-500" />
                                Mang về
                            </div>
                        </div>

                        <div className="flex h-72 items-end gap-3 overflow-x-auto border-b border-l border-gray-200 px-3">
                            {(statistics.orderTypeTimeline || []).map(
                                (item) => {
                                    const dineInHeight =
                                        (Number(item.dineIn || 0) /
                                            maxOrderType) *
                                        100;

                                    const takeAwayHeight =
                                        (Number(item.takeAway || 0) /
                                            maxOrderType) *
                                        100;

                                    return (
                                        <div
                                            key={item.key}
                                            className="flex h-full min-w-[55px] flex-1 flex-col justify-end"
                                        >
                                            <div className="flex h-full items-end justify-center gap-1">
                                                {/* DINE IN */}

                                                <div
                                                    className="group relative w-2/5 rounded-t bg-blue-500"
                                                    style={{
                                                        height:
                                                            item.dineIn > 0
                                                                ? `${dineInHeight}%`
                                                                : "0",
                                                    }}
                                                >
                                                    <div className="pointer-events-none absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white group-hover:block">
                                                        {formatMoney(
                                                            item.dineIn
                                                        )}
                                                    </div>
                                                </div>

                                                {/* TAKE AWAY */}

                                                <div
                                                    className="group relative w-2/5 rounded-t bg-emerald-500"
                                                    style={{
                                                        height:
                                                            item.takeAway > 0
                                                                ? `${takeAwayHeight}%`
                                                                : "0",
                                                    }}
                                                >
                                                    <div className="pointer-events-none absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white group-hover:block">
                                                        {formatMoney(
                                                            item.takeAway
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-2 text-center text-xs text-gray-500">
                                                {item.label}
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    </div>
                </div>

                {/* ========================================
                    REVENUE TIMELINE
                ======================================== */}

                <div className="rounded-2xl bg-white p-6 shadow">
                    <h2 className="text-xl font-bold text-[var(--color-text)]">
                        Doanh thu theo thời gian
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Theo khoảng thời gian đã chọn
                    </p>

                    <div className="mt-8 flex h-72 items-end gap-3 overflow-x-auto border-b border-l border-gray-200 px-3">
                        {(statistics.timeline || []).map((item) => {
                            const height =
                                (Number(item.total || 0) /
                                    maxTimeline) *
                                100;

                            return (
                                <div
                                    key={item.key}
                                    className="flex h-full min-w-[60px] flex-1 flex-col justify-end"
                                >
                                    <div className="group relative flex h-full items-end justify-center">
                                        <div
                                            className="relative w-10 rounded-t bg-[#7c5736] transition-all hover:opacity-80"
                                            style={{
                                                height:
                                                    item.total > 0
                                                        ? `${height}%`
                                                        : "0",
                                            }}
                                        >
                                            <div className="pointer-events-none absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white group-hover:block">
                                                {formatMoney(
                                                    item.total
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-2 text-center text-xs text-gray-500">
                                        {item.label}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ========================================
                    BEST / LEAST SELLING
                ======================================== */}

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    {/* BEST */}

                    <div className="rounded-2xl bg-white p-6 shadow">
                        <div className="mb-5 flex items-center gap-2">
                            <Trophy
                                size={22}
                                className="text-yellow-500"
                            />

                            <h2 className="text-xl font-bold text-[var(--color-text)]">
                                Món bán chạy nhất
                            </h2>
                        </div>

                        {bestSelling.length > 0 ? (
                            <div className="space-y-3">
                                {bestSelling.map((food, index) => (
                                    <div
                                        key={food.id}
                                        className="flex items-center justify-between rounded-xl bg-gray-50 p-4"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7c5736] text-sm font-bold text-white">
                                                {index + 1}
                                            </span>

                                            <span className="font-medium">
                                                {food.name}
                                            </span>
                                        </div>

                                        <div className="text-right">
                                            <p className="font-bold text-[var(--color-text)]">
                                                {food.quantity} món
                                            </p>

                                            <p className="text-xs text-gray-500">
                                                {formatMoney(
                                                    food.revenue
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="py-10 text-center text-sm text-gray-400">
                                Chưa có dữ liệu món ăn.
                            </p>
                        )}
                    </div>

                    {/* LEAST */}

                    <div className="rounded-2xl bg-white p-6 shadow">
                        <div className="mb-5 flex items-center gap-2">
                            <ArrowDown
                                size={22}
                                className="text-red-500"
                            />

                            <h2 className="text-xl font-bold text-[var(--color-text)]">
                                Món bán ít nhất
                            </h2>
                        </div>

                        {leastSelling.length > 0 ? (
                            <div className="space-y-3">
                                {leastSelling.map((food, index) => (
                                    <div
                                        key={food.id}
                                        className="flex items-center justify-between rounded-xl bg-gray-50 p-4"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-sm font-bold text-gray-700">
                                                {index + 1}
                                            </span>

                                            <span className="font-medium">
                                                {food.name}
                                            </span>
                                        </div>

                                        <div className="text-right">
                                            <p className="font-bold text-gray-700">
                                                {food.quantity} món
                                            </p>

                                            <p className="text-xs text-gray-500">
                                                {formatMoney(
                                                    food.revenue
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="py-10 text-center text-sm text-gray-400">
                                Chưa có dữ liệu món ăn.
                            </p>
                        )}
                    </div>
                </div>

                {/* ========================================
                    BRANCH REVENUE
                ======================================== */}

                {!branchId && branchRevenue.length > 0 && (
                    <div className="rounded-2xl bg-white p-6 shadow">
                        <div className="mb-5 flex items-center gap-2">
                            <Store
                                size={22}
                                className="text-[var(--color-text)]"
                            />

                            <h2 className="text-xl font-bold text-[var(--color-text)]">
                                Doanh thu theo chi nhánh
                            </h2>
                        </div>

                        <div className="space-y-4">
                            {branchRevenue.map((branch) => {
                                const width =
                                    (Number(branch.revenue || 0) /
                                        maxBranch) *
                                    100;

                                return (
                                    <div key={branch.id}>
                                        <div className="mb-1 flex justify-between text-sm">
                                            <span className="font-medium">
                                                {branch.name}
                                            </span>

                                            <span className="font-bold text-[var(--color-text)]">
                                                {formatMoney(
                                                    branch.revenue
                                                )}
                                            </span>
                                        </div>

                                        <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                                            <div
                                                className="h-full rounded-full bg-[#7c5736] transition-all"
                                                style={{
                                                    width: `${width}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* ========================================
                NOTIFICATION MODAL
            ======================================== */}

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