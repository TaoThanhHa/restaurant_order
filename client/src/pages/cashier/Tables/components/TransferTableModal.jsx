import { useState } from "react";
import { ArrowRightLeft, X } from "lucide-react";
import Button from "../../../../components/Button/Button";
import tableService from "../../../../services/table.service";

export default function TransferTableModal({
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

    const availableTables = tables.filter(
        item =>
            item.id !== table.id &&
            item.status === "AVAILABLE"
    );

    const handleTransfer = async () => {
        if (!targetTableId) {
            setError("Vui lòng chọn bàn mới.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            await tableService.transferTable( table.id, Number(targetTableId) );

            setTargetTableId("");
            onClose();
            onSuccess?.();
        } catch (error) {
            setError(
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                "Không thể đổi bàn."
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
                        <ArrowRightLeft size={20} />
                        <h2 className="text-lg font-semibold">
                            Đổi bàn
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
                            Bàn hiện tại
                        </p>
                        <p className="mt-1 text-lg font-semibold">
                            Bàn {table.tableNumber}
                        </p>
                    </div>

                    <div>
                        <p className="mb-2 text-sm font-medium">
                            Chọn bàn mới
                        </p>

                        {availableTables.length === 0 ? (
                            <div className="rounded-xl bg-gray-50 p-4 text-center text-sm text-gray-500">
                                Không có bàn trống.
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                {availableTables.map(item => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setTargetTableId(item.id) }
                                        className={`rounded-xl border p-3 text-left transition ${
                                            Number(targetTableId) === item.id
                                                ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                                                : "border-gray-200 hover:border-gray-400"
                                        }`}
                                    >
                                        <p className="font-semibold">
                                            Bàn {item.tableNumber}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Trống
                                        </p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {error && (
                        <p className="text-sm text-red-500">
                            {error}
                        </p>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-100 text-gray-700"
                        >
                            Hủy
                        </Button>

                        <Button
                            type="button"
                            disabled={ loading || !targetTableId || availableTables.length === 0}
                            onClick={handleTransfer}
                        >
                            {loading ? "Đang xử lý..." : "Đổi bàn"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}