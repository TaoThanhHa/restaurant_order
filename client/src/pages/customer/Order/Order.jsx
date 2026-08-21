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

    useEffect(() => {

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
                    err.response?.data || err
                );

            }

        };

        if (qrCode) {
            loadData();
        }

    }, [qrCode]);

    if (!profile || !table) {
        return null;
    }

    const order =
        profile.orderMembers?.[0]?.order;

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
                reload={async () => {

                    const res =
                        await customerAuthService.profile();

                    setProfile(res.data);

                }}
                qrCode={qrCode}
                table={table}
            />
        </>
    );
}