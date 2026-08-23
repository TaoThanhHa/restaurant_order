import { Lock, Sparkles, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

import Button from "../../../components/Button/Button";
import Input from "../../../components/Input/Input";
import styles from "./Login.module.css";

import authService from "../../../services/auth.service";
import useAuth from "../../../hooks/useAuth";

export default function Login() {
    const navigate = useNavigate();

    const { user, login } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    useEffect(() => {
        if (!user) return;

        if (user.role === "ADMIN") {
            navigate("/admin/dashboard", { replace: true });
        }

        if (user.role === "CASHIER") {
            navigate("/cashier/dashboard", { replace: true });
        }
        if (user.role === "ORDER") {
            navigate("/cashier/tables", {
                replace: true,
            });
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!formData.email.trim()) {
            setError("Vui lòng nhập mail.");
            return;
        }

        if (!formData.password.trim()) {
            setError("Vui lòng nhập mật khẩu.");
            return;
        }

        try {
            setLoading(true);

            const result = await authService.login(formData);

            const { token, user } = result.data;

            login(token, user);

        switch (user.role) {
            case "ADMIN":
                navigate("/admin/dashboard", {
                    replace: true,
                });
                break;

            case "CASHIER":
                navigate("/cashier/dashboard", {
                    replace: true,
                });
                break;

            case "ORDER":
                navigate("/cashier/tables", {
                    replace: true,
                });
                break;

            default:
                setError("Bạn không có quyền truy cập.");
                break;
        }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Đăng nhập thất bại."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className={`flex flex-col justify-center items-center ${styles.bg}`}>
            <div className="flex flex-col">
                {/* <h1 className={styles.title}>
                    Chào mừng bạn tới CAFÉ
                </h1> */}
                <div className={styles.loginCard}>
                    <h2 className={`${styles.loginTitle}`}>
                        Đăng nhập
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="flex items-center m-1">
                            <label className="w-20 shrink-0">
                                Email
                            </label>

                            <Input
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="flex-1"
                                icon={<User size={20} />}
                                placeholder="Nhập mail của bạn"
                            />
                        </div>
                        <div className="flex items-center m-1">
                            <label className="w-20 shrink-0">
                                Mật khẩu
                            </label>

                            <Input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="flex-1"
                                icon={<Lock size={20} />}
                                placeholder="Nhập mật khẩu"
                            />
                        </div>
                        <div className="flex justify-end mb-5 mr-2">
                            <button
                                type="button"
                                onClick={() => navigate("/forgot-password")}
                                className="text-sm text-blue-600 hover:underline"
                            >
                                Quên mật khẩu?
                            </button>
                        </div>
                         {error && (
                            <div className="rounded bg-red-100 p-3 text-sm text-red-600">
                                {error}
                            </div>
                        )}
                        <div className="flex justify-center">
                            <Button className={styles.btnLogin} disabled={loading}>
                                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
}