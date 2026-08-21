const express = require("express");

const router = express.Router();

const customerController =
    require("./customer.controller");

const auth =
    require("../../middlewares/customerAuth.middleware");

/* const { upload } = require("../../middlewares/upload.middleware");
 */
// ======================================================
// CUSTOMER PROFILE
// ======================================================




// Cập nhật họ tên + avatar
/* router.put(
    "/profile",
    auth,
    upload.single("avatar"),
    customerController.updateProfile
); */


// ======================================================
// CUSTOMER ACCOUNT
// ======================================================

// Đổi số điện thoại
router.put(
    "/phone",
    auth,
    customerController.updatePhone
);


// Đổi mật khẩu
router.put(
    "/password",
    auth,
    customerController.changePassword
);



/* // ======================================================
// ADMIN / CASHIER
// ======================================================

router.get(
    "/:id",
    auth,
    customerController.getById
);


router.put(
    "/:id",
    auth,
    customerController.update
);


// ======================================================
// ADMIN
// ======================================================

router.delete(
    "/:id",
    auth,
    customerController.remove
);


// ======================================================
// PUBLIC
// ======================================================

// Tạo customer
router.post(
    "/",
    customerController.create
);


// Tạo guest
router.post(
    "/guest",
    customerController.createGuest
);


// Guest token
router.get(
    "/token/:token",
    customerController.getByGuestToken
);
 */
// ======================================================
// CHANGE EMAIL
// ======================================================

router.post(
    "/email/send-otp",
    auth,
    customerController.sendChangeEmailOtp
);

router.post(
    "/email/verify-otp",
    auth,
    customerController.verifyChangeEmailOtp
);

module.exports = router;