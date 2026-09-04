import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Pencil, Lock, Unlock } from "lucide-react";

import Button from "../../../components/Button/Button";
import Input from "../../../components/Input/Input";
import NotiModal from "../../../components/NotiModal/NotiModal";

import useAuth from "../../../hooks/useAuth";
import staffService from "../../../services/staff.service";

import StaffFormModal from "./StaffFormModal";

const ROLE_LABELS = {
    CASHIER: "Thu ngân",
    ORDER: "Nhân viên order",
    KITCHEN: "Nhân viên bếp",
    WAREHOUSE: "Nhân viên kho",
};

export default function BranchStaff() {
    const { user } = useAuth();

    const [staff, setStaff] = useState([]);
    const [keyword, setKeyword] = useState("");
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);

    const [noti, setNoti] = useState({
        open: false,
        type: "error",
        title: "",
        message: "",
    });

    // ========================================
    // BRANCH INFO
    // ========================================

    const branchId = user?.branchId || user?.branch?.id || null;
    const branch = user?.branch || null;

    // ========================================
    // NOTIFICATION
    // ========================================

    const showNoti = (type, message, title = "") => {
        setNoti({
            open: true,
            type,
            title,
            message,
        });
    };

    // ========================================
    // LOAD STAFF
    // ========================================

    const loadData = async () => {
        if (!branchId) {
            setStaff([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            const res = await staffService.getAll();

            console.log("STAFF RESPONSE:", res);

            const staffData =
                res.data?.data?.staff ||
                res.data?.staff ||
                res.data?.data ||
                [];

            setStaff(Array.isArray(staffData) ? staffData : []);
        } catch (err) {
            console.error("LOAD STAFF ERROR:", err);

            setStaff([]);

            showNoti(
                "error",
                err.response?.data?.message ||
                    err.message ||
                    "Không thể tải danh sách nhân viên."
            );
        } finally {
            setLoading(false);
        }
    };

    // ========================================
    // EFFECT
    // ========================================

    useEffect(() => {
        loadData();
    }, [branchId]);

    // ========================================
    // FILTER STAFF
    // ========================================

    const filtered = useMemo(() => {
        const text = keyword.toLowerCase().trim();

        if (!text) return staff;

        return staff.filter((user) => {
            const username = user.username?.toLowerCase() || "";
            const email = user.email?.toLowerCase() || "";

            const roleName = user.role?.name || "";
            const roleLabel = ROLE_LABELS[roleName] || roleName;

            return (
                username.includes(text) ||
                email.includes(text) ||
                roleName.toLowerCase().includes(text) ||
                roleLabel.toLowerCase().includes(text)
            );
        });
    }, [staff, keyword]);

    // ========================================
    // MODAL
    // ========================================

    const handleCreate = () => {
        if (!branchId) {
            showNoti(
                "error",
                "Không xác định được chi nhánh của tài khoản."
            );
            return;
        }

        setSelectedStaff(null);
        setOpenModal(true);
    };

    const handleEdit = (user) => {
        setSelectedStaff(user);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedStaff(null);
    };

    // ========================================
    // TOGGLE STATUS
    // ========================================

    const handleToggleStatus = async (user) => {
        if (!branch?.isActive) {
            showNoti(
                "warning",
                "Chi nhánh đang bị khóa, không thể thay đổi trạng thái nhân viên."
            );
            return;
        }

        const action = user.isActive ? "khóa" : "mở khóa";

        const confirmed = window.confirm(
            `Bạn có chắc muốn ${action} tài khoản ${user.email}?`
        );

        if (!confirmed) return;

        try {
            await staffService.toggleStatus(user.id);

            await loadData();

            showNoti(
                "success",
                `${action.charAt(0).toUpperCase() + action.slice(1)} tài khoản thành công.`
            );
        } catch (err) {
            console.error("TOGGLE STAFF STATUS ERROR:", err);

            showNoti(
                "error",
                err.response?.data?.message ||
                    err.message ||
                    "Không thể cập nhật trạng thái nhân viên."
            );
        }
    };

    // ========================================
    // FORMAT DATE
    // ========================================

    const formatDate = (date) => {
        if (!date) return "-";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "-";
        }

        return parsedDate.toLocaleDateString("vi-VN");
    };

    // ========================================
    // NO BRANCH
    // ========================================

    if (!branchId) {
        return (
            <div className="rounded-xl bg-white p-10 text-center shadow">
                <p className="text-gray-500">
                    Tài khoản chưa được gán chi nhánh.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-5">

            {/* HEADER */}
            <div className="flex items-center justify-between gap-4">

                <div>
                    <h1 className="text-2xl font-bold">
                        Quản lý nhân viên
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Chi nhánh:{" "}
                        <span className="font-medium text-[var(--color-primary)]">
                            {branch?.name || "Chi nhánh"}
                        </span>
                    </p>

                    {!branch?.isActive && (
                        <p className="mt-1 text-sm text-red-500">
                            Chi nhánh đang bị khóa. Bạn không thể thêm hoặc
                            chỉnh sửa nhân viên.
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-3">

                    {/* SEARCH */}
                    <div className="relative w-full max-w-sm">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <Input
                            value={keyword}
                            onChange={(e) =>
                                setKeyword(e.target.value)
                            }
                            placeholder="Tìm tên, email hoặc chức vụ..."
                            className="pl-10"
                        />
                    </div>

                    {/* ADD */}
                    <Button
                        disabled={!branch?.isActive || loading}
                        onClick={handleCreate}
                        className="flex items-center gap-2 whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <Plus size={18} />
                        Thêm nhân viên
                    </Button>
                </div>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto rounded-xl bg-white shadow">
                <table className="w-full min-w-[850px]">

                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 text-center">
                                Tài khoản
                            </th>

                            <th className="p-3 text-center">
                                Email
                            </th>

                            <th className="p-3 text-center">
                                Chức vụ
                            </th>

                            <th className="p-3 text-center">
                                Ngày tạo
                            </th>

                            <th className="p-3 text-center">
                                Trạng thái
                            </th>

                            <th className="p-3 text-center">
                                Thao tác
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="p-10 text-center text-gray-500"
                                >
                                    Đang tải...
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="p-10 text-center text-gray-400"
                                >
                                    {keyword
                                        ? "Không tìm thấy nhân viên phù hợp."
                                        : "Chưa có nhân viên."}
                                </td>
                            </tr>
                        ) : (
                            filtered.map((user) => (
                                <tr
                                    key={user.id}
                                    className="border-t hover:bg-gray-50"
                                >
                                    {/* USERNAME */}
                                    <td className="p-3 font-medium">
                                        {user.username}
                                    </td>

                                    {/* EMAIL */}
                                    <td className="p-3">
                                        {user.email}
                                    </td>

                                    {/* ROLE */}
                                    <td className="p-3 text-center">
                                        {ROLE_LABELS[user.role?.name] ||
                                            user.role?.name ||
                                            "-"}
                                    </td>

                                    {/* CREATED DATE */}
                                    <td className="p-3 text-center">
                                        {formatDate(user.createdAt)}
                                    </td>

                                    {/* STATUS */}
                                    <td className="p-3 text-center">
                                        <span
                                            className={`inline-block rounded-full px-3 py-1 text-sm ${
                                                user.isActive
                                                    ? "bg-green-100 text-green-600"
                                                    : "bg-red-100 text-red-600"
                                            }`}
                                        >
                                            {user.isActive
                                                ? "Hoạt động"
                                                : "Đã khóa"}
                                        </span>
                                    </td>

                                    {/* ACTION */}
                                    <td className="p-3">
                                        <div className="flex justify-center gap-2">

                                            {/* EDIT */}
                                            <Button
                                                disabled={!branch?.isActive}
                                                title="Sửa nhân viên"
                                                className="!bg-[var(--color-warning)] disabled:cursor-not-allowed disabled:opacity-40"
                                                onClick={() =>
                                                    handleEdit(user)
                                                }
                                            >
                                                <Pencil size={16} />
                                            </Button>

                                            {/* LOCK / UNLOCK */}
                                            <Button
                                                disabled={!branch?.isActive}
                                                title={
                                                    user.isActive
                                                        ? "Khóa tài khoản"
                                                        : "Mở khóa tài khoản"
                                                }
                                                className={`disabled:cursor-not-allowed disabled:opacity-40 ${
                                                    user.isActive
                                                        ? "!bg-[var(--color-danger)]"
                                                        : "!bg-[var(--color-success)]"
                                                }`}
                                                onClick={() =>
                                                    handleToggleStatus(user)
                                                }
                                            >
                                                {user.isActive ? (
                                                    <Lock size={16} />
                                                ) : (
                                                    <Unlock size={16} />
                                                )}
                                            </Button>

                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* STAFF MODAL */}
            <StaffFormModal
                open={openModal}
                branchId={branchId}
                staff={selectedStaff}
                onClose={handleCloseModal}
                reload={loadData}
            />

            {/* NOTIFICATION */}
            <NotiModal
                open={noti.open}
                type={noti.type}
                title={noti.title}
                message={noti.message}
                onClose={() =>
                    setNoti((prev) => ({
                        ...prev,
                        open: false,
                    }))
                }
            />
        </div>
    );
}
