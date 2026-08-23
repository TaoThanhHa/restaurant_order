import { useEffect, useState } from "react";
import {
    Bell,
    Clock,
    Eye,
    X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import orderService from "../../services/order.service";

export default function OrderNotificationBell() {

    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [open, setOpen] = useState(false);

    // =================================================
    // LOAD ĐƠN CHỜ XÁC NHẬN
    // =================================================

    const loadOrders = async () => {

        try {

            const res =
                await orderService.getPendingOrders();

            console.log(
                "PENDING ORDER RESPONSE:",
                res
            );

            const responseData =
                res?.data;

            let data = [];

            // Backend:
            // {
            //     success: true,
            //     data: [...]
            // }

            if (
                responseData &&
                Array.isArray(
                    responseData.data
                )
            ) {

                data =
                    responseData.data;

            } else if (
                Array.isArray(
                    responseData
                )
            ) {

                data =
                    responseData;

            }

            console.log(
                "PENDING ORDER DATA:",
                data
            );

            // Backend đã lọc PENDING
            // FE lọc thêm cho an toàn

            const pendingOrders =
                data.filter(
                    order =>
                        order?.status ===
                        "PENDING"
                );

            setOrders(
                pendingOrders
            );

        } catch (error) {

            console.error(
                "LOAD ORDER NOTIFICATION ERROR:",
                error.response?.data ||
                error
            );

        }

    };

    // =================================================
    // POLLING
    // =================================================

    useEffect(() => {

        loadOrders();

        const interval =
            setInterval(
                loadOrders,
                3000
            );

        return () => {

            clearInterval(
                interval
            );

        };

    }, []);

    // =================================================
    // XEM ĐƠN
    // =================================================

    const handleViewOrder = (
        order
    ) => {

        // Đóng notification

        setOpen(false);

        // ---------------------------------------------
        // Nếu đơn tại bàn
        // ---------------------------------------------

        const tableId =
            order?.session?.table?.id;

        if (tableId) {

            navigate(
                `/cashier/tables/${tableId}`
            );

            return;

        }

        // ---------------------------------------------
        // Nếu là đơn mang về
        // ---------------------------------------------

        navigate(
            `/cashier/order-history`
        );

    };

    // =================================================
    // SỐ ĐƠN
    // =================================================

    const pendingCount =
        orders.length;

    // =================================================
    // FORMAT TIME
    // =================================================

    const formatDate = (
        date
    ) => {

        if (!date) {
            return "--";
        }

        const value =
            new Date(date);

        if (
            Number.isNaN(
                value.getTime()
            )
        ) {
            return "--";
        }

        return value.toLocaleString(
            "vi-VN"
        );

    };

    // =================================================
    // RENDER
    // =================================================

    return (

        <div className="relative">

            {/* ================================================= */}
            {/* BELL */}
            {/* ================================================= */}

            <button
                type="button"
                onClick={() =>
                    setOpen(
                        prev => !prev
                    )
                }
                className="
                    relative
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    hover:bg-gray-100
                "
                title="Đơn hàng mới"
            >

                <Bell size={21} />

                {pendingCount > 0 && (

                    <span
                        className="
                            absolute
                            -right-1
                            -top-1
                            flex
                            h-5
                            min-w-5
                            items-center
                            justify-center
                            rounded-full
                            bg-red-600
                            px-1
                            text-[11px]
                            font-bold
                            text-white
                        "
                    >

                        {pendingCount > 99
                            ? "99+"
                            : pendingCount
                        }

                    </span>

                )}

            </button>


            {/* ================================================= */}
            {/* DROPDOWN */}
            {/* ================================================= */}

            {open && (

                <>

                    {/* OVERLAY */}

                    <div
                        className="
                            fixed
                            inset-0
                            z-40
                        "
                        onClick={() =>
                            setOpen(false)
                        }
                    />


                    {/* PANEL */}

                    <div
                        className="
                            absolute
                            right-0
                            top-12
                            z-50
                            w-[400px]
                            overflow-hidden
                            rounded-2xl
                            border
                            bg-white
                            shadow-2xl
                        "
                    >

                        {/* ================================================= */}
                        {/* HEADER */}
                        {/* ================================================= */}

                        <div
                            className="
                                flex
                                items-center
                                justify-between
                                border-b
                                px-4
                                py-3
                            "
                        >

                            <div>

                                <h3
                                    className="
                                        font-bold
                                        text-gray-800
                                    "
                                >
                                    Đơn hàng mới
                                </h3>

                                <p
                                    className="
                                        text-xs
                                        text-gray-500
                                    "
                                >

                                    {pendingCount > 0
                                        ? `${pendingCount} đơn đang chờ xác nhận`
                                        : "Không có đơn mới"
                                    }

                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={() =>
                                    setOpen(false)
                                }
                                className="
                                    rounded-lg
                                    p-2
                                    hover:bg-gray-100
                                "
                            >

                                <X size={18} />

                            </button>

                        </div>


                        {/* ================================================= */}
                        {/* CONTENT */}
                        {/* ================================================= */}

                        <div
                            className="
                                max-h-[500px]
                                overflow-y-auto
                            "
                        >

                            {/* KHÔNG CÓ ĐƠN */}

                            {orders.length === 0 ? (

                                <div
                                    className="
                                        px-5
                                        py-10
                                        text-center
                                        text-gray-400
                                    "
                                >

                                    <Bell
                                        size={32}
                                        className="
                                            mx-auto
                                            mb-3
                                        "
                                    />

                                    <p>
                                        Chưa có đơn mới
                                    </p>

                                </div>

                            ) : (

                                orders.map(
                                    order => {

                                        const table =
                                            order?.session?.table;

                                        const itemCount =
                                            Array.isArray(
                                                order?.orderItems
                                            )
                                                ? order.orderItems.length
                                                : 0;

                                        return (

                                            <div
                                                key={
                                                    order.id
                                                }
                                                className="
                                                    border-b
                                                    p-4
                                                    last:border-b-0
                                                "
                                            >

                                                {/* ================================================= */}
                                                {/* TOP */}
                                                {/* ================================================= */}

                                                <div
                                                    className="
                                                        flex
                                                        items-start
                                                        justify-between
                                                        gap-3
                                                    "
                                                >

                                                    <div>

                                                        {/* MÃ ĐƠN */}

                                                        <p
                                                            className="
                                                                font-bold
                                                                text-gray-800
                                                            "
                                                        >

                                                            {order.orderCode ||
                                                                `Đơn #${order.id}`
                                                            }

                                                        </p>


                                                        {/* BÀN */}

                                                        <p
                                                            className="
                                                                mt-1
                                                                text-sm
                                                                font-semibold
                                                                text-gray-700
                                                            "
                                                        >

                                                            {table?.tableNumber
                                                                ? `Bàn ${table.tableNumber}`
                                                                : "Mang về"
                                                            }

                                                        </p>

                                                    </div>


                                                    {/* STATUS */}

                                                    <span
                                                        className="
                                                            shrink-0
                                                            rounded-full
                                                            bg-orange-100
                                                            px-2
                                                            py-1
                                                            text-xs
                                                            font-semibold
                                                            text-orange-600
                                                        "
                                                    >
                                                        Chờ xác nhận
                                                    </span>

                                                </div>


                                                {/* ================================================= */}
                                                {/* SỐ MÓN */}
                                                {/* ================================================= */}

                                                <div
                                                    className="
                                                        mt-3
                                                        flex
                                                        items-center
                                                        gap-2
                                                    "
                                                >

                                                    <span
                                                        className="
                                                            rounded-lg
                                                            bg-gray-100
                                                            px-3
                                                            py-1.5
                                                            text-sm
                                                            font-medium
                                                            text-gray-700
                                                        "
                                                    >

                                                        {itemCount} món

                                                    </span>

                                                </div>


                                                {/* ================================================= */}
                                                {/* TIME */}
                                                {/* ================================================= */}

                                                <div
                                                    className="
                                                        mt-2
                                                        flex
                                                        items-center
                                                        gap-1
                                                        text-xs
                                                        text-gray-400
                                                    "
                                                >

                                                    <Clock
                                                        size={13}
                                                    />

                                                    {formatDate(
                                                        order.createdAt
                                                    )}

                                                </div>


                                                {/* ================================================= */}
                                                {/* XEM ĐƠN */}
                                                {/* ================================================= */}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleViewOrder(
                                                            order
                                                        )
                                                    }
                                                    className="
                                                        mt-3
                                                        flex
                                                        w-full
                                                        items-center
                                                        justify-center
                                                        gap-2
                                                        rounded-lg
                                                        bg-green-600
                                                        py-2
                                                        text-sm
                                                        font-semibold
                                                        text-white
                                                        hover:bg-green-700
                                                    "
                                                >

                                                    <Eye
                                                        size={16}
                                                    />

                                                    Xem đơn

                                                </button>

                                            </div>

                                        );

                                    }
                                )

                            )}

                        </div>

                    </div>

                </>

            )}

        </div>

    );

}