import { useEffect, useMemo, useState } from "react";
import {
    ArrowDown,
    ArrowUp,
    ShoppingBag,
    Store,
    TrendingDown,
    TrendingUp,
    Trophy,
} from "lucide-react";

import adminService from "../../../services/adminStatistics.service";
import NotiModal from "../../../components/NotiModal/NotiModal";

export default function Statistics({ branchOnly = false }) {
    const today = new Date();
    const todayString = today.toISOString().split("T")[0];

    const [statistics, setStatistics] = useState(null);
    const [branches, setBranches] = useState([]);
    const [period, setPeriod] = useState("week");
    const [branchId, setBranchId] = useState("");
    const [selectedDay, setSelectedDay] = useState(todayString);
    const [selectedDate, setSelectedDate] = useState(todayString);
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());
    const [selectedQuarter, setSelectedQuarter] = useState(
        Math.floor(today.getMonth() / 3) + 1
    );
    const [loading, setLoading] = useState(true);
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

    const formatDateInput = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    const formatDateDisplay = (date) => {
        return date.toLocaleDateString("vi-VN");
    };

    const formatMoney = (value) => {
        return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
    };

    const getMonday = (dateValue) => {
        const date = new Date(`${dateValue}T12:00:00`);
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

    const years = useMemo(() => {
        return Array.from(
            { length: 6 },
            (_, index) => today.getFullYear() - index
        );
    }, [today]);

    useEffect(() => {
        if (branchOnly) return;

        const loadBranches = async () => {
            try {
                const res = await adminService.getBranches();

                console.log("BRANCHES RESPONSE:", res);

                if (res?.success) {
                    setBranches(Array.isArray(res.data) ? res.data : []);
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
    }, [branchOnly]);

    useEffect(() => {
        const loadStatistics = async () => {
            try {
                setLoading(true);

                const params = {
                    period,
                };

                if (!branchOnly && branchId) {
                    params.branchId = branchId;
                }

                if (period === "day") {
                    params.date = selectedDay;
                }

                if (period === "week") {
                    params.weekStart = formatDateInput(
                        getMonday(selectedDate)
                    );
                }

                if (period === "month") {
                    params.year = selectedYear;
                    params.month = selectedMonth;
                }

                if (period === "quarter") {
                    params.year = selectedYear;
                    params.quarter = selectedQuarter;
                }

                console.log("STATISTICS PARAMS:", params);

                const res = await adminService.getStatistics(params);

                console.log("STATISTICS RESPONSE:", res);

                if (res?.success) {
                    setStatistics(res.data || null);
                    return;
                }

                setStatistics(null);

                showNotification(
                    "warning",
                    "Không có dữ liệu",
                    res?.message ||
                        "Không có dữ liệu thống kê cho khoảng thời gian này."
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
        selectedDay,
        selectedDate,
        selectedMonth,
        selectedYear,
        selectedQuarter,
        branchOnly,
    ]);

    const summary = statistics?.summary || {};
    const timeline = statistics?.timeline || [];
    const customerTimeline = statistics?.customerTimeline || [];
    const orderTypeTimeline = statistics?.orderTypeTimeline || [];
    const bestSelling = statistics?.bestSelling || [];
    const leastSelling = statistics?.leastSelling || [];
    const branchRevenue = statistics?.branchRevenue || [];
    const foodTrend = statistics?.foodTrend || {};
    const increasedFoods = foodTrend.increased || [];
    const decreasedFoods = foodTrend.decreased || [];
    const unsoldFoods = statistics?.unsoldFoods || [];

    const showFoodAnalysis =
        period === "week" || period === "month";

    const maxTimeline = useMemo(() => {
        return Math.max(
            ...timeline.map((item) => Number(item.total || 0)),
            1
        );
    }, [timeline]);

    const maxCustomer = useMemo(() => {
        return Math.max(
            ...customerTimeline.flatMap((item) => [
                Number(item.member || 0),
                Number(item.guest || 0),
            ]),
            1
        );
    }, [customerTimeline]);

    const maxOrderType = useMemo(() => {
        return Math.max(
            ...orderTypeTimeline.flatMap((item) => [
                Number(item.dineIn || 0),
                Number(item.takeAway || 0),
            ]),
            1
        );
    }, [orderTypeTimeline]);

    const maxBranch = useMemo(() => {
        return Math.max(
            ...branchRevenue.map((item) =>
                Number(item.revenue || 0)
            ),
            1
        );
    }, [branchRevenue]);

    const createMoneyAxis = (max) => {
        if (!max || max <= 0) {
            return [0];
        }

        const step = max / 4;

        return [
            max,
            step * 3,
            step * 2,
            step,
            0,
        ];
    };

    const revenueAxis = useMemo(
        () => createMoneyAxis(maxTimeline),
        [maxTimeline]
    );

    const customerAxis = useMemo(
        () => createMoneyAxis(maxCustomer),
        [maxCustomer]
    );

    const orderTypeAxis = useMemo(
        () => createMoneyAxis(maxOrderType),
        [maxOrderType]
    );

    const EmptyData = ({
        message = "Chưa có dữ liệu.",
    }) => {
        return (
            <p className="py-10 text-center text-sm text-gray-400">
                {message}
            </p>
        );
    };

    const Notification = () => {
        return (
            <NotiModal
                open={notification.open}
                type={notification.type}
                title={notification.title}
                message={notification.message}
                onClose={closeNotification}
            />
        );
    };

    if (loading) {
        return (
            <>
                <div className="p-6">
                    <div className="rounded-2xl bg-white p-10 text-center text-gray-500 shadow">
                        Đang tải thống kê...
                    </div>
                </div>

                <Notification />
            </>
        );
    }

    if (!statistics) {
        return (
            <>
                <div className="p-6">
                    <div className="rounded-2xl bg-white p-10 text-center text-gray-500 shadow">
                        Không có dữ liệu thống kê.
                    </div>
                </div>

                <Notification />
            </>
        );
    }

    return (
        <>
            <div className="space-y-6 p-3">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--color-text)]">
                        Thống kê doanh thu
                    </h1>

                    <p className="mt-2 text-[var(--color-text-muted)]">
                        Theo dõi doanh thu và hoạt động kinh doanh.
                    </p>
                </div>

                <div className="flex flex-wrap items-end gap-4 rounded-2xl bg-white p-5 shadow">
                    {!branchOnly && (
                        <div>
                            <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                                Chi nhánh
                            </label>

                            <select
                                value={branchId}
                                onChange={(e) =>
                                    setBranchId(e.target.value)
                                }
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
                    )}

                    <div>
                        <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                            Thống kê theo
                        </label>

                        <select
                            value={period}
                            onChange={(e) =>
                                setPeriod(e.target.value)
                            }
                            className="rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-[var(--color-border)]"
                        >
                            <option value="day">Ngày</option>
                            <option value="week">Tuần</option>
                            <option value="month">Tháng</option>
                            <option value="quarter">Quý</option>
                        </select>
                    </div>

                    {period === "day" && (
                        <div>
                            <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                                Chọn ngày
                            </label>

                            <input
                                type="date"
                                value={selectedDay}
                                onChange={(e) =>
                                    setSelectedDay(e.target.value)
                                }
                                className="rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-[var(--color-border)]"
                            />
                        </div>
                    )}

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
                                        setSelectedDate(
                                            e.target.value
                                        )
                                    }
                                    className="rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-[var(--color-border)]"
                                />
                            </div>

                            <p className="pb-2 pl-4 text-sm text-gray-500">
                                Tuần{" "}
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
                                    className="rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-[var(--color-border)]"
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
                                    className="rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-[var(--color-border)]"
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
                                    className="rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-[var(--color-border)]"
                                >
                                    <option value={1}>
                                        Quý 1
                                    </option>
                                    <option value={2}>
                                        Quý 2
                                    </option>
                                    <option value={3}>
                                        Quý 3
                                    </option>
                                    <option value={4}>
                                        Quý 4
                                    </option>
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
                                    className="rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-[var(--color-border)]"
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

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
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
                            {formatMoney(
                                summary.totalRevenue
                            )}
                        </p>
                    </div>

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
                            {formatMoney(
                                summary.averageOrder
                            )}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
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

                        {customerTimeline.length > 0 ? (
                            <div className="flex">
                                <div className="flex h-72 w-24 shrink-0 flex-col justify-between border-r border-gray-200 pr-3 text-right text-xs text-gray-400">
                                    {customerAxis.map(
                                        (value, index) => (
                                            <span
                                                key={index}
                                                className="whitespace-nowrap"
                                            >
                                                {formatMoney(
                                                    value
                                                )}
                                            </span>
                                        )
                                    )}
                                </div>

                                <div className="flex h-72 min-w-0 flex-1 items-end gap-3 overflow-x-auto border-b border-gray-200 px-3">
                                    {customerTimeline.map(
                                        (item) => {
                                            const member =
                                                Number(
                                                    item.member ||
                                                        0
                                                );

                                            const guest =
                                                Number(
                                                    item.guest ||
                                                        0
                                                );

                                            const memberHeight =
                                                (member /
                                                    maxCustomer) *
                                                100;

                                            const guestHeight =
                                                (guest /
                                                    maxCustomer) *
                                                100;

                                            return (
                                                <div
                                                    key={
                                                        item.key
                                                    }
                                                    className="flex h-full min-w-[55px] flex-1 flex-col justify-end"
                                                >
                                                    <div className="flex h-full items-end justify-center gap-1">
                                                        <div
                                                            className="group relative w-2/5 rounded-t bg-[#7c5736]"
                                                            style={{
                                                                height:
                                                                    member >
                                                                    0
                                                                        ? `${memberHeight}%`
                                                                        : "0",
                                                            }}
                                                        >
                                                            {member >
                                                                0 && (
                                                                <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-[-38px] hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-800 px-3 py-2 text-xs font-medium text-white shadow-lg group-hover:block">
                                                                    {formatMoney(
                                                                        member
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div
                                                            className="group relative w-2/5 rounded-t bg-gray-300"
                                                            style={{
                                                                height:
                                                                    guest >
                                                                    0
                                                                        ? `${guestHeight}%`
                                                                        : "0",
                                                            }}
                                                        >
                                                            {guest >
                                                                0 && (
                                                                <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-[-38px] hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-800 px-3 py-2 text-xs font-medium text-white shadow-lg group-hover:block">
                                                                    {formatMoney(
                                                                        guest
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="mt-2 text-center text-xs text-gray-500">
                                                        {
                                                            item.label
                                                        }
                                                    </div>
                                                </div>
                                            );
                                        }
                                    )}
                                </div>
                            </div>
                        ) : (
                            <EmptyData />
                        )}
                    </div>

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

                        {orderTypeTimeline.length > 0 ? (
                            <div className="flex">
                                <div className="flex h-72 w-24 shrink-0 flex-col justify-between border-r border-gray-200 pr-3 text-right text-xs text-gray-400">
                                    {orderTypeAxis.map(
                                        (value, index) => (
                                            <span
                                                key={index}
                                                className="whitespace-nowrap"
                                            >
                                                {formatMoney(
                                                    value
                                                )}
                                            </span>
                                        )
                                    )}
                                </div>

                                <div className="flex h-72 min-w-0 flex-1 items-end gap-3 overflow-x-auto border-b border-gray-200 px-3">
                                    {orderTypeTimeline.map(
                                        (item) => {
                                            const dineIn =
                                                Number(
                                                    item.dineIn ||
                                                        0
                                                );

                                            const takeAway =
                                                Number(
                                                    item.takeAway ||
                                                        0
                                                );

                                            const dineInHeight =
                                                (dineIn /
                                                    maxOrderType) *
                                                100;

                                            const takeAwayHeight =
                                                (takeAway /
                                                    maxOrderType) *
                                                100;

                                            return (
                                                <div
                                                    key={
                                                        item.key
                                                    }
                                                    className="flex h-full min-w-[55px] flex-1 flex-col justify-end"
                                                >
                                                    <div className="flex h-full items-end justify-center gap-1">
                                                        <div
                                                            className="group relative w-2/5 rounded-t bg-blue-500"
                                                            style={{
                                                                height:
                                                                    dineIn >
                                                                    0
                                                                        ? `${dineInHeight}%`
                                                                        : "0",
                                                            }}
                                                        >
                                                            {dineIn >
                                                                0 && (
                                                                <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-[-38px] hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-800 px-3 py-2 text-xs font-medium text-white shadow-lg group-hover:block">
                                                                    {formatMoney(
                                                                        dineIn
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div
                                                            className="group relative w-2/5 rounded-t bg-emerald-500"
                                                            style={{
                                                                height:
                                                                    takeAway >
                                                                    0
                                                                        ? `${takeAwayHeight}%`
                                                                        : "0",
                                                            }}
                                                        >
                                                            {takeAway >
                                                                0 && (
                                                                <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-[-38px] hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-800 px-3 py-2 text-xs font-medium text-white shadow-lg group-hover:block">
                                                                    {formatMoney(
                                                                        takeAway
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="mt-2 text-center text-xs text-gray-500">
                                                        {
                                                            item.label
                                                        }
                                                    </div>
                                                </div>
                                            );
                                        }
                                    )}
                                </div>
                            </div>
                        ) : (
                            <EmptyData />
                        )}
                    </div>
                </div>

                {period !== "day" && (
                    <div className="rounded-2xl bg-white p-6 shadow">
                        <div className="mb-5">
                            <h2 className="text-xl font-bold text-[var(--color-text)]">
                                Doanh thu theo thời gian
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Theo khoảng thời gian đã chọn
                            </p>
                        </div>

                        {timeline.length > 0 ? (
                            <div className="flex">
                                <div className="flex h-72 w-24 shrink-0 flex-col justify-between border-r border-gray-200 pr-3 text-right text-xs text-gray-400">
                                    {revenueAxis.map(
                                        (value, index) => (
                                            <span
                                                key={index}
                                                className="whitespace-nowrap"
                                            >
                                                {formatMoney(value)}
                                            </span>
                                        )
                                    )}
                                </div>

                                <div className="flex h-72 min-w-0 flex-1 items-end gap-3 overflow-x-auto border-b border-gray-200 px-4">
                                    {timeline.map(
                                        (item) => {
                                            const total = Number( item.total || 0 );
                                            const height = (total / maxTimeline) * 100;
                                            return (
                                                <div
                                                    key={
                                                        item.key
                                                    }
                                                    className="flex h-full min-w-[60px] flex-1 flex-col justify-end"
                                                >
                                                    <div className="group relative flex h-full items-end justify-center">
                                                        <div
                                                            className="relative w-10 rounded-t bg-[#7c5736] transition-all duration-200 hover:opacity-80"
                                                            style={{
                                                                height:
                                                                    total >
                                                                    0
                                                                        ? `${height}%`
                                                                        : "0",
                                                            }}
                                                        >
                                                            {total >
                                                                0 && (
                                                                <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-[-38px] hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-800 px-3 py-2 text-xs font-medium text-white shadow-lg group-hover:block">
                                                                    {formatMoney(
                                                                        total
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="mt-2 text-center text-xs text-gray-500">
                                                        {
                                                            item.label
                                                        }
                                                    </div>
                                                </div>
                                            );
                                        }
                                    )}
                                </div>
                            </div>
                        ) : (
                            <EmptyData />
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <div className="rounded-2xl bg-white p-6 shadow">
                        <div className="mb-5 flex items-center gap-2">
                            <Trophy
                                size={22}
                                className="text-yellow-500"
                            />

                            <div>
                                <h2 className="text-xl font-bold text-[var(--color-text)]">
                                    Món bán chạy nhất
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Top món có số lượng bán cao nhất
                                </p>
                            </div>
                        </div>

                        {bestSelling.length > 0 ? (
                            <div className="space-y-3">
                                {bestSelling.map(
                                    (food, index) => (
                                        <div
                                            key={food.id}
                                            className="flex items-center justify-between rounded-xl bg-gray-50 p-4"
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#7c5736] text-sm font-bold text-white">
                                                    {index + 1}
                                                </span>

                                                <span className="truncate font-medium">
                                                    {food.name}
                                                </span>
                                            </div>

                                            <div className="ml-4 shrink-0 text-right">
                                                <p className="font-bold text-[var(--color-text)]">
                                                    { food.quantity }{" "}
                                                    món
                                                </p>

                                                <p className="text-xs text-gray-500">
                                                    {formatMoney( food.revenue )}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        ) : (
                            <EmptyData message="Chưa có dữ liệu món ăn." />
                        )}
                    </div>

                    <div className="rounded-2xl bg-white p-6 shadow">
                        <div className="mb-5 flex items-center gap-2">
                            <ArrowDown
                                size={22}
                                className="text-red-500"
                            />

                            <div>
                                <h2 className="text-xl font-bold text-[var(--color-text)]">
                                    Món bán ít nhất
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Top món có số lượng bán thấp nhất
                                </p>
                            </div>
                        </div>

                        {leastSelling.length > 0 ? (
                            <div className="space-y-3">
                                {leastSelling.map(
                                    (food, index) => (
                                        <div
                                            key={food.id}
                                            className="flex items-center justify-between rounded-xl bg-gray-50 p-4"
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-300 text-sm font-bold text-gray-700">
                                                    {index +
                                                        1}
                                                </span>

                                                <span className="truncate font-medium">
                                                    {food.name}
                                                </span>
                                            </div>

                                            <div className="ml-4 shrink-0 text-right">
                                                <p className="font-bold text-gray-700">
                                                    {
                                                        food.quantity
                                                    }{" "}
                                                    món
                                                </p>

                                                <p className="text-xs text-gray-500">
                                                    {formatMoney(
                                                        food.revenue
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        ) : (
                            <EmptyData message="Chưa có dữ liệu món ăn." />
                        )}
                    </div>
                </div>

                {showFoodAnalysis && (
                    <>
                        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                            <div className="rounded-2xl bg-white p-6 shadow">
                                <div className="mb-5 flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100">
                                        <TrendingUp
                                            size={22}
                                            className="text-green-600"
                                        />
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-bold text-[var(--color-text)]">
                                            Món tăng mạnh
                                        </h2>

                                        <p className="mt-1 text-sm text-gray-500">
                                            So với kỳ trước
                                        </p>
                                    </div>
                                </div>

                                {increasedFoods.length >
                                0 ? (
                                    <div className="space-y-3">
                                        {increasedFoods.map(
                                            (food) => (
                                                <div
                                                    key={
                                                        food.id
                                                    }
                                                    className="rounded-xl border border-green-100 bg-green-50 p-4"
                                                >
                                                    <div className="flex items-center justify-between gap-4">
                                                        <div className="min-w-0">
                                                            <p className="truncate font-semibold text-[var(--color-text)]">
                                                                {
                                                                    food.name
                                                                }
                                                            </p>

                                                            <p className="mt-1 text-xs text-gray-500">
                                                                Kỳ trước:{" "}
                                                                <span className="font-medium">
                                                                    {
                                                                        food.previousQuantity
                                                                    }
                                                                </span>{" "}
                                                                món
                                                            </p>
                                                        </div>

                                                        <div className="shrink-0 text-right">
                                                            <div className="flex items-center justify-end gap-1 text-green-600">
                                                                <ArrowUp size={16} />

                                                                <span className="font-bold">
                                                                    +
                                                                    {
                                                                        food.percentage
                                                                    }
                                                                    %
                                                                </span>
                                                            </div>

                                                            <p className="mt-1 text-xs text-gray-500">
                                                                {
                                                                    food.currentQuantity
                                                                }{" "}
                                                                món
                                                            </p>

                                                            <p className="text-xs font-medium text-green-600">
                                                                +
                                                                {
                                                                    food.difference
                                                                }{" "}
                                                                món
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                ) : (
                                    <EmptyData message="Không có món tăng mạnh." />
                                )}
                            </div>

                            <div className="rounded-2xl bg-white p-6 shadow">
                                <div className="mb-5 flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100">
                                        <TrendingDown
                                            size={22}
                                            className="text-red-600"
                                        />
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-bold text-[var(--color-text)]">
                                            Món giảm mạnh
                                        </h2>

                                        <p className="mt-1 text-sm text-gray-500">
                                            So với kỳ trước
                                        </p>
                                    </div>
                                </div>

                                {decreasedFoods.length >
                                0 ? (
                                    <div className="space-y-3">
                                        {decreasedFoods.map(
                                            (food) => (
                                                <div
                                                    key={
                                                        food.id
                                                    }
                                                    className="rounded-xl border border-red-100 bg-red-50 p-4"
                                                >
                                                    <div className="flex items-center justify-between gap-4">
                                                        <div className="min-w-0">
                                                            <p className="truncate font-semibold text-[var(--color-text)]">
                                                                {
                                                                    food.name
                                                                }
                                                            </p>

                                                            <p className="mt-1 text-xs text-gray-500">
                                                                Kỳ trước:{" "}
                                                                <span className="font-medium">
                                                                    {
                                                                        food.previousQuantity
                                                                    }
                                                                </span>{" "}
                                                                món
                                                            </p>
                                                        </div>

                                                        <div className="shrink-0 text-right">
                                                            <div className="flex items-center justify-end gap-1 text-red-600">
                                                                <ArrowDown size={16} />

                                                                <span className="font-bold">
                                                                    {
                                                                        food.percentage
                                                                    }
                                                                    %
                                                                </span>
                                                            </div>

                                                            <p className="mt-1 text-xs text-gray-500">
                                                                {
                                                                    food.currentQuantity
                                                                }{" "}
                                                                món
                                                            </p>

                                                            <p className="text-xs font-medium text-red-600">
                                                                {
                                                                    food.difference
                                                                }{" "}
                                                                món
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                ) : (
                                    <EmptyData message="Không có món giảm mạnh." />
                                )}
                            </div>
                        </div>

                        <div className="rounded-2xl bg-white p-6 shadow">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100">
                                    <ShoppingBag
                                        size={22}
                                        className="text-orange-600"
                                    />
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold text-[var(--color-text)]">
                                        Món chưa bán được
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Các món chưa phát sinh số
                                        lượng bán trong kỳ
                                    </p>
                                </div>
                            </div>

                            {unsoldFoods.length > 0 ? (
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                                    {unsoldFoods.map(
                                        (food) => (
                                            <div
                                                key={
                                                    food.id
                                                }
                                                className="flex items-center justify-between rounded-xl border border-orange-100 bg-orange-50 p-4"
                                            >
                                                <div className="min-w-0">
                                                    <p className="truncate font-semibold text-[var(--color-text)]">
                                                        {
                                                            food.name
                                                        }
                                                    </p>

                                                    {food
                                                        .category
                                                        ?.name && (
                                                        <p className="mt-1 text-xs text-gray-500">
                                                            {
                                                                food
                                                                    .category
                                                                    .name
                                                            }
                                                        </p>
                                                    )}
                                                </div>

                                                <span className="ml-4 shrink-0 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-600">
                                                    0 món
                                                </span>
                                            </div>
                                        )
                                    )}
                                </div>
                            ) : (
                                <EmptyData message="Tất cả món đều đã có lượt bán trong kỳ." />
                            )}
                        </div>
                    </>
                )}

                {!branchOnly && !branchId && (
                    <div className="rounded-2xl bg-white p-6 shadow">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-secondary)]">
                                <Store
                                    size={22}
                                    className="text-[var(--color-text)]"
                                />
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-[var(--color-text)]">
                                    Doanh thu theo chi nhánh
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    So sánh doanh thu giữa các chi
                                    nhánh
                                </p>
                            </div>
                        </div>

                        {branchRevenue.length > 0 ? (
                            <div className="space-y-4">
                                {branchRevenue.map(
                                    (branch, index) => {
                                        const revenue =
                                            Number(
                                                branch.revenue ||
                                                    0
                                            );

                                        const width =
                                            maxBranch > 0
                                                ? (revenue /
                                                      maxBranch) *
                                                  100
                                                : 0;

                                        return (
                                            <div
                                                key={
                                                    branch.id
                                                }
                                                className="group rounded-2xl border border-gray-100 bg-gray-50 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                                            >
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex min-w-0 items-center gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-bold text-[var(--color-text)] shadow-sm">
                                                            #
                                                            {index +
                                                                1}
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="truncate font-semibold text-[var(--color-text)]">
                                                                {
                                                                    branch.name
                                                                }
                                                            </p>

                                                            <p className="mt-0.5 text-xs text-gray-500">
                                                                {width.toFixed(
                                                                    1
                                                                )}
                                                                % so
                                                                với chi
                                                                nhánh cao
                                                                nhất
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="shrink-0 text-right">
                                                        <p className="text-base font-bold text-[var(--color-text)]">
                                                            {formatMoney(
                                                                revenue
                                                            )}
                                                        </p>

                                                        <p className="mt-0.5 text-xs text-gray-400">
                                                            Doanh thu
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-4 h-3 overflow-hidden rounded-full bg-white">
                                                    <div
                                                        className="h-full rounded-full bg-[#7c5736] transition-all duration-500 group-hover:opacity-90"
                                                        style={{
                                                            width: `${width}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        ) : (
                            <EmptyData message="Chưa có dữ liệu doanh thu chi nhánh." />
                        )}
                    </div>
                )}
            </div>

            <Notification />
        </>
    );
}