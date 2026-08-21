import {useEffect,useState} from "react";
import {Plus,Search} from "lucide-react";

import Button from "../../../../components/Button/Button";
import FoodCard from "../../../../components/FoodCard/FoodCard";
import FoodFormModal from "./FoodFormModal";

import foodService from "../../../../services/food.service";
import categoryService from "../../../../services/category.service";
import branchService from "../../../../services/branch.service";

export default function FoodManagement(){

    const [foods,setFoods]=useState([]);
    const [categories,setCategories]=useState([]);
    const [branches,setBranches]=useState([]);

    const [loading,setLoading]=useState(false);

    const [selectedFood,setSelectedFood]=useState(null);
    const [openModal,setOpenModal]=useState(false);

    const [selectedCategory,setSelectedCategory]=useState(null);
    const [selectedBranch,setSelectedBranch]=useState("");
    const [keyword,setKeyword]=useState("");

    useEffect(()=>{
        loadData();
    },[]);

    const loadData=async()=>{

        setLoading(true);

        try{

            const [
                foodRes,
                categoryRes,
                branchRes
            ] = await Promise.all([
                foodService.getAll(),
                categoryService.getAll(),
                branchService.getAll()
            ]);

            setFoods(foodRes.data.data);
            setCategories(categoryRes.data.data);
            setBranches(branchRes.data);

        }catch(err){

            alert(
                err.response?.data?.message||
                err.message
            );

        }

        setLoading(false);

    };

    const handleCreate=()=>{
        setSelectedFood(null);
        setOpenModal(true);
    };

    const handleEdit=(food)=>{
        setSelectedFood(food);
        setOpenModal(true);
    };

    const handleSave=async(data)=>{

        try{

            if(selectedFood){

                await foodService.update(
                    selectedFood.id,
                    data
                );

            }else{

                await foodService.create(data);

            }

            setOpenModal(false);
            setSelectedFood(null);

            loadData();

        }catch(err){

            alert(
                err.response?.data?.message||
                err.message
            );

        }

    };

    const handleInactive=async(food)=>{

        if(
            !window.confirm(
                `Ngừng kinh doanh "${food.name}"?`
            )
        ){
            return;
        }

        try{

            await foodService.update(
                food.id,
                {
                    status:"INACTIVE"
                }
            );

            loadData();

        }catch(err){

            alert(
                err.response?.data?.message||
                err.message
            );

        }

    };

    const displayFoods=foods.filter(food=>{

        const matchCategory=
            !selectedCategory||
            food.categoryId===selectedCategory;

        const matchKeyword=
            food.name
            .toLowerCase()
            .includes(keyword.toLowerCase());

        const matchBranch=
            !selectedBranch||
            food.branchFoods.some(
                item=>item.branchId===Number(selectedBranch)
            );

        return(
            matchCategory&&
            matchKeyword&&
            matchBranch
        );

    });

    return(

        <div className="flex h-full flex-col">

            <div className="border-b bg-[var(--color-background)] p-2">

                <div className="flex items-center justify-between">

                    <div>

                        <h2 className="text-xl font-bold text-[var(--color-text)]">
                            Danh sách món ăn
                        </h2>

                        <p className="text-sm text-[var(--color-text-muted)]">
                            {displayFoods.length} món
                        </p>

                    </div>

                    <Button
                        onClick={handleCreate}
                        className="flex items-center gap-2"
                    >
                        <Plus size={18}/>
                        Thêm món
                    </Button>

                </div>

                <div className="mt-5 flex gap-3 overflow-x-auto hide-scrollbar">

                    <button
                        onClick={()=>setSelectedCategory(null)}
                        className={`rounded-full px-4 py-2 ${
                            selectedCategory===null
                            ?"bg-[var(--color-primary)] text-white"
                            :"border bg-white hover:bg-[var(--color-secondary)]"
                        }`}
                    >
                        Tất cả
                    </button>

                    {categories.map(category=>(

                        <button
                            key={category.id}
                            onClick={()=>setSelectedCategory(category.id)}
                            className={`rounded-full px-4 py-2 ${
                                selectedCategory===category.id
                                ?"bg-[var(--color-primary)] text-white"
                                :"border bg-white hover:bg-[var(--color-secondary)]"
                            }`}
                        >
                            {category.name}
                        </button>

                    ))}

                </div>

                <div className="mt-5 flex gap-4">

                    <div className="relative flex-1">

                        <Search
                            size={18}
                            className="absolute left-3 top-3 text-gray-400"
                        />

                        <input
                            value={keyword}
                            onChange={e=>setKeyword(e.target.value)}
                            placeholder="Tìm theo tên món..."
                            className="w-full rounded-lg border py-2 pl-10 pr-3"
                        />

                    </div>

                    <select
                        value={selectedBranch}
                        onChange={e=>setSelectedBranch(e.target.value)}
                        className="w-60 rounded-lg border px-3"
                    >

                        <option value="">
                            Tất cả cơ sở
                        </option>

                        {Array.isArray(branches)
                        ? branches.map((branch) => {
                            console.log(branch);
                            return (
                                <option
                                    key={branch.id}
                                    value={branch.id}
                                >
                                    {branch.name}
                                </option>
                            );
                        })
                        : null}

                    </select>

                </div>

            </div>
            <div className="flex-1 bg-[var(--color-background)] p-6">

                {loading?(

                    <div className="flex h-60 items-center justify-center text-gray-400">
                        Đang tải dữ liệu...
                    </div>

                ):displayFoods.length===0?(

                    <div className="flex h-60 items-center justify-center text-gray-400">
                        Không có món ăn nào.
                    </div>

                ):(

                    <div className="grid grid-cols-2 gap-5 xl:grid-cols-4 2xl:grid-cols-5">

                        {displayFoods.map(food=>(

                            <FoodCard
                                key={food.id}
                                food={food}
                                mode="admin"
                                onEdit={handleEdit}
                                onDelete={handleInactive}
                            />

                        ))}

                    </div>

                )}

            </div>

            <FoodFormModal
                open={openModal}
                mode={
                    selectedFood
                    ?"edit"
                    :"create"
                }
                food={selectedFood}
                categories={categories}
                branches={branches}
                onClose={()=>{
                    setOpenModal(false);
                    setSelectedFood(null);
                }}
                onSave={handleSave}
            />

        </div>

    );

}