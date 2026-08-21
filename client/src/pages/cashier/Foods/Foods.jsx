import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import Input from "../../../components/Input/Input"

import FoodCard from "../../../components/FoodCard/FoodCard";

import categoryService from "../../../services/category.service";
import branchFoodService from "../../../services/branchFood.service";

export default function Foods() {

    const [categories, setCategories] = useState([]);
    const [foods, setFoods] = useState([]);

    const [categoryId, setCategoryId] = useState("ALL");
    const [keyword, setKeyword] = useState("");
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [cateRes, foodRes] = await Promise.all([
                categoryService.getAll(),
                branchFoodService.getAll()
            ]);

            setCategories(cateRes.data.data);
            setFoods(Array.isArray(foodRes.data.data)
                ? foodRes.data.data
                : []);

        } catch (err) {
            console.log(err);
        }
    };

    const handleStatusChange = async (food, status) => {

        try {

            await branchFoodService.updateStatus(
                food.foodId,
                status
            );

            loadData();

        } catch (err) {

            alert(
                err.response?.data?.message ||
                err.message
            );

        }

    };

    const filterFoods = useMemo(() => {

        if (!Array.isArray(foods)) return [];

        return foods.filter(item => {

            const matchCategory =
                categoryId === "ALL" ||
                item.food.categoryId === categoryId;

            const matchKeyword =
                item.food.name
                    .toLowerCase()
                    .includes(keyword.toLowerCase());

            return matchCategory && matchKeyword;

        });

    }, [foods, categoryId, keyword]);

    return (

        <div className="space-y-6">

            <h1 className="text-2xl font-bold text-[var(--color-text)]">
                Quản lý món ăn
            </h1>

            {/* Category */}

            <div className="flex flex-wrap gap-3">

                <button
                    onClick={() => setCategoryId("ALL")}
                    className={`rounded-full px-4 py-2 transition
                    ${
                        categoryId === "ALL"
                            ? "bg-[var(--color-primary)] text-white"
                            : "bg-white border hover:bg-[var(--color-secondary-hover)]"
                    }`}
                >
                    Tất cả
                </button>

                {categories.map(category => (

                    <button
                        key={category.id}
                        onClick={() => setCategoryId(category.id)}
                        className={`rounded-full px-4 py-2 transition
                        ${
                            categoryId === category.id
                                ? "bg-[var(--color-primary)] text-white"
                                : "bg-white border hover:bg-[var(--color-secondary)]"
                        }`}
                    >
                        {category.name}
                    </button>

                ))}
            </div>
            <div className="relative mt-4 max-w-md">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <Input
                        type="text"
                        placeholder="Tìm món ăn..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className="w-full py-2 pl-10 pr-3 !bg-white"
                    />

                </div>

            {/* Foods */}

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">

                {filterFoods.map(food => (

                    <FoodCard
                        key={food.foodId}
                        food={food}
                        mode="cashier"
                        onStatusChange={handleStatusChange}
                    />

                ))}

            </div>

        </div>

    );

}