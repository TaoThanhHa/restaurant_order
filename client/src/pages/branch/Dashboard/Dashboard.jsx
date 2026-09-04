import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
    PaperBag,
    HandPlatter,
    ScrollText,
    Soup,
    TrendingUp,
} from "lucide-react";

import styles from "./Dashboard.module.css";

import cashierService from "../../../services/cashier.service";


export default function Dashboard() {
    const [statistics, setStatistics] = useState([]);
    const [loadingStatistics, setLoadingStatistics] =
        useState(true);

    const menus = [

        {
            title: "Quản lý bàn",
            description:
                "Xem trạng thái bàn và tạo đơn tại quán.",
            path: "/branch/tables",
            icon: <HandPlatter size={40} />,
        },

        {
            title: "Quản lý thực đơn",
            description:
                "Quản lý thực đơn tại quán.",
            path: "/branch/foods",
            icon: <Soup size={40} />,
        },

        {
            title: "Đơn mang về",
            description:
                "Tạo và quản lý đơn mang về.",
            path: "/branch/take-away",
            icon: <PaperBag size={40} />,
        },

        {
            title: "Quản lý hóa đơn",
            description:
                "Theo dõi các đơn đang phục vụ.",
            path: "/branch/order-history",
            icon: <ScrollText size={40} />,
        },

    ];

    // LOAD STATISTICS
    
    useEffect(() => {

        const loadStatistics = async () => {

            try {

                setLoadingStatistics(true);

                const res =
                    await cashierService.getStatistics();

                setStatistics(
                    Array.isArray(res.data)
                        ? res.data
                        : []
                );

            } catch (error) {

                console.error(
                    "Lỗi lấy thống kê:",
                    error
                );

                setStatistics([]);

            } finally {

                setLoadingStatistics(false);

            }

        };


        loadStatistics();

    }, []);


     
    // FORMAT MONEY
     

    const formatMoney = (value) => {

        return (
            Number(value || 0)
                .toLocaleString("vi-VN")
            + "đ"
        );

    };


     
    // LẤY GIÁ TRỊ AN TOÀN
     

    const getNumber = (value) => {

        const number = Number(value);

        return Number.isFinite(number)
            ? number
            : 0;

    };


     
    // TỔNG DOANH THU
     
    //
    // Tổng = Tại chỗ + Mang về
    //
    // Không phụ thuộc member / guest.
     

    const totalDineIn =
        statistics.reduce(
            (sum, item) =>
                sum +
                getNumber(item.dineIn),
            0
        );


    const totalTakeAway =
        statistics.reduce(
            (sum, item) =>
                sum +
                getNumber(item.takeAway),
            0
        );


    const totalRevenue =
        totalDineIn +
        totalTakeAway;


     
    // MAX CHO BIỂU ĐỒ KHÁCH HÀNG
     
    //
    // Tìm giá trị lớn nhất trong:
    //
    // member
    // guest
    //
    // của toàn bộ 7 ngày.
    //
    // Sau đó làm tròn lên theo 100.000đ.
     

    const maxCustomerRevenue =
        Math.max(
            ...statistics.map(item =>
                Math.max(
                    getNumber(item.member),
                    getNumber(item.guest)
                )
            ),
            0
        );


    const customerChartMax =
        Math.max(
            Math.ceil(
                maxCustomerRevenue / 100000
            ) * 100000,
            100000
        );


     
    // MAX CHO BIỂU ĐỒ TẠI CHỖ / MANG VỀ
     

    const maxOrderTypeRevenue =
        Math.max(
            ...statistics.map(item =>
                Math.max(
                    getNumber(item.dineIn),
                    getNumber(item.takeAway)
                )
            ),
            0
        );


    const orderTypeChartMax =
        Math.max(
            Math.ceil(
                maxOrderTypeRevenue / 100000
            ) * 100000,
            100000
        );


     
    // CHIA MỐC TRỤC Y
     

    const getChartLevels = (max) => {

        return {

            max,

            seventyFive:
                max * 0.75,

            fifty:
                max * 0.5,

            twentyFive:
                max * 0.25,

            zero: 0,

        };

    };


    const customerLevels =
        getChartLevels(
            customerChartMax
        );


    const orderTypeLevels =
        getChartLevels(
            orderTypeChartMax
        );


     
    // RENDER
     

    return (

        <div className="space-y-6">


             
            {/* HEADER */}
             

            <div>

                <h1 className="text-3xl font-bold text-[var(--color-text)]">
                    Dashboard Cashier
                </h1>

                <p className="mt-2 text-[var(--color-text-muted)]">
                    Chào mừng bạn đến với hệ thống quản lý nhà hàng.
                </p>

            </div>


             
            {/* MENU */}
             

            <div className="grid grid-cols-1 gap-6 bg-[var(--color-background)] md:grid-cols-2 xl:grid-cols-4">

                {menus.map((item) => (

                    <Link
                        key={item.path}
                        to={item.path}
                        className={`
                            rounded-xl
                            bg-white
                            p-6
                            shadow
                            transition-all
                            hover:-translate-y-1
                            hover:bg-[var(--color-secondary)]
                            hover:shadow-lg
                            ${styles.card}
                        `}
                    >

                        <div className="mb-4 flex justify-center text-4xl text-[var(--color-primary)]">

                            {item.icon}

                        </div>


                        <h2 className="text-xl font-semibold text-[var(--color-text)]">

                            {item.title}

                        </h2>


                        <p className="mt-2 text-sm text-[var(--color-text-muted)]">

                            {item.description}

                        </p>

                    </Link>

                ))}

            </div>


             
            {/* THỐNG KÊ */}
             

            <div className="pt-2">


                {/* TITLE */}

                <div className="mb-5 flex items-center gap-2">

                    <TrendingUp
                        size={24}
                        className="text-[#7c5736]"
                    />

                    <h2 className="text-2xl font-bold text-[var(--color-text)]">

                        Thống kê doanh thu

                    </h2>


                    <span className="text-sm text-gray-500">

                        7 ngày gần nhất

                    </span>

                </div>


                 
                {/* LOADING */}
                 

                {loadingStatistics ? (

                    <div className="rounded-2xl bg-white p-10 text-center text-gray-500 shadow">

                        Đang tải thống kê...

                    </div>

                ) : (


                    <>


                         
                        {/* TỔNG QUAN */}
                         

                        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">


                            {/* TỔNG */}

                            <div className="rounded-2xl bg-white p-5 shadow">

                                <p className="text-sm text-gray-500">

                                    Tổng doanh thu

                                </p>


                                <p className="mt-2 text-2xl font-bold text-[#7c5736]">

                                    {formatMoney(
                                        totalRevenue
                                    )}

                                </p>

                            </div>


                            {/* TẠI CHỖ */}

                            <div className="rounded-2xl bg-white p-5 shadow">

                                <p className="text-sm text-gray-500">

                                    Tại chỗ

                                </p>


                                <p className="mt-2 text-2xl font-bold text-blue-500">

                                    {formatMoney(
                                        totalDineIn
                                    )}

                                </p>

                            </div>


                            {/* MANG VỀ */}

                            <div className="rounded-2xl bg-white p-5 shadow">

                                <p className="text-sm text-gray-500">

                                    Mang về

                                </p>


                                <p className="mt-2 text-2xl font-bold text-emerald-500">

                                    {formatMoney(
                                        totalTakeAway
                                    )}

                                </p>

                            </div>

                        </div>


                         
                        {/* 2 BIỂU ĐỒ */}
                         

                        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">


                             
                            {/* BIỂU ĐỒ 1
                                DOANH THU THEO KHÁCH HÀNG
                            */}
                             

                            <div className="rounded-2xl bg-white p-6 shadow">


                                {/* TITLE */}

                                <div className="mb-5 text-center">

                                    <h3 className="font-bold text-[#7c5736]">

                                        Doanh thu theo khách hàng

                                    </h3>


                                    <p className="mt-1 text-sm text-gray-500">

                                        7 ngày gần nhất

                                    </p>

                                </div>


                                 
                                {/* LEGEND */}
                                 

                                <div className="mb-5 flex gap-6 text-sm">


                                    {/* THÀNH VIÊN */}

                                    <div className="flex items-center gap-2">

                                        <span className="h-3 w-3 rounded-full bg-[#7c5736]" />

                                        <span>
                                            Thành viên
                                        </span>

                                    </div>


                                    {/* VÃNG LAI */}

                                    <div className="flex items-center gap-2">

                                        <span className="h-3 w-3 rounded-full bg-gray-300" />

                                        <span>
                                            Vãng lai
                                        </span>

                                    </div>

                                </div>


                                 
                                {/* CHART */}
                                 

                                <div className="flex h-72 gap-4">


                                    {/* ============================= */}
                                    {/* Y AXIS */}
                                    {/* ============================= */}

                                    <div className="flex w-[76px] shrink-0 flex-col justify-between py-2 text-xs text-gray-400">

                                        <span>
                                            {formatMoney(
                                                customerLevels.max
                                            )}
                                        </span>


                                        <span>
                                            {formatMoney(
                                                customerLevels.seventyFive
                                            )}
                                        </span>


                                        <span>
                                            {formatMoney(
                                                customerLevels.fifty
                                            )}
                                        </span>


                                        <span>
                                            {formatMoney(
                                                customerLevels.twentyFive
                                            )}
                                        </span>


                                        <span>
                                            0đ
                                        </span>

                                    </div>


                                    {/* ============================= */}
                                    {/* CỘT */}
                                    {/* ============================= */}

                                    <div className="flex flex-1 items-end gap-3 border-b border-l border-gray-200 px-3">


                                        {statistics.map(item => {


                                            const member =
                                                getNumber(
                                                    item.member
                                                );


                                            const guest =
                                                getNumber(
                                                    item.guest
                                                );


                                            // Dùng chung chartMax cho toàn bộ 7 ngày

                                            const memberHeight =
                                                (
                                                    member /
                                                    customerChartMax
                                                ) * 100;


                                            const guestHeight =
                                                (
                                                    guest /
                                                    customerChartMax
                                                ) * 100;


                                            return (

                                                <div
                                                    key={item.date}
                                                    className="flex h-full flex-1 flex-col justify-end"
                                                >


                                                    {/* ========================= */}
                                                    {/* CỘT */}
                                                    {/* ========================= */}

                                                    <div className="flex h-full items-end justify-center gap-1">


                                                        {/* THÀNH VIÊN */}

                                                        <div
                                                            className="group relative w-2/5 rounded-t bg-[#7c5736]"
                                                            style={{
                                                                height:
                                                                    member > 0
                                                                        ? `${memberHeight}%`
                                                                        : "0",
                                                            }}
                                                        >

                                                            <div className="absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white group-hover:block">

                                                                {formatMoney(
                                                                    member
                                                                )}

                                                            </div>

                                                        </div>


                                                        {/* VÃNG LAI */}

                                                        <div
                                                            className="group relative w-2/5 rounded-t bg-gray-300"
                                                            style={{
                                                                height:
                                                                    guest > 0
                                                                        ? `${guestHeight}%`
                                                                        : "0",
                                                            }}
                                                        >

                                                            <div className="absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white group-hover:block">

                                                                {formatMoney(
                                                                    guest
                                                                )}

                                                            </div>

                                                        </div>

                                                    </div>


                                                    {/* ========================= */}
                                                    {/* NGÀY */}
                                                    {/* ========================= */}

                                                    <div className="mt-2 h-5 text-center text-xs text-gray-500">

                                                        {item.label}

                                                    </div>

                                                </div>

                                            );

                                        })}

                                    </div>

                                </div>

                            </div>


                             
                            {/* BIỂU ĐỒ 2
                                TẠI CHỖ / MANG VỀ
                            */}
                             

                            <div className="rounded-2xl bg-white p-6 shadow">


                                {/* TITLE */}

                                <div className="mb-5 text-center">

                                    <h3 className="font-bold text-[#7c5736]">

                                        So sánh doanh thu tại chỗ, mang về

                                    </h3>


                                    <p className="mt-1 text-sm text-gray-500">

                                        Trong 7 ngày gần nhất

                                    </p>

                                </div>


                                 
                                {/* LEGEND */}
                                 

                                <div className="mb-5 flex gap-6 text-sm">


                                    {/* TẠI CHỖ */}

                                    <div className="flex items-center gap-2">

                                        <span className="h-3 w-3 rounded-full bg-blue-500" />

                                        <span>
                                            Tại chỗ
                                        </span>

                                    </div>


                                    {/* MANG VỀ */}

                                    <div className="flex items-center gap-2">

                                        <span className="h-3 w-3 rounded-full bg-emerald-500" />

                                        <span>
                                            Mang về
                                        </span>

                                    </div>

                                </div>


                                 
                                {/* CHART */}
                                 

                                <div className="flex h-72 gap-4">


                                    {/* ============================= */}
                                    {/* Y AXIS */}
                                    {/* ============================= */}

                                    <div className="flex w-[76px] shrink-0 flex-col justify-between py-2 text-xs text-gray-400">

                                        <span>
                                            {formatMoney(
                                                orderTypeLevels.max
                                            )}
                                        </span>


                                        <span>
                                            {formatMoney(
                                                orderTypeLevels.seventyFive
                                            )}
                                        </span>


                                        <span>
                                            {formatMoney(
                                                orderTypeLevels.fifty
                                            )}
                                        </span>


                                        <span>
                                            {formatMoney(
                                                orderTypeLevels.twentyFive
                                            )}
                                        </span>


                                        <span>
                                            0đ
                                        </span>

                                    </div>


                                    {/* ============================= */}
                                    {/* CỘT */}
                                    {/* ============================= */}

                                    <div className="flex flex-1 items-end gap-3 border-b border-l border-gray-200 px-3">


                                        {statistics.map(item => {


                                            const dineIn =
                                                getNumber(
                                                    item.dineIn
                                                );


                                            const takeAway =
                                                getNumber(
                                                    item.takeAway
                                                );


                                            // Dùng chung chartMax
                                            // cho toàn bộ 7 ngày

                                            const dineInHeight =
                                                (
                                                    dineIn /
                                                    orderTypeChartMax
                                                ) * 100;


                                            const takeAwayHeight =
                                                (
                                                    takeAway /
                                                    orderTypeChartMax
                                                ) * 100;


                                            return (

                                                <div
                                                    key={item.date}
                                                    className="flex h-full flex-1 flex-col justify-end"
                                                >


                                                    {/* ========================= */}
                                                    {/* CỘT */}
                                                    {/* ========================= */}

                                                    <div className="flex h-full items-end justify-center gap-1">


                                                        {/* TẠI CHỖ */}

                                                        <div
                                                            className="group relative w-2/5 rounded-t bg-blue-500"
                                                            style={{
                                                                height:
                                                                    dineIn > 0
                                                                        ? `${dineInHeight}%`
                                                                        : "0",
                                                            }}
                                                        >

                                                            <div className="absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white group-hover:block">

                                                                {formatMoney(
                                                                    dineIn
                                                                )}

                                                            </div>

                                                        </div>


                                                        {/* MANG VỀ */}

                                                        <div
                                                            className="group relative w-2/5 rounded-t bg-emerald-500"
                                                            style={{
                                                                height:
                                                                    takeAway > 0
                                                                        ? `${takeAwayHeight}%`
                                                                        : "0",
                                                            }}
                                                        >

                                                            <div className="absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white group-hover:block">

                                                                {formatMoney(
                                                                    takeAway
                                                                )}

                                                            </div>

                                                        </div>

                                                    </div>


                                                    {/* ========================= */}
                                                    {/* NGÀY */}
                                                    {/* ========================= */}

                                                    <div className="mt-2 h-5 text-center text-xs text-gray-500">

                                                        {item.label}

                                                    </div>

                                                </div>

                                            );

                                        })}

                                    </div>

                                </div>

                            </div>

                        </div>

                    </>

                )}

            </div>

        </div>

    );

}