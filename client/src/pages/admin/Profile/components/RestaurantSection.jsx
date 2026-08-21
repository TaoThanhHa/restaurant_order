import { useEffect, useState,} from "react";

import { Upload, Save, Image as ImageIcon, Pencil, X, } from "lucide-react";

import adminService from "../../../../services/admin.service";
import uploadService from "../../../../services/upload.service";

// API SERVER URL

const SERVER_URL =
    import.meta.env.VITE_API_URL  ?.replace(/\/api\/?$/, "") || "";

const getImageUrl = (url) => {
    if (!url) {
        return "";
    }

    if (url.startsWith("http://") ||  url.startsWith("https://")) {
        return url;
    }

    return `${SERVER_URL}${url}`;
};


function RestaurantSection() {
    const [restaurant, setRestaurant] = useState({ name: "", logo: "", });

    const [originalRestaurant, setOriginalRestaurant] = useState({name: "",logo: "",});

    const [loading, setLoading] =useState(true);

    const [saving, setSaving] =useState(false);

    const [uploading, setUploading] =useState(false);

    const [editing, setEditing] =useState(false);

    const [preview, setPreview] =useState("");

    // LOAD PROFILE
    const loadProfile = async () => {
        try {
            const res =  await adminService.getProfile();

            const data = res?.data || res;

            const restaurantData = {
                name: data?.restaurant?.name || "",
                logo: data?.restaurant?.logo || "",
            };

            setRestaurant( restaurantData );
            setOriginalRestaurant( restaurantData );
            setPreview( getImageUrl( restaurantData.logo ) );

        } catch (error) {
            console.error( "LOAD PROFILE ERROR:",error );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    // INPUT
    const handleChange = (e) => {
        const { name, value,} = e.target;

        setRestaurant(
            (prev) => ({
                ...prev,
                [name]: value,
            })
        );
    };


    // UPLOAD LOGO
    const handleImageChange = async (e) => {
        const file = e.target.files?.[0];
        // Cho phép chọn lại cùng file
        e.target.value = "";
        if (!file) {
            return;
        }
        // CHECK FILE
        if (!file.type.startsWith("image/")) {
            alert( "Vui lòng chọn file hình ảnh.");
            return;
        }
        // CHECK SIZE
        if (file.size > 5 * 1024 * 1024) {
            alert( "Ảnh không được vượt quá 5MB."  );
            return;
        }
        try {
            setUploading(true);
            const formData =  new FormData();

            formData.append(  "image",  file );            
            // UPLOAD
        
            const res = await uploadService.uploadRestaurantLogo(file);
            console.log("UPLOAD RESPONSE:", res);

            const imageUrl = res?.data?.data;

            if (!imageUrl) {
                throw new Error("Server không trả về đường dẫn ảnh.");
            }
            // UPDATE STATE
            
            setRestaurant(
                (prev) => ({
                    ...prev,
                    logo: imageUrl,
                })
            );

            // PREVIEW
            setPreview(
                `${getImageUrl(
                    imageUrl
                )}?t=${Date.now()}`
            );
        } catch (error) {
            console.error(
                "UPLOAD ERROR:",
                error
            );
            alert(
                error?.response?.data?.message ||
                error.message ||
                "Upload ảnh thất bại."
            );
        } finally {
            setUploading(false);
        }
    };
    // EDIT
    const handleEdit = () => {
        setEditing(true);
    };

    // CANCEL
    const handleCancel = () => {
        setRestaurant( originalRestaurant);
        setPreview( getImageUrl( originalRestaurant.logo ));
        setEditing(false);
    };

    // SAVE
    const handleSubmit = async ( e ) => {
        e.preventDefault();
        if (uploading) {
            alert("Vui lòng chờ upload ảnh hoàn tất.");
            return;
        }

        if (!restaurant.name.trim()) {
            alert("Tên quán không được để trống.");
            return;
        }

        try {
            setSaving(true);
            const res = await adminService .updateRestaurant({
                name: restaurant.name.trim(),
                logo: restaurant.logo,
            });

            console.log("UPDATE RESTAURANT:", res );

            alert("Cập nhật thông tin quán thành công.");
            setEditing(false);
            await loadProfile();

        } catch (error) {
            console.error( "UPDATE RESTAURANT ERROR:", error);

            alert(error?.response?.data?.message ||"Không thể cập nhật thông tin quán.");
        } finally {
            setSaving(false);
        }
    };
    // LOADING
    if (loading) {
        return (
            <section className=" bg-white rounded-xl border border-[var(--color-border)] p-6">
                <p className="text-[var(--color-text-muted)] ">
                    Đang tải thông tin...
                </p>
            </section>
        );
    }

    return (
        <section className=" bg-white rounded-xl border border-[var(--color-border)] p-6">
            {/* HEADER */}
            <div className=" flex items-start justify-between mb-6">
                <div>
                    <h2 className=" text-xlfont-bold text-[var(--color-text)]">
                        Thông tin quán
                    </h2>

                    <p className=" mt-1 text-sm text-[var(--color-text-muted)] ">
                        Quản lý tên và logo của nhà hàng
                    </p>
                </div>


                {!editing && (
                    <button
                        type="button"
                        onClick={handleEdit}
                        className=" flex items-center justify-center w-10 h-10 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] transition"
                        title="Chỉnh sửa"
                    >
                        <Pencil size={18}/>
                    </button>
                )}
            </div>

            <form  onSubmit={handleSubmit} >

                {/* NAME */}

                <div className="mb-6">

                    <label className=" block mb-2 font-medium text-[var(--color-text)]">
                        Tên quán
                    </label>

                    {editing ? (
                        <input 
                            type="text" name="name" 
                            value={ restaurant.name } 
                            onChange={ handleChange }
                            disabled={saving} className="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] outline-none focus:ring-2 focus:ring-[var(--color-primary)] disabled:opacity-50 "
                            placeholder="Nhập tên quán"
                        />
                    ) : (
                        <div className="px-4     py-3     rounded-lg     bg-gray-50     border     border-[var(--color-border)]     text-[var(--color-text)] " >
                            {restaurant.name ||"Chưa cập nhật"}
                        </div>
                    )}
                </div>


                {/* =========================
                    LOGO
                ========================= */}
                <div className="mb-6">
                    <label  className=" block mb-2 font-medium text-[var(--color-text)] " >
                        Logo quán
                    </label>

                    <div className="flex items-center gap-6 ">
                        {/* PREVIEW */}
                        <div className="w-32 h-32 rounded-xl border border-[var(--color-border)] overflow-hidden flex items-center justify-center bg-gray-50 shrink-0 ">
                            {preview ? (
                                <img
                                    src={preview}
                                    alt="Logo quán"
                                    className=" w-full h-full object-cover"
                                    onError={() => { setPreview(""); }}
                                />
                            ) : (
                                <ImageIcon size={40} className="text-gray-400" />
                            )}
                        </div>
                        {/* UPLOAD */}
                        {editing && (
                            <div>
                                <label
                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white transition
                                        ${ uploading  ? "opacity-50 cursor-not-allowed"  : "cursor-pointer hover:opacity-90" }
                                    `}
                                >
                                    <Upload size={18} />
                                    {uploading  ? "Đang tải..." : "Chọn ảnh" }

                                    <input
                                        type="file"
                                        accept="  image/png, image/jpeg, image/webp"
                                        className="hidden"
                                        disabled={ uploading || saving }
                                        onChange={ handleImageChange }
                                    />
                                </label>

                                <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                                    JPG, PNG hoặc WEBP · Tối đa 5MB
                                </p>
                            </div>
                        )}
                    </div>
                </div>
                {/* BUTTONS */}

                {editing && (
                    <div className=" flex items-center gap-3" >
                        {/* SAVE */}
                        <button
                            type="submit"
                            disabled={  saving ||  uploading }
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[var(--color-primary)] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed "
                        >
                            <Save size={18} />
                            {saving ? "Đang lưu..." : "Lưu thay đổi" }
                        </button>
                        {/* CANCEL */}
                        <button
                            type="button"
                            onClick={ handleCancel }
                            disabled={ saving || uploading }
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-[var(--color-border)] text-[var(--color-text)] hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed "
                        >
                            <X size={18} />
                            Hủy
                        </button>
                    </div>
                )}
            </form>
        </section>
    );
}

export default RestaurantSection;