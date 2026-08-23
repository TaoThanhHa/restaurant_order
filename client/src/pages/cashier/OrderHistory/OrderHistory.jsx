import { useEffect, useMemo, useState } from "react";
import { Eye, X} from "lucide-react";
import orderService from "../../../services/order.service";

export default function OrderHistory() {

    const [orders, setOrders] = useState([]);
    const [dateFilter, setDateFilter] = useState("TODAY");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const today = new Date();
    const [selectedDate, setSelectedDate] = useState(
        today.toISOString().split("T")[0]
    );

    const [selectedMonth, setSelectedMonth] = useState(
        `${today.getFullYear()}-${String(
            today.getMonth() + 1
        ).padStart(2, "0")}`
    );

    const [selectedYear, setSelectedYear] = useState(
        today.getFullYear()
    );

    const [selectedQuarter, setSelectedQuarter] = useState(
        Math.floor(today.getMonth() / 3) + 1
    );

    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const [orderCode, setOrderCode] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [orderType, setOrderType] = useState("ALL");

    useEffect(() => {

        loadData();

    }, []);

    const loadData = async () => {

        try {

            const res = await orderService.getHistory();

            setOrders(
                Array.isArray(res.data.data)
                    ? res.data.data
                    : []
            );

        } catch (err) {

            alert(
                err.response?.data?.message ||
                err.message
            );

        }

    };
const handleViewDetail = async (orderId) => {
    try {
        setLoadingDetail(true);

        const res = await orderService.getById(orderId);

        console.log("=== ORDER DETAIL ===");
        console.log(res.data.data);

        setSelectedOrder(res.data.data);

    } catch (err) {
        console.error(err);

        alert(
            err.response?.data?.message ||
            err.message
        );
    } finally {
        setLoadingDetail(false);
    }
};
        const getWeekRange = (date) => {

        const selected = new Date(date);

        const day = selected.getDay();

        const diff = day === 0 ? -6 : 1 - day;

        const start = new Date(selected);

        start.setDate(selected.getDate() + diff);
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);

        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);

        return { start, end };

    };
    const formatMoney = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "0đ";
    }

    return `${number.toLocaleString("vi-VN")}đ`;
};

const getItemPrice = (item) => {
    return Number(
        item.price ??
        item.unitPrice ??
        item.food?.price ??
        0
    );
};

const getItemTotal = (item) => {
    return (
        getItemPrice(item) *
        Number(item.quantity || 0)
    );
};

const getOrderTotal = (order) => {
    if (order.totalAmount != null) {
        return Number(order.totalAmount);
    }

    return (order.orderItems || [])
        .filter(item => item.status !== "CANCELLED")
        .reduce(
            (total, item) =>
                total + getItemTotal(item),
            0
        );
};

    const filterOrders = useMemo(() => {

        return orders.filter(order => {

            const matchCode =
    String(order.orderCode || "")
        .toLowerCase()
        .includes(orderCode.toLowerCase());

const matchCustomer =
    String(
        order.customerName ||
        order.customer?.name ||
        ""
    )
        .toLowerCase()
        .includes(customerName.toLowerCase());
            const matchType =
                orderType === "ALL" ||
                order.orderType === orderType;

            const createdAt = new Date(order.createdAt);

            let matchDate = true;

            switch (dateFilter) {

                case "TODAY": {

                    const selected = new Date(selectedDate);

                    matchDate =
                        createdAt.toDateString() ===
                        selected.toDateString();

                    break;

                }

                case "WEEK": {

                const selected = new Date(selectedDate);

                // Thứ trong tuần (CN = 0, T2 = 1, ..., T7 = 6)
                const day = selected.getDay();

                // Tính về Thứ 2
                const diff = day === 0 ? -6 : 1 - day;

                const start = new Date(selected);

                start.setDate(selected.getDate() + diff);
                start.setHours(0, 0, 0, 0);

                const end = new Date(start);

                end.setDate(start.getDate() + 6);
                end.setHours(23, 59, 59, 999);

                matchDate =
                    createdAt >= start &&
                    createdAt <= end;

                break;
            }

                case "MONTH": {

                    const [year, month] =
                        selectedMonth.split("-");

                    matchDate =
                        createdAt.getFullYear() ===
                            Number(year) &&
                        createdAt.getMonth() + 1 ===
                            Number(month);

                    break;

                }

                case "QUARTER": {

                    const quarter =
                        Math.floor(
                            createdAt.getMonth() / 3
                        ) + 1;

                    matchDate =
                        quarter === selectedQuarter &&
                        createdAt.getFullYear() ===
                            selectedYear;

                    break;

                }

                case "YEAR":

                    matchDate =
                        createdAt.getFullYear() ===
                        selectedYear;

                    break;

                case "CUSTOM": {

                    const matchFrom =
                        !fromDate ||
                        createdAt >=
                            new Date(fromDate);

                    const matchTo =
                        !toDate ||
                        createdAt <=
                            new Date(
                                toDate +
                                "T23:59:59"
                            );

                    matchDate =
                        matchFrom &&
                        matchTo;

                    break;

                }

            }

            return (
                matchCode &&
                matchCustomer &&
                matchType &&
                matchDate
            );

        });

    }, [
        orders,
        orderCode,
        customerName,
        orderType,

        dateFilter,

        selectedDate,
        selectedMonth,
        selectedQuarter,
        selectedYear,

        fromDate,
        toDate
    ]);

    return (

        <div className="space-y-5">

            <h1 className="text-2xl font-bold">
                Quản lý đơn hàng 
            </h1>
            <h4>Tổng đơn: ({filterOrders.length})</h4>

            {/* Filter */}

            <div className="grid grid-cols-3 gap-5">

                <div>
                    <label className="mb-1 block text-sm font-medium">
                        Thời gian
                    </label>

                    <select
                        value={dateFilter}
                        onChange={(e) =>
                            setDateFilter(e.target.value)
                        }
                        className="w-full rounded-lg border p-2"
                    >
                        <option value="TODAY">Ngày</option>
                        <option value="WEEK">Tuần</option>
                        <option value="MONTH">Tháng</option>
                        <option value="QUARTER">Quý</option>
                        <option value="YEAR">Năm</option>
                        <option value="CUSTOM">Tùy chọn</option>
                    </select>
                </div>

                {(dateFilter === "TODAY" ||
                    dateFilter === "WEEK") && (

                    <div>

                        <label className="mb-1 block text-sm font-medium">
                            Chọn ngày
                        </label>

                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) =>
                                setSelectedDate(e.target.value)
                            }
                            className="w-full rounded-lg border p-2"
                        />

                    </div>

                )}

                {dateFilter === "WEEK" && (
                    <p className="mt-2 pt-6 text-m text-gray-500">
                        Tuần:
                        {" "}
                        {getWeekRange(selectedDate).start.toLocaleDateString("vi-VN")}
                        {" - "}
                        {getWeekRange(selectedDate).end.toLocaleDateString("vi-VN")}
                    </p>
                )}

                {dateFilter === "MONTH" && (

                    <div>

                        <label className="mb-1 block text-sm font-medium">
                            Chọn tháng
                        </label>

                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) =>
                                setSelectedMonth(e.target.value)
                            }
                            className="w-full rounded-lg border p-2"
                        />

                    </div>

                )}

                {dateFilter === "QUARTER" && (

                    <>

                        <div>

                            <label className="mb-1 block text-sm font-medium">
                                Quý
                            </label>

                            <select
                                value={selectedQuarter}
                                onChange={(e) =>
                                    setSelectedQuarter(
                                        Number(e.target.value)
                                    )
                                }
                                className="w-full rounded-lg border p-2"
                            >
                                <option value={1}>Quý I</option>
                                <option value={2}>Quý II</option>
                                <option value={3}>Quý III</option>
                                <option value={4}>Quý IV</option>
                            </select>

                        </div>

                        <div>

                            <label className="mb-1 block text-sm font-medium">
                                Năm
                            </label>

                            <input
                                type="number"
                                value={selectedYear}
                                onChange={(e) =>
                                    setSelectedYear(
                                        Number(e.target.value)
                                    )
                                }
                                className="w-full rounded-lg border p-2"
                            />

                        </div>

                    </>

                )}

                {dateFilter === "YEAR" && (

                    <div>

                        <label className="mb-1 block text-sm font-medium">
                            Năm
                        </label>

                        <input
                            type="number"
                            value={selectedYear}
                            onChange={(e) =>
                                setSelectedYear(
                                    Number(e.target.value)
                                )
                            }
                            className="w-full rounded-lg border p-2"
                        />

                    </div>

                )}

                {dateFilter === "CUSTOM" && (

                    <>

                        <div>

                            <label className="mb-1 block text-sm font-medium">
                                Từ ngày
                            </label>

                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) =>
                                    setFromDate(e.target.value)
                                }
                                className="w-full rounded-lg border p-2"
                            />

                        </div>

                        <div>

                            <label className="mb-1 block text-sm font-medium">
                                Đến ngày
                            </label>

                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) =>
                                    setToDate(e.target.value)
                                }
                                className="w-full rounded-lg border p-2"
                            />

                        </div>

                    </>

                )}

            </div>

            {/* Table */}

            <div className="overflow-hidden rounded-xl border bg-white">

                <table className="w-full">

                    <thead>

                        <tr className="bg-gray-100">

                            <th className="p-3 text-left">
                                Mã đơn
                            </th>

                            <th className="p-3 text-left">
                                Loại đơn
                            </th>

                            <th className="p-3 text-center">
                                Tổng món
                            </th>

                            <th className="p-3 text-right">
                                Tổng tiền
                            </th>

                            <th className="p-3 text-center">
                                Chi tiết
                            </th>

                        </tr>

                        {/* Filter row */}

                        <tr className="border-t bg-gray-50">

                            <th className="p-2">

                                <input
                                    value={orderCode}
                                    onChange={e =>
                                        setOrderCode(e.target.value)
                                    }
                                    placeholder="Tìm..."
                                    className="w-full rounded border px-2 py-1"
                                />

                            </th>

                            <th className="p-2">

                                <select
                                    value={orderType}
                                    onChange={e =>
                                        setOrderType(e.target.value)
                                    }
                                    className="w-full rounded border px-2 py-1"
                                >

                                    <option value="ALL">
                                        Tất cả
                                    </option>

                                    <option value="DINE_IN">
                                        Tại bàn
                                    </option>

                                    <option value="TAKE_AWAY">
                                        Mang về
                                    </option>

                                </select>

                            </th>

                            <th></th>

                            <th></th>

                            <th></th>

                        </tr>

                    </thead>

                    <tbody>

                        {filterOrders.length === 0 && (

                            <tr>

                                <td
                                    colSpan={6}
                                    className="p-8 text-center text-gray-400"
                                >
                                    Không có dữ liệu
                                </td>

                            </tr>

                        )}

                        {filterOrders.map(order => (

                            <tr
                                key={order.id}
                                className="border-t hover:bg-gray-50"
                            >

                                <td className="p-3">
                                    {order.orderCode}
                                </td>

                                <td className="p-3">

                                    {order.orderType === "DINE_IN"
                                        ? "🍽️ Tại bàn"
                                        : "🥡 Mang về"}

                                </td>

                                <td className="p-3 text-center">
                                    {order.totalItems}
                                </td>

                                <td className="p-3 text-right font-semibold text-red-500">
                                    {formatMoney(getOrderTotal(order))}
                                </td>

                                <td className="p-3 text-center">

                                    <button
                                        onClick={() => handleViewDetail(order.id)}
                                        className="inline-flex items-center gap-1 rounded-lg bg-blue-500 px-3 py-1.5 text-sm text-white hover:bg-blue-600"
                                    >
                                        <Eye size={16} />
                                        Xem
                                    </button>

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>
            {selectedOrder && (

                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={() => setSelectedOrder(null)}
                >

                    <div
                        className="w-full max-w-2xl rounded-2xl bg-white shadow-xl"
                        onClick={e => e.stopPropagation()}
                    >

                        {/* HEADER */}

                        <div className="flex items-center justify-between border-b p-5">

                            <div>

                                <h2 className="text-xl font-bold">
                                    Chi tiết hóa đơn
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    {selectedOrder.orderCode}
                                </p>

                            </div>

                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="rounded-lg p-2 hover:bg-gray-100"
                            >
                                <X size={20} />
                            </button>

                        </div>


                        {/* CONTENT */}

                        <div className="max-h-[70vh] overflow-y-auto p-5">

                            {/* THÔNG TIN */}

                            <div className="grid grid-cols-2 gap-4 rounded-xl bg-gray-50 p-4">

                                <div>
                                    <p className="text-sm text-gray-500">
                                        Khách hàng
                                    </p>

                                    <p className="font-medium">
                                        {selectedOrder.customer?.name ||
                                            "Khách lẻ"}
                                    </p>
                                </div>


                                <div>
                                    <p className="text-sm text-gray-500">
                                        Loại đơn
                                    </p>

                                    <p className="font-medium">
                                        {selectedOrder.orderType === "DINE_IN"
                                            ? "🍽️ Tại bàn"
                                            : "🥡 Mang về"}
                                    </p>
                                </div>


                                {selectedOrder.session?.table && (

                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Bàn
                                        </p>

                                        <p className="font-medium">
                                            {selectedOrder.session.table.tableNumber}
                                        </p>
                                    </div>

                                )}


                                <div>
                                    <p className="text-sm text-gray-500">
                                        Thời gian
                                    </p>

                                    <p className="font-medium">
                                        {new Date(
                                            selectedOrder.createdAt
                                        ).toLocaleString("vi-VN")}
                                    </p>
                                </div>

                            </div>


                            {/* DANH SÁCH MÓN */}

                            <div className="mt-5">

                                <h3 className="mb-3 font-semibold">
                                    Danh sách món
                                </h3>

                                <div className="overflow-hidden rounded-xl border">

                                    <table className="w-full">

                                        <thead>

                                            <tr className="bg-gray-100 text-sm">

                                                <th className="p-3 text-left">
                                                    Món
                                                </th>

                                                <th className="p-3 text-center">
                                                    SL
                                                </th>

                                                <th className="p-3 text-right">
                                                    Đơn giá
                                                </th>

                                                <th className="p-3 text-right">
                                                    Thành tiền
                                                </th>

                                            </tr>

                                        </thead>

                                        <tbody>

                                            {selectedOrder.orderItems
                                                ?.filter(
                                                    item =>
                                                        item.status !== "CANCELLED"
                                                )
                                                .map(item => (

                                                    <tr
                                                        key={item.id}
                                                        className="border-t"
                                                    >

                                                        <td className="p-3">

                                                            <div className="font-medium">
                                                                {item.food?.name}
                                                            </div>

                                                            {item.note && (

                                                                <div className="text-xs text-gray-500">
                                                                    Ghi chú: {item.note}
                                                                </div>

                                                            )}

                                                        </td>

                                                        <td className="p-3 text-center">
                                                            {item.quantity}
                                                        </td>

                                                        <td className="p-3 text-right">
                                                            {Number(
                                                                item.price
                                                            ).toLocaleString()}đ
                                                        </td>

                                                        <td className="p-3 text-right font-medium">
                                                            {(
                                                                Number(item.price) *
                                                                item.quantity
                                                            ).toLocaleString()}đ
                                                        </td>

                                                    </tr>

                                                ))}

                                        </tbody>

                                    </table>

                                </div>

                            </div>


                            {/* THANH TOÁN */}

                            <div className="mt-5 border-t pt-4">

                                <div className="flex justify-between">

                                    <span className="text-gray-500">
                                        Phương thức thanh toán
                                    </span>

                                    <span className="font-medium">
                                        {selectedOrder.payment?.paymentMethod === "CASH"
                                            ? "💵 Tiền mặt"
                                            : "🏦 Chuyển khoản"}
                                    </span>

                                </div>


                                <div className="mt-3 flex justify-between text-lg">

                                    <span className="font-semibold">
                                        Tổng cộng
                                    </span>

                                    <span className="font-bold text-red-500">
                                        {Number(
                                            selectedOrder.totalAmount
                                        ).toLocaleString()}đ
                                    </span>

                                </div>


                                {selectedOrder.payment?.paidAt && (

                                    <div className="mt-2 text-right text-sm text-gray-500">
                                        Thanh toán lúc:{" "}
                                        {new Date(
                                            selectedOrder.payment.paidAt
                                        ).toLocaleString("vi-VN")}
                                    </div>

                                )}

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}