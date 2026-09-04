import {
    Pencil,
    Trash2,
    QrCode,
} from "lucide-react";

import { useState } from "react";

import tableService from "../../../services/table.service";
import TableQRModal from "../../cashier/Tables/components/TableQRModal";

export default function FloorCard({
    floor,
    onEdit,
    onDelete,
    onEditTable,
    reload,
}) {

    const [qrTable, setQrTable] = useState(null);

    // ========================================
    // DELETE TABLE
    // ========================================

    const handleDeleteTable = async (table) => {

        if (
            !window.confirm(
                `Xóa bàn ${table.tableNumber}?`
            )
        ) {
            return;
        }

        try {

            await tableService.remove(table.id);

            await reload();

        } catch (err) {

            alert(
                err.response?.data?.message ||
                err.message
            );

        }

    };

    return (

        <>

            <div className="mb-8 rounded-xl bg-white p-3 shadow">

                {/* HEADER */}

                <div className="mb-5 flex items-center justify-between">

                    <h3 className="text-xl font-bold">
                        {floor.name}
                    </h3>

                    <div className="flex gap-2">

                        <button
                            onClick={onEdit}
                            className="rounded-lg p-2 hover:bg-gray-100"
                        >
                            <Pencil size={18} />
                        </button>

                        <button
                            onClick={onDelete}
                            className="rounded-lg p-2 text-red-600 hover:bg-red-100"
                        >
                            <Trash2 size={18} />
                        </button>

                    </div>

                </div>

                {/* TABLES */}

                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-6">

                        {[...(floor.tables || [])]
                            .sort((a, b) => Number(a.tableNumber) - Number(b.tableNumber))
                            .map(table => (                   

                        <div
                            key={table.id}
                            className="rounded-xl border bg-gray-50 p-4"
                        >

                            <div className="text-center">

                                <p className="mt-1 text-sm font-semibold">
                                    Bàn {table.tableNumber}
                                </p>

                                <p className="mt-1 text-xs text-gray-500">
                                    {table.capacity || 4} người
                                </p>

                            </div>

                            <div className="mt-4 flex justify-center gap-2">

                                {/* QR */}

                                <button
                                    onClick={() =>
                                        setQrTable(table)
                                    }
                                    title="Xem QR"
                                    className="rounded-lg bg-blue-100 p-2 text-blue-600 hover:bg-blue-200"
                                >
                                    <QrCode size={18} />
                                </button>

                                {/* EDIT */}

                                <button
                                    onClick={() =>
                                        onEditTable(table)
                                    }
                                    title="Chỉnh sửa"
                                    className="rounded-lg bg-yellow-100 p-2 text-yellow-700 hover:bg-yellow-200"
                                >
                                    <Pencil size={18} />
                                </button>

                                {/* DELETE */}

                                <button
                                    onClick={() =>
                                        handleDeleteTable(table)
                                    }
                                    title="Xóa"
                                    className="rounded-lg bg-red-100 p-2 text-red-600 hover:bg-red-200"
                                >
                                    <Trash2 size={18} />
                                </button>

                            </div>

                        </div>

                    ))}

                    {floor.tables?.length === 0 && (

                        <div className="col-span-full py-10 text-center text-gray-400">
                            Chưa có bàn nào
                        </div>

                    )}

                </div>

            </div>

            {/* QR MODAL */}

            <TableQRModal
                open={!!qrTable}
                table={qrTable}
                onClose={() => setQrTable(null)}
            />

        </>

    );

}