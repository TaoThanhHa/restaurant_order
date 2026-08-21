const express = require("express");

const router = express.Router();

const controller =
    require("./adminStatistics.controller");

const auth =
    require("../../middlewares/auth.middleware");


// ========================================
// GET STATISTICS
// GET /api/statistics
// ========================================

router.get(
    "/",
    auth,
    controller.getStatistics
);


module.exports = router;