import { Routes, Route, Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

import Login from "../pages/auth/Login/Login";
import AuthLayout from "../layouts/AuthLayout/AuthLayout";
import ForgotPassword from "../pages/auth/Login/ForgotPassword";

//Branch
import CashierDashboard from "../pages/branch/Dashboard/Dashboard";
import Tables from "../pages/cashier/Tables/Tables";
import TableDetail from "../pages/cashier/Tables/TableDetail/TableDetail";
import Foods from "../pages/cashier/Foods/Foods";
import TakeAwayOrder from "../pages/cashier/TakeAwayOrder/TakeAwayOrder";
import OrderHistory from "../pages/branch/OrderHistory/OrderHistory";
import TableManagement from "../pages/admin/Table/FloorManagement";
import Profile from "../pages/branch/Profile/BranchProfile";

//Admin
import AdminDashboard from "../pages/admin/Dashboard/Dashboard";
import Menu from "../pages/admin/Menu/Menu";
import Branch from "../pages/admin/Branch/Branch";
import CustomerManagement from "../pages/admin/Customers/CustomersManagement";
import Statistics from "../pages/admin/Statistics/Statistics";
import AdminProfile from "../pages/admin/Profile/AdminProfile";
import BranchStaff from "../pages/branch/Employee/BranchStaff";

// Customer
import CustomerWelcome from "../pages/customer/CustomerWelcome";
import CustomerGuest from "../pages/customer/CustomerGuest";
import CustomerLogin from "../pages/customer/CustomerLogin";
import CustomerRegister from "../pages/customer/CustomerRegister";
import Home from "../pages/customer/Home/Home"
import Order from "../pages/customer/Order/Order"
import Account from "../pages/customer/Account/Account"
import CustomerOrderHistory from "../pages/customer/Account/OrderHistory";

// Order
import OrderLayout from "../layouts/OrderLayout/OrderLayout";

//Warehouse
import Warehouse from "../pages/warehouse/Warehouse";
import InventoryImport from "../pages/warehouse/Import/InventoryImport";

import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {

    const { user } = useAuth();

    return (
        <Routes>
            {/* Mặc định */}
            <Route path="/" element={<Navigate to="/login" replace />}/>

            {/* Login Admin/Cashier */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Branch */}
            <Route
                path="/branch"
                element={
                    <ProtectedRoute roles={["BRANCH", "ORDER", "CASHIER"]}>
                        {user?.role === "ORDER"
                            ? <OrderLayout />
                            : <AuthLayout />
                        }
                    </ProtectedRoute>
                }
            >
                <Route path="dashboard" element={<CashierDashboard />} />
                <Route path="tables" element={<Tables />} />
                <Route path="tables/:tableId" element={<TableDetail />}/>
                <Route path="foods" element={<Foods />} />
                <Route path="take-away" element={<TakeAwayOrder />}/>
                <Route path="order-history" element={<OrderHistory />}/>
                <Route path="employee" element={<BranchStaff />}/>
                <Route path="profile" element={<Profile />} />
            </Route>

            {/* Admin */}
            <Route path="/admin" element={
                <ProtectedRoute roles={["ADMIN"]}>
                    <AuthLayout />
                </ProtectedRoute>}
            >
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="menu" element={<Menu />} />
                <Route path="branch" element={<Branch />} />
                <Route path="table" element={<TableManagement />} />
                <Route path="customers" element={<CustomerManagement />}/>
                <Route path="statistics"element={<Statistics />}/>
                <Route path="profile" element={<AdminProfile />}/>
            </Route>

            {/* Customer */}
            <Route path="/customer/:qrCode" element={<CustomerWelcome/>} />
            <Route path="/customer/guest/:qrCode" element={<CustomerGuest/>} />
            <Route path="/customer/login/:qrCode" element={<CustomerLogin/>} />
            <Route path="/customer/register/:qrCode" element={<CustomerRegister />} />
            <Route path="/customer/home/:qrCode" element={<Home />} />
            <Route path="/customer/order/:qrCode" element={<Order />} />
            <Route path="/customer/account/:qrCode" element={<Account />} />
            <Route path="/customer/history/:qrCode" element={<CustomerOrderHistory />}/>

            {/* Warehouse */}
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


            {/* 404 */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}