import { useState } from "react";

import Button from "../../../../components/Button/Button";
import orderService from "../../../../services/order.service";
import PaymentModal from "./PaymentModal";
import { printKitchenOrder } from "../../../../../utils/printKitchenOrder";

const STATUS={
    PENDING:{text:"Chờ xác nhận",className:"bg-yellow-100 text-yellow-700"},
    CONFIRMED:{text:"Đã xác nhận",className:"bg-blue-100 text-blue-700"},
    PREPARING:{text:"Đang chế biến",className:"bg-orange-100 text-orange-700"},
    SERVED:{text:"Đã phục vụ",className:"bg-green-100 text-green-700"},
    COMPLETED:{text:"Hoàn thành",className:"bg-gray-100 text-gray-700"},
    CANCELLED:{text:"Đã hủy",className:"bg-red-100 text-red-700"}
};

export default function InvoicePanel({order,reload,onAddFood,table}){
    
    const [openPayment, setOpenPayment] = useState(false);
    
    if(!order){
        return(
            <div className="flex h-full items-center justify-center text-gray-400">
                Chọn một đơn để xem chi tiết
            </div>
        );
    }

    const currentOrderCode = order.orderCode || "";
    const orderItems = (order.orderItems || []).filter(
        item => item.status !== "CANCELLED"
    );
    const handleConfirm = async () => {
    try {

        const res = await orderService.confirmItems(order.id);

        console.log("CONFIRM RESPONSE:", res);

        await reload();

    } catch (err) {

        console.log("CONFIRM ERROR:", err);
        console.log("STATUS:", err.response?.status);
        console.log("DATA:", err.response?.data);

        alert(
            err.response?.data?.message ||
            err.response?.data?.error ||
            err.message
        );

    }
};

const handleServed = async () => {

    try{

        await orderService.closeOrder(
            order.id,
            "SERVED"
        );

        reload();

    }catch(err){

        alert(
            err.response?.data?.message ||
            err.message
        );

    }

};

const handlePreparing = async () => {
    try {
        const orderRes = await orderService.getById(order.id);

        const fullOrder = orderRes.data.data;

        await orderService.closeOrder(
            order.id,
            "PREPARING"
        );

        printKitchenOrder(fullOrder);

        reload();

    } catch (err) {
        alert(
            err.response?.data?.message ||
            err.message
        );
    }
};

const handleRemoveItem = async (itemId) => {

    if (!window.confirm("Bạn có chắc muốn xóa món này?")) {
        return;
    }

    try {

        await orderService.removeItem(
            order.id,
            itemId
        );

        await reload();

    } catch (err) {

        alert(
            err.response?.data?.message ||
            err.message
        );

    }

};


    const oldItems = orderItems.filter(
        item => item.status !== "PENDING"
    );

    const newItems = orderItems.filter(
        item => item.status === "PENDING"
    );
    const canPayment =
        orderItems.length > 0 &&
        orderItems.every(
            item => item.status === "SERVED"
        );

    const total = orderItems.reduce(
        (sum, item) =>
            sum + item.price * item.quantity,
        0
    );

    const status=STATUS[order.status];

    return(

        <div className="flex h-full flex-col pt-2">

            <div className="border-b pl-4 pr-4">

                <div className="flex items-center justify-between">

                    <div>

                        <h2 className="text-xl font-bold">
                            Đơn {currentOrderCode || "Chưa có đơn"}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            👤 {order.customer?.name||"Khách"}
                        </p>
                    </div>
                    
                    <div className="grid items-center justify-between">
                    <span className={`rounded-full px-3 py-1 mb-2 text-sm font-semibold ${status.className}`}>
                        {status.text}
                    </span>
                    <Button className=" w-[150px]" onClick={() => onAddFood(order)}>
                        + Thêm món
                    </Button>
                    </div>

                </div>

            </div>

            <div className="flex-1 overflow-y-auto p-5">

                {oldItems.length>0&&(
                    <>
                        <h3 className="mb-3 font-semibold">
                            Món đã xác nhận
                        </h3>

                        {oldItems.map(item=>(
                            <div
                                key={item.id}
                                className="mb-3 flex items-center justify-between rounded-lg border p-3"
                            >
                                <div>
                                    <div className="font-medium">
                                        {item.food.name}
                                    </div>

                                    {item.note&&(
                                        <div className="text-xs text-gray-500">
                                            Ghi chú: {item.note}
                                        </div>
                                    )}
                                </div>

                                <div className="text-right">

                                    <div>x{item.quantity}</div>

                                    <div className="text-sm text-gray-500">
                                        {item.price.toLocaleString()}đ
                                    </div>

                                </div>

                            </div>
                        ))}
                    </>
                )}

                {newItems.length>0&&(
                    <>
                        <div className="my-5 border-t"></div>

                        <div className="mb-3 flex items-center justify-between">

                            <h3 className="font-semibold text-yellow-600">
                                Món mới
                            </h3>

                            <span className="rounded-full bg-red-500 px-2 py-1 text-xs text-white">
                                {newItems.length} món
                            </span>

                        </div>

                        {newItems.map(item => (
                            <div
                                key={item.id}
                                className="mb-3 flex items-center justify-between rounded-lg border-2 border-yellow-300 bg-yellow-50 p-3"
                            >
                                <div>
                                    <div className="font-medium">
                                        {item.food.name}
                                    </div>

                                    {item.note && (
                                        <div className="text-xs text-gray-500">
                                            Ghi chú: {item.note}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-3">

                                    <div className="text-right">
                                        <div>x{item.quantity}</div>

                                        <div className="text-sm text-gray-500">
                                            {item.price.toLocaleString()}đ
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleRemoveItem(item.id)}
                                        className="rounded-lg p-2 text-red-500 hover:bg-red-100"
                                    >
                                        🗑
                                    </button>

                                </div>
                            </div>
                        ))}
                    </>
                )}

            </div>

            <div className="border-t pl-5 pr-5">

                <div className="mb-2 mt-2 flex items-center justify-between">

                    <span className="font-semibold">
                        Tổng tiền
                    </span>

                    <span className="text-lg font-bold text-red-500">
                        {total.toLocaleString()}đ
                    </span>

                </div>

                {newItems.length>0&&(
                    <Button className=" mt-2 w-full !bg-red-500" onClick={handleConfirm}>
                        Xác nhận món mới
                    </Button>
                )}

                {newItems.length===0&&order.status==="CONFIRMED"&&(
                    <Button className="mt-2 w-full !bg-green-500" onClick={handlePreparing}>

                        Bắt đầu chế biến
                    </Button>
                )}

                {order.status==="PREPARING"&&(
                    <Button className="mt-2 w-full !bg-blue-500" onClick={handleServed}>
                        Phục vụ
                    </Button>
                )}

                {canPayment && (
                    <>
                        <Button
                            className="mt-2 w-full bg-green-600 hover:bg-green-700"
                            onClick={()=>setOpenPayment(true)}
                        >
                            💳 Thanh toán
                        </Button>

                        <PaymentModal
                            open={openPayment}
                            onClose={()=>setOpenPayment(false)}
                            order={order}
                            reload={reload}
                            table={table}
                        />
                    </>
                )}

            </div>

        </div>

    );

}