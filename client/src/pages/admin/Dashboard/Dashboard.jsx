// src/pages/cashier/Dashboard.jsx

import { Link } from "react-router-dom";
import { Building2, UtensilsCrossed, ChartNoAxesCombined, Table2, Users } from "lucide-react";
import styles from "./Dashboard.module.css";

export default function Dashboard() {
    const menus = [
        {
            title: "Quản lý cơ sở",
            description: "Xem trạng thái bàn và tạo đơn tại quán.",
            path: "/admin/branch",
            icon: <Building2 size={40} />,
        },
        {
            title: "Quản lý bàn",
            description: "Quản lý bàn, tầng của các cơ sở",
            path: "/admin/table",
            icon: <Table2 size={40}/>,
        },
        {
            title: "Quản lý thực đơn",
            description: "Quán lý menu các chi nhánh",
            path: "/admin/menu",
            icon: <UtensilsCrossed size={40}/>,
        },
        { 
            title: "Quản lý khách hàng thành viên",
            description: "Quản lý thông tin khách hàng đã đăng ký thành viên.",
            path: "/customers",
            icon: <Users size={40}/>,
        },
        {
            title: "Thống kê",
            description: "Xem doanh thu và số lượng đơn.",
            path: "/statistics",
            icon: <ChartNoAxesCombined size={40}/>,
        },
    ];

    return (
        <div className="space-y-6">
            {/* Tiêu đề */}
            <div>
                <h1 className="text-3xl font-bold text-[var(--color-text)]">
                    Dashboard Admin
                </h1>

                <p className="mt-2 text-[var(--color-text-muted)]">
                    Chào mừng bạn đến với hệ thống quản lý nhà hàng.
                </p>
            </div>

            {/* Menu */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                {menus.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`rounded-xl bg-white p-6 shadow transition-all hover:-translate-y-1 hover:shadow-lg hover:bg-[var(--color-secondary-hover)] ${styles.card}`}
                    >
                        <div className="mb-4 text-4xl flex justify-center text-[var(--color-primary)]">
                            {item.icon}
                        </div>

                        <h2 className="text-xl font-semibold text-[var(--color-text)]">
                            {item.title}
                        </h2>

                        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                            {item.description}
                        </p>
                    </Link>
                ))}
            </div>
        </div>
    );
}