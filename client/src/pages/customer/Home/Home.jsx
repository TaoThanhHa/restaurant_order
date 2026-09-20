import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UtensilsCrossed, BellRing, CheckCircle, Clock, X } from "lucide-react";

import customerAuthService from "../../../services/customerAuth.service";
import serviceRequestService from "../../../services/serviceRequest.service";
import HomeHeader from "../../../components/Customer/HomeHeader";
import ActionCard from "../../../components/Customer/ActionCard";
import CurrentOrderCard from "../../../components/Customer/CurrentOrderCard";
import ServiceRequestModal from "../../../components/Customer/ServiceRequestModal";

export default function Home() {
    const navigate = useNavigate();
    const { qrCode } = useParams();
    const [profile, setProfile] = useState(null);
    const [table, setTable] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showServiceRequest, setShowServiceRequest] = useState(false);
    const [serviceRequests, setServiceRequests] = useState([]);
    const [notification, setNotification] = useState(null);
    const previousOrdersRef = useRef(new Map());
    const previousRequestsRef = useRef(new Map());
    const notificationTimerRef = useRef(null);

    const showNotificationMessage = useCallback((message, type = "success") => {
        setNotification({ message, type });

        if (notificationTimerRef.current) clearTimeout(notificationTimerRef.current);

        notificationTimerRef.current = setTimeout(() => setNotification(null), 5000);
    }, []);

    const loadProfile = useCallback(async (showStatusNotification = true) => {
        try {
            const profileRes = await customerAuthService.profile();
            const newProfile = profileRes.data;
            const newOrders = newProfile?.orderMembers?.map(member => member.order)?.filter(Boolean) || [];
            const newOrderMap = new Map(newOrders.map(order => [order.id, order.status]));

            if (showStatusNotification && previousOrdersRef.current.size > 0) {
                newOrders.forEach(order => {
                    const oldStatus = previousOrdersRef.current.get(order.id);
                    if (!oldStatus || oldStatus === order.status) return;

                    const messages = {
                        CONFIRMED: "Đơn hàng của bạn đã được xác nhận.",
                        PREPARING: "Nhà bếp đang chuẩn bị món cho bạn.",
                        SERVED: "Đơn hàng của bạn đã được phục vụ.",
                        PAID: "Đơn hàng của bạn đã thanh toán thành công.",
                    };

                    if (messages[order.status]) showNotificationMessage(messages[order.status]);
                });
            }

            previousOrdersRef.current = newOrderMap;
            setProfile(newProfile);
            return newProfile;
        } catch (error) {
            console.error("LOAD CUSTOMER PROFILE ERROR:", error.response?.data || error);
            return null;
        }
    }, [showNotificationMessage]);

    const loadServiceRequests = useCallback(async (showStatusNotification = true) => {
        if (!table?.id) return [];

        try {
            const res = await serviceRequestService.getCustomerRequests(table.id);
            const newRequests = res?.data || [];
            const newRequestMap = new Map(newRequests.map(request => [request.id, request.status]));

            if (showStatusNotification && previousRequestsRef.current.size > 0) {
                newRequests.forEach(request => {
                    const oldStatus = previousRequestsRef.current.get(request.id);

                    if (oldStatus === "PENDING" && request.status === "ACCEPTED") {
                        showNotificationMessage("Nhân viên đã xác nhận yêu cầu của bạn.");
                    }

                    if (oldStatus === "ACCEPTED" && request.status === "COMPLETED") {
                        showNotificationMessage("Yêu cầu của bạn đã được hoàn thành.");
                    }
                });
            }

            previousRequestsRef.current = newRequestMap;
            setServiceRequests(newRequests);
            return newRequests;
        } catch (error) {
            console.error("LOAD SERVICE REQUEST ERROR:", error.response?.data || error);
            return [];
        }
    }, [table?.id, showNotificationMessage]);

    useEffect(() => {
        let cancelled = false;

        const loadInitialData = async () => {
            try {
                if (!qrCode) throw new Error("Không xác định được mã QR của bàn.");

                const profileRes = await customerAuthService.profile();
                if (cancelled) return;

                const initialProfile = profileRes.data;
                setProfile(initialProfile);

                const initialOrders = initialProfile?.orderMembers?.map(member => member.order)?.filter(Boolean) || [];
                previousOrdersRef.current = new Map(initialOrders.map(order => [order.id, order.status]));

                const tableRes = await customerAuthService.getTable(qrCode);
                if (cancelled) return;

                setTable(tableRes.data);
            } catch (error) {
                console.error("LOAD HOME ERROR:", error.response?.data || error);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadInitialData();

        return () => {
            cancelled = true;
        };
    }, [qrCode]);

    const getCustomerToken = () =>
        localStorage.getItem("customerToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken");

    useEffect(() => {
        if (!table?.id) return;

        const token = getCustomerToken();
        if (!token) {
            console.error("Không tìm thấy customer token.");
            return;
        }

        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const url = `${apiUrl}/events/customer?token=${encodeURIComponent(token)}`;
        const eventSource = new EventSource(url);

        eventSource.addEventListener("connected", () => {
            console.log("SSE CUSTOMER CONNECTED");
        });

        eventSource.addEventListener("order.updated", async event => {
            try {
                console.log("SSE ORDER UPDATED:", JSON.parse(event.data));
                await loadProfile(true);
            } catch (error) {
                console.error("SSE ORDER ERROR:", error);
            }
        });

        eventSource.addEventListener("service-request.updated", async event => {
            try {
                console.log("SSE SERVICE REQUEST UPDATED:", JSON.parse(event.data));
                await loadServiceRequests(true);
            } catch (error) {
                console.error("SSE SERVICE REQUEST ERROR:", error);
            }
        });

        eventSource.onerror = error => {
            console.error("SSE CONNECTION ERROR:", error);
        };

        return () => {
            console.log("SSE CUSTOMER DISCONNECTED");
            eventSource.close();
        };
    }, [table?.id, loadProfile, loadServiceRequests]);

    useEffect(() => {
        return () => {
            if (notificationTimerRef.current) clearTimeout(notificationTimerRef.current);
        };
    }, []);

    const activeServiceRequest = serviceRequests
        .filter(request => request.status === "PENDING" || request.status === "ACCEPTED")
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-gray-500">Đang tải...</div>
            </div>
        );
    }

    if (!profile || !table) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-gray-500">Không thể xác định bàn hiện tại.</div>
            </div>
        );
    }

    const ACTIVE_ORDER_STATUSES = ["PENDING", "CONFIRMED", "PREPARING", "SERVED"];

    const currentOrder = profile.orderMembers
        ?.map(member => member.order)
        ?.filter(order => ACTIVE_ORDER_STATUSES.includes(order?.status))
        ?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

    return (
        <div className="min-h-screen bg-[var(--color-background)] pb-24">
            {notification && (
                <div className="fixed left-1/2 top-4 z-[100] w-[calc(100%-32px)] max-w-md -translate-x-1/2">
                    <div className={`flex items-start gap-3 rounded-2xl px-4 py-3 text-white shadow-2xl ${notification.type === "success" ? "bg-green-600" : "bg-orange-500"}`}>
                        <CheckCircle size={22} className="mt-0.5 shrink-0" />
                        <p className="flex-1 text-sm font-semibold">{notification.message}</p>
                        <button type="button" onClick={() => setNotification(null)} className="rounded-lg p-1 hover:bg-white/20">
                            <X size={17} />
                        </button>
                    </div>
                </div>
            )}

            <HomeHeader profile={profile} table={table} />

            <div className="space-y-5 p-5">
                {activeServiceRequest && (
                    <div className="rounded-2xl border bg-white p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${activeServiceRequest.status === "PENDING" ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-600"}`}>
                                {activeServiceRequest.status === "PENDING" ? <Clock size={23} /> : <CheckCircle size={23} />}
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="font-bold text-gray-800">Gọi nhân viên</h3>
                                    <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${activeServiceRequest.status === "PENDING" ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-600"}`}>
                                        {activeServiceRequest.status === "PENDING" ? "Đang chờ" : "Đã xác nhận"}
                                    </span>
                                </div>

                                <p className="mt-1 text-sm text-gray-600">{activeServiceRequest.message}</p>

                                <p className={`mt-2 text-xs ${activeServiceRequest.status === "PENDING" ? "text-orange-600" : "text-green-600"}`}>
                                    {activeServiceRequest.status === "PENDING"
                                        ? "Đang chờ nhân viên xác nhận."
                                        : "Nhân viên đã xác nhận và sẽ tới hỗ trợ bạn."}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <ActionCard
                    icon={<UtensilsCrossed size={42} />}
                    title="ĐẶT MÓN"
                    description="Xem menu và gọi thêm món"
                    button="Đặt món ngay"
                    color="bg-blue-500"
                    onClick={() => navigate(`/customer/order/${table.qrCode}`)}
                />

                <ActionCard
                    icon={<BellRing size={42} />}
                    title="GỌI NHÂN VIÊN"
                    description={activeServiceRequest ? "Bạn đang có yêu cầu chưa hoàn thành" : "Nhân viên sẽ tới hỗ trợ bạn"}
                    button={activeServiceRequest ? "Đang xử lý" : "Gọi nhân viên"}
                    color={activeServiceRequest ? "bg-gray-400" : "bg-orange-500"}
                    onClick={() => {
                        if (activeServiceRequest) {
                            showNotificationMessage(
                                activeServiceRequest.status === "PENDING"
                                    ? "Yêu cầu của bạn đang chờ nhân viên xác nhận."
                                    : "Nhân viên đã xác nhận yêu cầu của bạn."
                            );
                            return;
                        }

                        setShowServiceRequest(true);
                    }}
                />

                <CurrentOrderCard order={currentOrder} />
            </div>

            <ServiceRequestModal
                open={showServiceRequest}
                table={table}
                onClose={() => setShowServiceRequest(false)}
                onSuccess={async () => {
                    setShowServiceRequest(false);
                    await loadServiceRequests(false);
                }}
            />
        </div>
    );
}
