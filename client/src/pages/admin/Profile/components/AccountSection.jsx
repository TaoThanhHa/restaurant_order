import { useEffect, useState } from "react";
import { Mail, Send, Check,} from "lucide-react";

import adminService from "../../../../services/admin.service";

function AccountSection() {

    const [profile, setProfile] = useState(null);
    const [editingEmail, setEditingEmail] = useState(false);
    const [newEmail, setNewEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const res = await adminService.getProfile();
            const data = res.data || res;
            setProfile(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleRequestOtp = async () => {
        if (!newEmail.trim()) {
            alert("Vui lòng nhập email mới.");
            return;
        }
        try {
            setLoading(true);
            await adminService.requestChangeEmail(newEmail);
            setOtpSent(true);
            alert("OTP đã được gửi đến email mới.");

        } catch (error) {
            alert(error.response?.data?.message ||"Không thể gửi OTP.");
        } finally {
            setLoading(false);
        }
    };


    const handleVerifyOtp = async () => {
        if (!otp.trim()) {
            alert("Vui lòng nhập OTP.");
            return;
        }

        try {
            setLoading(true);
            await adminService.verifyChangeEmail(otp);
            alert("Đổi email thành công.");
            setEditingEmail(false);
            setOtpSent(false);
            setNewEmail("");
            setOtp("");
            await loadProfile();
        } catch (error) {
            alert(error.response?.data?.message ||"OTP không hợp lệ.");
        } finally {
            setLoading(false);
        }
    };

    if (!profile) {
        return (
            <section className="bg-white rounded-xl border p-6">
                Đang tải thông tin tài khoản...
            </section>
        );
    }


    return (
        <section className="bg-white rounded-xl border border-[var(--color-border)] p-6  " >
            <div className="mb-6">
                <h2 className="text-xl font-bold text-[var(--color-text)]">
                    Tài khoản
                </h2>

                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                    Quản lý thông tin đăng nhập
                </p>
            </div>

            {/* USERNAME 

            <div className="mb-5">
                <label className="block mb-2 font-medium">
                    Tên tài khoản
                </label>

                <input
                    type="text"
                    value={profile.username || ""}
                    disabled
                    className=" w-full px-4 py-3 rounded-lg border bg-gray-100 text-gray-500"
                />
            </div>*/}

            {/* EMAIL */}

            <div>
                <label className="block mb-2 font-medium">
                    Email đăng nhập
                </label>

                <div className="flex gap-3">
                    <input
                        type="email"
                        value={profile.email || ""}
                        disabled
                        className=" flex-1 px-4 py-3 rounded-lg border bg-gray-100 "
                    />

                    {!editingEmail && (

                        <button
                            type="button"
                            onClick={() => setEditingEmail(true) }
                            className=" px-4 py-3 rounded-lg bg-[var(--color-primary)] text-white"
                        >
                            Sửa email
                        </button>
                    )}
                </div>
            </div>

            {/* CHANGE EMAIL */}

            {editingEmail && (
                <div className=" mt-6 p-5 rounded-xl bg-gray-50 border">
                    <h3 className="font-semibold mb-4">
                        Đổi email
                    </h3>

                    <div className="flex gap-3 mb-4">
                        <input
                            type="email"
                            value={newEmail}
                            onChange={(e) =>setNewEmail(e.target.value) }
                            placeholder="Nhập email mới"
                            className=" flex-1 px-4 py-3 rounded-lg border outline-none "
                        />

                        <button
                            type="button"
                            disabled={loading}
                            onClick={handleRequestOtp}
                            className=" flex items-center gap-2 px-4 py-3 rounded-lg bg-[var(--color-primary)] text-white "
                        >
                            <Send size={18} />
                            {loading ? "Đang gửi..." : "Gửi OTP"}
                        </button>
                    </div>

                    {otpSent && (
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) =>
                                    setOtp(e.target.value)
                                }
                                placeholder="Nhập mã OTP"
                                maxLength={6}
                                className=" flex-1 px-4 py-3 rounded-lg border "
                            />

                            <button
                                type="button"
                                disabled={loading}
                                onClick={handleVerifyOtp}
                                className=" flex items-center gap-2 px-4 py-3 rounded-lg bg-green-600 text-white "
                            >
                                <Check size={18} />
                                Xác nhận
                            </button>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}

export default AccountSection;