import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Pencil, Lock, Unlock } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Button from "../../../components/Button/Button";
import Input from "../../../components/Input/Input";
import branchService from "../../../services/branch.service";
import BranchFormModal from "./BranchFormModal";

export default function Branch() {
    const navigate = useNavigate();

    const [branches, setBranches] = useState([]);
    const [keyword, setKeyword] = useState("");
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("active");
    const [openModal, setOpenModal] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState(null);

    const loadBranches = async () => {
        try {
            setLoading(true);
            const res = await branchService.getAll();
            setBranches(res.data);
        } catch (err) {
            console.log(err);
            alert(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBranches();
    }, []);

    const filtered = useMemo(() => {
        const text = keyword.toLowerCase();

        return branches.filter(branch => {
            const matchStatus = activeTab === "active"
                ? branch.isActive
                : !branch.isActive;

            const matchKeyword =
                branch.name?.toLowerCase().includes(text) ||
                branch.email?.toLowerCase().includes(text) ||
                branch.phone?.toLowerCase().includes(text);

            return matchStatus && matchKeyword;
        });
    }, [branches, keyword, activeTab]);

    const activeCount = branches.filter(branch => branch.isActive).length;
    const lockedCount = branches.filter(branch => !branch.isActive).length;

    const handleToggleStatus = async (branch) => {
        const text = branch.isActive
            ? "Bạn có chắc muốn khóa chi nhánh này?"
            : "Bạn có chắc muốn mở khóa chi nhánh này?";

        if (!window.confirm(text)) return;

        try {
            await branchService.toggleStatus(branch.id);
            await loadBranches();
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        }
    };

    return (
        <div className="space-y-5">
            <h1 className="m-3 font-bold text-[var(--color-text)]">
                Quản lý chi nhánh
            </h1>

            <div className="flex items-center justify-between pt-3">
                <div className="relative w-80">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <Input
                        value={keyword}
                        onChange={e => setKeyword(e.target.value)}
                        placeholder="Tìm theo tên, email, SĐT..."
                        className="pl-10"
                    />
                </div>

                <Button
                    onClick={() => {
                        setSelectedBranch(null);
                        setOpenModal(true);
                    }}
                    className="flex items-center justify-center gap-1"
                >
                    <Plus size={18} />
                    Thêm chi nhánh
                </Button>
            </div>

            <div className="flex gap-2 border-b">
                <button
                    onClick={() => setActiveTab("active")}
                    className={`px-4 py-3 font-medium ${
                        activeTab === "active"
                            ? "border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]"
                            : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                    Đang hoạt động ({activeCount})
                </button>

                <button
                    onClick={() => setActiveTab("locked")}
                    className={`px-4 py-3 font-medium ${
                        activeTab === "locked"
                            ? "border-b-2 border-[var(--color-danger)] text-[var(--color-danger)]"
                            : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                    Chi nhánh bị khóa ({lockedCount})
                </button>
            </div>

            <div className="overflow-hidden rounded-xl bg-white shadow">
                <table className="w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 text-center">Tên</th>
                            <th className="p-3 text-center">Địa chỉ</th>
                            <th className="p-3 text-center">Email</th>
                            <th className="p-3 text-center">SĐT</th>
                            <th className="p-3 text-center">Trạng thái</th>
                            <th className="p-3 text-center">Thao tác</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="p-10 text-center">
                                    Đang tải...
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-10 text-center text-gray-400">
                                    {activeTab === "locked"
                                        ? "Không có chi nhánh bị khóa."
                                        : "Không có chi nhánh đang hoạt động."}
                                </td>
                            </tr>
                        ) : (
                            filtered.map(branch => (
                                <tr
                                    key={branch.id}
                                    className="border-t hover:bg-gray-50"
                                >
                                    <td className="p-3 font-medium">{branch.name}</td>
                                    <td className="p-3">{branch.address || "-"}</td>
                                    <td className="p-3">{branch.email}</td>
                                    <td className="p-3">{branch.phone || "-"}</td>

                                    <td className="text-center">
                                        {branch.isActive ? (
                                            <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-[var(--color-success)]">
                                                HĐ
                                            </span>
                                        ) : (
                                            <span className="rounded-full bg-red-100 px-3 py-1 text-sm text-[var(--color-danger)]">
                                                Khóa
                                            </span>
                                        )}
                                    </td>

                                    <td>
                                        <div className="flex justify-center gap-1 pr-1">
                                            <Button
                                                disabled={!branch.isActive}
                                                title="Sửa chi nhánh"
                                                className="!bg-[var(--color-warning)] disabled:opacity-40"
                                                onClick={() => {
                                                    setSelectedBranch(branch);
                                                    setOpenModal(true);
                                                }}
                                            >
                                                <Pencil size={16} />
                                            </Button>

                                            <Button
                                                title={
                                                    branch.isActive
                                                        ? "Khóa chi nhánh"
                                                        : "Mở khóa chi nhánh"
                                                }
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
                        )}
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
