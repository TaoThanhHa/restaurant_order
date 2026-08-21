import { Coffee } from "lucide-react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import customerAuthService from "../../services/customerAuth.service";
import useCustomerAuth from "../../hooks/useCustomerAuth";

function getDeviceId() {
    let id = localStorage.getItem("deviceId");

    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem("deviceId", id);
    }

    return id;
}

export default function CustomerWelcome() {

    const { qrCode } = useParams();
    const navigate = useNavigate();
    const { login } = useCustomerAuth();

    useEffect(() => {

        const autoLogin = async () => {

            try {

                const result = await customerAuthService.guest({
                    tableId: qrCode,
                    deviceId: getDeviceId(),
                });

                login(
                    result.data.token,
                    result.data.customer
                );

                navigate(`/customer/home/${qrCode}`, {
                    replace: true,
                });

            } catch (err) {
                console.error(err);
            }

        };

        autoLogin();

    }, []);

    return (

        <div className="min-h-screen bg-gradient-to-b from-sky-300 to-indigo-500 flex items-center justify-center">

            <div className="text-center text-white">

                <Coffee
                    size={70}
                    className="mx-auto mb-5 animate-pulse"
                />

                <h2 className="text-3xl font-bold">
                    Đang vào quán...
                </h2>

                <p className="mt-2 opacity-80">
                    Vui lòng chờ
                </p>

            </div>

        </div>

    );
}