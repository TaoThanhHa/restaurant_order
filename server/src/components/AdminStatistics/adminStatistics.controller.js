const statisticsService = require("./adminStatistics.service");

const getStatistics = async (req, res) => {
    try {
        const { role, branchId: userBranchId } = req.user;
        let branchId = null;

        if (role === "ADMIN") {
            branchId = req.query.branchId || null;
        }

        if (role === "BRANCH") {
            if (!userBranchId) {
                return res.status(403).json({
                    success: false,
                    message: "Tài khoản chưa được phân quyền chi nhánh."
                });
            }
            branchId = userBranchId;
        }

        const result = await statisticsService.getStatistics(
            branchId,
            req.query.period,
            req.query
        );

        return res.json({ success: true, data: result });
    } catch (error) {
        console.error("Lỗi lấy thống kê:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Không thể lấy dữ liệu thống kê."
        });
    }
};

module.exports = { 
    getStatistics 
};
