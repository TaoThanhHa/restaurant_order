import Button from "../Button/Button";

export default function FoodCard({
    food,
    mode = "order", // order | cashier | admin

    onAdd,
    onEdit,
    onStatusChange,
}) {

    // Hỗ trợ cả Food và BranchFood
    const item = food.food ?? food;
    const SERVER_URL = import.meta.env.VITE_API_URL.replace("/api", "");
    const image=item.image
        ?`${SERVER_URL}${item.image}`
        :"https://placehold.co/400x400?text=Food";

    const price=Number(item.price);

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">

            {/* Image */}

            <div className="aspect-square bg-gray-100">

                <img
                    src={image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                    
                />

            </div>

            {/* Content */}

            <div className="p-4">

                <h3 className="line-clamp-2 min-h-[40px] text-l font-semibold text-gray-800">
                    {item.name}
                </h3>

                <p className="mt-2 text-l font-bold text-red-500">
                    {price.toLocaleString()}đ
                </p>

                {/* ========================= */}
                {/* ORDER */}
                {/* ========================= */}
                {mode === "order" && (
                    food.status === "AVAILABLE" ? (
                        <Button
                            className="mt-4 w-full"
                            onClick={() => onAdd?.(food)}
                        >
                            + Thêm
                        </Button>
                    ) : (
                        <div className="mt-4 rounded-lg bg-red-100 py-2 text-center font-semibold text-red-600">
                            HẾT HÀNG
                        </div>
                    )
                )}

                {/* ========================= */}
                {/* CASHIER */}
                {/* ========================= */}

                {mode === "cashier" && (

                    <div className="mt-4 rounded-lg border p-3">

                        {/* <p className="mb-2 text-sm font-semibold">
                            Trạng thái
                        </p> */}

                        <label className="mb-2 flex cursor-pointer items-center gap-2">
                            <input
                                type="radio"
                                name={`status-${food.foodId}`}
                                checked={food.status === "AVAILABLE"}
                                onChange={() =>
                                    onStatusChange?.(food, "AVAILABLE")
                                }
                            />
                            <span className="text-green-600 font-medium">
                                Còn hàng
                            </span>
                        </label>

                        <label className="flex cursor-pointer items-center gap-2">
                            <input
                                type="radio"
                                name={`status-${food.foodId}`}
                                checked={food.status === "OUT_OF_STOCK"}
                                onChange={() =>
                                    onStatusChange?.(food, "OUT_OF_STOCK")
                                }
                            />
                            <span className="text-red-500 font-medium">
                                Hết hàng
                            </span>
                        </label>

                    </div>

                )}
                {/* ========================= */}
                {/* ADMIN */}
                {/* ========================= */}

                {mode === "admin" && (

                    <div className="mt-4 flex gap-2">

                        <Button
                            className="flex-1"
                            onClick={() => onEdit?.(food)}
                        >
                            Sửa
                        </Button>

                    </div>

                )}

            </div>

        </div>
    );
}