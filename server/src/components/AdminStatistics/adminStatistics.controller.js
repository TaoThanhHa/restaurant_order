const statisticsService = require("./adminStatistics.service");

const getStatistics = async (req, res) => {
    try {
        const user = req.user;
        const { branchId } = req.query;

        const result = await statisticsService.getStatistics({
            user,
            branchId: branchId || null,
            period: req.query.period,
            filters: req.query
        });

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
