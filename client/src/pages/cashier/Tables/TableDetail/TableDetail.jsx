import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import tableService from "../../../../services/table.service";
import orderService from "../../../../services/order.service";

import OrderList from "./OrderList";
import InvoicePanel from "./InvoicePanel";
import FoodPanel from "./FoodPanel";
import InvoicePanelOrder from "./InvoicePanelOrder";
import MergeOrderModal from "../components/MergeOrderModal";
import NotiModal from "../../../../components/NotiModal/NotiModal";

export default function TableDetail() {
    const { tableId } = useParams();

    const [loading, setLoading] = useState(true);
    const [table, setTable] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showFoodPanel, setShowFoodPanel] = useState(false);
    const [cart, setCart] = useState([]);
    const [openMerge, setOpenMerge] = useState(false);

    const [noti, setNoti] = useState({
        open: false,
        type: "error",
        message: "",
    });

    // LOAD TABLE
    const loadTable = useCallback(
        async (showLoading = false) => {
            try {
                if (showLoading) setLoading(true);

                const res = await tableService.getById(tableId);
                const newTable = res?.data;

                if (!newTable) return;

                setTable((prev) => {
                    if (!prev) return newTable;

                    const oldOrders = prev.orders || [];
                    const newOrders = newTable.orders || [];

                    const ordersChanged =
                        oldOrders.length !== newOrders.length ||
                        oldOrders.some((oldOrder, index) => {
                            const newOrder = newOrders[index];
                            if (!newOrder) return true;

                            return (
                                oldOrder.id !== newOrder.id ||
                                oldOrder.status !== newOrder.status ||
                                oldOrder.updatedAt !== newOrder.updatedAt
                            );
                        });

                    const tableChanged =
                        prev.status !== newTable.status || ordersChanged;

                    return tableChanged ? newTable : prev;
                });

                setSelectedOrder((prevSelected) => {
                    const newOrders = newTable.orders || [];

                    if (!prevSelected) {
                        return newOrders.length ? newOrders[0] : null;
                    }

                    const updatedOrder = newOrders.find(
                        (order) => order.id === prevSelected.id
                    );

                    if (!updatedOrder) {
                        return newOrders.length ? newOrders[0] : null;
                    }

                    const unchanged =
                        updatedOrder.status === prevSelected.status &&
                        updatedOrder.updatedAt === prevSelected.updatedAt;

                    return unchanged ? prevSelected : updatedOrder;
                });
            } catch (err) {
                console.error("LOAD TABLE DETAIL ERROR:", err);
            } finally {
                if (showLoading) setLoading(false);
            }
        },
        [tableId]
    );

    
    // LOAD LẦN ĐẦU
    

    useEffect(() => {
        if (!tableId) return;
        loadTable(true);
    }, [tableId, loadTable]);

    
    // SSE BRANCH
    

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const eventSource = new EventSource(
            `${import.meta.env.VITE_API_URL}/events/branch?token=${encodeURIComponent(token)}`
        );

        eventSource.addEventListener("connected", (event) => {
            console.log("SSE TABLE CONNECTED:", JSON.parse(event.data));
        });

        eventSource.addEventListener("order.updated", (event) => {
            try {
                const data = JSON.parse(event.data);

                console.log("TABLE ORDER UPDATED:", data);

                if (
                    data?.tableId &&
                    Number(data.tableId) !== Number(tableId)
                ) {
                    return;
                }

                loadTable(false);
            } catch (error) {
                console.error("SSE ORDER ERROR:", error);
            }
        });

        eventSource.onerror = (error) => {
            console.error("SSE ERROR:", error);
        };

        return () => eventSource.close();
    }, [tableId, loadTable]);

    
    // ORDER UPDATED
    

    const handleOrderUpdated = (updatedOrder) => {
        if (!updatedOrder) return;

        setSelectedOrder(updatedOrder);

        setTable((prev) => {
            if (!prev) return prev;

            const orders = prev.orders || [];
            const exists = orders.some(
                (order) => order.id === updatedOrder.id
            );

            if (!exists) {
                return { ...prev, orders: [...orders, updatedOrder] };
            }

            return {
                ...prev,
                orders: orders.map((order) =>
                    order.id === updatedOrder.id ? updatedOrder : order
                ),
            };
        });
    };

    
    // CREATE ORDER
    const handleCreateOrder = async () => {
        try {
            const customerRes = await tableService.open(table.id, {
                name: `Khách bàn ${table.tableNumber}`,
            });

            const orderRes = await orderService.create({
                customerId: customerRes.data.customer.id,
            });

            await loadTable(false);

            const createdOrder = orderRes?.data?.data;

            if (createdOrder) setSelectedOrder(createdOrder);

            setShowFoodPanel(true);
        } catch (err) {
            setNoti({
                open: true,
                type: "error",
                message:
                    err.response?.data?.message ||
                    err.message ||
                    "Không thể tạo đơn.",
            });
        }
    };

    
    // ADD FOOD
    

    const handleAddFood = (order) => {
        setSelectedOrder(order);
        setCart([]);
        setShowFoodPanel(true);
    };

    
    // LOADING
    

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                Đang tải...
            </div>
        );
    }

    
    // NOT FOUND
    

    if (!table) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                Không tìm thấy bàn.
            </div>
        );
    }

    
    // RENDER
    

    return (
        <>
            {!showFoodPanel ? (
                <div className="grid min-h-[calc(100vh-85px)] grid-cols-1 gap-3 bg-[var(--color-background)] lg:grid-cols-2 lg:gap-2">
                    <div className="min-h-[400px] overflow-hidden rounded-xl bg-white shadow lg:h-[calc(100vh-85px)]">
                        <OrderList
                            table={table}
                            orders={table.orders || []}
                            selectedOrder={selectedOrder}
                            onSelectOrder={setSelectedOrder}
                            onCreateOrder={handleCreateOrder}
                            reload={loadTable}
                            onMergeOrders={() => setOpenMerge(true)}
                            onOrderUpdated={handleOrderUpdated}
                        />
                    </div>

                    <div className="min-h-[400px] overflow-hidden rounded-xl bg-white shadow lg:h-[calc(100vh-85px)]">
                        <InvoicePanel
                            order={selectedOrder}
                            reload={loadTable}
                            onAddFood={handleAddFood}
                            table={table}
                            onOrderUpdated={handleOrderUpdated}
                        />
                    </div>
                </div>
            ) : (
                <div className="grid min-h-[calc(100vh-85px)] grid-cols-1 gap-3 bg-[vả(--color-background)] lg:grid-cols-12 lg:gap-2">
                    <div className="min-h-[400px] overflow-hidden rounded-2xl bg-white shadow lg:col-span-8 lg:h-[calc(100vh-85px)]">
                        <FoodPanel
                            title="Order"
                            table={table}
                            order={selectedOrder}
                            cart={cart}
                            setCart={setCart}
                            reload={loadTable}
                            onBack={() => setShowFoodPanel(false)}
                            showBack
                        />
                    </div>

                    <div className="min-h-[400px] overflow-hidden rounded-2xl bg-white shadow lg:col-span-4 lg:h-[calc(100vh-85px)]">
                        <InvoicePanelOrder
                            cart={cart}
                            setCart={setCart}
                            table={table}
                            order={selectedOrder}
                            reload={loadTable}
                            onBack={() => setShowFoodPanel(false)}
                        />
                    </div>
                </div>
            )}

            <MergeOrderModal
                open={openMerge}
                onClose={() => setOpenMerge(false)}
                orders={table.orders || []}
                reload={loadTable}
                onSelectOrder={setSelectedOrder}
            />

            <NotiModal
                open={noti.open}
                type={noti.type}
                message={noti.message}
                onClose={() => setNoti((prev) => ({ ...prev, open: false }))}
            />
        </>
    );
}