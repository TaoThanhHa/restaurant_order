import { useEffect, useState } from "react";
import { X, Minus, Plus } from "lucide-react";
import Button from "../Button/Button";

export default function AddFoodModal({
    open,
    onClose,
    food,
    cart,
    setCart,
}) {

    const [quantity, setQuantity] = useState(1);
    const [note, setNote] = useState("");

    useEffect(() => {
        if (open) {
            setQuantity(1);
            setNote("");
        }
    }, [open]);

    if (!open || !food) return null;
    
    const item = food.food ?? food;
    const image=item.image
    ?`${import.meta.env.VITE_API_URL.replace("/api","")}${item.image}`
    :"https://placehold.co/400x400?text=Food";

    const handleAdd = () => {

        const existed = cart.find(
            x => x.id === item.id
        );

        if (existed) {
            setCart(
                cart.map(x =>
                    x.id === item.id
                        ? {
                              ...x,
                              quantity: x.quantity + quantity,
                              note:
                                  note.trim() !== ""
                                      ? note
                                      : x.note,
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
                    image: image,
                    price: Number(item.price),
                    quantity,
                    note,
                },
            ]);
        }
        onClose();
    };

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center
                transition-all duration-300
                ${open ? "bg-black/40 opacity-100" : "pointer-events-none bg-black/0 opacity-0"}`}
            >

            <div className="w-full max-w-md max-h-[90vh] rounded-xl bg-white shadow-xl flex flex-col">
                {/* Header */}

                <div className="flex items-center justify-between border-b px-5 py-4">
                    <h2 className="text-lg font-bold">
                        Thêm món
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded p-1 hover:bg-gray-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto hide-scrollbar p-5">
                <div className="flex justify-between">
                    <img
                        src={image}
                        alt={item.name}
                        className="aspect-square w-[50%] rounded-xl object-cover"
                        onError={(e)=>{
                            console.log(image);
                            e.currentTarget.src="https://placehold.co/400x400?text=Food";
                        }}
                    />
                    <div className="w-[50%]">

                    <h3 className="mt-4 text-xl font-bold">
                        {item.name}
                    </h3>

                    <p className="mt-1 text-l font-bold text-red-500">
                        {Number(item.price).toLocaleString()}đ
                    </p>

                    {/* Quantity */}
                    <div className="mt-6">
                        <label className="mb-2 block font-medium">
                            Số lượng
                        </label>

                        <div className="flex items-center justify-center gap-4">
                            <button
                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                className="rounded-lg border p-2 hover:bg-gray-100"
                            >
                                <Minus size={18} />
                            </button>

                            <span className="w-10 text-center text-xl font-bold">
                                {quantity}
                            </span>

                            <button
                                onClick={() =>  setQuantity(q => q + 1)}
                                className="rounded-lg border p-2 hover:bg-gray-100"
                            >
                                <Plus size={18} />
                            </button>

                        </div>

                    </div>
                    </div>
                    </div>

                    {/* Note */}

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

                {/* Footer */}
                <div className="border-t p-5">
                    <Button
                        className="w-full"
                        onClick={handleAdd}
                    >
                        Thêm vào giỏ
                    </Button>

                </div>
            </div>
        </div>
    );
}