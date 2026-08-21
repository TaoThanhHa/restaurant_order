import { useEffect, useState } from "react";
import { X } from "lucide-react";

import Button from "../../../components/Button/Button";
import branchService from "../../../services/branch.service";

export default function BranchFormModal({
    open,
    onClose,
    reload,
    branch,
}) {

    if (!open) return;

    const [form, setForm] = useState({
        name: "",
        address: "",
        email: "",
        phone: "",
    });

    const [loading, setLoading] = useState(false);

      
    // LOAD DATA
      

    useEffect(() => {

        if (branch) {

            setForm({

                name: branch.name || "",

                address: branch.address || "",

                email: branch.email || "",

                phone: branch.phone || "",

            });

        } else {

            setForm({

                name: "",

                address: "",

                email: "",

                phone: "",

            });

        }

    }, [branch, open]);

      
    // INPUT
      

    const handleChange = (e) => {

        setForm({

            ...form,

            [e.target.name]: e.target.value,

        });

    };

      
    // SAVE
      

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            setLoading(true);

            if (branch) {

                const emailChanged =
                    branch.email !== form.email;

                await branchService.update(
                    branch.id,
                    form
                );

                if (emailChanged) {

                    alert(
                        "Đã cập nhật chi nhánh.\nEmail đăng nhập đã thay đổi, hệ thống đã tạo mật khẩu mới và gửi tới email mới."
                    );

                } else {

                    alert("Cập nhật chi nhánh thành công.");

                }

            } else {

                await branchService.create(form);

                alert(
                    "Tạo chi nhánh thành công.\nThông tin đăng nhập đã được gửi tới email của chi nhánh."
                );

            }

            reload();

            onClose();

        } catch (err) {

            alert(
                err.response?.data?.message ||
                err.message
            );

        } finally {

            setLoading(false);

        }

    };

      

    if (!open) return null;

    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

            <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">

                <div className="flex items-center justify-between border-b p-5">

                    <h2 className="text-xl font-bold">

                        {
                            branch
                                ? "Cập nhật chi nhánh"
                                : "Thêm chi nhánh"
                        }

                    </h2>

                    <button

                        type="button"

                        disabled={loading}

                        onClick={() => {

                            if (!loading) {

                                onClose();

                            }

                        }}

                    >

                        <X />

                    </button>

                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5 p-5"
                >

                    <div>

                        <label className="mb-1 block font-medium">

                            Tên chi nhánh *

                        </label>

                        <input

                            name="name"
                            disabled={loading}

                            value={form.name}

                            onChange={handleChange}

                            className="w-full rounded-lg border p-3 outline-none"

                            required

                        />

                    </div>

                    <div>

                        <label className="mb-1 block font-medium">

                            Địa chỉ

                        </label>

                        <input

                            name="address"

                            value={form.address}

                            onChange={handleChange}

                            className="w-full rounded-lg border p-3 outline-none"

                        />

                    </div>

                    <div>

                        <label className="mb-1 block font-medium">

                            Email *

                        </label>

                        <input

                            type="email"

                            name="email"

                            value={form.email}

                            onChange={handleChange}

                            className="w-full rounded-lg border p-3 outline-none"

                            required

                        />

                    </div>

                    <div>

                        <label className="mb-1 block font-medium">

                            Số điện thoại

                        </label>

                        <input

                            name="phone"

                            value={form.phone}

                            onChange={handleChange}

                            className="w-full rounded-lg border p-3 outline-none"

                        />

                    </div>

                    <div className="flex justify-end gap-3">

                        <Button

                            type="button"

                            disabled={loading}

                            className="!bg-gray-400"

                            onClick={onClose}

                        >

                            Hủy

                        </Button>

                        <Button
                            type="submit"
                            disabled={loading}
                        >

                            {

                                loading

                                    ? "Đang lưu..."

                                    : branch

                                        ? "Cập nhật"

                                        : "Thêm mới"

                            }

                        </Button>

                    </div>

                </form>

            </div>

        </div>

    );

}