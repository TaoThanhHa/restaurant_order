import { useEffect, useState } from "react";
import { X } from "lucide-react";

import Button from "../../../components/Button/Button";

export default function FloorModal({
    open,
    floor,
    onClose,
    onSave,
}) {

    const [floorNumber, setName] = useState("");

    useEffect(() => {

        if (!open) return;

        setName(
            floor?.floorNumber || ""
        );

    }, [open, floor]);

    if (!open) return null;

      
    // SAVE
      

    const handleSubmit = () => {

        if (!floorNumber) {
            alert("Nhập số tầng.");
            return;
        }

        onSave({
            floorNumber: Number(floorNumber),
        });

    };

    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

            <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">

                {/* Header */}

                <div className="flex items-center justify-between border-b p-5">

                    <h2 className="text-xl font-bold">

                        {floor
                            ? "Chỉnh sửa tầng"
                            : "Thêm tầng"}

                    </h2>

                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 hover:bg-gray-100"
                    >
                        <X size={20}/>
                    </button>

                </div>

                {/* Body */}

                <div className="space-y-5 p-5">

                    <div>

                        <label className="mb-2 block font-semibold">

                            Tên tầng

                        </label>

                        <input
                            type="number"
                            value={floorNumber}
                            onChange={(e)=>
                                setName(e.target.value)
                            }
                            placeholder="Ví dụ: Tầng 1"
                            className="w-full rounded-lg border p-3 outline-none focus:border-blue-500"
                        />

                    </div>

                </div>

                {/* Footer */}

                <div className="flex justify-end gap-3 border-t p-5">

                    <Button
                        className="bg-gray-300 text-black hover:bg-gray-400"
                        onClick={onClose}
                    >
                        Hủy
                    </Button>

                    <Button
                        onClick={handleSubmit}
                    >
                        {floor
                            ? "Lưu"
                            : "Thêm tầng"}
                    </Button>

                </div>

            </div>

        </div>

    );

}