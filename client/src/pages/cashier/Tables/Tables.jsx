import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import FloorTabs from "./components/FloorTabs";
import TableCard from "./components/TableCard";

import floorService from "../../../services/floor.service";
import tableService from "../../../services/table.service";

export default function Tables() {
    const [floors, setFloors] = useState([]);
    const [floorId, setFloorId] = useState(null);
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        loadFloors();
    }, []);

    useEffect(() => {
        if (!floorId) return;
        loadTables();
    }, [floorId]);

    const loadFloors = async () => {
        try {
            const res = await floorService.getAll();
            setFloors(res.data);
            if (res.data.length > 0) {
                setFloorId(res.data[0].id);
            }
        } catch (err) {
            console.log(err);
        }
    };

    const loadTables = async () => {
        try {
            setLoading(true);
            const res = await tableService.getByFloor(floorId);
            console.log("Tables API:", res);
            setTables(res.data);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-[var(--color-text)]">
                Quản lý bàn
            </h1>

            <FloorTabs
                floors={floors}
                active={floorId}
                onChange={setFloorId}
            />

            {loading ? <div>Đang tải...</div> : 
                <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {
                    tables.map(table => (
                        <TableCard
                        key={table.id}
                        table={table}
                        onClick={() =>{
                            if(table.status === "OCCUPIED"){
                                navigate(`/cashier/tables/${table.id}`)
                            } else if(table.status === "AVAILABLE")
                                navigate(`/cashier/tables/${table.id}`)
                        }}
                        />
                    ))
                }
                </div>
            }
        </div>
    );
}