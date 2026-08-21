import { useState } from "react";
import {
    Store,
    User,
    Lock,
    Palette,
} from "lucide-react";

import RestaurantSection from "./components/RestaurantSection";
import AccountSection from "./components/AccountSection";
import SecuritySection from "./components/SecuritySection";
import AppearanceSection from "./components/AppearanceSection";

function AdminProfile() {

    const [activeSection, setActiveSection] = useState("restaurant");

    const sections = [
        {
            id: "restaurant",
            name: "Thông tin quán",
            description: "Tên quán và logo",
            icon: Store,
        },
        {
            id: "account",
            name: "Tài khoản",
            description: "Email đăng nhập",
            icon: User,
        },
        {
            id: "security",
            name: "Bảo mật",
            description: "Đổi mật khẩu",
            icon: Lock,
        },
        {
            id: "appearance",
            name: "Giao diện",
            description: "Tùy chỉnh giao diện",
            icon: Palette,
        },
    ];

    const renderSection = () => {

        switch (activeSection) {

            case "restaurant":
                return <RestaurantSection />;

            case "account":
                return <AccountSection />;

            case "security":
                return <SecuritySection />;

            case "appearance":
                return <AppearanceSection />;

            default:
                return <RestaurantSection />;
        }
    };

    return (
        <div className="p-6">

            {/* TITLE */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[var(--color-text)]">
                    Cài đặt
                </h1>

                <p className="mt-1 text-[var(--color-text-muted)]">
                    Quản lý thông tin tài khoản và nhà hàng
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* SIDEBAR SETTINGS */}
                <div className="bg-white rounded-xl border border-[var(--color-border)] p-3 h-fit">
                    {sections.map((section) => {
                        const Icon = section.icon;
                        const active = activeSection === section.id;
                        return (
                            <button
                                key={section.id}
                                type="button"
                                onClick={() => setActiveSection(section.id)}
                                className={` w-full flex items-center gap-3 p-3 rounded-lg text-left transition mb-1
                                    ${
                                        active
                                            ? "bg-[var(--color-primary)] text-white"
                                            : "text-[var(--color-text)] hover:bg-gray-100"
                                    }
                                `}
                            >
                                <Icon size={20} />
                                <div>
                                    <div className="font-medium">
                                        {section.name}
                                    </div>
                                    <div
                                        className={` text-xs mt-0.5
                                            ${
                                                active
                                                    ? "text-white/80"
                                                    : "text-[var(--color-text-muted)]"
                                            }
                                        `}
                                    >
                                        {section.description}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
                {/* CONTENT */}
                <div className="lg:col-span-3">
                    {renderSection()}
                </div>
            </div>
        </div>
    );
}

export default AdminProfile;