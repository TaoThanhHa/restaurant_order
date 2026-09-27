import { useEffect, useState } from "react";
import { CreditCard, Pencil, Plus, Trash2, Power } from "lucide-react";

import Button from "../../../../components/Button/Button";
import NotiModal from "../../../../components/NotiModal/NotiModal";
import paymentService from "../../../../services/payment.service";
import useAuth from "../../../../hooks/useAuth";
import vietnamBanks from "../../../../constants/vietnamBanks";

export default function PaymentAccountSection() {
    const { user } = useAuth();

    const [accounts, setAccounts] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);

    const [form, setForm] = useState({
        bankCode: "",
        accountNumber: "",
        accountName: "",
        branchId: "",
    });

    const [noti, setNoti] = useState({
        open: false,
        type: "success",
        message: "",
    });

    const isMulti = user?.restaurantMode === "MULTI";

    const loadData = async () => {
        try {
            setLoading(true);

            const response = await paymentService.getAll();
            const data = response?.data || response;

            setAccounts(data.accounts || []);
            setBranches(data.branches || []);
        } catch (err) {
            setNoti({
                open: true,
                type: "error",
                message:
                    err.response?.data?.message ||
                    "Không thể tải tài khoản ngân hàng.",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const resetForm = () => {
        setForm({
            bankCode: "",
            accountNumber: "",
            accountName: "",
            branchId: "",
        });

        setEditingAccount(null);
        setShowForm(false);
    };

    const handleSubmit = async e => {
        e.preventDefault();

        try {
            const data = {
                bankCode: form.bankCode.trim(),
                accountNumber: form.accountNumber.trim(),
                accountName: form.accountName.trim(),
                branchId: form.branchId
                    ? Number(form.branchId)
                    : null,
            };

            if (editingAccount) {
                await paymentService.updateAccount(
                    editingAccount.id,
                    data
                );

                setNoti({
                    open: true,
                    type: "success",
                    message: "Đã cập nhật tài khoản ngân hàng.",
                });
            } else {
                await paymentService.createAccount(data);

                setNoti({
                    open: true,
                    type: "success",
                    message: "Đã thêm tài khoản ngân hàng.",
                });
            }

            resetForm();
            await loadData();
        } catch (err) {
            setNoti({
                open: true,
                type: "error",
                message:
                    err.response?.data?.message ||
                    "Không thể lưu tài khoản ngân hàng.",
            });
        }
    };

    const handleEdit = account => {
        setEditingAccount(account);

        setForm({
            bankCode: account.bankCode || "",
            accountNumber: account.accountNumber || "",
            accountName: account.accountName || "",
            branchId: account.branchId
                ? String(account.branchId)
                : "",
        });

        setShowForm(true);
    };

    const handleDelete = async account => {
        try {
            await paymentService.removeAccount(account.id);

            setNoti({
                open: true,
                type: "success",
                message: "Đã xóa tài khoản ngân hàng.",
            });

            await loadData();
        } catch (err) {
            setNoti({
                open: true,
                type: "error",
                message:
                    err.response?.data?.message ||
                    "Không thể xóa tài khoản ngân hàng.",
            });
        }
    };

    const handleToggle = async account => {
        try {
            await paymentService.toggleAccount(
                account.id,
                !account.isActive
            );

            await loadData();
        } catch (err) {
            setNoti({
                open: true,
                type: "error",
                message:
                    err.response?.data?.message ||
                    "Không thể thay đổi trạng thái tài khoản.",
            });
        }
    };

    return (
        <>
            <div className="rounded-xl border border-[var(--color-border)] bg-white">
                <div className="flex items-center justify-between border-b p-5">
                    <div>
                        <h2 className="text-lg font-bold text-[var(--color-text)]">
                            Tài khoản ngân hàng
                        </h2>

                        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                            Tài khoản dùng để nhận thanh toán chuyển khoản
                        </p>
                    </div>

                    <Button
                        type="button"
                        onClick={() => {
                            resetForm();
                            setShowForm(true);
                        }}
                    >
                        <Plus size={18} />
                        Thêm tài khoản
                    </Button>
                </div>

                {showForm && (
                    <form
                        onSubmit={handleSubmit}
                        className="border-b bg-gray-50 p-5"
                    >
                        <h3 className="mb-4 font-semibold">
                            {editingAccount
                                ? "Chỉnh sửa tài khoản"
                                : "Thêm tài khoản ngân hàng"}
                        </h3>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Ngân hàng
                                </label>

                                <select
                                    value={form.bankCode}
                                    onChange={e =>
                                        setForm(prev => ({
                                            ...prev,
                                            bankCode: e.target.value,
                                        }))
                                    }
                                    className="w-full rounded-lg border px-3 py-2 outline-none focus:border-[var(--color-primary)]"
                                    required
                                >
                                    <option value="">
                                        Chọn ngân hàng
                                    </option>

                                    {vietnamBanks.map(bank => (
                                        <option
                                            key={bank.code}
                                            value={bank.code}
                                        >
                                            {bank.name} ({bank.code})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Số tài khoản
                                </label>

                                <input
                                    value={form.accountNumber}
                                    onChange={e =>
                                        setForm(prev => ({
                                            ...prev,
                                            accountNumber: e.target.value,
                                        }))
                                    }
                                    placeholder="Nhập số tài khoản"
                                    className="w-full rounded-lg border px-3 py-2 outline-none focus:border-[var(--color-primary)]"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Tên chủ tài khoản
                                </label>

                                <input
                                    value={form.accountName}
                                    onChange={e =>
                                        setForm(prev => ({
                                            ...prev,
                                            accountName: e.target.value.toUpperCase(),
                                        }))
                                    }
                                    placeholder="VD: NGUYEN VAN A"
                                    className="w-full rounded-lg border px-3 py-2 outline-none focus:border-[var(--color-primary)]"
                                    required
                                />
                            </div>

                            {isMulti && (
                                <div>
                                    <label className="mb-1 block text-sm font-medium">
                                        Chi nhánh
                                    </label>

                                    <select
                                        value={form.branchId}
                                        onChange={e =>
                                            setForm(prev => ({
                                                ...prev,
                                                branchId: e.target.value,
                                            }))
                                        }
                                        className="w-full rounded-lg border px-3 py-2 outline-none focus:border-[var(--color-primary)]"
                                        required
                                    >
                                        <option value="">
                                            Chọn chi nhánh
                                        </option>

                                        {branches.map(branch => (
                                            <option
                                                key={branch.id}
                                                value={branch.id}
                                            >
                                                {branch.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="mt-5 flex justify-end gap-2">
                            <Button
                                type="button"
                                onClick={resetForm}
                            >
                                Hủy
                            </Button>

                            <Button type="submit">
                                {editingAccount
                                    ? "Lưu thay đổi"
                                    : "Thêm tài khoản"}
                            </Button>
                        </div>
                    </form>
                )}

                <div className="p-5">
                    {loading ? (
                        <div className="py-10 text-center text-gray-500">
                            Đang tải...
                        </div>
                    ) : accounts.length === 0 ? (
                        <div className="rounded-xl border border-dashed p-10 text-center">
                            <CreditCard
                                size={40}
                                className="mx-auto mb-3 text-gray-400"
                            />

                            <div className="font-medium">
                                Chưa có tài khoản ngân hàng
                            </div>

                            <p className="mt-1 text-sm text-gray-500">
                                Thêm tài khoản để nhận thanh toán chuyển khoản.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {accounts.map(account => (
                                <div
                                    key={account.id}
                                    className="rounded-xl border p-4"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex gap-3">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--color-primary)]/10">
                                                <CreditCard
                                                    size={22}
                                                    className="text-[var(--color-primary)]"
                                                />
                                            </div>

                                            <div>
                                                <div className="font-bold">
                                                    {account.bankCode}
                                                </div>

                                                <div className="text-sm text-gray-600">
                                                    {account.accountNumber}
                                                </div>

                                                <div className="text-sm font-medium">
                                                    {account.accountName}
                                                </div>

                                                {account.branch && (
                                                    <div className="mt-1 text-xs text-gray-500">
                                                        Chi nhánh:{" "}
                                                        {account.branch.name}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                account.isActive
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-100 text-gray-500"
                                            }`}
                                        >
                                            {account.isActive
                                                ? "Đang hoạt động"
                                                : "Đã tắt"}
                                        </span>
                                    </div>

                                    <div className="mt-4 flex justify-end gap-2 border-t pt-3">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleToggle(account)
                                            }
                                            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm hover:bg-gray-100"
                                        >
                                            <Power size={16} />
                                            {account.isActive
                                                ? "Tắt"
                                                : "Bật"}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleEdit(account)
                                            }
                                            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm hover:bg-gray-100"
                                        >
                                            <Pencil size={16} />
                                            Sửa
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDelete(account)
                                            }
                                            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 size={16} />
                                            Xóa
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <NotiModal
                open={noti.open}
                type={noti.type}
                message={noti.message}
                onClose={() =>
                    setNoti(prev => ({
                        ...prev,
                        open: false,
                    }))
                }
            />
        </>
    );
}