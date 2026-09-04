import { CheckCircle2, AlertTriangle, XCircle, X, } from "lucide-react";

const CONFIG = {
    success: {
        icon: CheckCircle2,
        title: "Thành công",
        iconClass: "text-green-500",
        bgClass: "bg-green-50",
        buttonClass: "bg-[#4f7d4f] hover:bg-[#416b41]",
    },

    warning: {
        icon: AlertTriangle,
        title: "Thông báo",
        iconClass: "text-yellow-500",
        bgClass: "bg-yellow-50",
        buttonClass: "bg-yellow-500 hover:bg-yellow-600",
    },

    error: {
        icon: XCircle,
        title: "Có lỗi xảy ra",
        iconClass: "text-red-500",
        bgClass: "bg-red-50",
        buttonClass: "bg-red-500 hover:bg-red-600",
    },
};

export default function NotiModal({
    open,
    type = "success",
    title,
    message,
    onClose,
}) {
    if (!open) {
        return null;
    }

    const config = CONFIG[type] || CONFIG.success;
    const Icon = config.icon;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-5 backdrop-blur-[2px]">
            <div
                className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* CLOSE */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                >
                    <X size={19} />
                </button>

                {/* ICON */}
                <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${config.bgClass}`}>
                    <Icon
                        size={34}
                        className={config.iconClass}
                    />
                </div>

                {/* CONTENT */}
                <div className="mt-4 text-center">
                    <h2 className="text-xl font-bold text-gray-800">
                        {title || config.title}
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-gray-500">
                        {message}
                    </p>
                </div>

                {/* BUTTON */}
                <button
                    type="button"
                    onClick={onClose}
                    className={`mt-6 w-full rounded-xl px-4 py-3 font-semibold text-white transition ${config.buttonClass}`}
                >
                    Đã hiểu
                </button>
            </div>
        </div>
    );
}