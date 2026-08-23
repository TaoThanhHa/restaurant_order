import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Pencil, Lock, Unlock, ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import Button from "../../../components/Button/Button";
import Input from "../../../components/Input/Input";
import branchService from "../../../services/branch.service";
import staffService from "../../../services/staff.service";
import StaffFormModal from "./StaffFormModal";

export default function BranchStaff() {

    const { branchId } = useParams();
    const navigate = useNavigate();

    const [branch, setBranch] = useState(null);
    const [staff, setStaff] = useState([]);

    const [keyword, setKeyword] = useState("");
    const [loading, setLoading] = useState(true);

    const [openModal, setOpenModal] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);

    const loadData = async () => {
    try {
        setLoading(true);

        const [branchRes, staffRes] = await Promise.all([
            branchService.getById(branchId),
            staffService.getAll(branchId),
        ]);

        console.log("BRANCH RESPONSE:", branchRes);
        console.log("STAFF RESPONSE:", staffRes);

        const branchData =
            branchRes.data?.data || branchRes.data;

        const staffData =
            staffRes.data?.data?.staff ||
            staffRes.data?.staff ||
            [];
            
        setBranch(branchData);
        setStaff(Array.isArray(staffData) ? staffData : []);

    } catch (err) {
        console.error("LOAD STAFF ERROR:", err);

        setStaff([]);

        alert(
            err.response?.data?.message ||
            err.message
        );
    } finally {
        setLoading(false);
    }
};

    useEffect(() => {

        loadData();

    }, [branchId]);

    const filtered = useMemo(() => {

        const text = keyword.toLowerCase().trim();

        return staff.filter(user =>
            user.username?.toLowerCase().includes(text) ||
            user.email?.toLowerCase().includes(text) ||
            user.role?.name?.toLowerCase().includes(text)
        );

    }, [staff, keyword]);

    const handleToggleStatus = async (user) => {

        const text = user.isActive
            ? `Bạn có chắc muốn khóa tài khoản ${user.email}?`
            : `Bạn có chắc muốn mở khóa tài khoản ${user.email}?`;

        if (!window.confirm(text)) return;

        try {

            await staffService.toggleStatus(
                branchId,
                user.id
            );

            await loadData();

        } catch (err) {

            alert(
                err.response?.data?.message ||
                err.message
            );

        }

    };

    return (

        <div className="space-y-5">

            {/* HEADER */}

            <div className="flex items-center justify-between">

                <div>

                    <button
                        onClick={() =>
                            navigate("/admin/branch")
                        }
                        className="mb-2 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800"
                    >
                        <ArrowLeft size={16} />
                        Quay lại chi nhánh
                    </button>

                    <h1 className="text-2xl font-bold">

                        Nhân viên

                        {branch && (
                            <span className="ml-2 text-[var(--color-primary)]">
                                - {branch.name}
                            </span>
                        )}

                    </h1>

                </div>

                <Button
                    disabled={!branch?.isActive}
                    onClick={() => {
 console.log("MỞ MODAL THÊM NHÂN VIÊN");
                        setSelectedStaff(null);
                        setOpenModal(true);

                    }}
                    className="flex items-center gap-2 disabled:opacity-40"
                >
                    <Plus size={18} />
                    Thêm nhân viên
                </Button>

            </div>

            {/* SEARCH */}

            <div className="relative w-80">

                <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <Input
                    value={keyword}
                    onChange={(e) =>
                        setKeyword(e.target.value)
                    }
                    placeholder="Tìm nhân viên..."
                    className="pl-10"
                />

            </div>

            {/* TABLE */}

            <div className="overflow-hidden rounded-xl bg-white shadow">

                <table className="w-full">

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
                                    className="p-10 text-center"
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
                                    Chưa có nhân viên.
                                </td>

                            </tr>

                        ) : (

                            filtered.map(user => (

                                <tr
                                    key={user.id}
                                    className="border-t hover:bg-gray-50"
                                >

                                    <td className="p-3 font-medium">
                                        {user.username}
                                    </td>

                                    <td className="p-3">
                                        {user.email}
                                    </td>

                                    <td className="p-3 text-center">

                                        {user.role?.name === "ORDER"
                                            ? "Nhân viên order"
                                            : "Nhân viên bếp"}

                                    </td>

                                    <td className="p-3 text-center">

                                        {new Date(
                                            user.createdAt
                                        ).toLocaleDateString("vi-VN")}

                                    </td>

                                    <td className="text-center">

                                        {user.isActive ? (

                                            <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-600">
                                                Hoạt động
                                            </span>

                                        ) : (

                                            <span className="rounded-full bg-red-100 px-3 py-1 text-sm text-red-600">
                                                Đã khóa
                                            </span>

                                        )}

                                    </td>

                                    <td>

                                        <div className="flex justify-center gap-2">

                                            <Button
                                                disabled={!branch?.isActive}
                                                title="Sửa"
                                                className="!bg-[var(--color-warning)] disabled:opacity-40"
                                                onClick={() => {

                                                    setSelectedStaff(user);
                                                    setOpenModal(true);

                                                }}
                                            >
                                                <Pencil size={16} />
                                            </Button>

                                            <Button
                                                title={
                                                    user.isActive
                                                        ? "Khóa tài khoản"
                                                        : "Mở khóa tài khoản"
                                                }
                                                className={
                                                    user.isActive
                                                        ? "!bg-[var(--color-danger)]"
                                                        : "!bg-[var(--color-success)]"
                                                }
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

            <StaffFormModal
                open={openModal}
                branchId={branchId}
                staff={selectedStaff}
                onClose={() => setOpenModal(false)}
                reload={loadData}
            />

        </div>

    );

}