import { useContext, useState } from "react";

import FoodManagement from "./components/FoodManagement";
import CategoryManagement from "./components/CategoryManagement";
import { AuthContext } from "../../../contexts/AuthContext";

export default function Foods() {
    const [tab, setTab] = useState("food");
    const { user } = useContext(AuthContext);

    return (
        <div className="flex h-full flex-col bg-gray-50">
            <div className="border-b bg-[var(--color-background)] p-2">
                <h1 className="text-2xl font-bold text-[var(--color-text)]">
                    Quản lý thực đơn
                </h1>

                <div className="mt-2 inline-flex rounded-xl bg-[var(--color-background)] p-1">
                    <button
                        onClick={() => setTab("food")}
                        className={`rounded-lg px-6 py-2 text-sm font-semibold transition ${
                            tab === "food"
                                ? "bg-white text-[var(--color-primary)] shadow"
                                : "text-gray-600 hover:bg-[var(--color-secondary-hover)] hover:text-[var(--color-primary)]"
                        }`}
                    >
                        Quản lý món
                    </button>

                    <button
                        onClick={() => setTab("category")}
                        className={`rounded-lg px-6 py-2 text-sm font-semibold transition ${
                            tab === "category"
                                ? "bg-white text-[var(--color-primary)] shadow"
                                : "text-gray-600 hover:bg-[var(--color-secondary-hover)] hover:text-[var(--color-primary)]"
                        }`}
                    >
                        Quản lý danh mục
                    </button>
                </div>
            </div>

            <div className="flex-1">
                {tab === "food" ? (
                    <FoodManagement restaurantMode={user?.restaurantMode} />
                ) : (
                    <CategoryManagement />
                )}
            </div>
        </div>
    );
}
