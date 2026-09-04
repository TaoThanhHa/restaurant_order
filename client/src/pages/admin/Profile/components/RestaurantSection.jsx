import { useEffect, useState } from "react";
import { Upload, Save, Image as ImageIcon, Pencil, X,} from "lucide-react";

import NotiModal from "../../../../components/NotiModal/NotiModal";
import adminService from "../../../../services/admin.service";
import uploadService from "../../../../services/upload.service";

const SERVER_URL = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") || "";

const getImageUrl = (url) => {
    if (!url) return "";

    if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
    }

    return `${SERVER_URL}${url}`;
};

function RestaurantSection() {
    const [restaurant, setRestaurant] = useState({
        name: "",
        logo: "",
    });

    const [originalRestaurant, setOriginalRestaurant] = useState({
        name: "",
        logo: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [editing, setEditing] = useState(false);
    const [preview, setPreview] = useState("");

    const [notification, setNotification] = useState({
        open: false,
        type: "success",
        title: "",
        message: "",
    });

    const showNotification = ({
        type = "success",
        title = "",
        message = "",
    }) => {
        setNotification({
            open: true,
            type,
            title,
            message,
        });
    };

    const closeNotification = () => {
        setNotification({
            open: false,
            type: "success",
            title: "",
            message: "",
        });
    };

    const loadProfile = async () => {
        try {
            const res = await adminService.getProfile();
            const data = res?.data || res;

            const restaurantData = {
                name: data?.restaurant?.name || "",
                logo: data?.restaurant?.logo || "",
            };

            setRestaurant(restaurantData);
            setOriginalRestaurant(restaurantData);
            setPreview(getImageUrl(restaurantData.logo));
        } catch (error) {
            console.error("LOAD PROFILE ERROR:", error);

            showNotification({
                type: "error",
                title: "Không thể tải thông tin",
                message:
                    error?.response?.data?.message ||
                    error?.message ||
                    "Không thể tải thông tin quán.",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setRestaurant((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImageChange = async (e) => {
        const file = e.target.files?.[0];

        e.target.value = "";

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            showNotification({
                type: "error",
                title: "Ảnh không hợp lệ",
                message: "Vui lòng chọn file hình ảnh.",
            });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showNotification({
                type: "error",
                title: "Ảnh quá lớn",
                message: "Ảnh không được vượt quá 5MB.",
            });
            return;
        }

        try {
            setUploading(true);

            const res = await uploadService.uploadRestaurantLogo(file);
            const imageUrl = res?.data?.data;

            if (!imageUrl) {
                throw new Error("Server không trả về đường dẫn ảnh.");
            }

            setRestaurant((prev) => ({
                ...prev,
                logo: imageUrl,
            }));

            setPreview(`${getImageUrl(imageUrl)}?t=${Date.now()}`);
        } catch (error) {
            console.error("UPLOAD ERROR:", error);

            showNotification({
                type: "error",
                title: "Upload ảnh thất bại",
                message:
                    error?.response?.data?.message ||
                    error?.message ||
                    "Upload ảnh thất bại.",
            });
        } finally {
            setUploading(false);
        }
    };

    const handleEdit = () => {
        setEditing(true);
    };

    const handleCancel = () => {
        setRestaurant(originalRestaurant);
        setPreview(getImageUrl(originalRestaurant.logo));
        setEditing(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (uploading) {
            showNotification({
                type: "warning",
                title: "Đang tải ảnh",
                message: "Vui lòng chờ upload ảnh hoàn tất.",
            });
            return;
        }

        if (!restaurant.name.trim()) {
            showNotification({
                type: "error",
                title: "Thiếu thông tin",
                message: "Tên quán không được để trống.",
            });
            return;
        }

        try {
            setSaving(true);

            await adminService.updateRestaurant({
                name: restaurant.name.trim(),
                logo: restaurant.logo,
            });

            showNotification({
                type: "success",
                title: "Cập nhật thành công",
                message: "Thông tin quán đã được cập nhật.",
            });

            setEditing(false);
            await loadProfile();
        } catch (error) {
            console.error(
                "UPDATE RESTAURANT ERROR:",
                error
            );

            showNotification({
                type: "error",
                title: "Không thể cập nhật",
                message:
                    error?.response?.data?.message ||
                    "Không thể cập nhật thông tin quán.",
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <section className="rounded-xl border border-[var(--color-border)] bg-white p-6">
                <p className="text-[var(--color-text-muted)]">
                    Đang tải thông tin...
                </p>
            </section>
        );
    }

    return (
        <>
            <section className="rounded-xl border border-[var(--color-border)] bg-white p-6">
                <div className="mb-6 flex items-start justify-between">
                    <div className="max-auto w-full">
                        <h2 className="text-xl font-bold text-[var(--color-text)]">
                            Thông tin quán
                        </h2>
                    </div>

                    {!editing && (
                        <button
                            type="button"
                            onClick={handleEdit}
                            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                            title="Chỉnh sửa"
                        >
                            <Pencil size={18} />
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit}  className="flex">
                    <div className="mb-6 mx-auto w-[40%]">
                        <label className="mb-2 block font-medium text-[var(--color-text)]">
                            Logo quán
                        </label>

                        <div className="w-full">
                            <div className="mx-auto mb-2 flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--color-border)] bg-gray-50">
                                {preview ? (
                                    <img
                                        src={preview}
                                        alt="Logo quán"
                                        className="h-full w-full object-cover"
                                        onError={() => setPreview("")}
                                    />
                                ) : (
                                    <ImageIcon
                                        size={40}
                                        className="text-gray-400"
                                    />
                                )}
                            </div>

                            {editing && (
                                <div>
                                    <label
                                        className={`inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-white transition ${
                                            uploading
                                                ? "cursor-not-allowed opacity-50"
                                                : "cursor-pointer hover:opacity-90"
                                        }`}
                                    >
                                        <Upload size={18} />

                                        {uploading ? "Đang tải..." : "Chọn ảnh"}

                                        <input
                                            type="file"
                                            accept="image/png, image/jpeg, image/webp"
                                            className="hidden"
                                            disabled={uploading || saving}
                                            onChange={handleImageChange}
                                        />
                                    </label>

                                    <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                                        JPG, PNG hoặc WEBP · Tối đa 5MB
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mb-6 w-[60%]">
                        <label className="mb-2 block font-medium text-[var(--color-text)]">
                            Tên quán
                        </label>

                        {editing ? (
                            <input
                                type="text"
                                name="name"
                                value={restaurant.name}
                                onChange={handleChange}
                                disabled={saving}
                                placeholder="Nhập tên quán"
                                className="w-full rounded-lg border border-[var(--color-border)] px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--color-primary)] disabled:opacity-50"
                            />
                        ) : (
                            <div className="rounded-lg border border-[var(--color-border)] bg-gray-50 px-4 py-3 text-[var(--color-text)]">
                                {restaurant.name || "Chưa cập nhật"}
                            </div>
                        )}
                    

                    {editing && (
                        <div className="flex justify-center items-center gap-3 mt-5">
                            <button
                                type="submit"
                                disabled={saving || uploading}
                                className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-5 py-3 text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Save size={18} />

                                {saving ? "Đang lưu..." : "Lưu thay đổi"}
                            </button>

                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={saving || uploading}
                                className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-5 py-3 text-[var(--color-text)] hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <X size={18} />
                                Hủy
                            </button>
                        </div>
                    )}
                    </div>
                </form>
            </section>

            <NotiModal
                open={notification.open}
                type={notification.type}
                title={notification.title}
                message={notification.message}
                onClose={closeNotification}
            />
        </>
    );
}

export default RestaurantSection;