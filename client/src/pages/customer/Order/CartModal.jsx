import InvoicePanelOrder from "../../cashier/Tables/TableDetail/InvoicePanelOrder";

export default function CartModal({

    open,
    onClose,
    cart,
    setCart,
    order,
    reload,
    qrCode,

}) {

    if (!open) return null;

    return (

        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">

            <div className="h-[85vh] w-full max-w-lg overflow-hidden rounded-xl bg-white">

                <InvoicePanelOrder
                    mode="customer"
                    qrCode={qrCode}
                    cart={cart}
                    setCart={setCart}
                    order={order}
                    reload={reload}
                    onBack={onClose}
                />

            </div>

        </div>

    );

}