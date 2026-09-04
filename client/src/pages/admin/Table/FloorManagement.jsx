import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import Button from "../../../components/Button/Button";
import NotiModal from "../../../components/NotiModal/NotiModal";

import FloorCard from "./FloorCard";
import FloorModal from "./FloorModal";
import TableModal from "./TableModal";

import branchService from "../../../services/branch.service";
import floorService from "../../../services/floor.service";

export default function FloorManagement() {
    // STATE

    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState("");

    const [floors, setFloors] = useState([]);
    const [loading, setLoading] = useState(false);

    const [openFloorModal, setOpenFloorModal] = useState(false);
    const [selectedFloor, setSelectedFloor] = useState(null);

    const [openTableModal, setOpenTableModal] = useState(false);
    const [selectedTable, setSelectedTable] = useState(null);

    const [notification, setNotification] = useState({
        open: false,
        type: "success",
        title: "",
        message: "",
    });

    // NOTIFICATION

    const showNotification = ({
        type = "success",
        title,
        message,
    }) => {
        setNotification({
            open: true,
            type,
            title,
            message,
        });
    };

    const closeNotification = () => {
        setNotification((prev) => ({
            ...prev,
            open: false,
        }));
    };

    const getErrorMessage = (error, fallback) => {
        return (
            error.response?.data?.message ||
            error.message ||
            fallback
        );
    };

    // LOAD BRANCHES
    const loadBranches = async () => {
        try {
            const res = await branchService.getAll();
            const branchData = res?.data || [];

            setBranches(branchData);

            if (branchData.length > 0) {
                setSelectedBranch(branchData[0].id);
            }
        } catch (error) {
            console.error("Lỗi lấy danh sách chi nhánh:", error);

            showNotification({
                type: "error",
                title: "Không thể tải dữ liệu",
                message: getErrorMessage(
                    error,
                    "Không thể lấy danh sách chi nhánh."
                ),
            });
        }
    };

    // LOAD FLOORS
    const loadFloors = async () => {
        if (!selectedBranch) {
            setFloors([]);
            return;
        }

        try {
            setLoading(true);

            const res = await floorService.getByBranch(
                selectedBranch
            );

            setFloors(res?.data || []);
        } catch (error) {
            console.error("Lỗi lấy danh sách tầng:", error);

            showNotification({
                type: "error",
                title: "Không thể tải dữ liệu",
                message: getErrorMessage(
                    error,
                    "Không thể lấy danh sách tầng."
                ),
            });
        } finally {
            setLoading(false);
        }
    };

    // EFFECT
    useEffect(() => {
        loadBranches();
    }, []);

    useEffect(() => {
        if (selectedBranch) {
            loadFloors();
        }
    }, [selectedBranch]);

    // FLOOR MODAL
    const openCreateFloorModal = () => {
        setSelectedFloor(null);
        setOpenFloorModal(true);
    };

    const openEditFloorModal = (floor) => {
        setSelectedFloor(floor);
        setOpenFloorModal(true);
    };

    const closeFloorModal = () => {
        setOpenFloorModal(false);
        setSelectedFloor(null);
    };

    // SAVE FLOOR

    const handleSaveFloor = async (data) => {
        try {
            if (selectedFloor) {
                await floorService.update(
                    selectedFloor.id,
                    data
                );

                showNotification({
                    type: "success",
                    title: "Cập nhật thành công",
                    message: "Thông tin tầng đã được cập nhật.",
                });
            } else {
                await floorService.create({
                    ...data,
                    branchId: selectedBranch,
                });

                showNotification({
                    type: "success",
                    title: "Thêm tầng thành công",
                    message: "Tầng mới đã được thêm vào chi nhánh.",
                });
            }

            closeFloorModal();
            await loadFloors();
        } catch (error) {
            console.error("Lỗi lưu tầng:", error);

            showNotification({
                type: "error",
                title: selectedFloor
                    ? "Không thể cập nhật tầng"
                    : "Không thể thêm tầng",
                message: getErrorMessage(
                    error,
                    "Đã xảy ra lỗi khi lưu thông tin tầng."
                ),
            });
        }
    };

    // DELETE FLOOR
    const handleDeleteFloor = async (floor) => {
        const confirmed = window.confirm(
            `Bạn có chắc muốn xóa "${floor.name}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            await floorService.remove(floor.id);

            showNotification({
                type: "success",
                title: "Xóa thành công",
                message: `Tầng "${floor.name}" đã được xóa.`,
            });

            await loadFloors();
        } catch (error) {
            console.error("Lỗi xóa tầng:", error);

            showNotification({
                type: "error",
                title: "Không thể xóa tầng",
                message: getErrorMessage(
                    error,
                    "Đã xảy ra lỗi khi xóa tầng."
                ),
            });
        }
    };

    // TABLE MODAL
    const openCreateTableModal = () => {
        setSelectedTable(null);
        setOpenTableModal(true);
    };

    const openEditTableModal = (table) => {
        setSelectedTable(table);
        setOpenTableModal(true);
    };

    const closeTableModal = () => {
        setOpenTableModal(false);
        setSelectedTable(null);
    };

    // RENDER

    return (
        <div className="flex h-full flex-col">
            {/* HEADER */}
            <div className="border-b bg-white p-5">
                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-2xl font-bold">
                        Quản lý bàn
                    </h2>

                    <div className="flex items-center gap-3">
                        {/* BRANCH */}
                        <select
                            value={selectedBranch}
                            onChange={(e) =>
                                setSelectedBranch(
                                    Number(e.target.value)
                                )
                            }
                            className="rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-[var(--color-primary)]"
                        >
                            {branches.map((branch) => (
                                <option
                                    key={branch.id}
                                    value={branch.id}
                                >
                                    {branch.name}
                                </option>
                            ))}
                        </select>

                        {/* ADD FLOOR */}
                        <Button
                            onClick={openCreateFloorModal}
                        >
                            <Plus size={18} />
                            Thêm tầng
                        </Button>

                        {/* ADD TABLE */}
                        <Button
                            onClick={openCreateTableModal}
                            disabled={!floors.length}
                        >
                            <Plus size={18} />
                            Thêm bàn
                        </Button>
                    </div>
                </div>
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-auto bg-gray-100 p-3 hide-scrollbar">
                {loading ? (
                    <div className="flex min-h-[200px] items-center justify-center text-gray-500">
                        Đang tải dữ liệu...
                    </div>
                ) : floors.length === 0 ? (
                    <div className="flex min-h-[200px] items-center justify-center rounded-xl bg-white text-gray-500 shadow-sm">
                        Chi nhánh chưa có tầng nào.
                    </div>
                ) : (
                    <div className="space-y-6">
                        {floors.map((floor) => (
                            <FloorCard
                                key={floor.id}
                                floor={floor}
                                onEdit={() =>
                                    openEditFloorModal(floor)
                                }
                                onDelete={() =>
                                    handleDeleteFloor(floor)
                                }
                                onEditTable={
                                    openEditTableModal
                                }
                                reload={loadFloors}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* FLOOR MODAL */}
            <FloorModal
                open={openFloorModal}
                floor={selectedFloor}
                onClose={closeFloorModal}
                onSave={handleSaveFloor}
            />

            {/* TABLE MODAL */}
            <TableModal
                open={openTableModal}
                floors={floors}
                table={selectedTable}
                onClose={closeTableModal}
                reload={loadFloors}
            />

            {/* NOTIFICATION */}
            <NotiModal
                open={notification.open}
                type={notification.type}
                title={notification.title}
                message={notification.message}
                onClose={closeNotification}
            />
        </div>
    );
}