const prisma = require("../../config/prisma");
const statisticsService = require("./adminStatistics.service");

const getStatistics = async (req, res) => {
    try {
        const { id: userId, role, restaurantId: userRestaurantId, branchId: userBranchId } = req.user;

        let restaurantId = userRestaurantId;
        let branchId = null;

        if (role === "ADMIN") {
            const restaurant = await prisma.restaurant.findFirst({
                where: {
                    OR: [
                        userRestaurantId ? { id: Number(userRestaurantId) } : undefined,
                        { adminId: Number(userId) }
                    ].filter(Boolean)
                },
                select: {
                    id: true,
                    mode: true
                }
            });

            if (!restaurant) {
                return res.status(403).json({
                    success: false,
                    message: "Tài khoản chưa được liên kết với nhà hàng."
                });
            }

            restaurantId = restaurant.id;

            // ADMIN SINGLE: bị khóa vào branch của tài khoản
            if (userBranchId) {
                branchId = Number(userBranchId);
            } else {
                // ADMIN MULTI: được chọn tất cả hoặc một chi nhánh
                branchId = req.query.branchId
                    ? Number(req.query.branchId)
                    : null;
            }
        }

        if (role === "BRANCH") {
            if (!userBranchId) {
                return res.status(403).json({
                    success: false,
                    message: "Tài khoản chưa được phân quyền chi nhánh."
                });
            }

            if (!restaurantId) {
                const branch = await prisma.branch.findUnique({
                    where: { id: Number(userBranchId) },
                    select: { restaurantId: true }
                });

                restaurantId = branch?.restaurantId;
            }

            branchId = Number(userBranchId);
        }

        if (!restaurantId) {
            return res.status(403).json({
                success: false,
                message: "Tài khoản chưa được liên kết với nhà hàng."
            });
        }

        const scope = {
            restaurantId: Number(restaurantId),
            branchId: branchId ? Number(branchId) : null
        };

        const result = await statisticsService.getStatistics(
            scope,
            req.query.period,
            req.query
        );

        return res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error("Lỗi lấy thống kê:", error);

        return res.status(400).json({
            success: false,
            message: error.message || "Không thể lấy dữ liệu thống kê."
        });
    }
};

module.exports = { getStatistics };