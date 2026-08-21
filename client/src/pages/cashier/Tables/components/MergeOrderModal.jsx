import { useEffect, useState } from "react";

import Button from "../../../../components/Button/Button";
import orderService from "../../../../services/order.service";

export default function MergeOrderModal({
    open,
    onClose,
    orders = [],
    reload,
    onSelectOrder
}) {

    const [targetOrderId, setTargetOrderId] = useState("");
    const [sourceOrderIds, setSourceOrderIds] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {

        if (!open) return;

        setTargetOrderId(
            orders[0]?.id || ""
        );

        setSourceOrderIds([]);

    }, [open, orders]);

    if (!open) return null;

    const handleTargetChange = id => {

        setTargetOrderId(Number(id));

        setSourceOrderIds(prev =>
            prev.filter(
                orderId => orderId !== Number(id)
            )
        );

    };

    const handleSourceChange = id => {

        id = Number(id);

        setSourceOrderIds(prev => {

            if (prev.includes(id)) {

                return prev.filter(
                    orderId => orderId !== id
                );

            }

            return [
                ...prev,
                id
            ];

        });

    };

    const handleMerge = async () => {

        if (!targetOrderId) {
            alert("Vui lòng chọn đơn chính");
            return;
        }

        if (sourceOrderIds.length === 0) {
            alert("Vui lòng chọn ít nhất một đơn để gộp");
            return;
        }

        if (!window.confirm("Bạn có chắc muốn gộp các đơn đã chọn?")) {
            return;
        }

        try {

            setLoading(true);

            await orderService.mergeOrders({
                targetOrderId,
                sourceOrderIds
            });

            // Đóng modal trước
            onClose();

            // Reload lại bàn và chọn đơn chính
            await reload(targetOrderId);

        } catch (err) {

            alert(
                err.response?.data?.message ||
                err.message
            );

        } finally {

            setLoading(false);

        }
    };

    return (

        <div className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/40
            p-4
        ">

            <div className="
                w-full
                max-w-lg
                rounded-xl
                bg-white
                shadow-xl
            ">

                <div className="
                    flex
                    items-center
                    justify-between
                    border-b
                    p-5
                ">

                    <div>

                        <h2 className="text-lg font-bold">
                            Gộp đơn
                        </h2>

                        <p className="text-sm text-gray-500">
                            Chọn đơn chính và các đơn cần gộp
                        </p>

                    </div>

                    <button
                        onClick={onClose}
                        className="
                            text-xl
                            text-gray-400
                            hover:text-gray-700
                        "
                    >
                        ✕
                    </button>

                </div>

                <div className="p-5">

                    <h3 className="mb-3 font-semibold">
                        Đơn chính
                    </h3>

                    <div className="space-y-2">

                        {orders.map(order => (

                            <label
                                key={order.id}
                                className={`
                                    flex
                                    cursor-pointer
                                    items-center
                                    justify-between
                                    rounded-lg
                                    border
                                    p-3
                                    ${
                                        Number(targetOrderId) === order.id
                                            ? "border-blue-500 bg-blue-50"
                                            : ""
                                    }
                                `}
                            >

                                <div className="flex items-center gap-3">

                                    <input
                                        type="radio"
                                        name="targetOrder"
                                        checked={
                                            Number(targetOrderId) === order.id
                                        }
                                        onChange={() =>
                                            handleTargetChange(order.id)
                                        }
                                    />

                                    <div>

                                        <div className="font-semibold">
                                            {order.orderCode ||
                                                `Đơn #${order.id}`}
                                        </div>

                                        <div className="text-sm text-gray-500">
                                            {order.orderItems?.length || 0} món
                                        </div>

                                    </div>

                                </div>

                            </label>

                        ))}

                    </div>

                    <div className="my-5 border-t" />

                    <h3 className="mb-3 font-semibold">
                        Các đơn cần gộp
                    </h3>

                    <div className="space-y-2">

                        {orders
                            .filter(
                                order =>
                                    order.id !== Number(targetOrderId)
                            )
                            .map(order => (

                                <label
                                    key={order.id}
                                    className="
                                        flex
                                        cursor-pointer
                                        items-center
                                        justify-between
                                        rounded-lg
                                        border
                                        p-3
                                    "
                                >

                                    <div className="flex items-center gap-3">

                                        <input
                                            type="checkbox"
                                            checked={
                                                sourceOrderIds.includes(
                                                    order.id
                                                )
                                            }
                                            onChange={() =>
                                                handleSourceChange(order.id)
                                            }
                                        />

                                        <div>

                                            <div className="font-semibold">
                                                {order.orderCode ||
                                                    `Đơn #${order.id}`}
                                            </div>

                                            <div className="text-sm text-gray-500">
                                                {order.orderItems?.length || 0} món
                                            </div>

                                        </div>

                                    </div>

                                </label>

                            ))}

                    </div>

                </div>

                <div className="
                    flex
                    justify-end
                    gap-3
                    border-t
                    p-5
                ">

                    <Button
                        onClick={onClose}
                    >
                        Hủy
                    </Button>

                    <Button
                        onClick={handleMerge}
                        disabled={
                            loading ||
                            sourceOrderIds.length === 0
                        }
                    >
                        {loading
                            ? "Đang gộp..."
                            : "Gộp đơn"
                        }
                    </Button>

                </div>

            </div>

        </div>

    );

}