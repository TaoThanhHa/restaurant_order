import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UtensilsCrossed, BellRing } from "lucide-react";

import customerAuthService from "../../../services/customerAuth.service";

import HomeHeader from "../../../components/Customer/HomeHeader";
import ActionCard from "../../../components/Customer/ActionCard";
import CurrentOrderCard from "../../../components/Customer/CurrentOrderCard";

export default function Home() {

    const navigate = useNavigate();

    // QR của bàn hiện tại từ URL
    const { qrCode } = useParams();

    const [profile, setProfile] = useState(null);
    const [table, setTable] = useState(null);
    const [loading, setLoading] = useState(true);
    

    //////////////////////////////////////////////////
    // LOAD PROFILE + TABLE
    //////////////////////////////////////////////////

    useEffect(() => {

        const loadData = async () => {

            try {

                if (!qrCode) {
                    throw new Error(
                        "Không xác định được mã QR của bàn."
                    );
                }

                // -----------------------------------------
                // LẤY PROFILE
                // -----------------------------------------

                const profileRes =
                    await customerAuthService.profile();

                setProfile(profileRes.data);


                // -----------------------------------------
                // LẤY BÀN THEO QR HIỆN TẠI
                // -----------------------------------------

                const tableRes =
                    await customerAuthService.getTable(qrCode);

                setTable(tableRes.data);

            } catch (err) {

                console.error(
                    "Không lấy được thông tin:",
                    err
                );

            } finally {

                setLoading(false);

            }

        };

        loadData();

    }, [qrCode]);


    //////////////////////////////////////////////////
    // LOADING
    //////////////////////////////////////////////////

    if (loading) {

        return (
            <div className="flex h-screen items-center justify-center">

                <div className="text-gray-500">
                    Đang tải...
                </div>

            </div>
        );

    }


    //////////////////////////////////////////////////
    // KHÔNG CÓ PROFILE / TABLE
    //////////////////////////////////////////////////

    if (!profile || !table) {

        return (
            <div className="flex h-screen items-center justify-center">

                <div className="text-gray-500">
                    Không thể xác định bàn hiện tại.
                </div>

            </div>
        );

    }


    //////////////////////////////////////////////////
    // TÌM ĐƠN HIỆN TẠI CỦA BÀN
    //////////////////////////////////////////////////

    const ACTIVE_ORDER_STATUSES = [
        "PENDING",
        "CONFIRMED",
        "PREPARING",
        "SERVED",
    ];

    const currentOrder = profile.orderMembers
        ?.map(member => member.order)
        ?.filter(order =>
            ACTIVE_ORDER_STATUSES.includes(order?.status)
        )
        ?.sort(
            (a, b) =>
                new Date(b.createdAt) -
                new Date(a.createdAt)
        )[0];
        


    //////////////////////////////////////////////////
    // RENDER
    //////////////////////////////////////////////////

    return (

        <div className="min-h-screen bg-slate-100 pb-24">

            <HomeHeader
                profile={profile}
                table={table}
            />


            <div className="space-y-5 p-5">

                {/* ĐẶT MÓN */}

                <ActionCard
                    icon={
                        <UtensilsCrossed size={42} />
                    }
                    title="ĐẶT MÓN"
                    description="Xem menu và gọi thêm món"
                    button="Đặt món ngay"
                    color="bg-blue-500"
                    onClick={() =>
                        navigate(
                            `/customer/order/${table.qrCode}`
                        )
                    }
                />


                {/* GỌI NHÂN VIÊN */}

                <ActionCard
                    icon={
                        <BellRing size={42} />
                    }
                    title="GỌI NHÂN VIÊN"
                    description="Nhân viên sẽ tới hỗ trợ bạn"
                    button="Gọi nhân viên"
                    color="bg-orange-500"
                />


                {/* ĐƠN HIỆN TẠI */}

                <CurrentOrderCard
                    order={currentOrder}
                />

            </div>

        </div>

    );
}