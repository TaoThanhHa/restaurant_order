import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    UtensilsCrossed,
    BellRing,
    CheckCircle,
    Clock,
    X,
} from "lucide-react";

import customerAuthService from "../../../services/customerAuth.service";
import serviceRequestService from "../../../services/serviceRequest.service";

import HomeHeader from "../../../components/Customer/HomeHeader";
import ActionCard from "../../../components/Customer/ActionCard";
import CurrentOrderCard from "../../../components/Customer/CurrentOrderCard";
import ServiceRequestModal from "../../../components/Customer/ServiceRequestModal";


export default function Home() {

    const navigate = useNavigate();

    const { qrCode } = useParams();


    // =================================================
    // STATE
    // =================================================

    const [profile, setProfile] =
        useState(null);

    const [table, setTable] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [showServiceRequest, setShowServiceRequest] =
        useState(false);

    const [serviceRequests, setServiceRequests] =
        useState([]);

    const [notification, setNotification] =
        useState(null);


    // =================================================
    // REF
    // Dùng để so sánh dữ liệu cũ
    // Không làm re-render
    // =================================================

    const previousOrdersRef =
        useRef(new Map());

    const previousRequestsRef =
        useRef(new Map());

    const notificationTimerRef =
        useRef(null);


    // =================================================
    // HIỂN THỊ THÔNG BÁO
    // =================================================

    const showNotificationMessage = useCallback(
        (message, type = "success") => {

            setNotification({
                message,
                type,
            });


            if (notificationTimerRef.current) {

                clearTimeout(
                    notificationTimerRef.current
                );

            }


            notificationTimerRef.current =
                setTimeout(() => {

                    setNotification(null);

                }, 5000);

        },
        []
    );


    // =================================================
    // LOAD PROFILE
    //
    // PROFILE chứa orderMembers
    // nên dùng để cập nhật đơn hàng
    // =================================================

    const loadProfile = useCallback(
        async (showStatusNotification = true) => {

            try {

                const profileRes =
                    await customerAuthService.profile();

                const newProfile =
                    profileRes.data;


                // -----------------------------------------
                // SO SÁNH TRẠNG THÁI ĐƠN HÀNG
                // -----------------------------------------

                const newOrders =
                    newProfile?.orderMembers
                        ?.map(member => member.order)
                        ?.filter(Boolean) || [];


                const newOrderMap =
                    new Map();


                newOrders.forEach(order => {

                    newOrderMap.set(
                        order.id,
                        order.status
                    );

                });


                if (
                    showStatusNotification &&
                    previousOrdersRef.current.size > 0
                ) {

                    newOrders.forEach(order => {

                        const oldStatus =
                            previousOrdersRef.current.get(
                                order.id
                            );


                        // -------------------------------------
                        // CHỈ THÔNG BÁO KHI STATUS THAY ĐỔI
                        // -------------------------------------

                        if (
                            oldStatus &&
                            oldStatus !== order.status
                        ) {

                            let message = null;


                            switch (order.status) {

                                case "CONFIRMED":

                                    message =
                                        "Đơn hàng của bạn đã được xác nhận.";

                                    break;


                                case "PREPARING":

                                    message =
                                        "Nhà bếp đang chuẩn bị món cho bạn.";

                                    break;


                                case "SERVED":

                                    message =
                                        "Đơn hàng của bạn đã được phục vụ.";

                                    break;


                                case "PAID":

                                    message =
                                        "Đơn hàng của bạn đã thanh toán thành công.";

                                    break;


                                default:

                                    break;

                            }


                            if (message) {

                                showNotificationMessage(
                                    message,
                                    "success"
                                );

                            }

                        }

                    });

                }


                previousOrdersRef.current =
                    newOrderMap;


                // -----------------------------------------
                // CẬP NHẬT PROFILE
                // -----------------------------------------

                setProfile(newProfile);


                return newProfile;

            } catch (error) {

                console.error(
                    "LOAD CUSTOMER PROFILE ERROR:",
                    error.response?.data ||
                    error
                );

                return null;

            }

        },
        [showNotificationMessage]
    );


    // =================================================
    // LOAD SERVICE REQUEST
    // =================================================

    const loadServiceRequests = useCallback(
        async (showStatusNotification = true) => {

            if (!table?.id) {
                return [];
            }


            try {

                const res =
                    await serviceRequestService
                        .getCustomerRequests(
                            table.id
                        );


                const newRequests =
                    res?.data || [];


                // -----------------------------------------
                // SO SÁNH REQUEST CŨ / MỚI
                // -----------------------------------------

                const newRequestMap =
                    new Map();


                newRequests.forEach(request => {

                    newRequestMap.set(
                        request.id,
                        request.status
                    );

                });


                if (
                    showStatusNotification &&
                    previousRequestsRef.current.size > 0
                ) {

                    newRequests.forEach(request => {

                        const oldStatus =
                            previousRequestsRef.current.get(
                                request.id
                            );


                        // -------------------------------------
                        // PENDING → ACCEPTED
                        // -------------------------------------

                        if (
                            oldStatus === "PENDING" &&
                            request.status === "ACCEPTED"
                        ) {

                            showNotificationMessage(
                                "Nhân viên đã xác nhận yêu cầu của bạn.",
                                "success"
                            );

                        }


                        // -------------------------------------
                        // ACCEPTED → COMPLETED
                        // -------------------------------------

                        if (
                            oldStatus === "ACCEPTED" &&
                            request.status === "COMPLETED"
                        ) {

                            showNotificationMessage(
                                "Yêu cầu của bạn đã được hoàn thành.",
                                "success"
                            );

                        }

                    });

                }


                previousRequestsRef.current =
                    newRequestMap;


                // -----------------------------------------
                // CẬP NHẬT REQUEST
                // -----------------------------------------

                setServiceRequests(
                    newRequests
                );


                return newRequests;

            } catch (error) {

                console.error(
                    "LOAD SERVICE REQUEST ERROR:",
                    error.response?.data ||
                    error
                );

                return [];

            }

        },
        [
            table?.id,
            showNotificationMessage,
        ]
    );


    // =================================================
    // LOAD PROFILE + TABLE BAN ĐẦU
    //
    // Chỉ chạy khi qrCode thay đổi
    // =================================================

    useEffect(() => {

        let cancelled = false;


        const loadInitialData = async () => {

            try {

                if (!qrCode) {

                    throw new Error(
                        "Không xác định được mã QR của bàn."
                    );

                }


                // -----------------------------------------
                // PROFILE
                // -----------------------------------------

                const profileRes =
                    await customerAuthService.profile();


                if (cancelled) {
                    return;
                }


                const initialProfile =
                    profileRes.data;


                setProfile(
                    initialProfile
                );


                // -----------------------------------------
                // LƯU TRẠNG THÁI ĐƠN BAN ĐẦU
                //
                // Không thông báo ở lần load đầu
                // -----------------------------------------

                const initialOrders =
                    initialProfile?.orderMembers
                        ?.map(member => member.order)
                        ?.filter(Boolean) || [];


                const initialOrderMap =
                    new Map();


                initialOrders.forEach(order => {

                    initialOrderMap.set(
                        order.id,
                        order.status
                    );

                });


                previousOrdersRef.current =
                    initialOrderMap;


                // -----------------------------------------
                // TABLE
                //
                // Chỉ lấy 1 lần
                // -----------------------------------------

                const tableRes =
                    await customerAuthService.getTable(
                        qrCode
                    );


                if (cancelled) {
                    return;
                }


                setTable(
                    tableRes.data
                );


            } catch (error) {

                console.error(
                    "LOAD HOME ERROR:",
                    error.response?.data ||
                    error
                );

            } finally {

                if (!cancelled) {

                    setLoading(false);

                }

            }

        };


        loadInitialData();


        return () => {

            cancelled = true;

        };

    }, [qrCode]);

    const getCustomerToken = () => {

        return (
            localStorage.getItem("customerToken") ||
            localStorage.getItem("token") ||
            localStorage.getItem("accessToken")
        );

    };

    useEffect(() => {

    if (!table?.id) {
        return;
    }


    const token =
        getCustomerToken();


    if (!token) {

        console.error(
            "Không tìm thấy customer token."
        );

        return;

    }


    const apiUrl =
        import.meta.env.VITE_API_URL ||
        "http://localhost:5000/api";


    const url =
        `${apiUrl}/events/customer?token=${encodeURIComponent(token)}`;


    const eventSource =
        new EventSource(url);


    // ==================================================
    // CONNECTED
    // ==================================================

    eventSource.addEventListener(
        "connected",
        () => {

            console.log(
                "SSE CUSTOMER CONNECTED"
            );

        }
    );


    // ==================================================
    // ORDER
    // ==================================================

    eventSource.addEventListener(
        "order.updated",
        async (event) => {

            try {

                const data =
                    JSON.parse(
                        event.data
                    );


                console.log(
                    "SSE ORDER UPDATED:",
                    data
                );


                await loadProfile(true);

            } catch (error) {

                console.error(
                    "SSE ORDER ERROR:",
                    error
                );

            }

        }
    );


    // ==================================================
    // SERVICE REQUEST
    // ==================================================

    eventSource.addEventListener(
        "service-request.updated",
        async (event) => {

            try {

                const data =
                    JSON.parse(
                        event.data
                    );


                console.log(
                    "SSE SERVICE REQUEST UPDATED:",
                    data
                );


                await loadServiceRequests(true);

            } catch (error) {

                console.error(
                    "SSE SERVICE REQUEST ERROR:",
                    error
                );

            }

        }
    );


    // ==================================================
    // ERROR
    // ==================================================

    eventSource.onerror = error => {

        console.error(
            "SSE CONNECTION ERROR:",
            error
        );

    };


    return () => {

        console.log(
            "SSE CUSTOMER DISCONNECTED"
        );

        eventSource.close();

    };

}, [
    table?.id,
    loadProfile,
    loadServiceRequests,
]);
    // =================================================
    // CLEANUP NOTIFICATION TIMER
    // =================================================

    useEffect(() => {

        return () => {

            if (notificationTimerRef.current) {

                clearTimeout(
                    notificationTimerRef.current
                );

            }

        };

    }, []);


    // =================================================
    // REQUEST ĐANG HOẠT ĐỘNG
    // =================================================

    const activeServiceRequest =
        serviceRequests
            .filter(request =>
                request.status === "PENDING" ||
                request.status === "ACCEPTED"
            )
            .sort(
                (a, b) =>
                    new Date(b.createdAt) -
                    new Date(a.createdAt)
            )[0];


    // =================================================
    // LOADING
    // =================================================

    if (loading) {

        return (

            <div className="flex h-screen items-center justify-center">

                <div className="text-gray-500">

                    Đang tải...

                </div>

            </div>

        );

    }


    // =================================================
    // KHÔNG CÓ PROFILE / TABLE
    // =================================================

    if (!profile || !table) {

        return (

            <div className="flex h-screen items-center justify-center">

                <div className="text-gray-500">

                    Không thể xác định bàn hiện tại.

                </div>

            </div>

        );

    }


    // =================================================
    // ĐƠN HIỆN TẠI
    // =================================================

    const ACTIVE_ORDER_STATUSES = [

        "PENDING",

        "CONFIRMED",

        "PREPARING",

        "SERVED",

    ];


    const currentOrder =
        profile.orderMembers
            ?.map(member => member.order)
            ?.filter(order =>
                ACTIVE_ORDER_STATUSES.includes(
                    order?.status
                )
            )
            ?.sort(
                (a, b) =>
                    new Date(b.createdAt) -
                    new Date(a.createdAt)
            )[0];


    // =================================================
    // RENDER
    // =================================================

    return (

        <div className="min-h-screen bg-[var(--color-background)] pb-24">


            
            {/* THÔNG BÁO */}
            

            {notification && (

                <div className="fixed left-1/2 top-4 z-[100] w-[calc(100%-32px)] max-w-md -translate-x-1/2">

                    <div
                        className={`
                            flex items-start gap-3
                            rounded-2xl
                            px-4 py-3
                            text-white
                            shadow-2xl
                            ${
                                notification.type === "success"
                                    ? "bg-green-600"
                                    : "bg-orange-500"
                            }
                        `}
                    >

                        <CheckCircle
                            size={22}
                            className="mt-0.5 shrink-0"
                        />


                        <p className="flex-1 text-sm font-semibold">

                            {notification.message}

                        </p>


                        <button
                            type="button"
                            onClick={() =>
                                setNotification(null)
                            }
                            className="rounded-lg p-1 hover:bg-white/20"
                        >

                            <X size={17} />

                        </button>

                    </div>

                </div>

            )}


            
            {/* HEADER */}
            

            <HomeHeader
                profile={profile}
                table={table}
            />


            <div className="space-y-5 p-5">


                
                {/* YÊU CẦU GỌI NHÂN VIÊN */}
                

                {activeServiceRequest && (

                    <div className="rounded-2xl border bg-white p-4 shadow-sm">

                        <div className="flex items-start gap-3">


                            {/* ICON */}

                            <div
                                className={`
                                    flex h-11 w-11
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-xl
                                    ${
                                        activeServiceRequest.status ===
                                        "PENDING"
                                            ? "bg-orange-100 text-orange-600"
                                            : "bg-green-100 text-green-600"
                                    }
                                `}
                            >

                                {activeServiceRequest.status ===
                                "PENDING" ? (

                                    <Clock size={23} />

                                ) : (

                                    <CheckCircle size={23} />

                                )}

                            </div>


                            {/* CONTENT */}

                            <div className="min-w-0 flex-1">

                                <div className="flex items-start justify-between gap-2">

                                    <h3 className="font-bold text-gray-800">

                                        Gọi nhân viên

                                    </h3>


                                    {activeServiceRequest.status ===
                                    "PENDING" ? (

                                        <span className="shrink-0 rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-600">

                                            Đang chờ

                                        </span>

                                    ) : (

                                        <span className="shrink-0 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-600">

                                            Đã xác nhận

                                        </span>

                                    )}

                                </div>


                                <p className="mt-1 text-sm text-gray-600">

                                    {activeServiceRequest.message}

                                </p>


                                {activeServiceRequest.status ===
                                "PENDING" ? (

                                    <p className="mt-2 text-xs text-orange-600">

                                        Đang chờ nhân viên xác nhận.

                                    </p>

                                ) : (

                                    <p className="mt-2 text-xs text-green-600">

                                        Nhân viên đã xác nhận và sẽ tới hỗ trợ bạn.

                                    </p>

                                )}

                            </div>

                        </div>

                    </div>

                )}


                
                {/* ĐẶT MÓN */}
                

                <ActionCard
                    icon={
                        <UtensilsCrossed
                            size={42}
                        />
                    }
                    title="ĐẶT MÓN"
                    description="Xem menu và gọi thêm món"
                    button="Đặt món ngay"
                    color="bg-blue-500"
                    onClick={() =>
                        navigate(
                            `/customer/order/${table.qrCode}`
                        )
                    }
                />


                
                {/* GỌI NHÂN VIÊN */}
                

                <ActionCard
                    icon={
                        <BellRing
                            size={42}
                        />
                    }
                    title="GỌI NHÂN VIÊN"
                    description={
                        activeServiceRequest
                            ? "Bạn đang có yêu cầu chưa hoàn thành"
                            : "Nhân viên sẽ tới hỗ trợ bạn"
                    }
                    button={
                        activeServiceRequest
                            ? "Đang xử lý"
                            : "Gọi nhân viên"
                    }
                    color={
                        activeServiceRequest
                            ? "bg-gray-400"
                            : "bg-orange-500"
                    }
                    onClick={() => {

                        if (activeServiceRequest) {

                            showNotificationMessage(
                                activeServiceRequest.status ===
                                "PENDING"
                                    ? "Yêu cầu của bạn đang chờ nhân viên xác nhận."
                                    : "Nhân viên đã xác nhận yêu cầu của bạn.",
                                "success"
                            );

                            return;

                        }


                        setShowServiceRequest(
                            true
                        );

                    }}
                />


                
                {/* ĐƠN HIỆN TẠI */}
                

                <CurrentOrderCard
                    order={currentOrder}
                />

            </div>


            
            {/* MODAL GỌI NHÂN VIÊN */}
            

            <ServiceRequestModal
                open={showServiceRequest}
                table={table}
                onClose={() => {
                    setShowServiceRequest(false);
                }}
                onSuccess={async () => {
                    setShowServiceRequest(false);

                    // Load ngay yêu cầu vừa tạo
                    await loadServiceRequests(false);
                }}
            />

        </div>

    );

}