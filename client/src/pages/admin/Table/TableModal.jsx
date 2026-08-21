import { useEffect, useState } from "react";
import { X, RefreshCw } from "lucide-react";

import Button from "../../../components/Button/Button";

import tableService from "../../../services/table.service";

export default function TableModal({
    open,
    floors,
    table = null,
    onClose,
    reload,
}) {

    const emptyForm = {
        tableNumber: "",
        floorId: "",
        qrCode: "",
    };

    const [form, setForm] = useState(emptyForm);

    useEffect(() => {

        if (!open) return;

        if (table) {

            setForm({
                tableNumber: table.tableNumber,
                floorId: table.floorId,
                qrCode: table.qrCode,
            });

        } else {

            setForm({
                tableNumber: "",
                floorId: floors[0]?.id ?? "",
                qrCode: generateQR(),
            });

        }

    }, [open, table, floors]);

    if (!open) return null;

       

    function generateQR() {

        return (
            "QR-" +
            Date.now().toString(36).toUpperCase()
        );

    }

       

    const handleChange = (e) => {

        const { name, value } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: value,
        }));

    };

       

    const handleSubmit = async () => {

        if (!form.tableNumber.trim()) {

            alert("Nhập số bàn.");

            return;

        }

        try {

            if (table) {

                await tableService.update(
                    table.id,
                    form
                );

            } else {

                await tableService.create(form);

            }

            reload();

            onClose();

        } catch (err) {

            alert(
                err.response?.data?.message ||
                err.message
            );

        }

    };

       

    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

            <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">

                {/* Header */}

                <div className="flex items-center justify-between border-b p-5">

                    <h2 className="text-xl font-bold">

                        {table
                            ? "Chỉnh sửa bàn"
                            : "Thêm bàn"}

                    </h2>

                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 hover:bg-gray-100"
                    >
                        <X size={20}/>
                    </button>

                </div>

                {/* Body */}

                <div className="space-y-5 p-6">

                    <div>

                        <label className="mb-2 block font-semibold">

                            Tầng

                        </label>

                        <select
                            name="floorId"
                            value={form.floorId}
                            onChange={handleChange}
                            className="w-full rounded-lg border p-3"
                        >

                            {floors.map(floor => (

                                <option
                                    key={floor.id}
                                    value={floor.id}
                                >
                                    {floor.name}
                                </option>

                            ))}

                        </select>

                    </div>

                    <div>

                        <label className="mb-2 block font-semibold">

                            Tên bàn

                        </label>

                        <input
                            type="number"
                            name="tableNumber"
                            value={form.tableNumber}
                            onChange={handleChange}
                            className="w-full rounded-lg border p-3"
                            placeholder="Ví dụ: Bàn 1"
                        />

                    </div>

                    <div>

                        <label className="mb-2 block font-semibold">

                            QR Code

                        </label>

                        <div className="flex gap-2">

                            <input
                                readOnly
                                value={form.qrCode}
                                className="flex-1 rounded-lg border bg-gray-100 p-3"
                            />

                            <button
                                onClick={() =>
                                    setForm(prev => ({
                                        ...prev,
                                        qrCode:
                                            generateQR(),
                                    }))
                                }
                                className="rounded-lg border p-3 hover:bg-gray-100"
                            >
                                <RefreshCw
                                    size={18}
                                />
                            </button>

                        </div>

                    </div>

                </div>

                {/* Footer */}

                <div className="flex justify-end gap-3 border-t p-5">

                    <Button
                        className="bg-gray-300 text-black"
                        onClick={onClose}
                    >
                        Hủy
                    </Button>

                    <Button
                        onClick={handleSubmit}
                    >
                        {table
                            ? "Lưu"
                            : "Thêm bàn"}
                    </Button>

                </div>

            </div>

        </div>

    );

}