const express = require("express");
const router = express.Router();

const controller = require("./reservation.controller");
const auth = require("../../middlewares/auth.middleware");
const authorize = require("../../middlewares/role.middleware");

router.use(auth);

router.post( "/", authorize("ADMIN", "BRANCH"), controller.create);
router.get( "/", authorize("ADMIN", "BRANCH", "CASHIER"), controller.getAll);
router.get( "/:id", authorize("ADMIN", "BRANCH", "CASHIER"), controller.getById);
router.put( "/:id", authorize("ADMIN", "BRANCH"), controller.update);
router.delete( "/:id", authorize("ADMIN", "BRANCH"), controller.cancel);
router.get( "/:id/available-tables", authorize("ADMIN", "BRANCH", "CASHIER"), controller.getAvailableTables);
router.post( "/:id/assign-table", authorize("ADMIN", "BRANCH", "CASHIER"), controller.assignTable);
router.post( "/:id/remind", authorize("ADMIN", "BRANCH"), controller.remind);
router.post( "/:id/check-in", authorize("ADMIN", "BRANCH", "CASHIER"), controller.checkIn);
router.post( "/:id/complete", authorize("ADMIN", "BRANCH", "CASHIER"), controller.complete);

module.exports = router;