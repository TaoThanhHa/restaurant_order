import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

import FloorTabs from "./components/FloorTabs";
import TableCard from "./components/TableCard";
import TransferTableModal from "./components/TransferTableModal";
import MergeTableModal from "./components/MergeTableModal";

import floorService from "../../../services/floor.service";
import tableService from "../../../services/table.service";

export default function ({ mode = "branch" }) {
    const navigate = useNavigate();
    const [floors, setFloors] = useState([]);
    const [floorId, setFloorId] = useState(null);
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mergeTable, setMergeTable] = useState(null);
    const [transferTable, setTransferTable] = useState(null);

    useEffect(() => {
        let cancelled = false;

        const loadFloors = async () => {
            try {
                const res = await floorService.getAll();
                if (cancelled) return;

                const data = res?.data || [];
                setFloors(data);

                if (data.length > 0) {
                    setFloorId(data[0].id);
                }
            } catch (error) {
                console.error(
                    "LOAD FLOORS ERROR:",
                    error.response?.data || error
                );
            }
        };

        loadFloors();

        return () => {
            cancelled = true;
        };
    }, []);

    const loadTables = useCallback(
        async (showLoading = false) => {
            if (!floorId) return;

            try {
                if (showLoading) setLoading(true);

                const res = await tableService.getByFloor(floorId);

                const data = Array.isArray(res)
                    ? res
                    : Array.isArray(res?.data)
                        ? res.data
                        : [];

                setTables(data);
            } catch (error) {
                console.error(
                    "LOAD TABLES ERROR:",
                    error.response?.data || error
                );
            } finally {
                if (showLoading) setLoading(false);
            }
        },
        [floorId]
    );

    useEffect(() => {
        if (floorId) {
            loadTables(true);
        }
    }, [floorId, loadTables]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const socket = io(import.meta.env.VITE_API_URL, {
            auth: { token },
        });

        const handleTableUpdated = data => {
            console.log("TABLE UPDATED:", data);

            if (
                data?.tableId &&
                data?.status &&
                tables.some(
                    table => Number(table.id) === Number(data.tableId)
                )
            ) {
                setTables(prev =>
                    prev.map(table =>
                        Number(table.id) === Number(data.tableId)
                            ? {
                                  ...table,
                                  status: data.status,
                              }
                            : table
                    )
                );
            }

            loadTables(false);
        };

        const handleOrderUpdated = data => {
            console.log("ORDER UPDATED:", data);
            loadTables(false);
        };

        socket.on("connect", () => {
            console.log(
                "WEBSOCKET CONNECTED:",
                socket.id
            );
        });

        socket.on(
            "table.updated",
            handleTableUpdated
        );

        socket.on(
            "order.updated",
            handleOrderUpdated
        );

        socket.on("connect_error", error => {
            console.error(
                "WEBSOCKET ERROR:",
                error.message
            );
        });

        socket.on("disconnect", reason => {
            console.log(
                "WEBSOCKET DISCONNECTED:",
                reason
            );
        });

        return () => {
            socket.off(
                "table.updated",
                handleTableUpdated
            );
            socket.off(
                "order.updated",
                handleOrderUpdated
            );
            socket.disconnect();
        };
    }, [loadTables, tables]);

    const handleFloorChange = id => {
        if (id === floorId) return;

        setTables([]);
        setFloorId(id);
    };

    const handleTableClick = table => {
        if (!["OCCUPIED", "AVAILABLE"].includes(table.status)) {
            return;
        }

        navigate(
            mode === "single"
                ? `/admin/tables/${table.id}`
                : `/branch/tables/${table.id}`
        );
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-[var(--color-text)]">
                Quản lý bàn
            </h1>

            <FloorTabs
                floors={floors}
                active={floorId}
                onChange={handleFloorChange}
            />

            {loading ? (
                <div className="py-10 text-center text-gray-500">
                    Đang tải bàn...
                </div>
            ) : tables.length === 0 ? (
                <div className="rounded-xl bg-white py-10 text-center text-gray-400 shadow-sm">
                    Tầng này chưa có bàn.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                    {tables.map(table => (
                        <TableCard
                            key={table.id}
                            table={table}
                            onClick={() => handleTableClick(table)}
                            onTransfer={setTransferTable}
                            onMerge={setMergeTable}
                        />
                    ))}
                </div>
            )}

            <TransferTableModal
                open={!!transferTable}
                table={transferTable}
                tables={tables}
                onClose={() => setTransferTable(null)}
                onSuccess={() => loadTables(true)}
            />

            <MergeTableModal
                open={!!mergeTable}
                table={mergeTable}
                tables={tables}
                onClose={() => setMergeTable(null)}
                onSuccess={() => loadTables(true)}
            />
        </div>
    );
}