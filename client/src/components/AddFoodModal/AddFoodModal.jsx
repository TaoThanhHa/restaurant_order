import { useEffect, useState } from "react";
import { X, Minus, Plus } from "lucide-react";
import Button from "../Button/Button";
import cartService from "../../services/cart.service";
import NotiModal from "../NotiModal/NotiModal";

export default function AddFoodModal({
    open,
    onClose,
    food,
    cart,
    setCart,
    mode = "customer",
}) {
    const [quantity, setQuantity] = useState(1);
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);
    const [notiModal, setNotiModal] = useState({
        open: false,
        type: "error",
        title: "",
        message: "",
    });

    useEffect(() => {
        if (open) {
            setQuantity(1);
            setNote("");
        }
    }, [open]);

    if (!open || !food) return null;

    const item = food.food ?? food;

    const image = item.image
        ? `${import.meta.env.VITE_API_URL.replace("/api", "")}${item.image}`
        : "https://placehold.co/400x400?text=Food";

    const mapCart = data => {
        const items = data?.items || data?.data?.items || [];

        return items.map(item => ({
            id: item.food?.id || item.foodId,
            name: item.food?.name,
            image: item.food?.image
                ? `${import.meta.env.VITE_API_URL.replace("/api", "")}${item.food.image}`
                : "https://placehold.co/400x400?text=Food",
            price: Number(item.food?.price || 0),
            quantity: item.quantity,
            note: item.note || "",
        }));
    };

    const handleAdd = async () => {
        if (mode === "customer") {
            try {
                setLoading(true);

                const res = await cartService.addItem({
                    foodId: item.id,
                    quantity,
                    note: note.trim() || null,
                });

                setCart(mapCart(res));
                onClose();
            } catch (err) {
                console.error(
                    "ADD CART ERROR:",
                    err.response?.data || err
                );

                setNotiModal({
                    open: true,
                    type: "error",
                    title: "Không thể thêm món",
                    message:
                        err.response?.data?.message ||
                        err.message ||
                        "Không thể thêm món vào giỏ hàng.",
                });
            } finally {
                setLoading(false);
            }

            return;
        }

        const existed = cart.find(x => x.id === item.id);

        if (existed) {
            setCart(
                cart.map(x =>
                    x.id === item.id
                        ? {
                              ...x,
                              quantity: x.quantity + quantity,
                              note: note.trim() || x.note,
                          }
                        : x
                )
            );
        } else {
            setCart([
                ...cart,
                {
                    id: item.id,
                    name: item.name,
                    image,
                    price: Number(item.price),
                    quantity,
                    note,
                },
            ]);
        }

        onClose();
    };

    return (
        <>
            <div
                className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
                    open
                        ? "bg-black/40 opacity-100"
                        : "pointer-events-none bg-black/0 opacity-0"
                }`}
            >
                <div className="flex max-h-[90vh] w-full max-w-md flex-col rounded-xl bg-white shadow-xl">
                    <div className="flex items-center justify-between border-b px-5 py-4">
                        <h2 className="text-lg font-bold">
                            Thêm món
                        </h2>

                        <button
                            onClick={onClose}
                            className="rounded p-1 hover:bg-gray-100"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="hide-scrollbar flex-1 overflow-y-auto p-5">
                        <div className="flex justify-between">
                            <img
                                src={image}
                                alt={item.name}
                                className="aspect-square w-[50%] rounded-xl object-cover"
                                onError={e => {
                                    e.currentTarget.src =
                                        "https://placehold.co/400x400?text=Food";
                                }}
                            />

                            <div className="w-[50%]">
                                <h3 className="mt-4 text-xl font-bold">
                                    {item.name}
                                </h3>

                                <p className="mt-1 text-lg font-bold text-red-500">
                                    {Number(item.price).toLocaleString()}đ
                                </p>

                                <div className="mt-6">
                                    <label className="mb-2 block font-medium">
                                        Số lượng
                                    </label>

                                    <div className="flex items-center justify-center gap-4">
                                        <button
                                            onClick={() =>
                                                setQuantity(q =>
                                                    Math.max(1, q - 1)
                                                )
                                            }
                                            className="rounded-lg border p-2 hover:bg-gray-100"
                                        >
                                            <Minus size={18} />
                                        </button>

                                        <span className="w-10 text-center text-xl font-bold">
                                            {quantity}
                                        </span>

                                        <button
                                            onClick={() =>
                                                setQuantity(q => q + 1)
                                            }
                                            className="rounded-lg border p-2 hover:bg-gray-100"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <label className="mb-2 block font-medium">
                                Ghi chú
                            </label>

                            <textarea
                                rows={3}
                                value={note}
                                onChange={e => setNote(e.target.value)}
                                placeholder="Ví dụ: Không hành, ít cay..."
                                className="w-full rounded-lg border p-3 outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div className="border-t p-5">
                        <Button
                            className="w-full"
                            disabled={loading}
                            onClick={handleAdd}
                        >
                            {loading
                                ? "Đang thêm..."
                                : "Thêm vào giỏ"}
                        </Button>
                    </div>
                </div>
            </div>

            <NotiModal
                open={notiModal.open}
                type={notiModal.type}
                title={notiModal.title}
                message={notiModal.message}
                onClose={() =>
                    setNotiModal({
                        open: false,
                        type: "error",
                        title: "",
                        message: "",
                    })
                }
            />
        </>
    );
}