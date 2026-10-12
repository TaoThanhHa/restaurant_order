import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Button from "../../components/Button/Button";
import tableService from "../../services/table.service";
import orderService from "../../services/order.service";

import InvoicePanel from "../cashier/Tables/TableDetail/InvoicePanel";
import FoodPanel from "../cashier/Tables/TableDetail/FoodPanel";
import InvoicePanelOrder from "../cashier/Tables/TableDetail/InvoicePanelOrder";

const getResponseData = response =>
    response?.data?.data ?? response?.data ?? response;

export default function Invoice() {
    const { tableId, orderId } = useParams();
    const navigate = useNavigate();

    const [table, setTable] = useState(null);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const [view, setView] = useState("invoice");
    const [cart, setCart] = useState([]);

    const loadInvoiceData = useCallback(async (showLoading = true) => {
        if (!tableId || !orderId) {
            setErrorMessage("Thiếu thông tin bàn hoặc đơn hàng trên URL.");
            setLoading(false);
            return;
        }

        try {
            if (showLoading) setLoading(true);
            setErrorMessage("");

            const [tableResponse, orderResponse] = await Promise.all([
                tableService.getById(tableId),
                orderService.getById(orderId),
            ]);

            const tableResult = getResponseData(tableResponse);
            const orderResult = getResponseData(orderResponse);

            const tableData = tableResult?.table ?? tableResult;
            const orderData = orderResult?.order ?? orderResult;

            if (!tableData?.id) {
                throw new Error(`Không tìm thấy bàn ${tableId}.`);
            }

            if (
                !orderData?.id ||
                Number(orderData.id) !== Number(orderId)
            ) {
                throw new Error(`Không tìm thấy đơn hàng ${orderId}.`);
            }

            const orderTableId =
                orderData.tableId ?? orderData.table?.id;

            if (
                orderTableId != null &&
                Number(orderTableId) !== Number(tableId)
            ) {
                throw new Error("Đơn hàng không thuộc bàn đang chọn.");
            }

            setTable(tableData);
            setOrder(orderData);
        } catch (error) {
            setTable(null);
            setOrder(null);

            setErrorMessage(
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                "Không thể tải thông tin đơn hàng."
            );
        } finally {
            if (showLoading) setLoading(false);
        }
    }, [tableId, orderId]);

    useEffect(() => {
        loadInvoiceData();
    }, [loadInvoiceData]);

    const reload = useCallback(
        () => loadInvoiceData(false),
        [loadInvoiceData]
    );

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center text-gray-500">
                Đang tải thông tin đơn hàng...
            </div>
        );
    }

    if (errorMessage || !table?.id || !order?.id) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
                <p className="text-center text-red-500">
                    {errorMessage || "Không tìm thấy bàn hoặc đơn hàng."}
                </p>

                <Button
                    onClick={() =>
                        navigate(
                            tableId
                                ? `/order/tables/${tableId}`
                                : "/order/tables"
                        )
                    }
                >
                    Quay lại danh sách đơn
                </Button>
            </div>
        );
    }

    if (view === "foods") {
        return (
            <FoodPanel
                title={`Thêm món - ${order.orderCode || `Đơn #${order.id}`}`}
                table={table}
                order={order}
                reload={reload}
                cart={cart}
                setCart={setCart}
                mode="order"
                showBack
                onBack={() => setView("invoice")}
                onOpenCart={() => setView("cart")}
            />
        );
    }

    if (view === "cart") {
        return (
            <InvoicePanelOrder
                cart={cart}
                setCart={setCart}
                table={table}
                order={order}
                reload={reload}
                mode="order"
                onBack={() => setView("foods")}
                onSuccess={() => {
                    setCart([]);
                    setView("invoice");
                }}
            />
        );
    }

    return (
        <div className="h-full min-h-0">
            <InvoicePanel
                order={order}
                table={table}
                reload={reload}
                onBack={() =>
                    navigate(`/order/tables/${tableId}`)
                }
                onAddFood={() => {
                    setCart([]);
                    setView("foods");
                }}
            />
        </div>
    );
}