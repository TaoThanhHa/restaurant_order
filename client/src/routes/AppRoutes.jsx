import { Routes, Route, Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

import Login from "../pages/auth/Login/Login";
import AuthLayout from "../layouts/AuthLayout/AuthLayout";
import ForgotPassword from "../pages/auth/Login/ForgotPassword";

import CashierDashboard from "../pages/branch/Dashboard/Dashboard";
import Tables from "../pages/cashier/Tables/Tables";
import TableDetail from "../pages/cashier/Tables/TableDetail/TableDetail";
import Foods from "../pages/cashier/Foods/Foods";
import TakeAwayOrder from "../pages/cashier/TakeAwayOrder/TakeAwayOrder";
import OrderHistory from "../pages/branch/OrderHistory/OrderHistory";
import TableManagement from "../pages/admin/Table/FloorManagement";
import Profile from "../pages/branch/Profile/BranchProfile";
import BranchStaff from "../pages/branch/Employee/BranchStaff";

import AdminDashboard from "../pages/admin/Dashboard/Dashboard";
import Menu from "../pages/admin/Menu/Menu";
import Branch from "../pages/admin/Branch/Branch";
import CustomerManagement from "../pages/admin/Customers/CustomersManagement";
import Statistics from "../pages/admin/Statistics/Statistics";
import AdminProfile from "../pages/admin/Profile/AdminProfile";

import CustomerWelcome from "../pages/customer/CustomerWelcome";
import CustomerGuest from "../pages/customer/CustomerGuest";
import CustomerLogin from "../pages/customer/CustomerLogin";
import CustomerRegister from "../pages/customer/CustomerRegister";
import CustomerForgotPassword from "../pages/customer/CustomerForgotPassword";
import Home from "../pages/customer/Home/Home";
import Order from "../pages/customer/Order/Order";
import Account from "../pages/customer/Account/Account";
import CustomerOrderHistory from "../pages/customer/Account/OrderHistory";

import OrderLayout from "../layouts/OrderLayout/OrderLayout";
import Kitchen from "../pages/kitchen/Kitchen";

import Warehouse from "../pages/warehouse/Warehouse";
import InventoryImport from "../pages/warehouse/Import/InventoryImport";

import HomePage from "../pages/auth/HomePage/HomePage";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
    const { user } = useAuth();

    return (
        <Routes>
            <Route path="/" element={<HomePage />} />

            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* BRANCH / CASHIER / ORDER */}
            <Route
                path="/branch"
                element={
                    <ProtectedRoute roles={["BRANCH", "ORDER", "CASHIER"]}>
                        {user?.role === "ORDER" ? <OrderLayout /> : <AuthLayout />}
                    </ProtectedRoute>
                }
            >
                <Route path="dashboard" element={<CashierDashboard />} />
                <Route path="tables" element={<Tables />} />
                <Route path="tables/:tableId" element={<TableDetail />} />
                <Route path="foods" element={<Foods />} />
                <Route path="take-away" element={<TakeAwayOrder />} />
                <Route path="order-history" element={<OrderHistory />} />
                <Route path="profile" element={<Profile />} />

                {user?.role === "BRANCH" && (
                    <>
                        <Route path="table" element={<TableManagement mode="branch" />} />
                        <Route path="employee" element={<BranchStaff />} />
                        <Route path="statistics" element={<Statistics branchOnly />} />
                    </>
                )}
            </Route>

            {/* ADMIN */}
            <Route
                path="/admin"
                element={
                    <ProtectedRoute roles={["ADMIN"]}>
                        <AuthLayout />
                    </ProtectedRoute>
                }
            >
                {/* ADMIN MULTI */}
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="menu" element={<Menu />} />
                <Route path="branch" element={<Branch />} />
                <Route path="customers" element={<CustomerManagement />} />
                <Route path="statistics" element={<Statistics />} />
                <Route path="profile" element={<AdminProfile />} />
                <Route path="table" element={<TableManagement mode="admin" />} />

                {/* ADMIN SINGLE */}
                <Route path="tables" element={<Tables />} />
                <Route path="tables/:tableId" element={<TableDetail />} />
                <Route path="floors" element={<TableManagement mode="single" />} />
                <Route path="foods" element={<Menu />} />
                <Route path="take-away" element={<TakeAwayOrder />} />
                <Route path="employees" element={<BranchStaff />} />
                <Route path="order-history" element={<OrderHistory />} />
            </Route>

            {/* CUSTOMER */}
            <Route path="/customer/:qrCode" element={<CustomerWelcome />} />
            <Route path="/customer/guest/:qrCode" element={<CustomerGuest />} />
            <Route path="/customer/login/:qrCode" element={<CustomerLogin />} />
            <Route path="/customer/register/:qrCode" element={<CustomerRegister />} />
            <Route path="/customer/home/:qrCode" element={<Home />} />
            <Route path="/customer/order/:qrCode" element={<Order />} />
            <Route path="/customer/account/:qrCode" element={<Account />} />
            <Route path="/customer/history/:qrCode" element={<CustomerOrderHistory />} />
            <Route path="/customer/forgot/:qrCode" element={<CustomerForgotPassword />} />

            {/* WAREHOUSE */}
            <Route
                path="/warehouse"
                element={
                    <ProtectedRoute roles={["WAREHOUSE"]}>
                        <Warehouse />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/warehouse/import"
                element={
                    <ProtectedRoute roles={["WAREHOUSE"]}>
                        <InventoryImport />
                    </ProtectedRoute>
                }
            />

            {/* KITCHEN */}
            <Route
                path="/kitchen"
                element={
                    <ProtectedRoute roles={["KITCHEN"]}>
                        <Kitchen />
                    </ProtectedRoute>
                }
            />

            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}