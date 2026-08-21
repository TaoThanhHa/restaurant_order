const adminStatisticsService =
    require("./adminStatistics.service");

const response =
    require("../../utils/response");


// ========================================
// GET STATISTICS
// ========================================

const getStatistics =
    async (req, res) => {

        try {

            const {

                branchId,

                period = "week",

                weekStart,

                year,

                month,

                quarter

            } = req.query;


            const data =
                await adminStatisticsService.getStatistics(

                    branchId || null,

                    period,

                    {

                        weekStart,

                        year,

                        month,

                        quarter

                    }

                );


            return response.success(

                res,
                "Lấy thống kê thành công.",
                data

            );

        } catch (error) {

            console.error(
                "GET STATISTICS ERROR:",
                error
            );

            return response.error(

                res,

                error.message ||
                "Không thể lấy thống kê.",

                400

            );

        }

    };


module.exports = {

    getStatistics

};