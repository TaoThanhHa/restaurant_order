import { useEffect, useMemo, useState } from "react";
import {
    CalendarDays,
    CheckCircle2,
    Clock3,
    Eye,
    Plus,
    RefreshCw,
    Search,
    Table2,
    UserRound,
    XCircle,
} from "lucide-react";

import reservationService from "../../../services/resevervation.service.js";
import ReservationForm from "./components/ReservationForm";
import AssignTableModal from "./components/AssignTableModal";

const STATUS = {
    PENDING: {
        label: "Chờ xác nhận",
        className: "bg-yellow-50 text-yellow-700",
    },
    CONFIRMED: {
        label: "Đã xác nhận",
        className: "bg-blue-50 text-blue-700",
    },
    CHECKED_IN: {
        label: "Đang phục vụ",
        className: "bg-emerald-50 text-emerald-700",
    },
    COMPLETED: {
        label: "Hoàn thành",
        className: "bg-gray-100 text-gray-600",
    },
    CANCELLED: {
        label: "Đã hủy",
        className: "bg-red-50 text-red-600",
    },
    NO_SHOW: {
        label: "Không đến",
        className: "bg-orange-50 text-orange-700",
    },
};

const formatDateTime = value => {
    if (!value) return "-";

    return new Date(value).toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

const getToday = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

export default function ReservationManagement() {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    const [date, setDate] = useState(getToday());
    const [status, setStatus] = useState("");
    const [search, setSearch] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [assignReservation, setAssignReservation] = useState(null);
    const [detail, setDetail] = useState(null);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const user = JSON.parse(localStorage.getItem("user") || "null");
    const role = user?.role;

    const canManage = ["ADMIN", "BRANCH"].includes(role);
    const canProcess = ["ADMIN", "BRANCH", "CASHIER"].includes(role);

    const loadReservations = async () => {
        try {
            setLoading(true);
            setError("");

            const params = {};

            if (date) params.date = date;
            if (status) params.status = status;

            const res = await reservationService.getAll(params);
            setReservations(res.data || res || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Không thể tải danh sách đặt bàn."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReservations();
    }, [date, status]);

    const filteredReservations = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) return reservations;

        return reservations.filter(item =>
            `${item.customerName} ${item.customerPhone}`
                .toLowerCase()
                .includes(keyword)
        );
    }, [reservations, search]);

    const handleCreate = async data => {
        try {
            setActionLoading("create");
            setError("");

            await reservationService.create(data);

            setShowForm(false);
            setMessage("Tạo đặt bàn thành công.");
            await loadReservations();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Không thể tạo đặt bàn."
            );
        } finally {
            setActionLoading(null);
        }
    };

    const handleCancel = async reservation => {
        if (
            !window.confirm(
                `Hủy đặt bàn của ${reservation.customerName}?`
            )
        ) {
            return;
        }

        try {
            setActionLoading(reservation.id);
            setError("");

            await reservationService.cancel(reservation.id);

            setMessage("Đã hủy đặt bàn.");
            await loadReservations();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Không thể hủy đặt bàn."
            );
        } finally {
            setActionLoading(null);
        }
    };

    const handleRemind = async reservation => {
        try {
            setActionLoading(reservation.id);
            setError("");

            await reservationService.remind(reservation.id);

            setMessage("Đã ghi nhận gọi nhắc khách.");
            await loadReservations();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Không thể ghi nhận nhắc khách."
            );
        } finally {
            setActionLoading(null);
        }
    };

    const handleCheckIn = async reservation => {
        try {
            setActionLoading(reservation.id);
            setError("");

            await reservationService.checkIn(reservation.id);

            setMessage("Check-in khách thành công.");
            await loadReservations();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Không thể check-in."
            );
        } finally {
            setActionLoading(null);
        }
    };

    const handleComplete = async reservation => {
        try {
            setActionLoading(reservation.id);
            setError("");

            await reservationService.complete(reservation.id);

            setMessage("Đã hoàn thành đặt bàn.");
            await loadReservations();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Không thể hoàn thành đặt bàn."
            );
        } finally {
            setActionLoading(null);
        }
    };

    useEffect(() => {
        if (!message) return;

        const timer = setTimeout(() => {
            setMessage("");
        }, 3000);

        return () => clearTimeout(timer);
    }, [message]);

    return (
        <div className="min-h-full bg-gray-50 p-4 md:p-6">
            <div className="mx-auto max-w-[1600px]">
                <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Quản lý đặt bàn
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Theo dõi và xử lý các lượt đặt bàn của nhà hàng
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={loadReservations}
                            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-50"
                        >
                            <RefreshCw size={17} />
                            Làm mới
                        </button>

                        {canManage && (
                            <button
                                onClick={() => setShowForm(true)}
                                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
                            >
                                <Plus size={18} />
                                Đặt bàn
                            </button>
                        )}
                    </div>
                </div>

                {message && (
                    <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                        {error}
                    </div>
                )}

                <div className="mb-5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-3 lg:flex-row">
                        <div className="relative flex-1">
                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Tìm tên hoặc số điện thoại..."
                                className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                            />
                        </div>

                        <div className="relative">
                            <CalendarDays
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                className="rounded-xl border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-emerald-500"
                            />
                        </div>

                        <select
                            value={status}
                            onChange={e => setStatus(e.target.value)}
                            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                        >
                            <option value="">Tất cả trạng thái</option>
                            {Object.entries(STATUS).map(([key, value]) => (
                                <option key={key} value={key}>
                                    {value.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Tổng đặt bàn
                                </p>
                                <p className="mt-1 text-2xl font-bold text-gray-800">
                                    {reservations.length}
                                </p>
                            </div>
                            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                                <CalendarDays size={21} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Chờ xác nhận
                                </p>
                                <p className="mt-1 text-2xl font-bold text-gray-800">
                                    {
                                        reservations.filter(
                                            x => x.status === "PENDING"
                                        ).length
                                    }
                                </p>
                            </div>
                            <div className="rounded-xl bg-yellow-50 p-3 text-yellow-600">
                                <Clock3 size={21} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Đã xác nhận
                                </p>
                                <p className="mt-1 text-2xl font-bold text-gray-800">
                                    {
                                        reservations.filter(
                                            x => x.status === "CONFIRMED"
                                        ).length
                                    }
                                </p>
                            </div>
                            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                                <CheckCircle2 size={21} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Đang phục vụ
                                </p>
                                <p className="mt-1 text-2xl font-bold text-gray-800">
                                    {
                                        reservations.filter(
                                            x => x.status === "CHECKED_IN"
                                        ).length
                                    }
                                </p>
                            </div>
                            <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
                                <UserRound size={21} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-5 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1000px] text-left">
                            <thead className="border-b bg-gray-50">
                                <tr className="text-xs font-semibold uppercase text-gray-500">
                                    <th className="px-5 py-4">Khách hàng</th>
                                    <th className="px-5 py-4">Thời gian</th>
                                    <th className="px-5 py-4">Khách</th>
                                    <th className="px-5 py-4">Bàn</th>
                                    <th className="px-5 py-4">Trạng thái</th>
                                    <th className="px-5 py-4 text-right">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="py-16 text-center text-sm text-gray-500"
                                        >
                                            Đang tải...
                                        </td>
                                    </tr>
                                ) : filteredReservations.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="py-16 text-center text-sm text-gray-500"
                                        >
                                            Không có đặt bàn.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredReservations.map(reservation => {
                                        const statusInfo =
                                            STATUS[reservation.status];
                                        const table =
                                            reservation.tables?.[0]?.table;
                                        const loadingAction =
                                            actionLoading === reservation.id;

                                        return (
                                            <tr
                                                key={reservation.id}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-5 py-4">
                                                    <p className="font-semibold text-gray-800">
                                                        {reservation.customerName}
                                                    </p>
                                                    <p className="mt-1 text-sm text-gray-500">
                                                        {reservation.customerPhone}
                                                    </p>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <p className="font-medium text-gray-700">
                                                        {formatDateTime(
                                                            reservation.reservationTime
                                                        )}
                                                    </p>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1.5 text-sm font-medium text-gray-700">
                                                        <UserRound size={14} />
                                                        {reservation.numberOfGuests}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4">
                                                    {table ? (
                                                        <span className="inline-flex items-center gap-1.5 font-medium text-gray-700">
                                                            <Table2 size={16} />
                                                            Bàn{" "}
                                                            {table.tableNumber}
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-gray-400">
                                                            Chưa gán
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusInfo?.className}`}
                                                    >
                                                        {statusInfo?.label}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() =>
                                                                setDetail(
                                                                    reservation
                                                                )
                                                            }
                                                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                                                            title="Chi tiết"
                                                        >
                                                            <Eye size={17} />
                                                        </button>

                                                        {canProcess &&
                                                            [
                                                                "PENDING",
                                                                "CONFIRMED",
                                                            ].includes(
                                                                reservation.status
                                                            ) && (
                                                                <button
                                                                    onClick={() =>
                                                                        setAssignReservation(
                                                                            reservation
                                                                        )
                                                                    }
                                                                    className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                                                                    title="Gán bàn"
                                                                >
                                                                    <Table2
                                                                        size={
                                                                            17
                                                                        }
                                                                    />
                                                                </button>
                                                            )}

                                                        {canManage &&
                                                            reservation.status ===
                                                                "CONFIRMED" && (
                                                                <button
                                                                    disabled={
                                                                        loadingAction
                                                                    }
                                                                    onClick={() =>
                                                                        handleRemind(
                                                                            reservation
                                                                        )
                                                                    }
                                                                    className="rounded-lg p-2 text-orange-600 hover:bg-orange-50 disabled:opacity-50"
                                                                    title="Gọi nhắc"
                                                                >
                                                                    <Clock3
                                                                        size={
                                                                            17
                                                                        }
                                                                    />
                                                                </button>
                                                            )}

                                                        {canProcess &&
                                                            reservation.status ===
                                                                "CONFIRMED" && (
                                                                <button
                                                                    disabled={
                                                                        loadingAction
                                                                    }
                                                                    onClick={() =>
                                                                        handleCheckIn(
                                                                            reservation
                                                                        )
                                                                    }
                                                                    className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
                                                                    title="Check-in"
                                                                >
                                                                    <CheckCircle2
                                                                        size={
                                                                            17
                                                                        }
                                                                    />
                                                                </button>
                                                            )}

                                                        {canProcess &&
                                                            reservation.status ===
                                                                "CHECKED_IN" && (
                                                                <button
                                                                    disabled={
                                                                        loadingAction
                                                                    }
                                                                    onClick={() =>
                                                                        handleComplete(
                                                                            reservation
                                                                        )
                                                                    }
                                                                    className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
                                                                    title="Hoàn thành"
                                                                >
                                                                    <CheckCircle2
                                                                        size={
                                                                            17
                                                                        }
                                                                    />
                                                                </button>
                                                            )}

                                                        {canManage &&
                                                            [
                                                                "PENDING",
                                                                "CONFIRMED",
                                                            ].includes(
                                                                reservation.status
                                                            ) && (
                                                                <button
                                                                    disabled={
                                                                        loadingAction
                                                                    }
                                                                    onClick={() =>
                                                                        handleCancel(
                                                                            reservation
                                                                        )
                                                                    }
                                                                    className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:opacity-50"
                                                                    title="Hủy"
                                                                >
                                                                    <XCircle
                                                                        size={
                                                                            17
                                                                        }
                                                                    />
                                                                </button>
                                                            )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {showForm && canManage && (
                <ReservationForm
                    onClose={() => setShowForm(false)}
                    onSubmit={handleCreate}
                    loading={actionLoading === "create"}
                />
            )}

            {assignReservation && (
                <AssignTableModal
                    reservation={assignReservation}
                    onClose={() => setAssignReservation(null)}
                    onSuccess={async () => {
                        setAssignReservation(null);
                        setMessage("Gán bàn thành công.");
                        await loadReservations();
                    }}
                />
            )}

            {detail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b px-6 py-4">
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">
                                    Chi tiết đặt bàn
                                </h2>
                                <p className="mt-1 text-sm text-gray-500">
                                    Mã đặt bàn #{detail.id}
                                </p>
                            </div>

                            <button
                                onClick={() => setDetail(null)}
                                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4 p-6">
                            <div className="rounded-xl bg-gray-50 p-4">
                                <p className="text-lg font-bold text-gray-800">
                                    {detail.customerName}
                                </p>
                                <p className="mt-1 text-sm text-gray-500">
                                    {detail.customerPhone}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="rounded-xl border p-3">
                                    <p className="text-gray-400">
                                        Thời gian
                                    </p>
                                    <p className="mt-1 font-semibold text-gray-700">
                                        {formatDateTime(
                                            detail.reservationTime
                                        )}
                                    </p>
                                </div>

                                <div className="rounded-xl border p-3">
                                    <p className="text-gray-400">
                                        Số khách
                                    </p>
                                    <p className="mt-1 font-semibold text-gray-700">
                                        {detail.numberOfGuests} khách
                                    </p>
                                </div>

                                <div className="rounded-xl border p-3">
                                    <p className="text-gray-400">Bàn</p>
                                    <p className="mt-1 font-semibold text-gray-700">
                                        {detail.tables?.[0]?.table
                                            ? `Bàn ${detail.tables[0].table.tableNumber}`
                                            : "Chưa gán"}
                                    </p>
                                </div>

                                <div className="rounded-xl border p-3">
                                    <p className="text-gray-400">Trạng thái</p>
                                    <span
                                        className={`mt-1 inline-block rounded-full px-3 py-1.5 text-xs font-semibold ${
                                            STATUS[detail.status]?.className
                                        }`}
                                    >
                                        {STATUS[detail.status]?.label}
                                    </span>
                                </div>
                            </div>

                            {detail.note && (
                                <div className="rounded-xl border p-4">
                                    <p className="text-sm text-gray-400">
                                        Ghi chú
                                    </p>
                                    <p className="mt-1 text-sm text-gray-700">
                                        {detail.note}
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={() => setDetail(null)}
                                className="w-full rounded-xl bg-gray-100 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-200"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}