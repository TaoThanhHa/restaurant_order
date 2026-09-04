import { Search, Users, UserRound, UserRoundCheck, UserPlus, Wallet, MapPin, CalendarDays, ChevronRight,} from "lucide-react";
import { useEffect, useState } from "react";

import customerAdminService from "../../../services/customerAdmin.service";
import NotiModal from "../../../components/NotiModal/NotiModal";

// CONSTANTS
const INITIAL_STATISTICS = {
    totalCustomers: 0,
    guestCustomers: 0,
    returningCustomers: 0,
    newCustomers: 0,
    totalSpent: 0,
};

const PERIODS = [
    ["month", "Tháng"],
    ["quarter", "Quý"],
    ["year", "Năm"],
];

const SORT_OPTIONS = [
    ["visits_desc", "Ghé nhiều nhất"],
    ["visits_asc", "Ghé ít nhất"],
    ["spent_desc", "Chi tiêu cao nhất"],
    ["spent_asc", "Chi tiêu thấp nhất"],
    ["last_visit_desc", "Ghé gần nhất"],
];

// HELPERS

const formatMoney = (value) => {
    const amount = Number(value) || 0;

    return (
        new Intl.NumberFormat("vi-VN").format(amount) +
        " ₫"
    );
};

const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString("vi-VN");
};

const getCurrentQuarter = () => {
    return Math.floor(new Date().getMonth() / 3) + 1;
};

// MAIN

export default function CustomerManagement() {
    const currentYear = new Date().getFullYear();

    const [period, setPeriod] = useState("month");
    const [periodValue, setPeriodValue] = useState(
        String(new Date().getMonth() + 1)
    );
    const [year, setYear] = useState(currentYear);

    const [sort, setSort] = useState("visits_desc");
    const [search, setSearch] = useState("");

    const [customers, setCustomers] = useState([]);
    const [statistics, setStatistics] = useState(
        INITIAL_STATISTICS
    );

    const [selectedCustomer, setSelectedCustomer] =
        useState(null);

    const [loading, setLoading] = useState(false);

    const [notification, setNotification] = useState({
        open: false,
        type: "error",
        title: "",
        message: "",
    });

    // OPTIONS

    const yearOptions = Array.from(
        { length: 5 },
        (_, index) => currentYear - index
    );

    const periodOptions =
        period === "month"
            ? Array.from(
                  { length: 12 },
                  (_, index) => ({
                      value: String(index + 1),
                      label: `Tháng ${index + 1}`,
                  })
              )
            : period === "quarter"
            ? [1, 2, 3, 4].map((quarter) => ({
                  value: String(quarter),
                  label: `Quý ${quarter}`,
              }))
            : yearOptions.map((item) => ({
                  value: String(item),
                  label: `Năm ${item}`,
              }));

    // NOTIFICATION

    const showNotification = (
        type,
        message,
        title = ""
    ) => {
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

    // CHANGE PERIOD

    const handlePeriodChange = (newPeriod) => {
        setPeriod(newPeriod);

        if (newPeriod === "month") {
            setPeriodValue(
                String(new Date().getMonth() + 1)
            );
            return;
        }

        if (newPeriod === "quarter") {
            setPeriodValue(
                String(getCurrentQuarter())
            );
            return;
        }

        setPeriodValue(String(currentYear));
    };

    // LOAD CUSTOMERS

    const loadCustomers = async () => {
        try {
            setLoading(true);

            const params = {
                period,
                year: Number(year),
                search: search.trim(),
                sort,
            };

            if (period !== "year") {
                params.value = Number(periodValue);
            }

            const result =
                await customerAdminService.getAll(
                    params
                );

            const data = result?.data || {};

            setCustomers(
                Array.isArray(data.customers)
                    ? data.customers
                    : []
            );

            setStatistics({
                ...INITIAL_STATISTICS,
                ...(data.statistics || {}),
            });
        } catch (error) {
            console.error(
                "LOAD CUSTOMER ERROR:",
                error.response?.data || error
            );

            showNotification(
                "error",
                error.response?.data?.message ||
                    "Không thể tải dữ liệu khách hàng."
            );
        } finally {
            setLoading(false);
        }
    };

    // LOAD WHEN FILTER CHANGES

    useEffect(() => {
        const timer = setTimeout(
            loadCustomers,
            300
        );

        return () => clearTimeout(timer);
    }, [
        period,
        year,
        periodValue,
        sort,
        search,
    ]);

    // RENDER

    return (
        <div className="min-h-full bg-[var(--color-background)] p-3">
            {/* HEADER */}

            <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text)]">
                        Quản lý khách hàng
                    </h1>

                    <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                        Theo dõi hành vi quay lại và
                        thói quen sử dụng dịch vụ
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* YEAR */}

                    {period !== "year" && (
                        <select
                            value={year}
                            onChange={(e) =>
                                setYear(
                                    Number(
                                        e.target.value
                                    )
                                )
                            }
                            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                        >
                            {yearOptions.map(
                                (item) => (
                                    <option
                                        key={item}
                                        value={item}
                                    >
                                        {item}
                                    </option>
                                )
                            )}
                        </select>
                    )}

                    {/* PERIOD VALUE */}

                    <select
                        value={periodValue}
                        onChange={(e) =>
                            setPeriodValue(
                                e.target.value
                            )
                        }
                        className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                    >
                        {periodOptions.map(
                            (item) => (
                                <option
                                    key={item.value}
                                    value={item.value}
                                >
                                    {period === "year"
                                        ? item.label
                                        : `${item.label}/${year}`}
                                </option>
                            )
                        )}
                    </select>

                    {/* PERIOD */}

                    <div className="flex rounded-xl bg-white p-1 shadow-sm">
                        {PERIODS.map(
                            ([value, label]) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() =>
                                        handlePeriodChange(
                                            value
                                        )
                                    }
                                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                                        period ===
                                        value
                                            ? "bg-[var(--color-primary)] text-white"
                                            : "text-[var(--color-text-muted)] hover:bg-[var(--color-secondary)]"
                                    }`}
                                >
                                    {label}
                                </button>
                            )
                        )}
                    </div>

                    {/* SORT */}

                    <select
                        value={sort}
                        onChange={(e) =>
                            setSort(e.target.value)
                        }
                        className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                    >
                        {SORT_OPTIONS.map(
                            ([value, label]) => (
                                <option
                                    key={value}
                                    value={value}
                                >
                                    {label}
                                </option>
                            )
                        )}
                    </select>
                </div>
            </div>

            {/* STATISTICS */}

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <StatCard
                    icon={<Users size={21} />}
                    title="Tổng khách"
                    value={statistics.totalCustomers}
                    description="Tất cả khách trong kỳ"
                />

                <StatCard
                    icon={<UserRound size={21} />}
                    title="Khách vãng lai"
                    value={statistics.guestCustomers}
                    description="Không đăng ký tài khoản"
                />

                <StatCard
                    icon={<UserRoundCheck size={21} />}
                    title="Khách quay lại"
                    value={statistics.returningCustomers}
                    description="Đã ghé từ 2 lần"
                />

                <StatCard
                    icon={<UserPlus size={21} />}
                    title="Khách mới"
                    value={statistics.newCustomers}
                    description="Lần đầu ghé quán"
                />

                <StatCard
                    icon={<Wallet size={21} />}
                    title="Tổng chi tiêu"
                    value={formatMoney(statistics.totalSpent)}
                    description="Tổng giá trị đơn hàng"
                />
            </div>

            {/* CONTENT */}

            <div className="rounded-2xl bg-white shadow-sm">
                {/* TOOLBAR */}

                <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="font-semibold text-[var(--color-text)]">
                            Danh sách khách hàng
                        </h2>

                        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                            Theo dõi số lần ghé và cơ sở
                            khách hàng thường sử dụng
                        </p>
                    </div>

                    <div className="relative w-full lg:w-80">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                        />

                        <input
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                            placeholder="Tìm tên, SĐT hoặc email..."
                            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
                        />
                    </div>
                </div>

                {/* TABLE */}

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/70">
                                {[
                                    "Khách hàng",
                                    "Liên hệ",
                                    "Số lần ghé",
                                    "Cơ sở thường ghé",
                                    "Tổng chi tiêu",
                                    "Lần gần nhất",
                                ].map((title) => (
                                    <th
                                        key={title}
                                        className="px-5 py-3 text-center text-xs font-semibold uppercase text-[var(--color-text)]"
                                    >
                                        {title}
                                    </th>
                                ))}

                                <th className="w-12 px-3" />
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-5 py-12 text-center text-sm text-[var(--color-text-muted)]"
                                    >
                                        Đang tải dữ liệu
                                        khách hàng...
                                    </td>
                                </tr>
                            ) : (
                                customers.map(
                                    (customer) => (
                                        <CustomerRow
                                            key={
                                                customer.id
                                            }
                                            customer={
                                                customer
                                            }
                                            onClick={() =>
                                                setSelectedCustomer(
                                                    customer
                                                )
                                            }
                                        />
                                    )
                                )
                            )}
                        </tbody>
                    </table>
                </div>

                {/* EMPTY */}

                {!loading &&
                    customers.length === 0 && (
                        <EmptyCustomers />
                    )}
            </div>

            {/* DETAIL */}

            {selectedCustomer && (
                <CustomerDetail
                    customer={selectedCustomer}
                    onClose={() =>
                        setSelectedCustomer(null)
                    }
                />
            )}

            {/* NOTIFICATION */}

            <NotiModal
                open={notification.open}
                type={notification.type}
                title={notification.title}
                message={notification.message}
                onClose={closeNotification}
            />
        </div>
    );
}

// CUSTOMER ROW

function CustomerRow({
    customer,
    onClick,
}) {
    const initial =
        customer.name
            ?.charAt(0)
            ?.toUpperCase() || "?";

    return (
        <tr
            onClick={onClick}
            className="cursor-pointer border-b border-slate-100 transition hover:bg-slate-50"
        >
            {/* CUSTOMER */}

            <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-secondary)] font-semibold text-[var(--color-primary)]">
                        {initial}
                    </div>

                    <p className="font-medium text-[var(--color-text)]">
                        {customer.name || "Khách hàng"}
                    </p>
                </div>
            </td>

            {/* CONTACT */}

            <td className="px-5 py-4 text-center">
                <p className="text-sm text-[var(--color-text)]">
                    {customer.phone || "—"}
                </p>

                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    {customer.email || "—"}
                </p>
            </td>

            {/* VISITS */}

            <td className="px-5 py-4 text-center">
                <span className="inline-flex items-center rounded-full bg-[var(--color-secondary)] px-3 py-1 text-sm font-semibold text-[var(--color-primary)]">
                    {customer.visits || 0} lần
                </span>
            </td>

            {/* BRANCH */}

            <td className="px-5 py-4">
                <div className="flex items-center justify-center gap-2">
                    <MapPin
                        size={16}
                        className="text-[var(--color-primary)]"
                    />

                    <span className="text-sm text-[var(--color-text)]">
                        {customer.favoriteBranch ||
                            "—"}
                    </span>
                </div>
            </td>

            {/* SPENT */}

            <td className="px-5 py-4 text-center">
                <span className="text-sm font-semibold text-[var(--color-text)]">
                    {formatMoney(
                        customer.totalSpent
                    )}
                </span>
            </td>

            {/* LAST VISIT */}

            <td className="px-5 py-4 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-[var(--color-text-muted)]">
                    <CalendarDays size={15} />

                    {formatDate(customer.lastVisit)}
                </div>
            </td>

            {/* ARROW */}

            <td className="px-3">
                <ChevronRight
                    size={18}
                    className="text-[var(--color-text-muted)]"
                />
            </td>
        </tr>
    );
}

// EMPTY

function EmptyCustomers() {
    return (
        <div className="py-16 text-center">
            <Users
                size={40}
                className="mx-auto text-slate-300"
            />

            <p className="mt-3 font-medium text-[var(--color-text-muted)]">
                Không tìm thấy khách hàng
            </p>

            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                Thử tìm kiếm bằng tên, số điện thoại
                hoặc email
            </p>
        </div>
    );
}

// STAT CARD

function StatCard({
    icon,
    title,
    value,
    description,
}) {
    return (
        <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-[var(--color-text-muted)]">
                        {title}
                    </p>

                    <p className="mt-2 text-2xl font-bold text-[var(--color-text)]">
                        {value}
                    </p>

                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                        {description}
                    </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-secondary)] text-[var(--color-primary)]">
                    {icon}
                </div>
            </div>
        </div>
    );
}

// CUSTOMER DETAIL

function CustomerDetail({
    customer,
    onClose,
}) {
    const initial =
        customer.name
            ?.charAt(0)
            ?.toUpperCase() || "?";

    const branches = Array.isArray(
        customer.branches
    )
        ? [...customer.branches].sort(
              (a, b) =>
                  (b.visits || 0) -
                  (a.visits || 0)
          )
        : [];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={onClose}
        >
            <div
                className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-xl"
                onClick={(e) =>
                    e.stopPropagation()
                }
            >
                {/* HEADER */}

                <div className="border-b border-slate-100 p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-secondary)] text-xl font-bold text-[var(--color-primary)]">
                                {initial}
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-[var(--color-text)]">
                                    {customer.name ||
                                        "Khách hàng"}
                                </h2>

                                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                                    {customer.phone ||
                                        "—"}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl px-3 py-2 text-[var(--color-text-muted)] transition hover:bg-slate-100"
                        >
                            Đóng
                        </button>
                    </div>
                </div>

                {/* SUMMARY */}

                <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-3">
                    <DetailStat
                        label="Số lần ghé"
                        value={`${customer.visits || 0} lần`}
                    />

                    <DetailStat
                        label="Tổng chi tiêu"
                        value={formatMoney(
                            customer.totalSpent
                        )}
                    />

                    <DetailStat
                        label="Cơ sở yêu thích"
                        value={
                            customer.favoriteBranch ||
                            "—"
                        }
                    />
                </div>

                {/* BRANCH */}

                <div className="px-6 pb-6">
                    <h3 className="mb-4 font-semibold text-[var(--color-text)]">
                        Thống kê theo cơ sở
                    </h3>

                    {branches.length === 0 ? (
                        <p className="rounded-2xl bg-slate-50 p-5 text-center text-sm text-[var(--color-text-muted)]">
                            Chưa có dữ liệu theo cơ sở.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {branches.map(
                                (branch) => (
                                    <div
                                        key={
                                            branch.branchId
                                        }
                                        className="rounded-2xl border border-slate-100 p-4"
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-secondary)] text-[var(--color-primary)]">
                                                    <MapPin
                                                        size={
                                                            18
                                                        }
                                                    />
                                                </div>

                                                <div>
                                                    <p className="font-medium text-[var(--color-text)]">
                                                        {
                                                            branch.branchName
                                                        }
                                                    </p>

                                                    <p className="text-xs text-[var(--color-text-muted)]">
                                                        {branch.visits ||
                                                            0}{" "}
                                                        lần ghé
                                                    </p>
                                                </div>
                                            </div>

                                            <p className="font-semibold text-[var(--color-text)]">
                                                {formatMoney(
                                                    branch.totalSpent ??
                                                        branch.spent ??
                                                        0
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// DETAIL STAT

function DetailStat({
    label,
    value,
}) {
    return (
        <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs text-[var(--color-text-muted)]">
                {label}
            </p>

            <p className="mt-2 font-semibold text-[var(--color-text)]">
                {value || "—"}
            </p>
        </div>
    );
}