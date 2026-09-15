import { useEffect, useState } from "react";
import { Plus, AlertTriangle, X } from "lucide-react";

import Button from "../../../components/Button/Button";
import NotiModal from "../../../components/NotiModal/NotiModal";

import FloorCard from "./FloorCard";
import FloorModal from "./FloorModal";
import TableModal from "./TableModal";

import branchService from "../../../services/branch.service";
import floorService from "../../../services/floor.service";

export default function FloorManagement({ mode = "admin" }) {
    const isAdmin = mode === "admin";

    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState("");

    const [currentBranch, setCurrentBranch] = useState(null);
    const [floors, setFloors] = useState([]);
    const [loading, setLoading] = useState(false);

    const [openFloorModal, setOpenFloorModal] = useState(false);
    const [selectedFloor, setSelectedFloor] = useState(null);

    const [openTableModal, setOpenTableModal] = useState(false);
    const [selectedTable, setSelectedTable] = useState(null);

    const [deleteFloor, setDeleteFloor] = useState(null);
    const [deletingFloor, setDeletingFloor] = useState(false);

    const [notification, setNotification] = useState({
        open: false,
        type: "success",
        title: "",
        message: "",
    });

    const getCurrentUser = () => {
        try {
            return JSON.parse(localStorage.getItem("user")) || null;
        } catch {
            return null;
        }
    };

    const user = getCurrentUser();

    const branchId = isAdmin
        ? selectedBranch
        : user?.branchId;

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

    const getErrorMessage = (error, fallback) =>
        error?.response?.data?.message ||
        error?.message ||
        fallback;

    // ======================================================
    // BRANCH
    // ======================================================

    const loadBranches = async () => {
        if (!isAdmin) return;

        try {
            const res = await branchService.getAll();
            const data = res?.data || [];

            setBranches(data);

            if (data.length > 0) {
                setSelectedBranch(data[0].id);
            }
        } catch (error) {
            console.error(
                "Lỗi lấy danh sách chi nhánh:",
                error
            );

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

    // ======================================================
    // BRANCH ACCOUNT
    // ======================================================

    const loadCurrentBranch = async () => {
        if (isAdmin || !user?.branchId) return;

        try {
            const res = await branchService.getById(
                user.branchId
            );

            setCurrentBranch(res?.data || null);
        } catch (error) {
            console.error(
                "Lỗi lấy thông tin chi nhánh:",
                error
            );

            showNotification({
                type: "error",
                title: "Không thể tải dữ liệu",
                message: getErrorMessage(
                    error,
                    "Không thể lấy thông tin chi nhánh."
                ),
            });
        }
    };

    // ======================================================
    // FLOOR
    // ======================================================

    const loadFloors = async () => {
        if (!branchId) {
            setFloors([]);
            return;
        }

        try {
            setLoading(true);

            const res = await floorService.getByBranch(
                branchId
            );

            setFloors(res?.data || []);
        } catch (error) {
            console.error(
                "Lỗi lấy danh sách tầng:",
                error
            );

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

    useEffect(() => {
        if (isAdmin) {
            loadBranches();
        } else {
            loadCurrentBranch();
        }
    }, [isAdmin]);

    useEffect(() => {
        if (branchId) {
            loadFloors();
        }
    }, [branchId]);

    // ======================================================
    // FLOOR MODAL
    // ======================================================

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

    const handleSaveFloor = async (data) => {
        if (!branchId) {
            showNotification({
                type: "error",
                title: "Không xác định được chi nhánh",
                message:
                    "Không thể xác định chi nhánh cần thao tác.",
            });

            return;
        }

        try {
            if (selectedFloor) {
                await floorService.update(
                    selectedFloor.id,
                    data
                );

                showNotification({
                    type: "success",
                    title: "Cập nhật thành công",
                    message:
                        "Thông tin tầng đã được cập nhật.",
                });
            } else {
                await floorService.create({
                    ...data,
                    branchId,
                });

                showNotification({
                    type: "success",
                    title: "Thêm tầng thành công",
                    message:
                        "Tầng mới đã được thêm vào chi nhánh.",
                });
            }

            closeFloorModal();
            await loadFloors();
        } catch (error) {
            console.error(
                "Lỗi lưu tầng:",
                error
            );

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

    // ======================================================
    // DELETE FLOOR
    // ======================================================

    const requestDeleteFloor = (floor) => {
        setDeleteFloor(floor);
    };

    const closeDeleteFloor = () => {
        if (deletingFloor) return;

        setDeleteFloor(null);
    };

    const handleDeleteFloor = async () => {
        if (!deleteFloor || deletingFloor) return;

        const floor = deleteFloor;

        try {
            setDeletingFloor(true);

            await floorService.remove(floor.id);

            setDeleteFloor(null);

            showNotification({
                type: "success",
                title: "Xóa thành công",
                message: `Tầng "${floor.name}" và toàn bộ bàn trong tầng đã được xóa.`,
            });

            await loadFloors();
        } catch (error) {
            console.error(
                "Lỗi xóa tầng:",
                error
            );

            setDeleteFloor(null);

            showNotification({
                type: "error",
                title: "Không thể xóa tầng",
                message: getErrorMessage(
                    error,
                    "Đã xảy ra lỗi khi xóa tầng."
                ),
            });
        } finally {
            setDeletingFloor(false);
        }
    };

    // ======================================================
    // TABLE
    // ======================================================

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

    // ======================================================
    // BRANCH NAME
    // ======================================================

    const branchName = isAdmin
        ? branches.find(
              (branch) =>
                  branch.id === Number(selectedBranch)
          )?.name
        : currentBranch?.name ||
          "Chi nhánh của bạn";

    return (
        <div className="flex h-full flex-col">
            {/* HEADER */}
            <div className="border-b bg-white p-5">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold">
                            Quản lý bàn
                        </h2>

                        {!isAdmin && (
                            <p className="mt-1 text-sm text-gray-500">
                                {branchName}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {isAdmin && (
                            <select
                                value={selectedBranch}
                                onChange={(e) =>
                                    setSelectedBranch(
                                        Number(
                                            e.target.value
                                        )
                                    )
                                }
                                className="rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-[var(--color-primary)]"
                            >
                                {branches.map(
                                    (branch) => (
                                        <option
                                            key={
                                                branch.id
                                            }
                                            value={
                                                branch.id
                                            }
                                        >
                                            {
                                                branch.name
                                            }
                                        </option>
                                    )
                                )}
                            </select>
                        )}

                        <Button
                            onClick={
                                openCreateFloorModal
                            }
                            disabled={!branchId}
                        >
                            <Plus size={18} />
                            Thêm tầng
                        </Button>

                        <Button
                            onClick={
                                openCreateTableModal
                            }
                            disabled={
                                !floors.length
                            }
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
                ) : !branchId ? (
                    <div className="flex min-h-[200px] items-center justify-center rounded-xl bg-white text-gray-500 shadow-sm">
                        Không xác định được chi nhánh.
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
                                    openEditFloorModal(
                                        floor
                                    )
                                }
                                onDelete={() =>
                                    requestDeleteFloor(
                                        floor
                                    )
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
                onSuccess={showNotification}
            />

            {/* DELETE FLOOR CONFIRMATION */}
            {deleteFloor && (
                <div
                    className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 p-5 backdrop-blur-[2px]"
                    onClick={closeDeleteFloor}
                >
                    <div
                        className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-50">
                            <AlertTriangle
                                size={34}
                                className="text-yellow-500"
                            />
                        </div>

                        <div className="mt-4 text-center">
                            <h2 className="text-xl font-bold text-gray-800">
                                Xác nhận xóa tầng
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-gray-500">
                                Bạn có chắc muốn xóa{" "}
                                <span className="font-semibold text-gray-700">
                                    "{deleteFloor.name}"
                                </span>
                                ?
                            </p>

                            <p className="mt-2 text-sm leading-6 text-red-500">
                                Toàn bộ bàn trong tầng
                                này cũng sẽ bị xóa.
                            </p>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={
                                    closeDeleteFloor
                                }
                                disabled={
                                    deletingFloor
                                }
                                className="flex-1 rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Hủy
                            </button>

                            <button
                                type="button"
                                onClick={
                                    handleDeleteFloor
                                }
                                disabled={
                                    deletingFloor
                                }
                                className="flex-1 rounded-xl bg-red-500 px-4 py-3 font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {deletingFloor
                                    ? "Đang xóa..."
                                    : "Xác nhận"}
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={
                                closeDeleteFloor
                            }
                            disabled={
                                deletingFloor
                            }
                            className="absolute"
                            aria-label="Đóng"
                        >
                            <X size={0} />
                        </button>
                    </div>
                </div>
            )}

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