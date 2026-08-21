import { useEffect,useState } from "react";
import { useParams } from "react-router-dom";

import tableService from "../../../../services/table.service";
import orderService from "../../../../services/order.service";

import OrderList from "./OrderList";
import InvoicePanel from "./InvoicePanel";
import FoodPanel from "./FoodPanel";
import InvoicePanelOrder from "./InvoicePanelOrder";
import MergeOrderModal from "../components/MergeOrderModal";
export default function TableDetail() {

    const { tableId } = useParams();

    const [loading,setLoading]=useState(true);
    const [table,setTable]=useState(null);
    const [selectedOrder,setSelectedOrder]=useState(null);
    const [showFoodPanel, setShowFoodPanel] = useState(false);
    const [cart,setCart]=useState([]);

    const [openMerge, setOpenMerge] = useState(false);

    const loadTable = async () => {
    try {

        setLoading(true);

        const res = await tableService.getById(tableId);

        console.log("res.data =", res.data);

        const tableData = res.data;

        console.log("table =", tableData);

        setTable(tableData);

        if (tableData.orders?.length) {
            setSelectedOrder(tableData.orders[0]);
        } else {
            setSelectedOrder(null);
        }

    } catch (err) {

        console.log(err);

    } finally {

        setLoading(false);

    }
};

    const handleCreateOrder = async () => {
        try {

            // mở bàn nếu chưa có customer
            const customerRes = await tableService.open(
                table.id,
                {
                    name: `Khách bàn ${table.tableNumber}`
                }
            );

            // tạo order
            const orderRes = await orderService.create({
                customerId: customerRes.data.customer.id,
            });

            await loadTable();

            setSelectedOrder(orderRes.data.data);

            setShowFoodPanel(true);

        } catch (err) {

            alert(
                err.response?.data?.message ||
                err.message
            );

        }
    };

    const handleAddFood = (order) => {
        setSelectedOrder(order);
        setShowFoodPanel(true);
    };

    useEffect(()=>{
        loadTable();
    },[tableId]);

    if(loading){
        return(
            <div className="flex h-full items-center justify-center">
                Đang tải...
            </div>
        );
    }

    if(!table){
        return(
            <div className="flex h-full items-center justify-center">
                Không tìm thấy bàn.
            </div>
        );
    }

    return (
        <>
            {!showFoodPanel ? (
            <div className="grid h-[calc(100vh-85px)] grid-cols-2 gap-2 bg-[#FEF8F2]">
                <div className="rounded-xl bg-white shadow overflow-hidden">
                    <OrderList
                        table={table}
                        orders={table.orders}
                        selectedOrder={selectedOrder}
                        onSelectOrder={setSelectedOrder}
                        onCreateOrder={handleCreateOrder}
                        reload={loadTable}
                        onMergeOrders={() => setOpenMerge(true)}
                    />
                </div>

                <div className="flex-1 rounded-xl bg-white shadow overflow-hidden">
                    <InvoicePanel
                        order={selectedOrder}
                        reload={loadTable}
                        onAddFood={handleAddFood}
                        table={table}
                    />
                </div>
            </div>

            ) : (

                <div className="grid h-[calc(100vh-85px)] grid-cols-12 gap-2 bg-[#FEF8F2]">

                    <div className="col-span-8 overflow-hidden rounded-3xl bg-white shadow">
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

                    <div className="col-span-4 flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow">
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
        </>
    );
}