import { useState } from "react";
import { Merge, X } from "lucide-react";
import Button from "../../../../components/Button/Button";
import tableService from "../../../../services/table.service";

export default function MergeTableModal({
    open,
    table,
    tables = [],
    onClose,
    onSuccess,
}) {
    const [targetTableId, setTargetTableId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!open || !table) return null;

    const occupiedTables = tables.filter(
        item => item.id !== table.id && item.status === "OCCUPIED"
    );

    const handleMerge = async () => {
        if (!targetTableId) {
            setError("Vui lòng chọn bàn muốn gộp vào.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            await tableService.mergeTables(table.id, Number(targetTableId));

            setTargetTableId("");
            onClose();
            onSuccess?.();
        } catch (error) {
            setError(
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                "Không thể gộp bàn."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b px-5 py-4">
                    <div className="flex items-center gap-2">
                        <Merge size={20} />
                        <h2 className="text-lg font-semibold">
                            Gộp bàn
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 hover:bg-gray-100"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4 p-5">
                    <div className="rounded-xl bg-gray-50 p-4">
                        <p className="text-sm text-gray-500">
                            Bàn nguồn
                        </p>
                        <p className="mt-1 text-lg font-semibold">
                            Bàn {table.tableNumber}
                        </p>
                    </div>

                    <div>
                        <p className="mb-2 text-sm font-medium">
                            Gộp vào bàn
                        </p>

                        {occupiedTables.length === 0 ? (
                            <div className="rounded-xl bg-gray-50 p-4 text-center text-sm text-gray-500">
                                Không có bàn đang phục vụ để gộp.
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                {occupiedTables.map(item => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() =>
                                            setTargetTableId(item.id)
                                        }
                                        className={`rounded-xl border p-3 text-left transition ${
                                            Number(targetTableId) === item.id
                                                ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                                                : "border-gray-200 hover:border-gray-400"
                                        }`}
                                    >
                                        <p className="font-semibold">
                                            Bàn {item.tableNumber}
                                        </p>
                                        <p className="text-sm text-green-600">
                                            Đang phục vụ
                                        </p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="rounded-xl bg-yellow-50 p-3 text-sm text-yellow-700">
                        Các đơn của bàn nguồn sẽ được chuyển sang bàn đích.
                    </div>

                    {error && (
                        <p className="text-sm text-red-500">
                            {error}
                        </p>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" onClick={onClose} >
                            Hủy
                        </Button>

                        <Button
                            type="button"
                            disabled={loading || !targetTableId || occupiedTables.length === 0 }
                            onClick={handleMerge}
                        >
                            {loading ? "Đang xử lý..." : "Gộp bàn"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}