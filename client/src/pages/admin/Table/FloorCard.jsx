import {
    Pencil,
    Trash2,
    QrCode,
} from "lucide-react";

import tableService from "../../../services/table.service";

export default function FloorCard({
    floor,
    onEdit,
    onDelete,
    onEditTable,
    reload,
}) {

     
    // DELETE TABLE
     

    const handleDeleteTable = async (table) => {

        if (
            !window.confirm(
                `Xóa ${table.name}?`
            )
        ) {
            return;
        }

        try {

            await tableService.remove(table.id);

            reload();

        } catch (err) {

            alert(
                err.response?.data?.message ||
                err.message
            );

        }

    };

     
    // QR
     

    const openQR = (table) => {

        window.open(
            `/scan/${table.qrCode}`,
            "_blank"
        );

    };

    return (

        <div className="mb-8 rounded-xl bg-white p-6 shadow">

            {/* Header */}

            <div className="mb-5 flex items-center justify-between">

                <h3 className="text-xl font-bold">

                    {floor.name}

                </h3>

                <div className="flex gap-2">

                    <button
                        onClick={onEdit}
                        className="rounded-lg p-2 hover:bg-gray-100"
                    >
                        <Pencil size={18}/>
                    </button>

                    <button
                        onClick={onDelete}
                        className="rounded-lg p-2 hover:bg-red-100 text-red-600"
                    >
                        <Trash2 size={18}/>
                    </button>

                </div>

            </div>

            {/* Tables */}

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-6">

                {floor.tables?.map(table=>(

                    <div
                        key={table.id}
                        className="rounded-xl border bg-gray-50 p-4"
                    >

                        <div className="text-center">

                            <p className="mt-1 text-xs text-gray-500">

                                Bàn {table.tableNumber}

                            </p>

                        </div>

                        <div className="mt-4 flex justify-center gap-2">

                            <button
                                onClick={()=>openQR(table)}
                                className="rounded-lg bg-blue-100 p-2 text-blue-600 hover:bg-blue-200"
                            >
                                <QrCode size={18}/>
                            </button>

                            <button
                            onClick={() => onEditTable(table)}
                                className="rounded-lg bg-yellow-100 p-2 text-yellow-700 hover:bg-yellow-200"
                            >
                                <Pencil size={18}/>
                            </button>

                            <button
                                onClick={()=>handleDeleteTable(table)}
                                className="rounded-lg bg-red-100 p-2 text-red-600 hover:bg-red-200"
                            >
                                <Trash2 size={18}/>
                            </button>

                        </div>

                    </div>

                ))}

                {floor.tables?.length===0&&(

                    <div className="col-span-full py-10 text-center text-gray-400">

                        Chưa có bàn nào

                    </div>

                )}

            </div>

        </div>

    );

}