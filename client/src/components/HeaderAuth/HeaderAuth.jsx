import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { LogOut } from "lucide-react";
import "./HeaderAuth.css";

export default function Header() {
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    const handleLogout = () => {
        logout();

        navigate("/login", {
            replace: true,
        });
    };

    return (
        <header className="header">
            <div className="header-left flex items-center justify-center gap-3">
                 
            </div>

            <div className="header-right">
                <span>
                    {user?.branch?.name || "Toàn hệ thống"}
                </span>

                <button  className="flex jutsy-center items-center !bg-red-700 !text-white gap-2"onClick={handleLogout}>
                <LogOut size={20}/>
                    Đăng xuất
                </button>
            </div>
        </header>
    );
}