import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import customerAuthService from "../../../services/customerAuth.service";

import HomeHeader from "../../../components/Customer/HomeHeader";
import FoodPanel from "../../cashier/Tables/TableDetail/FoodPanel";
import CartModal from "./CartModal";

export default function OrderPage() {

    const { qrCode } = useParams();

    const [profile, setProfile] = useState(null);
    const [table, setTable] = useState(null);

    const [cart, setCart] = useState([]);
    const [openCart, setOpenCart] = useState(false);

    // ========================================
    // LOAD CUSTOMER + TABLE
    // ========================================

    const loadData = async () => {

        try {

            const [profileRes, tableRes] =
                await Promise.all([
                    customerAuthService.profile(),
                    customerAuthService.getTable(qrCode),
                ]);

            setProfile(profileRes.data);
            setTable(tableRes.data);

        } catch (err) {

            console.error(
                "LOAD CUSTOMER ORDER:",
                err.response?.data || err
            );

        }

    };

    useEffect(() => {

        if (qrCode) {
            loadData();
        }

    }, [qrCode]);

    // ========================================
    // RELOAD PROFILE
    // ========================================

    const reload = async () => {

        try {

            const res =
                await customerAuthService.profile();

            setProfile(res.data);

        } catch (err) {

            console.error(
                "RELOAD PROFILE:",
                err.response?.data || err
            );

        }

    };

    // ========================================
    // LOADING
    // ========================================

    if (!profile || !table) {
        return null;
    }

    // ========================================
    // TÌM ORDER MÀ CUSTOMER ĐANG THAM GIA
    // ========================================

    const myOrders =
        (profile.orderMembers || [])
            .map(member => member.order)
            .filter(Boolean);

    // Chỉ lấy order còn hoạt động
    const activeOrders = (
        table.diningSessions?.flatMap(
            session => session.orders || []
        ) || []
    ).filter(order =>
        [
            "PENDING",
            "CONFIRMED",
            "PREPARING",
            "SERVED",
        ].includes(order.status)
    );

    // Customer có thể đã tham gia nhiều order
    // => lấy order active mới nhất
    const order =
        activeOrders.length > 0
            ? activeOrders[activeOrders.length - 1]
            : null;

    return (
        <>
            <HomeHeader
                profile={profile}
                table={table}
            />

            <FoodPanel
                mode="customer"
                qrCode={qrCode}
                title="Đặt món"
                cart={cart}
                setCart={setCart}
                onOpenCart={() =>
                    setOpenCart(true)
                }
                showBack={false}
            />

            <CartModal
                open={openCart}
                onClose={() =>
                    setOpenCart(false)
                }
                cart={cart}
                setCart={setCart}
                order={order}
                reload={reload}
                qrCode={qrCode}
                table={table}
            />
        </>
    );
}