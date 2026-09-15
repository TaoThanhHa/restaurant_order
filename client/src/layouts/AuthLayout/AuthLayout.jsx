import { Outlet } from "react-router-dom";

import Header from "../../components/HeaderAuth/HeaderAuth";
import SidebarAuth from "../../components/SidebarAuth/SidebarAuth";
import Sidebar from "../../components/Sidebar/Sidebar";
import SidebarSingle from "../../components/SidebarSingle/SidebarSingle";

import useAuth from "../../hooks/useAuth";

import "./AuthLayout.css";

export default function AuthLayout() {
    const { user } = useAuth();

    const isAdmin = user?.role === "ADMIN";
    const isSingle = user?.restaurantMode === "SINGLE";

    return (
        <div className="auth-layout">
            <div className="sidebar-layout">
                {isAdmin ? (
                    isSingle ? (
                        <SidebarSingle />
                    ) : (
                        <Sidebar />
                    )
                ) : (
                    <SidebarAuth />
                )}
            </div>

            <div className="boxContent">
                <Header className="header" />

                <main className="content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}