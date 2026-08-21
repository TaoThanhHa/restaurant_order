import { Outlet } from "react-router-dom";

import Header from "../../components/HeaderAuth/HeaderAuth";
import SidebarAuth from "../../components/SidebarAuth/SidebarAuth";
import Sidebar from "../../components/Sidebar/Sidebar";

import useAuth from "../../hooks/useAuth";

import "./AuthLayout.css";

export default function AuthLayout() {

    const { user } = useAuth();

    return (
        <div className="auth-layout">
            <div className="sidebar-layout">
            {user?.role === "ADMIN"
                ? <Sidebar />
                : <SidebarAuth />
            }
            </div>

            <div className="boxContent">
                <Header className="header"/>
                <main className="content">
                    <Outlet />
                </main>

            </div>

        </div>
    );
}