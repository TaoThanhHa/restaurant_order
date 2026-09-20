const multer = require("multer");
const path = require("path");
const fs = require("fs");

const createStorage = (folder) => {
    return multer.diskStorage({
        destination(req, file, cb) {
            const uploadDir = path.join(
                __dirname,
                "../../uploads",
                folder
            );

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, {
                    recursive: true,
                });
            }

            cb(null, uploadDir);
        },

        filename(req, file, cb) {
            const ext = path
                .extname(file.originalname)
                .toLowerCase();

            const fileName =
                Date.now() +
                "-" +
                Math.round(Math.random() * 1e9) +
                ext;

            cb(null, fileName);
        },
    });
};

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/png" ||
        file.mimetype === "image/webp"
    ) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Chỉ được upload ảnh JPG, PNG hoặc WEBP."
            ),
            false
        );
    }
};

const foodUpload = multer({
    storage: createStorage("foods"),
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

const restaurantUpload = multer({
    storage: createStorage("restaurants"),
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

const customerAvatarUpload = multer({
    storage: createStorage("customers"),
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

module.exports = {
    foodUpload,
    restaurantUpload,
    customerAvatarUpload,
};