const inventoryService = require("./inventory.service");
const response = require("../../utils/response");

// ========================================
// GET ALL INGREDIENTS
// ========================================

const getAllIngredients = async (req, res) => {
    try {
        const branchId = req.user.branchId;

        const data = await inventoryService.getAllIngredients(branchId);

        return response.success(
            res,
            "Lấy danh sách nguyên liệu thành công.",
            data
        );
    } catch (error) {
        console.error("GET INGREDIENTS ERROR:", error);

        return response.error(
            res,
            error.message,
            400
        );
    }
};

// ========================================
// GET INGREDIENT BY ID
// ========================================

const getIngredientById = async (req, res) => {
    try {
        const data = await inventoryService.getIngredientById(
            Number(req.params.id)
        );

        return response.success(
            res,
            "Lấy nguyên liệu thành công.",
            data
        );
    } catch (error) {
        console.error("GET INGREDIENT BY ID ERROR:", error);

        return response.error(
            res,
            error.message,
            404
        );
    }
};

// ========================================
// CREATE INGREDIENT
// ========================================

const createIngredient = async (req, res) => {
    try {
        const data = await inventoryService.createIngredient(req.body);

        return response.success(
            res,
            "Thêm nguyên liệu thành công.",
            data,
            201
        );
    } catch (error) {
        console.error("CREATE INGREDIENT ERROR:", error);

        return response.error(
            res,
            error.message,
            400
        );
    }
};

// ========================================
// UPDATE INGREDIENT
// ========================================

const updateIngredient = async (req, res) => {
    try {
        const data = await inventoryService.updateIngredient(
            Number(req.params.id),
            req.body
        );

        return response.success(
            res,
            "Cập nhật nguyên liệu thành công.",
            data
        );
    } catch (error) {
        console.error("UPDATE INGREDIENT ERROR:", error);

        return response.error(
            res,
            error.message,
            400
        );
    }
};

// ========================================
// TOGGLE STATUS
// ========================================

const toggleStatus = async (req, res) => {
    try {
        const data = await inventoryService.toggleStatus(
            Number(req.params.id)
        );

        return response.success(
            res,
            data.isActive
                ? "Đã kích hoạt nguyên liệu."
                : "Đã ngừng sử dụng nguyên liệu.",
            data
        );
    } catch (error) {
        console.error("TOGGLE INGREDIENT ERROR:", error);

        return response.error(
            res,
            error.message,
            400
        );
    }
};

// ========================================
// GET INVENTORY BY BRANCH
// ========================================

const getInventoryByBranch = async (req, res) => {
    try {
        const branchId = req.user.branchId;

        const data = await inventoryService.getInventoryByBranch(
            branchId
        );

        return response.success(
            res,
            "Lấy tồn kho thành công.",
            data
        );
    } catch (error) {
        console.error("GET INVENTORY ERROR:", error);

        return response.error(
            res,
            error.message,
            400
        );
    }
};

// ========================================
// IMPORT INVENTORY
// ========================================

const importInventory = async (req, res) => {
    try {
        const {
            ingredientId,
            quantity,
            note,
        } = req.body;

        const branchId = req.user.branchId;

        if (!branchId) {
            return response.error(
                res,
                "Tài khoản chưa được gán chi nhánh.",
                400
            );
        }

        const data = await inventoryService.importInventory(
            branchId,
            ingredientId,
            quantity,
            note
        );

        return response.success(
            res,
            "Nhập kho thành công.",
            data
        );
    } catch (error) {
        console.error("IMPORT INVENTORY ERROR:", error);

        return response.error(
            res,
            error.message,
            400
        );
    }
};

// ========================================
// EXPORT INVENTORY
// ========================================

const exportInventory = async (req, res) => {
    try {
        const {
            ingredientId,
            quantity,
            note,
        } = req.body;

        const branchId = req.user.branchId;

        if (!branchId) {
            return response.error(
                res,
                "Tài khoản chưa được gán chi nhánh.",
                400
            );
        }

        const data = await inventoryService.exportInventory(
            branchId,
            ingredientId,
            quantity,
            note
        );

        return response.success(
            res,
            "Xuất kho thành công.",
            data
        );
    } catch (error) {
        console.error("EXPORT INVENTORY ERROR:", error);

        return response.error(
            res,
            error.message,
            400
        );
    }
};

// ========================================
// ADJUST INVENTORY
// ========================================

const adjustInventory = async (req, res) => {
    try {
        const {
            ingredientId,
            actualQuantity,
            note,
        } = req.body;

        const branchId = req.user.branchId;

        if (!branchId) {
            return response.error(
                res,
                "Tài khoản chưa được gán chi nhánh.",
                400
            );
        }

        const data = await inventoryService.adjustInventory(
            branchId,
            ingredientId,
            actualQuantity,
            note
        );

        return response.success(
            res,
            "Điều chỉnh tồn kho thành công.",
            data
        );
    } catch (error) {
        console.error("ADJUST INVENTORY ERROR:", error);

        return response.error(
            res,
            error.message,
            400
        );
    }
};

// ========================================
// GET INVENTORY TRANSACTIONS
// ========================================

const getInventoryTransactions = async (req, res) => {
    try {
        const branchId = req.user.branchId;

        if (!branchId) {
            return response.error(
                res,
                "Tài khoản chưa được gán chi nhánh.",
                400
            );
        }

        const ingredientId = req.query.ingredientId
            ? Number(req.query.ingredientId)
            : undefined;

        const data =
            await inventoryService.getInventoryTransactions(
                branchId,
                ingredientId
            );

        return response.success(
            res,
            "Lấy lịch sử kho thành công.",
            data
        );
    } catch (error) {
        console.error(
            "GET INVENTORY TRANSACTIONS ERROR:",
            error
        );

        return response.error(
            res,
            error.message,
            400
        );
    }
};

module.exports = {
    getAllIngredients,
    getIngredientById,
    createIngredient,
    updateIngredient,
    toggleStatus,
    getInventoryByBranch,
    importInventory,
    exportInventory,
    adjustInventory,
    getInventoryTransactions,
};