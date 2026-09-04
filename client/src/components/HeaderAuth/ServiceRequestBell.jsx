import { useEffect, useState } from "react";
import { BellRing, Check, Clock, X } from "lucide-react";

import serviceRequestService from "../../services/serviceRequest.service";

export default function ServiceRequestBell() {
    const [requests, setRequests] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const loadRequests = async () => {
        try {
            const res = await serviceRequestService.getAll();

            const data = Array.isArray(res?.data?.data)
                ? res.data.data
                : Array.isArray(res?.data)
                    ? res.data
                    : [];

            setRequests(data);
        } catch (error) {
            console.error(
                "LOAD SERVICE REQUEST ERROR:",
                error.response?.data || error
            );
        }
    };

    useEffect(() => {
        loadRequests();

        const interval = setInterval(loadRequests, 5000);

        return () => clearInterval(interval);
    }, []);

    const handleAction = async (id, action) => {
        try {
            setLoading(true);

            if (action === "accept") {
                await serviceRequestService.accept(id);
            } else {
                await serviceRequestService.complete(id);
            }

            await loadRequests();
        } catch (error) {
            alert(
                error.response?.data?.message ||
                error.message ||
                "Không thể xử lý yêu cầu."
            );
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        const value = new Date(date);

        return date && !Number.isNaN(value.getTime())
            ? value.toLocaleString("vi-VN")
            : "--";
    };

    const pendingCount = requests.filter(
        (request) => request.status === "PENDING"
    ).length;

    return (
        <div className="relative">
            {/* BELL */}
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100"
                title="Yêu cầu của khách"
            >
                <BellRing size={21} />

                {pendingCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white">
                        {pendingCount > 99 ? "99+" : pendingCount}
                    </span>
                )}
            </button>

            {/* DROPDOWN */}
            {open && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setOpen(false)}
                    />

                    <div className="absolute right-0 top-12 z-50 w-[380px] overflow-hidden rounded-2xl border bg-white shadow-2xl">
                        {/* HEADER */}
                        <div className="flex items-center justify-between border-b px-4 py-3">
                            <div>
                                <h3 className="font-bold text-gray-800">
                                    Yêu cầu khách hàng
                                </h3>

                                <p className="text-xs text-gray-500">
                                    {pendingCount > 0
                                        ? `${pendingCount} yêu cầu đang chờ`
                                        : "Không có yêu cầu mới"}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="rounded-lg p-2 hover:bg-gray-100"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* CONTENT */}
                        <div className="max-h-[500px] overflow-y-auto">
                            {requests.length === 0 ? (
                                <div className="px-5 py-10 text-center text-gray-400">
                                    <BellRing
                                        size={32}
                                        className="mx-auto mb-3"
                                    />

                                    <p>Chưa có yêu cầu nào</p>
                                </div>
                            ) : (
                                requests.map((request) => {
                                    const isPending =
                                        request.status === "PENDING";

                                    const isAccepted =
                                        request.status === "ACCEPTED";

                                    return (
                                        <div
                                            key={request.id}
                                            className="border-b p-4 last:border-b-0"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="font-bold text-gray-800">
                                                        Bàn{" "}
                                                        {request.table?.tableNumber || "--"}
                                                    </p>

                                                    <p className="mt-1 text-sm text-gray-700">
                                                        {request.message}
                                                    </p>
                                                </div>

                                                <span
                                                    className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${
                                                        isPending
                                                            ? "bg-orange-100 text-orange-600"
                                                            : isAccepted
                                                                ? "bg-blue-100 text-blue-600"
                                                                : "bg-green-100 text-green-600"
                                                    }`}
                                                >
                                                    {isPending
                                                        ? "Chờ xử lý"
                                                        : isAccepted
                                                            ? "Đã nhận"
                                                            : "Hoàn thành"}
                                                </span>
                                            </div>

                                            <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                                                <Clock size={13} />
                                                {formatDate(request.createdAt)}
                                            </div>

                                            {request.customer?.name && (
                                                <p className="mt-1 text-xs text-gray-500">
                                                    Khách: {request.customer.name}
                                                </p>
                                            )}

                                            {request.status !== "COMPLETED" && (
                                                <button
                                                    type="button"
                                                    disabled={loading}
                                                    onClick={() =>
                                                        handleAction(
                                                            request.id,
                                                            isPending
                                                                ? "accept"
                                                                : "complete"
                                                        )
                                                    }
                                                    className={`mt-3 flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold text-white disabled:opacity-50 ${
                                                        isPending
                                                            ? "bg-green-600 hover:bg-green-700"
                                                            : "bg-blue-600 hover:bg-blue-700"
                                                    }`}
                                                >
                                                    <Check size={16} />
                                                    {isPending
                                                        ? "Xác nhận yêu cầu"
                                                        : "Hoàn thành"}
                                                </button>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}