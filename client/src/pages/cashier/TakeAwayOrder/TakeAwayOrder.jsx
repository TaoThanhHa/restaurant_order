import { useState } from "react";

import FoodPanel from "../Tables/TableDetail/FoodPanel";
import InvoicePanelTakeAway from "./InvoicePanelTakeAway";

export default function TakeAwayOrder() {

    const [cart, setCart] = useState([]);

    return (

        <div className="grid h-[calc(100vh-85px)] grid-cols-12 gap-2 bg-[#FEF8F2]">

            {/* Menu */}

            <div className="col-span-8 overflow-hidden rounded-3xl bg-white shadow">

                <FoodPanel
                    title="Order mang về"
                    cart={cart}
                    setCart={setCart}
                    onBack={() => {}}
                    showBack={false}
                />

            </div>

            {/* Invoice */}

            <div className="col-span-4 flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow">

                <InvoicePanelTakeAway
                    cart={cart}
                    setCart={setCart}
                />

            </div>

        </div>

    );

}