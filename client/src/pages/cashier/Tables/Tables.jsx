import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import FloorTabs from "./components/FloorTabs";
import TableCard from "./components/TableCard";

import floorService from "../../../services/floor.service";
import tableService from "../../../services/table.service";

export default function Tables() {
    const navigate = useNavigate();
    const [floors, setFloors] = useState([]);
    const [floorId, setFloorId] = useState(null);
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const loadFloors = async () => {
            try {
                const res = await floorService.getAll();
                if (cancelled) return;

                const data = res?.data || [];
                setFloors(data);
                if (data.length > 0) setFloorId(data[0].id);
            } catch (error) {
                console.error("LOAD FLOORS ERROR:", error.response?.data || error);
            }
        };

        loadFloors();
        return () => {
            cancelled = true;
        };
    }, []);

    const loadTables = useCallback(async (showLoading = false) => {
        if (!floorId) return;

        try {
            if (showLoading) setLoading(true);

            const res = await tableService.getByFloor(floorId);
            setTables(res?.data || []);
        } catch (error) {
            console.error("LOAD TABLES ERROR:", error.response?.data || error);
        } finally {
            if (showLoading) setLoading(false);
        }
    }, [floorId]);

    useEffect(() => {
        if (floorId) loadTables(true);
    }, [floorId, loadTables]);

    useEffect(() => {
        if (!floorId) return;

        const token = localStorage.getItem("token");
        if (!token) return;

        const eventSource = new EventSource(
            `${import.meta.env.VITE_API_URL}/events/branch?token=${token}`
        );

        eventSource.addEventListener("order.updated", () => loadTables(false));
        eventSource.onerror = error => console.error("SSE BRANCH ERROR:", error);

        return () => eventSource.close();
    }, [floorId, loadTables]);

    const handleFloorChange = id => {
        if (id === floorId) return;
        setTables([]);
        setFloorId(id);
    };

    const handleTableClick = table => {
        if (["OCCUPIED", "AVAILABLE"].includes(table.status)) {
            navigate(`/branch/tables/${table.id}`);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-[var(--color-text)]">Quản lý bàn</h1>

            <FloorTabs floors={floors} active={floorId} onChange={handleFloorChange} />

            {loading ? (
                <div className="py-10 text-center text-gray-500">Đang tải bàn...</div>
            ) : tables.length === 0 ? (
                <div className="rounded-xl bg-white py-10 text-center text-gray-400 shadow-sm">
                    Tầng này chưa có bàn.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {tables.map(table => (
                        <TableCard key={table.id} table={table} onClick={() => handleTableClick(table)} />
                    ))}
                </div>
            )}
        </div>
    );
}