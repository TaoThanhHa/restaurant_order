import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import Button from "../../../components/Button/Button";

import FloorCard from "./FloorCard";
import FloorModal from "./FloorModal";
import TableModal from "./TableModal";

import branchService from "../../../services/branch.service";
import floorService from "../../../services/floor.service";
import tableService from "../../../services/table.service";

export default function FloorManagement() {

    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState("");

    const [floors, setFloors] = useState([]);

    const [loading, setLoading] = useState(false);

    const [openFloorModal, setOpenFloorModal] = useState(false);
    const [selectedFloor, setSelectedFloor] = useState(null);

    const [openTableModal, setOpenTableModal] = useState(false);
    const [selectedTable, setSelectedTable] = useState(null);

    useEffect(() => {
        loadBranches();
    }, []);

    useEffect(() => {

        if (selectedBranch) {
            loadFloors();
        }

    }, [selectedBranch]);

      
    // LOAD BRANCH
      

    const loadBranches = async () => {

        try {

            const res = await branchService.getAll();

            setBranches(res.data);

            if (res.data.length > 0) {
                setSelectedBranch(res.data[0].id);
            }

        } catch (err) {

            alert(
                err.response?.data?.message ||
                err.message
            );

        }

    };

      
    // LOAD FLOOR
    
    const loadFloors = async () => {

        setLoading(true);

        try {

            const res =
                await floorService.getByBranch(
                    selectedBranch
                );

            setFloors(res.data);

        } catch (err) {

            alert(
                err.response?.data?.message ||
                err.message
            );

        }

        setLoading(false);

    };

      
    // SAVE FLOOR
    
    const handleSaveFloor = async (data) => {

        try {

            if (selectedFloor) {

                await floorService.update(
                    selectedFloor.id,
                    data
                );

            } else {

                await floorService.create({
                    ...data,
                    branchId: selectedBranch,
                });

            }

            setOpenFloorModal(false);
            setSelectedFloor(null);

            loadFloors();

        } catch (err) {

            alert(
                err.response?.data?.message ||
                err.message
            );

        }

    };

      
    // DELETE FLOOR
    const handleDeleteFloor = async (floor) => {

        if (
            !window.confirm(
                `Xóa ${floor.name}?`
            )
        ) {
            return;
        }

        try {

            await floorService.remove(
                floor.id
            );

            loadFloors();

        } catch (err) {

            alert(
                err.response?.data?.message ||
                err.message
            );

        }

    };

    const handleEditTable = (table) => {
        setSelectedTable(table);
        setOpenTableModal(true);
    }; 

    return (

        <div className="flex h-full flex-col">

            <div className="border-b bg-white p-5">

                <div className="flex items-center justify-between">

                    <h2 className="text-2xl font-bold">

                        Quản lý bàn

                    </h2>

                    <div className="flex gap-3">

                        <select
                            value={selectedBranch}
                            onChange={(e) =>
                                setSelectedBranch(
                                    Number(e.target.value)
                                )
                            }
                            className="rounded-lg border px-4"
                        >

                            {branches.map(branch => (

                                <option
                                    key={branch.id}
                                    value={branch.id}
                                >
                                    {branch.name}
                                </option>

                            ))}

                        </select>

                        <Button
                            onClick={() => {

                                setSelectedFloor(null);

                                setOpenFloorModal(true);

                            }}
                        >

                            <Plus size={18} />

                            Thêm tầng

                        </Button>

                        <Button
                            onClick={() =>
                                setOpenTableModal(true)
                            }
                        >

                            <Plus size={18} />

                            Thêm bàn

                        </Button>

                    </div>

                </div>

            </div>

            <div className="flex-1 overflow-auto hide-scrollbar bg-gray-100 p-6">

                {loading ? (

                    <div className="text-center">

                        Đang tải...

                    </div>

                ) : (

                    floors.map(floor => (

                        <FloorCard
                            key={floor.id}
                            floor={floor}
                            onEdit={() => {
                                setSelectedFloor(floor);
                                setOpenFloorModal(true);
                            }}
                            onDelete={() => handleDeleteFloor(floor)}
                            onEditTable={(table) => {
                                setSelectedTable(table);
                                setOpenTableModal(true);
                            }}
                            reload={loadFloors}
                        />

                    ))

                )}

            </div>

            <FloorModal

                open={openFloorModal}

                floor={selectedFloor}

                onClose={() => {

                    setOpenFloorModal(false);

                    setSelectedFloor(null);

                }}

                onSave={handleSaveFloor}

            />

            <TableModal
                open={openTableModal}
                floors={floors}
                table={selectedTable}
                onClose={() =>{
                    setOpenTableModal(false);
                    setSelectedTable(null);
                }}
                reload={loadFloors}

            />

        </div>

    );

}