const customerAdminService =
    require("./customerAdmin.service");

const response =
    require("../../utils/response");

// ======================================================
// GET CUSTOMER LIST
// ======================================================

const getCustomers = async (req, res) => {

    try {
        const {
            search,
            period,
            year,
            value,
            sort,
        } = req.query;

        const result = await customerAdminService.getCustomers({
            search,
            period:
                period || "month",
            year:
                year
                    ? Number(year)
                    : undefined,
            value:
                value
                    ? Number(value)
                    : undefined,
            sort:
                sort || "visits_desc",
        });

        return response.success(
            res,
            "Lấy danh sách khách hàng thành công.",
            result
        );

    } catch (error) {

        console.error(
            "CustomerAdmin getCustomers:",
            error
        );

        return response.error(
            res,
            error.message,
            400
        );

    }

};


// ======================================================
// GET CUSTOMER DETAIL
// ======================================================

const getCustomerById = async (req, res) => {

    try {

        const {
            period,
            year,
            value,
        } = req.query;

        const result =
            await customerAdminService
                .getCustomerById(

                    Number(req.params.id),

                    {

                        period:
                            period || "year",

                        year:
                            year
                                ? Number(year)
                                : undefined,

                        value:
                            value
                                ? Number(value)
                                : undefined,

                    }

                );

        return response.success(
            res,
            "Lấy thông tin khách hàng thành công.",
            result
        );

    } catch (error) {

        console.error(
            "CustomerAdmin getCustomerById:",
            error
        );

        return response.error(
            res,
            error.message,
            404
        );

    }

};


// ======================================================
// GET STATISTICS
// ======================================================

const getStatistics = async (req, res) => {

    try {

        const {
            period,
            year,
            value,
        } = req.query;

        const result =
            await customerAdminService
                .getStatistics({

                    period:
                        period || "month",

                    year:
                        year
                            ? Number(year)
                            : undefined,

                    value:
                        value
                            ? Number(value)
                            : undefined,

                });

        return response.success(
            res,
            "Lấy thống kê khách hàng thành công.",
            result
        );

    } catch (error) {

        console.error(
            "CustomerAdmin getStatistics:",
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

    getCustomers,

    getCustomerById,

    getStatistics,

};