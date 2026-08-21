import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function ProtectedRoute({
    children,
    roles = [],
}) {

    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                Đang tải...
            </div>
        );
    }

    // Chưa đăng nhập
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Không đúng quyền
    if (
        roles.length > 0 &&
        !roles.includes(user.role)
    ) {
        return <Navigate to="/login" replace />;
    }

    return children;
}