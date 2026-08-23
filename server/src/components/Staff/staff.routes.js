const express = require("express");

const router = express.Router();

const staffController = require("./staff.controller");

const auth = require("../../middlewares/auth.middleware");
const authorize = require("../../middlewares/role.middleware");


// ========================================
// TẤT CẢ API STAFF CHỈ ADMIN
// ========================================

router.use(
    auth,
    authorize("ADMIN")
);


// ========================================
// GET ALL STAFF
// GET /api/staff/branch/:branchId
// ========================================

router.get(
    "/branch/:branchId",
    staffController.getAll
);


// ========================================
// GET STAFF DETAIL
// GET /api/staff/branch/:branchId/:userId
// ========================================

router.get(
    "/branch/:branchId/:userId",
    staffController.getById
);


// ========================================
// CREATE STAFF
// POST /api/staff/branch/:branchId
// ========================================

router.post(
    "/branch/:branchId",
    staffController.create
);


// ========================================
// UPDATE STAFF
// PUT /api/staff/branch/:branchId/:userId
// ========================================

router.put(
    "/branch/:branchId/:userId",
    staffController.update
);


// ========================================
// LOCK / UNLOCK STAFF
// PATCH /api/staff/branch/:branchId/:userId/toggle-status
// ========================================

router.patch(
    "/branch/:branchId/:userId/toggle-status",
    staffController.toggleStatus
);


module.exports = router;