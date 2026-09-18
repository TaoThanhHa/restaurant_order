import { useState } from "react";
import { ArrowRightLeft, Merge } from "lucide-react";
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
        color: "bg-blue-100",
        text: "Đã đặt",
    },
    DISABLED: {
        color: "bg-gray-200",
        text: "Ngưng sử dụng",
    },
};

export default function TableCard({
    table,
    onClick,
    onMerge,
    onTransfer,
}) {
    const [qrTable, setQrTable] = useState(null);

    const status =
        statusConfig[table.status] || statusConfig.AVAILABLE;

    const isOccupied = table.status === "OCCUPIED";

    const handleShowQR = e => {
        e.stopPropagation();
        setQrTable(table);
    };

    return (
        <>
            <div
                onClick={onClick}
                className={`${status.color} mx-auto flex h-40 w-70 cursor-pointer rounded-xl p-5 shadow transition hover:shadow-lg`}
            >
                <div className="flex min-w-30 flex-col">
                    <button
                        type="button"
                        className="mb-3 w-30 rounded-lg bg-white px-3 py-2 text-sm shadow"
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

                {isOccupied && (
                    <div className="m-2 gap-1">
                        <button
                            type="button"
                            title="Đổi bàn"
                            className="mb-2 flex items-center gap-1 rounded-lg bg-white p-2 shadow hover:bg-gray-50"
                            onClick={e => {
                                e.stopPropagation();
                                onTransfer?.(table);
                            }}
                        >
                            <ArrowRightLeft size={16} />
                            Đổi bàn
                        </button>

                        <button
                            type="button"
                            title="Gộp bàn"
                            className="flex items-center gap-1 rounded-lg bg-white p-2 shadow hover:bg-gray-50"
                            onClick={e => {
                                e.stopPropagation();
                                onMerge?.(table);
                            }}
                        >
                            <Merge size={16} />
                            Gộp bàn
                        </button>
                    </div>
                )}
            </div>

            <TableQRModal
                open={!!qrTable}
                table={qrTable}
                onClose={() => setQrTable(null)}
            />
        </>
    );
}