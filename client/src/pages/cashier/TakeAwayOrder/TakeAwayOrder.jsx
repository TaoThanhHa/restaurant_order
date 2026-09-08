import { useCallback, useEffect, useState } from "react";

import FoodPanel from "../Tables/TableDetail/FoodPanel";
import InvoicePanelTakeAway from "./InvoicePanelTakeAway";

import TakeAwayOrderList from "./TakeAwayOrderList";
import InvoicePanelTakeAwayOrder from "./InvoicePanelTakeAwayOrder";

import orderService from "../../../services/order.service";
import NotiModal from "../../../components/NotiModal/NotiModal";

export default function TakeAwayOrder() {

    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showFoodPanel, setShowFoodPanel] = useState(false);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [noti, setNoti] = useState({
        open: false,
        type: "error",
        message: "",
    });

    const loadOrders = useCallback(
        async (showLoading = false) => {
            try {
                if (showLoading) {
                    setLoading(true);
                }
                const res = await orderService.getTakeAway();
                const newOrders = res?.data?.data || [];
                setOrders(newOrders);

                setSelectedOrder((prevSelected) => {
                    if (!prevSelected) {
                        return newOrders.length
                            ? newOrders[0]
                            : null;
                    }

                    const updatedOrder =
                        newOrders.find(
                            order =>
                                order.id === prevSelected.id
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
                    "LOAD TAKE AWAY ERROR:",
                    err
                );
            } finally {
                if (showLoading) {
                    setLoading(false);
                }
            }
        },
        []
    );

    useEffect(() => {
        loadOrders(true);
    }, [loadOrders]);


    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;
        const eventSource =
            new EventSource(
                `${import.meta.env.VITE_API_URL}/events/branch?token=${encodeURIComponent(token)}`
            );
        eventSource.addEventListener(
            "connected",
            (event) => {

                console.log(
                    "TAKE AWAY SSE CONNECTED:",
                    JSON.parse(event.data)
                );
            }
        );

        eventSource.addEventListener(
            "order.updated",
            (event) => {
                try {
                    const data = JSON.parse(event.data);

                    if (
                        data?.orderType &&
                        data.orderType !== "TAKE_AWAY"
                    ) {
                        return;
                    }

                    loadOrders(false);

                } catch (error) {

                    console.error(
                        "TAKE AWAY SSE ERROR:",
                        error
                    );

                }

            }
        );

        eventSource.onerror = (error) => {

            console.error(
                "SSE ERROR:",
                error
            );

        };

        return () => {
            eventSource.close();
        };

    }, [loadOrders]);


    const handleSelectOrder = (order) => {

        setSelectedOrder(order);

    };


    const handleCreateOrder = () => {

        setCart([]);

        setSelectedOrder(null);

        setShowFoodPanel(true);

    };


    const handleBack = async () => {

        setCart([]);

        setShowFoodPanel(false);

        await loadOrders(false);

    };


    const handlePaymentSuccess = async () => {

        setCart([]);

        setShowFoodPanel(false);

        await loadOrders(false);

    };


    if (loading) {

        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                Đang tải...
            </div>
        );

    }


    return (
        <>

            {!showFoodPanel ? (


                <div className="grid min-h-[calc(100vh-85px)] grid-cols-1 gap-3 bg-[var(--color-background)] lg:grid-cols-2 lg:gap-2">

                    {/* LIST */}

                    <div className="min-h-[400px] overflow-hidden rounded-xl bg-white shadow lg:h-[calc(100vh-85px)]">

                        <TakeAwayOrderList
                            orders={orders}
                            selectedOrder={selectedOrder}
                            onSelectOrder={
                                handleSelectOrder
                            }
                            onCreateOrder={
                                handleCreateOrder
                            }
                        />

                    </div>


                    {/* DETAIL */}

                    <div className="min-h-[400px] overflow-hidden rounded-xl bg-white shadow lg:h-[calc(100vh-85px)]">

                        <InvoicePanelTakeAwayOrder
                            order={selectedOrder}
                            reload={loadOrders}
                        />

                    </div>

                </div>

            ) : (

                <div className="grid min-h-[calc(100vh-85px)] grid-cols-1 gap-3 bg-[var(--color-background)] lg:grid-cols-12 lg:gap-2">

                    {/* MENU */}

                    <div className="min-h-[400px] overflow-hidden rounded-2xl bg-white shadow lg:col-span-8 lg:h-[calc(100vh-85px)]">

                        <FoodPanel
                            title="Order mang về"
                            cart={cart}
                            setCart={setCart}
                            onBack={handleBack}
                            showBack
                        />

                    </div>


                    {/* ORDER */}

                    <div className="min-h-[400px] overflow-hidden rounded-2xl bg-white shadow lg:col-span-4 lg:h-[calc(100vh-85px)]">

                        <InvoicePanelTakeAway
                            cart={cart}
                            setCart={setCart}
                            onPaymentSuccess={
                                handlePaymentSuccess
                            }
                        />

                    </div>

                </div>

            )}


            <NotiModal
                open={noti.open}
                type={noti.type}
                message={noti.message}
                onClose={() =>
                    setNoti(prev => ({
                        ...prev,
                        open: false,
                    }))
                }
            />

        </>
    );
}
