import { useEffect, useState } from "react";
import { X } from "lucide-react";

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
        capacity: 4,
    };

    const [form, setForm] = useState(emptyForm);

    // ========================================
    // LOAD FORM
    // ========================================

    useEffect(() => {

        if (!open) return;

        if (table) {

            setForm({
                tableNumber: table.tableNumber,
                floorId: table.floorId,
                capacity: table.capacity || 4,
            });

        } else {

            setForm({
                tableNumber: "",
                floorId: floors[0]?.id ?? "",
                capacity: 4,
            });

        }

    }, [open, table, floors]);

    // ========================================
    // CHANGE
    // ========================================

    const handleChange = (e) => {

        const { name, value } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: value,
        }));

    };

    // ========================================
    // SAVE
    // ========================================

    const handleSubmit = async () => {

        if (!form.tableNumber) {

            alert("Nhập số bàn.");

            return;

        }

        if (!form.floorId) {

            alert("Vui lòng chọn tầng.");

            return;

        }

        if (
            !form.capacity ||
            Number(form.capacity) < 1
        ) {

            alert("Số người trong bàn không hợp lệ.");

            return;

        }

        try {

            const data = {
                tableNumber: Number(
                    form.tableNumber
                ),

                floorId: Number(
                    form.floorId
                ),

                capacity: Number(
                    form.capacity
                ),
            };

            if (table) {

                await tableService.update(
                    table.id,
                    data
                );

            } else {

                await tableService.create(data);

            }

            await reload();

            onClose();

        } catch (err) {

            alert(
                err.response?.data?.message ||
                err.message
            );

        }

    };

    if (!open) return null;

    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

            <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">

                {/* HEADER */}

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
                        <X size={20} />
                    </button>

                </div>

                {/* BODY */}

                <div className="space-y-5 p-6">

                    {/* TẦNG */}

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

                    {/* SỐ BÀN */}

                    <div>

                        <label className="mb-2 block font-semibold">
                            Số bàn
                        </label>

                        <input
                            type="number"
                            min="1"
                            name="tableNumber"
                            value={form.tableNumber}
                            onChange={handleChange}
                            className="w-full rounded-lg border p-3"
                            placeholder="Ví dụ: 1"
                        />

                    </div>

                    {/* SỐ NGƯỜI */}

                    <div>

                        <label className="mb-2 block font-semibold">
                            Số người tối đa
                        </label>

                        <input
                            type="number"
                            min="1"
                            name="capacity"
                            value={form.capacity}
                            onChange={handleChange}
                            className="w-full rounded-lg border p-3"
                            placeholder="Ví dụ: 4"
                        />

                        <p className="mt-1 text-xs text-gray-500">
                            Số lượng khách tối đa mà bàn có thể phục vụ.
                        </p>

                    </div>

                </div>

                {/* FOOTER */}

                <div className="flex justify-end gap-3 border-t p-5">

                    <Button
                        className="bg-gray-300 text-black"
                        onClick={onClose}
                    >
                        Hủy
                    </Button>

                    <Button onClick={handleSubmit}>

                        {table
                            ? "Lưu"
                            : "Thêm bàn"}

                    </Button>

                </div>

            </div>

        </div>

    );

}