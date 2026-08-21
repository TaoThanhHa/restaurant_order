import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    ArrowLeft,
    Search
} from "lucide-react";

import FoodCard
    from "../../../../components/FoodCard/FoodCard";

import AddFoodModal
    from "../../../../components/AddFoodModal/AddFoodModal";

import foodService
    from "../../../../services/food.service";

import categoryService
    from "../../../../services/category.service";


export default function FoodPanel({

    title,
    onBack,
    table,
    order,
    reload,

    cart,
    setCart,

    showBack = true,

    // ==========================================
    // CASHIER / CUSTOMER
    // ==========================================

    mode = "cashier",

    // Customer dùng QR để xác định branch
    qrCode,

    // Customer mở CartModal
    onOpenCart,

}) {

    const [foods, setFoods] = useState([]);

    const [categories, setCategories] = useState([]);

    const [selectedCategory, setSelectedCategory] =
        useState(null);

    const [keyword, setKeyword] =
        useState("");

    const [selectedFood, setSelectedFood] =
        useState(null);

    const [openModal, setOpenModal] =
        useState(false);


    // ==========================================
    // LOAD MENU
    // ==========================================

    const loadData = async () => {

    try {

        let foodRes;

        if (mode === "customer") {

            foodRes = await foodService.getByQrCode(qrCode);

        } else {

            // GIỮ NGUYÊN CASHIER
            foodRes = await foodService.getByBranch();

        }

        const categoryRes =
            await categoryService.getAll();

        setFoods(
            foodRes?.data?.data ??
            foodRes?.data ??
            []
        );

        setCategories(
            categoryRes?.data?.data ??
            categoryRes?.data ??
            []
        );

    } catch (err) {

        console.error(err);

        alert(
            err.response?.data?.message ||
            err.message
        );

    }

};


    useEffect(() => {

        loadData();

    }, [mode, qrCode]);


    // ==========================================
    // FILTER
    // ==========================================

    const displayFoods = useMemo(() => {

        return foods.filter(item => {

            const food = item.food;

            return (

                item.status !== "INACTIVE"

                &&

                (
                    !selectedCategory ||
                    food.categoryId === selectedCategory
                )

                &&

                food.name
                    .toLowerCase()
                    .includes(
                        keyword.toLowerCase()
                    )

            );

        });

    }, [
        foods,
        selectedCategory,
        keyword
    ]);


    // ==========================================
    // ADD FOOD
    // ==========================================

    const handleAddFood = (food) => {

        setSelectedFood(food);

        setOpenModal(true);

    };


    return (

        <div className="flex h-full flex-col">


            {/* =================================
                HEADER
            ================================= */}

            <div className="border-b bg-white p-4">

                <div className="flex items-center justify-between">
                    {/* TITLE */}

                    <div className="flex items-center gap-3">

                        {showBack && (

                            <button
                                onClick={onBack}
                                className="
                                    rounded-lg
                                    p-2
                                    hover:bg-gray-100
                                "
                            >

                                <ArrowLeft
                                    size={20}
                                />

                            </button>

                        )}


                        <div className="flex items-center gap-2">

                            <h2 className="text-xl font-bold text-[var(--color-text)]">

                                {title}

                            </h2>


                            <p className="pb-[5px] text-sm text-gray-500">

                                {displayFoods.length} món

                            </p>

                        </div>

                    </div>


                    {/* SEARCH */}

                    <div className="relative">

                        <Search
                            size={18}
                            className={`absolute
                                left-3
                                top-3
                                text-gray-400
                            `}
                        />

                        <input
                            value={keyword}
                            onChange={
                                e =>
                                    setKeyword(
                                        e.target.value
                                    )
                            }
                            placeholder="Tìm món ăn..."
                            className="
                                w-full
                                rounded-lg
                                border
                                py-2
                                pl-10
                                pr-3
                            "
                        />

                    </div>

                </div>


                {/* CATEGORY */}

                <div className="mt-5 flex gap-2 overflow-x-auto">

                    <button
                        onClick={() =>
                            setSelectedCategory(null)
                        }
                        className={`
                            rounded-full
                            px-4
                            py-2
                            ${
                                selectedCategory === null
                                    ? "bg-[var(--color-primary)] text-white"
                                    : "border hover:bg-[var(--color-secondary-hover)]"
                            }
                        `}
                    >
                        Tất cả
                    </button>


                    {categories.map(category => (

                        <button
                            key={category.id}
                            onClick={() =>
                                setSelectedCategory(
                                    category.id
                                )
                            }
                            className={`
                                rounded-full
                                px-3
                                py-2
                                ${
                                    selectedCategory === category.id
                                        ? "bg-[var(--color-primary)] text-white"
                                        : "border hover:bg-[var(--color-secondary-hover)]"
                                }
                            `}
                        >

                            {category.name}

                        </button>

                    ))}

                </div>

            </div>


            {/* =================================
                FOOD LIST
            ================================= */}

            <div className="
                flex-1
                overflow-y-auto
                bg-gray-50
                p-5
            ">

                {displayFoods.length === 0 ? (

                    <div className="
                        mt-20
                        text-center
                        text-gray-400
                    ">
                        Không có món ăn
                    </div>

                ) : (

                    <div className="
                        grid
                        grid-cols-2
                        gap-5
                        xl:grid-cols-3
                        2xl:grid-cols-4
                    ">

                        {displayFoods.map(item => (

                            <FoodCard
                                key={item.id}
                                food={item}
                                mode="order"
                                onAdd={handleAddFood}
                            />

                        ))}

                    </div>

                )}

            </div>


            {/* =================================
                CUSTOMER CART BUTTON
            ================================= */}

            {mode === "customer" &&
                cart.length > 0 && (

                <button
                    onClick={onOpenCart}
                    className="
                        fixed
                        bottom-6
                        right-6
                        z-40
                        rounded-full
                        bg-[#4f7d4f]
                        px-6
                        py-4
                        font-semibold
                        text-white
                        shadow-xl
                        transition
                        hover:bg-[#416b41]
                    "
                >

                    🛒 Xem giỏ hàng ({cart.length})

                </button>

            )}


            {/* =================================
                ADD FOOD MODAL
            ================================= */}

            <AddFoodModal
                open={openModal}
                food={selectedFood}
                cart={cart}
                setCart={setCart}
                onClose={() => {

                    setOpenModal(false);

                    setSelectedFood(null);

                }}
            />

        </div>

    );

}