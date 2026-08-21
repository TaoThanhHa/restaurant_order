import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Pencil, Lock, Unlock } from "lucide-react";

import Button from "../../../components/Button/Button";
import Input from "../../../components/Input/Input";
import branchService from "../../../services/branch.service";
import BranchFormModal from "./BranchFormModal";

export default function Branch() {

    const [branches, setBranches] = useState([]);
    const [keyword, setKeyword] = useState("");
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState(null);

    const loadBranches = async () => {

        try {
            setLoading(true);
            const res = await branchService.getAll();
            setBranches(res.data);
        } catch (err) {
            console.log(err);
            alert(
                err.response?.data?.message ||
                err.message
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBranches();
    }, []);

    // tìm kiếm
    const filtered = useMemo(() => {
        const text = keyword.toLowerCase();
        return branches.filter(branch =>
            branch.name?.toLowerCase().includes(text) ||
            branch.email?.toLowerCase().includes(text) ||
            branch.phone?.toLowerCase().includes(text)
        );
    }, [branches, keyword]);

    // Đổi trạng thái
    const handleToggleStatus = async (branch) => {
        const text = branch.isActive
            ? "Bạn có chắc muốn khóa chi nhánh này?"
            : "Bạn có chắc muốn mở khóa chi nhánh này?";

        if (!window.confirm(text)) return;

        try {
            await branchService.toggleStatus(branch.id);
            await loadBranches(); // <-- thay reload()
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        }
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div className="relative w-80">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <Input
                        value={keyword}
                        onChange={(e) =>
                            setKeyword(e.target.value)
                        }
                        placeholder="Tìm theo tên, email, SĐT..."
                        className="pl-10"
                    />
                </div>

                <Button
                    onClick={() => {
                        setSelectedBranch(null);
                        setOpenModal(true);
                    }}
                    className="flex gap-1 justify-center items-center"
                >
                    <Plus size={18} />
                    Thêm chi nhánh
                </Button>
            </div>

            <div className="overflow-hidden rounded-xl bg-white shadow">
                <table className="w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 text-center">
                                Tên
                            </th>
                            <th className="p-3 text-center">
                                Địa chỉ
                            </th>
                            <th className="p-3 text-center">
                                Email
                            </th>
                            <th className="p-3 text-center">
                                SĐT
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
                        {
                            loading ?
                                <tr>
                                    <td colSpan={7} className="p-10 text-center">
                                        Đang tải...
                                    </td>
                                </tr>
                                :
                                filtered.length === 0 ?
                                    <tr>
                                        <td colSpan={7} className="p-10 text-center text-gray-400">
                                            Không có chi nhánh nào.
                                        </td>
                                    </tr>
                                    :
                                    filtered.map(branch => (

                                        <tr key={branch.id} className="border-t hover:bg-gray-50">
                                            <td className="p-3 font-medium">
                                                {branch.name}
                                            </td>

                                            <td className="p-3">
                                                {branch.address || "-"}
                                            </td>

                                            <td className="p-3">
                                                {branch.email}
                                            </td>

                                            <td className="p-3">
                                                {branch.phone || "-"}
                                            </td>

                                            <td className="text-center">
                                                {
                                                    new Date(
                                                        branch.createdAt
                                                    ).toLocaleDateString("vi-VN")
                                                }
                                            </td>

                                            <td className="text-center">
                                                {
                                                    branch.isActive ?
                                                        <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-[var(--color-success)]">
                                                            HĐ
                                                        </span>
                                                        :  <span className="rounded-full bg-red-100 px-3 py-1 text-sm text-[var(--color-danger)]">                                                              Khóa
                                                        </span>
                                                }
                                            </td>
                                            <td>
                                                <div className="flex justify-center gap-2">
                                                    <Button
                                                        disabled={!branch.isActive}
                                                        className="!bg-[var(--color-warning)] disabled:opacity-40"
                                                        onClick={() => {
                                                            setSelectedBranch(branch);
                                                            setOpenModal(true);
                                                        }}
                                                    >
                                                        <Pencil size={16} />
                                                    </Button>
                                                    <Button
                                                        className={
                                                            branch.isActive
                                                                ? "!bg-[var(--color-danger)]"
                                                                : "!bg-[var(--color-success)]"
                                                        }
                                                        onClick={() => handleToggleStatus(branch)}
                                                    >
                                                        {branch.isActive ? (
                                                            <Lock size={16} />
                                                        ) : (
                                                            <Unlock size={16} />
                                                        )}
                                                    </Button>

                                                </div>

                                            </td>

                                        </tr>

                                    ))
                        }
                    </tbody>
                </table>
            </div>

            <BranchFormModal
                open={openModal}
                branch={selectedBranch}
                onClose={() => setOpenModal(false)}
                reload={loadBranches}
            />
        </div>
    );
}