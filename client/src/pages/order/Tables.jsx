
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import FloorTabs from "../cashier/Tables/components/FloorTabs";
import TableCard from "../cashier/Tables/components/TableCard";
import OrderList from "./OrderList";
import TransferTableModal from "../cashier/Tables/components/TransferTableModal";
import MergeTableModal from "../cashier/Tables/components/MergeTableModal";
import MergeOrderModal from "../cashier/Tables/components/MergeOrderModal";
import FoodPanel from "../cashier/Tables/TableDetail/FoodPanel";
import InvoicePanelOrder from "../cashier/Tables/TableDetail/InvoicePanelOrder";
import NotiModal from "../../components/NotiModal/NotiModal";
import Button from "../../components/Button/Button";

import floorService from "../../services/floor.service";
import tableService from "../../services/table.service";
import orderService from "../../services/order.service";

const getResponseData = res =>
    res?.data?.data ?? res?.data ?? res;

export default function TablesOrder() {
    const navigate = useNavigate();
    const { tableId } = useParams();

    const [floors, setFloors] = useState([]);
    const [floorId, setFloorId] = useState(null);
    const [tables, setTables] = useState([]);
    const [loadingTables, setLoadingTables] = useState(false);
    const [loadingTable, setLoadingTable] = useState(false);
    const [tableError, setTableError] = useState("");

    const [mergeTable, setMergeTable] = useState(null);
    const [transferTable, setTransferTable] = useState(null);
    const [selectedTable, setSelectedTable] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const [openMerge, setOpenMerge] = useState(false);

    const [panelView, setPanelView] = useState("list");
    const [activeOrder, setActiveOrder] = useState(null);
    const [cart, setCart] = useState([]);

    const [noti, setNoti] = useState({
        open: false,
        type: "error",
        message: "",
    });

    const showNoti = useCallback((type, message) => {
        setNoti({ open: true, type, message });
    }, []);

    const loadFloors = useCallback(async () => {
        try {
            const res = await floorService.getAll();
            const result = getResponseData(res);
            const data = Array.isArray(result) ? result : [];

            setFloors(data);
            setFloorId(current => current ?? data[0]?.id ?? null);
        } catch (error) {
            console.error(
                "LOAD FLOORS ERROR:",
                error.response?.data || error
            );

            showNoti(
                "error",
                error.response?.data?.message ||
                    "Không thể tải danh sách tầng."
            );
        }
    }, [showNoti]);

    useEffect(() => {
        loadFloors();
    }, [loadFloors]);

    const loadTables = useCallback(async (showLoading = false) => {
        if (!floorId) {
            setTables([]);
            return;
        }

        try {
            if (showLoading) setLoadingTables(true);

            const res = await tableService.getByFloor(floorId);
            const result = getResponseData(res);

            setTables(Array.isArray(result) ? result : []);
        } catch (error) {
            console.error(
                "LOAD TABLES ERROR:",
                error.response?.data || error
            );

            showNoti(
                "error",
                error.response?.data?.message ||
                    "Không thể tải danh sách bàn."
            );
        } finally {
            if (showLoading) setLoadingTables(false);
        }
    }, [floorId, showNoti]);

    const loadSelectedTable = useCallback(async () => {
        if (!tableId) {
            setSelectedTable(null);
            setSelectedOrder(null);
            setTableError("");
            setLoadingTable(false);
            return;
        }

        try {
            setLoadingTable(true);
            setTableError("");

            const res = await tableService.getById(tableId);
            const table = getResponseData(res);

            if (!table?.id) {
                setSelectedTable(null);
                setSelectedOrder(null);
                setTableError("Không tìm thấy bàn.");
                return;
            }

            const orders = Array.isArray(table.orders)
                ? table.orders
                : [];

            setSelectedTable({
                ...table,
                orders,
            });

            setSelectedOrder(current => {
                if (!current) return null;

                return (
                    orders.find(
                        order =>
                            Number(order.id) === Number(current.id)
                    ) || null
                );
            });

            setActiveOrder(current => {
                if (!current) return null;

                return (
                    orders.find(
                        order =>
                            Number(order.id) === Number(current.id)
                    ) || current
                );
            });
        } catch (error) {
            console.error(
                "LOAD SELECTED TABLE ERROR:",
                error.response?.data || error
            );

            setSelectedTable(null);
            setSelectedOrder(null);
            setTableError(
                error.response?.data?.message ||
                    "Không thể tải thông tin bàn. Vui lòng thử lại."
            );
        } finally {
            setLoadingTable(false);
        }
    }, [tableId]);

    useEffect(() => {
        setPanelView("list");
        setCart([]);
        setActiveOrder(null);
    }, [tableId]);

    useEffect(() => {
        if (tableId) {
            setSelectedTable(null);
            setSelectedOrder(null);
            setTableError("");
            loadSelectedTable();
        } else {
            setSelectedTable(null);
            setSelectedOrder(null);
            setTableError("");
            setOpenMerge(false);
            loadTables(true);
        }
    }, [tableId, loadSelectedTable, loadTables]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const apiUrl = import.meta.env.VITE_API_URL || "/api";
        const eventSource = new EventSource(
            `${apiUrl}/events/branch?token=${encodeURIComponent(token)}`
        );

        const reload = () => {
            if (tableId) {
                loadSelectedTable();
            } else {
                loadTables();
            }
        };

        eventSource.addEventListener("order.updated", reload);
        eventSource.addEventListener("order.deleted", reload);
        eventSource.addEventListener("table.updated", reload);

        eventSource.onerror = error => {
            console.error("SSE BRANCH ERROR:", error);
        };

        return () => eventSource.close();
    }, [tableId, loadTables, loadSelectedTable]);

    const handleFloorChange = id => {
        if (id === floorId) return;

        setTables([]);
        setFloorId(id);
    };

    const handleTableClick = table => {
        if (!["OCCUPIED", "AVAILABLE"].includes(table.status)) {
            return;
        }

        navigate(`/order/tables/${table.id}`);
    };

    const handleSelectOrder = order => {
        if (!selectedTable?.id || !order?.id) {
            showNoti(
                "error",
                "Không xác định được bàn hoặc đơn hàng."
            );
            return;
        }

        setSelectedOrder(order);

        navigate(
            `/order/tables/${selectedTable.id}/${order.id}/invoice`
        );
    };

    const handleBackToTables = () => {
        navigate("/order/tables");
    };

    const handleOrderUpdated = updatedOrder => {
        if (!updatedOrder) return;

        setSelectedOrder(updatedOrder);

        setSelectedTable(current => {
            if (!current) return current;

            const orders = current.orders || [];
            const exists = orders.some(
                order =>
                    Number(order.id) === Number(updatedOrder.id)
            );

            return {
                ...current,
                orders: exists
                    ? orders.map(order =>
                        Number(order.id) === Number(updatedOrder.id)
                            ? updatedOrder
                            : order
                    )
                    : [...orders, updatedOrder],
            };
        });
    };

    const handleCreateOrder = async () => {
        try {
            if (!selectedTable?.id) {
                throw new Error("Không xác định được bàn.");
            }

            const customerRes = await tableService.open(
                selectedTable.id,
                {
                    name: `Khách bàn ${selectedTable.tableNumber}`,
                }
            );

            const customerData = getResponseData(customerRes);
            const customer =
                customerData?.customer ||
                customerRes?.data?.customer ||
                customerData;

            if (!customer?.id) {
                throw new Error(
                    "Không xác định được khách hàng của bàn."
                );
            }

            const orderRes = await orderService.create({
                customerId: customer.id,
            });

            const orderData = getResponseData(orderRes);
            const createdOrder = orderData?.order ?? orderData;

            if (!createdOrder?.id) {
                throw new Error(
                    "Không lấy được đơn hàng vừa tạo."
                );
            }

            setSelectedOrder(createdOrder);
            setActiveOrder(createdOrder);
            setCart([]);

            setSelectedTable(current => {
                if (!current) return current;

                const orders = current.orders || [];
                const exists = orders.some(
                    order =>
                        Number(order.id) === Number(createdOrder.id)
                );

                return {
                    ...current,
                    status: "OCCUPIED",
                    orders: exists
                        ? orders.map(order =>
                            Number(order.id) === Number(createdOrder.id)
                                ? createdOrder
                                : order
                        )
                        : [...orders, createdOrder],
                };
            });

            setPanelView("foods");

            loadSelectedTable();
        } catch (error) {
            console.error(
                "CREATE ORDER ERROR:",
                error.response?.data || error
            );

            showNoti(
                "error",
                error.response?.data?.message ||
                    error.message ||
                    "Không thể tạo đơn."
            );
        }
    };

    const reloadSelectedTable = async () => {
        await loadSelectedTable();
    };

    const handleSendCartSuccess = () => {
        if (!selectedTable?.id || !activeOrder?.id) {
            setPanelView("list");
            return;
        }

        setCart([]);

        navigate(
            `/order/tables/${selectedTable.id}/${activeOrder.id}/invoice`
        );
    };

    return (
        <div className="space-y-6">
            {(!tableId || panelView === "list") && (
                <h1 className="text-2xl font-bold text-[var(--color-text)]">
                    Quản lý bàn
                </h1>
            )}

            {!tableId && (
                <>
                    <FloorTabs
                        floors={floors}
                        active={floorId}
                        onChange={handleFloorChange}
                    />

                    {loadingTables ? (
                        <div className="py-10 text-center text-gray-500">
                            Đang tải danh sách bàn...
                        </div>
                    ) : tables.length === 0 ? (
                        <div className="rounded-xl bg-white py-10 text-center text-gray-400 shadow-sm">
                            Tầng này chưa có bàn.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {tables.map(table => (
                                <div
                                    key={table.id}
                                    onClick={() => handleTableClick(table)}
                                    className={
                                        ["OCCUPIED", "AVAILABLE"].includes(
                                            table.status
                                        )
                                            ? "cursor-pointer"
                                            : "cursor-not-allowed"
                                    }
                                >
                                    <TableCard table={table} />
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {tableId && (
                loadingTable && !selectedTable ? (
                    <div className="py-10 text-center text-gray-500">
                        Đang tải thông tin bàn...
                    </div>
                ) : tableError && !selectedTable ? (
                    <div className="rounded-xl bg-white py-10 text-center text-gray-500 shadow-sm">
                        <p>{tableError}</p>

                        <div className="mt-4 flex justify-center gap-3">
                            <Button onClick={loadSelectedTable}>
                                Thử lại
                            </Button>

                            <Button onClick={handleBackToTables}>
                                Quay lại danh sách bàn
                            </Button>
                        </div>
                    </div>
                ) : selectedTable && panelView === "foods" && activeOrder ? (
                    <div className="h-[calc(100vh-140px)] min-h-[500px] overflow-hidden rounded-xl bg-white shadow">
                        <FoodPanel
                            title={`Chọn món - ${activeOrder.orderCode || `Đơn #${activeOrder.id}`}`}
                            table={selectedTable}
                            order={activeOrder}
                            reload={reloadSelectedTable}
                            cart={cart}
                            setCart={setCart}
                            mode="order"
                            showBack
                            onBack={() => setPanelView("list")}
                            onOpenCart={() => setPanelView("cart")}
                        />
                    </div>
                ) : selectedTable && panelView === "cart" && activeOrder ? (
                    <div className="h-[calc(100vh-140px)] min-h-[500px] overflow-hidden rounded-xl bg-white shadow">
                        <InvoicePanelOrder
                            cart={cart}
                            setCart={setCart}
                            table={selectedTable}
                            order={activeOrder}
                            reload={reloadSelectedTable}
                            mode="order"
                            onBack={() => setPanelView("foods")}
                            onSuccess={handleSendCartSuccess}
                        />
                    </div>
                ) : selectedTable ? (
                    <div className="min-h-[60vh] overflow-hidden rounded-xl bg-white shadow">
                        <OrderList
                            table={selectedTable}
                            orders={selectedTable.orders || []}
                            selectedOrder={selectedOrder}
                            onSelectOrder={handleSelectOrder}
                            onCreateOrder={handleCreateOrder}
                            reload={reloadSelectedTable}
                            onMergeOrders={() => setOpenMerge(true)}
                            onOrderUpdated={handleOrderUpdated}
                            onBack={handleBackToTables}
                        />
                    </div>
                ) : null
            )}

            <TransferTableModal
                open={!!transferTable}
                table={transferTable}
                tables={tables}
                onClose={() => setTransferTable(null)}
                onSuccess={() => {
                    setTransferTable(null);
                    loadTables(true);
                }}
            />

            <MergeTableModal
                open={!!mergeTable}
                table={mergeTable}
                tables={tables}
                onClose={() => setMergeTable(null)}
                onSuccess={() => {
                    setMergeTable(null);
                    loadTables(true);
                }}
            />

            {selectedTable && (
                <MergeOrderModal
                    open={openMerge}
                    onClose={() => setOpenMerge(false)}
                    orders={selectedTable.orders || []}
                    reload={reloadSelectedTable}
                    onSelectOrder={handleSelectOrder}
                />
            )}

            <NotiModal
                open={noti.open}
                type={noti.type}
                message={noti.message}
                onClose={() =>
                    setNoti(current => ({
                        ...current,
                        open: false,
                    }))
                }
            />
        </div>
    );
}
