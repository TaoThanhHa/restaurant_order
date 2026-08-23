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

    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">

            <div className="relative h-[85vh] w-full max-w-lg overflow-hidden rounded-xl bg-white">

                {/* CLOSE */}

                <button
                    onClick={onClose}
                    className="
                        absolute
                        right-3
                        top-3
                        z-10
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-full
                        bg-gray-100
                        text-xl
                        text-gray-600
                        hover:bg-gray-200
                    "
                >
                    ×
                </button>

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