import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import customerAuthService from "../../../services/customerAuth.service";
import cartService from "../../../services/cart.service";

import HomeHeader from "../../../components/Customer/HomeHeader";
import FoodPanel from "../../cashier/Tables/TableDetail/FoodPanel";
import CartModal from "./CartModal";

export default function OrderPage() {
    const { qrCode } = useParams();

    const [profile, setProfile] = useState(null);
    const [table, setTable] = useState(null);
    const [cart, setCart] = useState([]);
    const [openCart, setOpenCart] = useState(false);

    const formatCart = items => {
        return (items || []).map(item => ({
            id: item.food.id,
            cartItemId: item.id,
            foodId: item.food.id,
            name: item.food.name,
            image: item.food.image
                ? `${import.meta.env.VITE_API_URL.replace("/api", "")}${item.food.image}`
                : "https://placehold.co/400x400?text=Food",
            price: Number(item.food.price),
            quantity: item.quantity,
            note: item.note || "",
        }));
    };

    const loadCart = async () => {
        const guestToken = localStorage.getItem("guestToken");

        if (!guestToken) {
            setCart([]);
            return;
        }

        try {
            const res = await cartService.get(guestToken);
            const cartData = res?.data || res;

            setCart(formatCart(cartData?.items));
        } catch (err) {
            console.error(
                "LOAD CART:",
                err.response?.data || err
            );
        }
    };

    const loadData = async () => {
        try {
            const [profileRes, tableRes] = await Promise.all([
                customerAuthService.profile(),
                customerAuthService.getTable(qrCode),
            ]);

            setProfile(profileRes.data);
            setTable(tableRes.data);

            await loadCart();
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
            const res = await customerAuthService.profile();
            setProfile(res.data);
        } catch (err) {
            console.error(
                "RELOAD PROFILE:",
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
            "PENDING",
            "CONFIRMED",
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