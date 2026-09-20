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

    const loadTable = useCallback(
        async (showLoading = false) => {
            try {
                if (showLoading) setLoading(true);

                const res = await tableService.getById(tableId);
                const newTable = res?.data;

                if (!newTable) return;

                setTable(newTable);

                setSelectedOrder(prevSelected => {
                    const newOrders = newTable.orders || [];

                    if (!prevSelected) {
                        return newOrders.length
                            ? newOrders[0]
                            : null;
                    }

                    const updatedOrder = newOrders.find(
                        order =>
                            Number(order.id) ===
                            Number(prevSelected.id)
                    );

                    if (!updatedOrder) {
                        return newOrders.length
                            ? newOrders[0]
                            : null;
                    }

                    return updatedOrder;
                });
            } catch (err) {
                console.error(
                    "LOAD TABLE DETAIL ERROR:",
                    err
                );
            } finally {
                if (showLoading) setLoading(false);
            }
        },
        [tableId]
    );

    useEffect(() => {
        if (!tableId) return;

        loadTable(true);
    }, [tableId, loadTable]);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) return;

        const eventSource = new EventSource(
            `${import.meta.env.VITE_API_URL}/events/branch?token=${encodeURIComponent(
                token
            )}`
        );

        eventSource.addEventListener(
            "connected",
            (event) => {
                try {
                    console.log(
                        "SSE TABLE CONNECTED:",
                        JSON.parse(event.data)
                    );
                } catch {
                    console.log(
                        "SSE TABLE CONNECTED"
                    );
                }
            }
        );

        eventSource.addEventListener(
            "order.updated",
            (event) => {
                try {
                    const data = JSON.parse(event.data);

                    console.log(
                        "TABLE ORDER UPDATED:",
                        data
                    );

                    if (
                        data?.tableId &&
                        Number(data.tableId) !==
                            Number(tableId)
                    ) {
                        return;
                    }

                    loadTable(false);
                } catch (error) {
                    console.error(
                        "SSE ORDER ERROR:",
                        error
                    );
                }
            }
        );

        eventSource.addEventListener(
            "order.deleted",
            (event) => {
                try {
                    const data = JSON.parse(event.data);

                    if (
                        data?.tableId &&
                        Number(data.tableId) !==
                            Number(tableId)
                    ) {
                        return;
                    }

                    loadTable(false);
                } catch (error) {
                    console.error(
                        "SSE ORDER DELETE ERROR:",
                        error
                    );
                }
            }
        );

        eventSource.addEventListener(
            "table.updated",
            (event) => {
                try {
                    const data = JSON.parse(event.data);

                    if (
                        data?.tableId &&
                        Number(data.tableId) !==
                            Number(tableId)
                    ) {
                        return;
                    }

                    loadTable(false);
                } catch (error) {
                    console.error(
                        "SSE TABLE UPDATE ERROR:",
                        error
                    );
                }
            }
        );

        eventSource.onerror = (error) => {
            console.error("SSE ERROR:", error);
        };

        return () => {
            eventSource.close();
        };
    }, [tableId, loadTable]);

    const handleOrderUpdated = (updatedOrder) => {
        if (!updatedOrder) return;

        setSelectedOrder(updatedOrder);

        setTable((prev) => {
            if (!prev) return prev;

            const orders = prev.orders || [];

            const exists = orders.some(
                (order) =>
                    Number(order.id) ===
                    Number(updatedOrder.id)
            );

            if (!exists) {
                return {
                    ...prev,
                    orders: [...orders, updatedOrder],
                };
            }

            return {
                ...prev,
                orders: orders.map((order) =>
                    Number(order.id) ===
                    Number(updatedOrder.id)
                        ? updatedOrder
                        : order
                ),
            };
        });
    };

    const handleCreateOrder = async () => {
        try {
            if (!table?.id) {
                throw new Error(
                    "Không xác định được bàn."
                );
            }

            const customerRes = await tableService.open(
                table.id,
                {
                    name: `Khách bàn ${table.tableNumber}`,
                }
            );

            const customer =
                customerRes?.data?.customer;

            if (!customer?.id) {
                throw new Error(
                    "Không xác định được khách hàng của bàn."
                );
            }

            const orderRes =
                await orderService.create({
                    customerId: customer.id,
                });

            const createdOrder =
                orderRes?.data?.data ||
                orderRes?.data ||
                null;

            if (!createdOrder?.id) {
                throw new Error(
                    "Không lấy được đơn hàng vừa tạo."
                );
            }

            console.log(
                "NEW ORDER CREATED:",
                createdOrder
            );

            setSelectedOrder(createdOrder);
            setCart([]);
            setShowFoodPanel(true);

            await loadTable(false);

            setSelectedOrder((currentOrder) => {
                const freshOrders =
                    table?.orders || [];

                const newOrder =
                    freshOrders.find(
                        (order) =>
                            Number(order.id) ===
                            Number(createdOrder.id)
                    );

                return newOrder || createdOrder;
            });
        } catch (err) {
            console.error(
                "CREATE ORDER ERROR:",
                err
            );

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

    const handleSelectOrder = (order) => {
        if (!order?.id) return;

        console.log(
            "SELECT ORDER:",
            order.id,
            order.orderCode
        );

        setSelectedOrder(order);
        setCart([]);
        setShowFoodPanel(false);
    };

    const handleAddFood = (order) => {
        if (!order?.id) {
            setNoti({
                open: true,
                type: "error",
                message:
                    "Không xác định được đơn hàng.",
            });
            return;
        }

        console.log(
            "ADD FOOD TO ORDER:",
            order.id,
            order.orderCode
        );

        setSelectedOrder(order);
        setCart([]);
        setShowFoodPanel(true);
    };

    const handleBackFoodPanel = () => {
        setShowFoodPanel(false);
        setCart([]);
        loadTable(false);
    };

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                Đang tải...
            </div>
        );
    }

    if (!table) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                Không tìm thấy bàn.
            </div>
        );
    }

    return (
        <>
            {!showFoodPanel ? (
                <div className="grid min-h-[calc(100vh-85px)] grid-cols-1 gap-3 bg-[var(--color-background)] lg:grid-cols-2 lg:gap-2">
                    <div className="min-h-[400px] overflow-hidden rounded-xl bg-white shadow lg:h-[calc(100vh-85px)]">
                        <OrderList
                            table={table}
                            orders={table.orders || []}
                            selectedOrder={selectedOrder}
                            onSelectOrder={
                                handleSelectOrder
                            }
                            onCreateOrder={
                                handleCreateOrder
                            }
                            reload={loadTable}
                            onMergeOrders={() =>
                                setOpenMerge(true)
                            }
                            onOrderUpdated={
                                handleOrderUpdated
                            }
                        />
                    </div>

                    <div className="min-h-[400px] overflow-hidden rounded-xl bg-white shadow lg:h-[calc(100vh-85px)]">
                        <InvoicePanel
                            order={selectedOrder}
                            reload={loadTable}
                            onAddFood={
                                handleAddFood
                            }
                            table={table}
                            onOrderUpdated={
                                handleOrderUpdated
                            }
                        />
                    </div>
                </div>
            ) : (
                <div className="grid min-h-[calc(100vh-85px)] grid-cols-1 gap-3 bg-[var(--color-background)] lg:grid-cols-12 lg:gap-2">
                    <div className="min-h-[400px] overflow-hidden rounded-2xl bg-white shadow lg:col-span-8 lg:h-[calc(100vh-85px)]">
                        <FoodPanel
                            title="Order"
                            table={table}
                            order={selectedOrder}
                            cart={cart}
                            setCart={setCart}
                            reload={loadTable}
                            onBack={
                                handleBackFoodPanel
                            }
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
                            onBack={
                                handleBackFoodPanel
                            }
                        />
                    </div>
                </div>
            )}

            <MergeOrderModal
                open={openMerge}
                onClose={() => setOpenMerge(false)}
                orders={table.orders || []}
                reload={loadTable}
                onSelectOrder={handleSelectOrder}
            />

            <NotiModal
                open={noti.open}
                type={noti.type}
                message={noti.message}
                onClose={() =>
                    setNoti((prev) => ({
                        ...prev,
                        open: false,
                    }))
                }
            />
        </>
    );
}