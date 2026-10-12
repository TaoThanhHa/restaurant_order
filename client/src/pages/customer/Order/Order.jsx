import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import customerService from "../../../services/customer.service";

import HomeHeader from "../../../components/Customer/HomeHeader";
import FoodPanel from "../../cashier/Tables/TableDetail/FoodPanel";
import CartModal from "./CartModal";

export default function OrderPage() {
    const { qrCode } = useParams();

    const [profile, setProfile] = useState(null);
    const [table, setTable] = useState(null);

    const [cart, setCart] = useState(() => {
        try {
            if (!qrCode) return [];

            const key = `customer_cart_${qrCode}`;
            const saved = localStorage.getItem(key);

            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error("LOAD LOCAL CART:", error);
            return [];
        }
    });

    const [openCart, setOpenCart] = useState(false);

    useEffect(() => {
        if (!qrCode) return;

        try {
            const key = `customer_cart_${qrCode}`;

            if (cart.length > 0) {
                localStorage.setItem(
                    key,
                    JSON.stringify(cart)
                );
            } else {
                localStorage.removeItem(key);
            }
        } catch (error) {
            console.error("SAVE LOCAL CART:", error);
        }
    }, [cart, qrCode]);

    const loadData = async () => {
        try {
            const [profileRes, tableRes] = await Promise.all([
                customerService.profile(),
                customerService.getTable(qrCode),
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

    const reload = async () => {
        try {
            const [profileRes, tableRes] = await Promise.all([
                customerService.profile(),
                customerService.getTable(qrCode),
            ]);

            setProfile(profileRes.data);
            setTable(tableRes.data);
        } catch (err) {
            console.error(
                "RELOAD CUSTOMER:",
                err.response?.data || err
            );
        }
    };

    if (!profile || !table) {
        return null;
    }

    const activeOrders = (
        table.diningSessions?.flatMap(
            session => session.orders || []
        ) || []
    ).filter(order =>
        [
            "PREPARING",
            "SERVED",
        ].includes(order.status)
    );

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
                onOpenCart={() => setOpenCart(true)}
                showBack={false}
            />

            <CartModal
                open={openCart}
                onClose={() => setOpenCart(false)}
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