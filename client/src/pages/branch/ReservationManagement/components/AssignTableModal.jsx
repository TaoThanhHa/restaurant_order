import { useEffect, useState } from "react";
import { AlertTriangle, Check, Users, X } from "lucide-react";
import reservationService from "../../../../services/resevervation.service";

export default function AssignTableModal({ reservation, onClose, onSuccess }) {
    const [tables, setTables] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadTables = async () => {
            try {
                setLoading(true);
                const res = await reservationService.getAvailableTables(
                    reservation.id
                );
                setTables(res.data || res || []);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Không thể lấy danh sách bàn."
                );
            } finally {
                setLoading(false);
            }
        };

        loadTables();
    }, [reservation.id]);

    const handleAssign = async () => {
        if (!selected) return;

        try {
            setSaving(true);
            await reservationService.assignTable(
                reservation.id,
                selected.id
            );
            onSuccess();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Không thể gán bàn."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">
                            Chọn bàn
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            {reservation.customerName} ·{" "}
                            {reservation.numberOfGuests} khách
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {error && (
                        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="py-12 text-center text-sm text-gray-500">
                            Đang tải danh sách bàn...
                        </div>
                    ) : tables.length === 0 ? (
                        <div className="py-12 text-center text-sm text-gray-500">
                            Không có bàn phù hợp.
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                            {tables.map(table => {
                                const conflict =
                                    table.conflictReservations?.length > 0;

                                const occupied = table.occupied;

                                const disabled =
                                    !table.availableForReservation;

                                const active =
                                    selected?.id === table.id;

                                return (
                                    <button
                                        key={table.id}
                                        disabled={disabled}
                                        onClick={() =>
                                            setSelected(table)
                                        }
                                        className={`relative rounded-2xl border p-4 text-left transition ${
                                            active
                                                ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200"
                                                : disabled
                                                ? "cursor-not-allowed border-red-100 bg-red-50 opacity-70"
                                                : occupied
                                                ? "border-amber-200 bg-amber-50 hover:border-amber-400"
                                                : "border-gray-200 bg-white hover:border-emerald-400 hover:bg-emerald-50"
                                        }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <span className="text-lg font-bold text-gray-800">
                                                Bàn{" "}
                                                {table.tableNumber}
                                            </span>

                                            {active && (
                                                <span className="rounded-full bg-emerald-500 p-1 text-white">
                                                    <Check size={14} />
                                                </span>
                                            )}
                                        </div>

                                        <p className="mt-2 flex items-center gap-1 text-sm text-gray-500">
                                            <Users size={15} />
                                            {table.capacity} chỗ
                                        </p>

                                        <p className="mt-2 text-xs text-gray-500">
                                            {table.floor?.name ||
                                                `Tầng ${table.floor?.floorNumber || ""}`}
                                        </p>

                                        {conflict && (
                                            <div className="mt-3 flex items-center gap-1 text-xs font-medium text-red-600">
                                                <AlertTriangle size={14} />
                                                Đã có lịch trùng
                                            </div>
                                        )}

                                        {!conflict && occupied && (
                                            <div className="mt-3 flex items-center gap-1 text-xs font-medium text-amber-600">
                                                <AlertTriangle size={14} />
                                                Đang có khách
                                            </div>
                                        )}

                                        {!conflict && !occupied && (
                                            <div className="mt-3 text-xs font-medium text-emerald-600">
                                                Có thể gán
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 border-t px-6 py-4">
                    <button
                        onClick={onClose}
                        className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                    >
                        Đóng
                    </button>

                    <button
                        disabled={!selected || saving}
                        onClick={handleAssign}
                        className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {saving ? "Đang gán..." : "Xác nhận gán bàn"}
                    </button>
                </div>
            </div>
        </div>
    );
}