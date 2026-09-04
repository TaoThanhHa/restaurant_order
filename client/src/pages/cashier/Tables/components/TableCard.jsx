import { useState } from "react";
import "./TableCard.css";
import TableQRModal from "./TableQRModal";

const statusConfig = {
    AVAILABLE: {
        color: "bg-gray-100",
        text: "Trống",
    },

    OCCUPIED: {
        color: "bg-green-100",
        text: "Đang phục vụ",
    },

    RESERVED: {
        color: "bg-bluelight-100",
        text: "Đã đặt",
    },

    DISABLED: {
        color: "bg-gray-200",
        text: "Ngưng sử dụng",
    },
};

const STATUS = {
    PENDING: {
        text: "Chờ xác nhận",
        color: "#EAB308",
    },

    CONFIRMED: {
        text: "Đã xác nhận",
        color: "#3B82F6",
    },

    PREPARING: {
        text: "Đang chế biến",
        color: "#F97316",
    },

    SERVED: {
        text: "Đã phục vụ",
        color: "#22C55E",
    },

    COMPLETED: {
        text: "Hoàn thành",
        color: "#6B7280",
    },

    CANCELLED: {
        text: "Đã hủy",
        color: "#EF4444",
    },
};

export default function TableCard({
    table,
    onClick,
}) {

    const [qrTable, setQrTable] =
        useState(null);

    const status =
        statusConfig[table.status] ||
        statusConfig.AVAILABLE;

    const orders =
        table.orders || [];

    // ========================================
    // OPEN QR
    // ========================================

    const handleShowQR = (e) => {

        e.stopPropagation();

        setQrTable(table);

    };

    return (

        <>
            {/* CARD */}

            <div
                onClick={onClick}
                className={`
                    ${status.color}
                    flex
                    rounded-xl
                    p-5
                    shadow
                    hover:shadow-lg
                    transition
                    mx-auto
                    w-70
                    h-40
                    cursor-pointer
                `}
            >

                <div>

                    {/* QR BUTTON */}

                    <button
                        type="button"
                        className="
                            mb-3
                            w-25
                            rounded-lg
                            bg-white
                            px-3
                            py-2
                            text-sm
                            shadow
                        "
                        onClick={handleShowQR}
                    >
                        Xem mã QR
                    </button>

                    <h2 className="text-xl font-bold">

                        {table.tableNumber}

                    </h2>

                    <p className="mt-2 font-medium">

                        {status.text}

                    </p>

                </div>

                {/* ORDERS */}

                {orders.length > 0 && (

                    <div className="
                        pl-3
                        flex-1
                        overflow-y-auto
                        no-scrollbar
                        space-y-2
                    ">

                        {orders.map(order => {

                            const statusInfo =
                                STATUS[order.status];

                            return (

                                <div
                                    key={order.id}
                                    className="
                                        rounded-md
                                        bg-white
                                        p-2
                                        text-left
                                        shadow-sm
                                    "
                                >

                                    <div className="text-sm font-semibold">

                                        🧾 Đơn #{order.id}

                                    </div>

                                    <span
                                        className="
                                            mt-1
                                            inline-block
                                            rounded-full
                                            px-2
                                            py-1
                                            text-xs
                                            font-semibold
                                        "
                                        style={{
                                            backgroundColor:
                                                statusInfo?.color,
                                        }}
                                    >

                                        {statusInfo?.text}

                                    </span>

                                </div>

                            );

                        })}

                    </div>

                )}

            </div>

            {/* QR MODAL ĐẶT NGOÀI CARD */}

            <TableQRModal
                open={!!qrTable}
                table={qrTable}
                onClose={() => {
                    setQrTable(null);
                }}
            />

        </>

    );

}