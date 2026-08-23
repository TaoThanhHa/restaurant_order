import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import FloorTabs from "./components/FloorTabs";
import TableCard from "./components/TableCard";

import floorService from "../../../services/floor.service";
import tableService from "../../../services/table.service";


export default function Tables() {

    const navigate = useNavigate();


    // =================================================
    // STATE
    // =================================================

    const [floors, setFloors] =
        useState([]);

    const [floorId, setFloorId] =
        useState(null);

    const [tables, setTables] =
        useState([]);

    const [loading, setLoading] =
        useState(false);


    // =================================================
    // LOAD FLOORS
    //
    // Chỉ gọi 1 lần khi vào trang
    // =================================================

    useEffect(() => {

        let cancelled = false;


        const loadFloors = async () => {

            try {

                const res =
                    await floorService.getAll();


                if (cancelled) {
                    return;
                }


                const data =
                    res?.data || [];


                setFloors(data);


                // -----------------------------------------
                // Chọn tầng đầu tiên
                // -----------------------------------------

                if (data.length > 0) {

                    setFloorId(
                        data[0].id
                    );

                }

            } catch (error) {

                console.error(
                    "LOAD FLOORS ERROR:",
                    error.response?.data ||
                    error
                );

            }

        };


        loadFloors();


        return () => {

            cancelled = true;

        };

    }, []);


    // =================================================
    // LOAD TABLES
    //
    // Có thể gọi:
    // - lần đầu
    // - polling
    // =================================================

    const loadTables = useCallback(
        async (showLoading = false) => {

            if (!floorId) {
                return;
            }


            try {

                if (showLoading) {

                    setLoading(true);

                }


                const res =
                    await tableService.getByFloor(
                        floorId
                    );


                const data =
                    res?.data || [];


                setTables(data);


            } catch (error) {

                console.error(
                    "LOAD TABLES ERROR:",
                    error.response?.data ||
                    error
                );

            } finally {

                if (showLoading) {

                    setLoading(false);

                }

            }

        },
        [floorId]
    );


    // =================================================
    // LOAD + POLLING TABLE
    //
    // Chỉ 1 interval cho tầng hiện tại
    // =================================================

    useEffect(() => {

        if (!floorId) {
            return;
        }

        loadTables(true);

    }, [
        floorId,
        loadTables,
    ]);

// =================================================
// SSE BRANCH
// =================================================

// =================================================
// SSE BRANCH
// =================================================

useEffect(() => {

    if (!floorId) {
        return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
        console.warn("Không có token SSE");
        return;
    }

    const eventSource = new EventSource(
        `${import.meta.env.VITE_API_URL}/events/branch?token=${token}`
    );

    eventSource.addEventListener("connected", (event) => {

        console.log(
            "SSE BRANCH CONNECTED:",
            JSON.parse(event.data)
        );

    });

    eventSource.addEventListener("order.updated", (event) => {

        try {

            const data = JSON.parse(event.data);

            console.log(
                "🔥 SSE ORDER UPDATED:",
                data
            );

            // ========================================
            // CÓ ORDER MỚI / ORDER ĐỔI TRẠNG THÁI
            // → LOAD LẠI BÀN NGAY
            // ========================================

            loadTables(false);

        } catch (error) {

            console.error(
                "SSE ORDER EVENT ERROR:",
                error
            );

        }

    });

    eventSource.onerror = (error) => {

        console.error(
            "SSE BRANCH ERROR:",
            error
        );

    };

    return () => {

        console.log("Đóng SSE branch");

        eventSource.close();

    };

}, [floorId, loadTables]);


    // =================================================
    // CHUYỂN TẦNG
    // =================================================

    const handleFloorChange = (id) => {

        if (id === floorId) {
            return;
        }


        // Xóa dữ liệu cũ trước
        // để tránh hiện bàn của tầng trước
        setTables([]);


        setFloorId(id);

    };


    // =================================================
    // CLICK TABLE
    // =================================================

    const handleTableClick = (table) => {

        if (
            table.status === "OCCUPIED" ||
            table.status === "AVAILABLE"
        ) {

            navigate(
                `/cashier/tables/${table.id}`
            );

        }

    };


    // =================================================
    // RENDER
    // =================================================

    return (

        <div className="space-y-6">


            {/* ================================================= */}
            {/* TITLE */}
            {/* ================================================= */}

            <h1 className="text-2xl font-bold text-[var(--color-text)]">

                Quản lý bàn

            </h1>


            {/* ================================================= */}
            {/* FLOOR */}
            {/* ================================================= */}

            <FloorTabs
                floors={floors}
                active={floorId}
                onChange={handleFloorChange}
            />


            {/* ================================================= */}
            {/* TABLES */}
            {/* ================================================= */}

            {loading ? (

                <div className="py-10 text-center text-gray-500">

                    Đang tải bàn...

                </div>

            ) : tables.length === 0 ? (

                <div className="rounded-xl bg-white py-10 text-center text-gray-400 shadow-sm">

                    Tầng này chưa có bàn.

                </div>

            ) : (

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

                    {tables.map(table => (

                        <TableCard
                            key={table.id}
                            table={table}
                            onClick={() =>
                                handleTableClick(
                                    table
                                )
                            }
                        />

                    ))}

                </div>

            )}

        </div>

    );

}