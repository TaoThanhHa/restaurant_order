import { useEffect, useState } from "react";
import {
    BellRing,
    Check,
    Clock,
    X,
} from "lucide-react";

import serviceRequestService
    from "../../services/serviceRequest.service";

export default function ServiceRequestBell() {

    const [requests, setRequests] =
        useState([]);

    const [open, setOpen] =
        useState(false);

    const [loading, setLoading] =
        useState(false);

    // ========================================
    // LOAD YÊU CẦU
    // ========================================

    const loadRequests = async () => {

        try {

            const res =
                await serviceRequestService.getAll();

            const data =
                res?.data || [];

            setRequests(data);

        } catch (error) {

            console.error(
                "LOAD SERVICE REQUEST ERROR:",
                error.response?.data ||
                error
            );

        }

    };

    // ========================================
    // LOAD + POLLING
    // ========================================

    useEffect(() => {

        loadRequests();

        const interval =
            setInterval(() => {

                loadRequests();

            }, 5000);

        return () =>
            clearInterval(interval);

    }, []);

    // ========================================
    // XÁC NHẬN
    // ========================================

    const handleAccept = async (id) => {

        try {

            setLoading(true);

            await serviceRequestService.accept(id);

            await loadRequests();

        } catch (error) {

            alert(
                error.response?.data?.message ||
                error.message ||
                "Không thể xác nhận yêu cầu."
            );

        } finally {

            setLoading(false);

        }

    };

    // ========================================
    // HOÀN THÀNH
    // ========================================

    const handleComplete = async (id) => {

        try {

            setLoading(true);

            await serviceRequestService.complete(id);

            await loadRequests();

        } catch (error) {

            alert(
                error.response?.data?.message ||
                error.message ||
                "Không thể hoàn thành yêu cầu."
            );

        } finally {

            setLoading(false);

        }

    };

    // ========================================
    // SỐ YÊU CẦU ĐANG CHỜ
    // ========================================

    const pendingCount =
        requests.filter(
            request =>
                request.status === "PENDING"
        ).length;

    return (

        <div className="relative">

            {/* ================================= */}
            {/* BELL */}
            {/* ================================= */}

            <button
                type="button"
                onClick={() =>
                    setOpen(prev => !prev)
                }
                className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100"
                title="Yêu cầu của khách"
            >

                <BellRing size={21} />

                {/* BADGE */}

                {pendingCount > 0 && (

                    <span
                        className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white"
                    >
                        {pendingCount > 99
                            ? "99+"
                            : pendingCount}
                    </span>

                )}

            </button>


            {/* ================================= */}
            {/* DROPDOWN */}
            {/* ================================= */}

            {open && (

                <>

                    {/* OVERLAY */}

                    <div
                        className="fixed inset-0 z-40"
                        onClick={() =>
                            setOpen(false)
                        }
                    />

                    <div
                        className="absolute right-0 top-12 z-50 w-[380px] overflow-hidden rounded-2xl border bg-white shadow-2xl"
                    >

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
                                onClick={() =>
                                    setOpen(false)
                                }
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

                                    <p>
                                        Chưa có yêu cầu nào
                                    </p>

                                </div>

                            ) : (

                                requests.map(request => (

                                    <div
                                        key={request.id}
                                        className="border-b p-4 last:border-b-0"
                                    >

                                        {/* TOP */}

                                        <div className="flex items-start justify-between gap-3">

                                            <div>

                                                <p className="font-bold text-gray-800">

                                                    Bàn{" "}
                                                    {request.table?.tableNumber}

                                                </p>

                                                <p className="mt-1 text-sm text-gray-700">

                                                    {request.message}

                                                </p>

                                            </div>


                                            {/* STATUS */}

                                            {request.status === "PENDING" ? (

                                                <span className="shrink-0 rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-600">

                                                    Chờ xử lý

                                                </span>

                                            ) : (

                                                <span className="shrink-0 rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-600">

                                                    Đã nhận

                                                </span>

                                            )}

                                        </div>


                                        {/* TIME */}

                                        <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">

                                            <Clock size={13} />

                                            {new Date(
                                                request.createdAt
                                            ).toLocaleString(
                                                "vi-VN"
                                            )}

                                        </div>


                                        {/* CUSTOMER */}

                                        {request.customer?.name && (

                                            <p className="mt-1 text-xs text-gray-500">

                                                Khách:{" "}
                                                {request.customer.name}

                                            </p>

                                        )}


                                        {/* ACTION */}

                                        <div className="mt-3">

                                            {request.status === "PENDING" ? (

                                                <button
                                                    type="button"
                                                    disabled={loading}
                                                    onClick={() =>
                                                        handleAccept(
                                                            request.id
                                                        )
                                                    }
                                                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                                                >

                                                    <Check size={16} />

                                                    Xác nhận yêu cầu

                                                </button>

                                            ) : (

                                                <button
                                                    type="button"
                                                    disabled={loading}
                                                    onClick={() =>
                                                        handleComplete(
                                                            request.id
                                                        )
                                                    }
                                                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                                                >

                                                    <Check size={16} />

                                                    Hoàn thành

                                                </button>

                                            )}

                                        </div>

                                    </div>

                                ))

                            )}

                        </div>

                    </div>

                </>

            )}

        </div>

    );

}