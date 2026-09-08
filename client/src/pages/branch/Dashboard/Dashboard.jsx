import { Link } from "react-router-dom";

import {
    Layers3,
    Users,
    ScrollText,
    ChartNoAxesCombined,
} from "lucide-react";

import styles from "./Dashboard.module.css";

export default function Dashboard() {

    const menus = [

        {
            title: "Quản lý tầng bàn",
            description:
                "Quản lý tầng và bố trí bàn tại chi nhánh.",
            path: "/branch/table",
            icon: <Layers3 size={40} />,
        },

        {
            title: "Quản lý nhân viên",
            description:
                "Quản lý nhân viên đang làm việc tại chi nhánh.",
            path: "/branch/employee",
            icon: <Users size={40} />,
        },

        {
            title: "Quản lý hóa đơn",
            description:
                "Theo dõi và xem lịch sử hóa đơn của chi nhánh.",
            path: "/branch/order-history",
            icon: <ScrollText size={40} />,
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

            {/* HEADER */}

            <div>

                <h1 className="text-3xl font-bold text-[var(--color-text)]">
                    Dashboard Branch
                </h1>

                <p className="mt-2 text-[var(--color-text-muted)]">
                    Chào mừng bạn đến với hệ thống quản lý chi nhánh.
                </p>

            </div>


            {/* MENU */}

            <div className="grid grid-cols-1 gap-6 bg-[var(--color-background)] md:grid-cols-2 xl:grid-cols-4">

                {menus.map((item) => (

                    <Link
                        key={item.path}
                        to={item.path}
                        className={`
                            rounded-xl
                            bg-white
                            p-6
                            shadow
                            transition-all
                            hover:-translate-y-1
                            hover:bg-[var(--color-secondary)]
                            hover:shadow-lg
                            ${styles.card}
                        `}
                    >

                        <div className="mb-4 flex justify-center text-4xl text-[var(--color-primary)]">

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
