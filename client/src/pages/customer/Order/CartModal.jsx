import { useEffect, useRef } from "react";

import InvoicePanelOrder from "../../cashier/Tables/TableDetail/InvoicePanelOrder";

export default function CartModal({
    open,
    onClose,
    cart,
    setCart,
    order,
    reload,
    qrCode,
    table,
}) {
    const loadedRef = useRef(false);

    const storageKey = qrCode
        ? `customer_cart_${qrCode}`
        : null;

    useEffect(() => {
        if (!qrCode || loadedRef.current) return;

        loadedRef.current = true;

        try {
            const savedCart = localStorage.getItem(storageKey);

            if (savedCart) {
                const parsedCart = JSON.parse(savedCart);

                if (Array.isArray(parsedCart)) {
                    setCart(parsedCart);
                }
            }
        } catch (error) {
            console.error("Không thể đọc cart:", error);
        }
    }, [qrCode, storageKey, setCart]);

    useEffect(() => {
        if (!qrCode || !loadedRef.current) return;

        try {
            if (cart?.length > 0) {
                localStorage.setItem(
                    storageKey,
                    JSON.stringify(cart)
                );
            } else {
                localStorage.removeItem(storageKey);
            }
        } catch (error) {
            console.error("Không thể lưu cart:", error);
        }
    }, [cart, qrCode, storageKey]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="relative h-[85vh] w-full max-w-lg overflow-hidden rounded-xl bg-white">
                <InvoicePanelOrder
                    mode="customer"
                    qrCode={qrCode}
                    cart={cart}
                    setCart={setCart}
                    order={order}
                    reload={reload}
                    table={table}
                    onBack={onClose}
                />
            </div>
        </div>
    );
}