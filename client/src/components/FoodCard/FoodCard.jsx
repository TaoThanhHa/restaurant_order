import Button from "../Button/Button";

export default function FoodCard({
    food,
    mode = "order",
    onAdd,
    onEdit,
    onStatusChange,
}) {
    const item = food.food ?? food;

    const SERVER_URL =
        import.meta.env.VITE_API_URL.replace("/api", "");

    const image = item.image
        ? `${SERVER_URL}${item.image}`
        : "https://placehold.co/400x400?text=Food";

    const price = Number(item.price);

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
            {/* IMAGE */}
            <div className="aspect-square bg-gray-100">
                <img
                    src={image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                />
            </div>

            {/* CONTENT */}
            <div className="p-2">
                <h3 className="line-clamp-2 min-h-[40px] text-lg font-semibold text-gray-800">
                    {item.name}
                </h3>

                <p className="mt-1 text-lg font-bold text-red-500">
                    {price.toLocaleString()}đ
                </p>

                {/* ORDER */}
                {mode === "order" && (
                    food.status === "AVAILABLE" ? (
                        <Button
                            className="mt-2 w-full"
                            onClick={() => onAdd?.(food)}
                        >
                            + Thêm
                        </Button>
                    ) : (
                        <div className="mt-2 rounded-lg bg-red-100 py-2 text-center font-semibold text-red-600">
                            HẾT HÀNG
                        </div>
                    )
                )}

                {/* BRANCH */}
                {mode === "cashier" && (
                    <div className="mt-2 rounded-lg border p-3">
                        <label className="mb-2 flex cursor-pointer items-center gap-2">
                            <input
                                type="radio"
                                name={`status-${food.foodId}`}
                                checked={
                                    food.status === "AVAILABLE"
                                }
                                onChange={() =>
                                    onStatusChange?.(
                                        food,
                                        "AVAILABLE"
                                    )
                                }
                            />

                            <span className="font-medium text-green-600">
                                Còn hàng
                            </span>
                        </label>

                        <label className="flex cursor-pointer items-center gap-2">
                            <input
                                type="radio"
                                name={`status-${food.foodId}`}
                                checked={
                                    food.status === "OUT_OF_STOCK"
                                }
                                onChange={() =>
                                    onStatusChange?.(
                                        food,
                                        "OUT_OF_STOCK"
                                    )
                                }
                            />

                            <span className="font-medium text-red-500">
                                Hết hàng
                            </span>
                        </label>
                    </div>
                )}

                {/* ADMIN */}
                {mode === "admin" && (
                    <div className="mt-2 flex gap-2">
                        <Button
                            className="flex-1 justify-center"
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