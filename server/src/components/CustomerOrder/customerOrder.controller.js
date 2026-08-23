const customerOrderService =
    require("./customerOrder.service");

const create = async (req, res) => {

    try {

        const {
            tableId,
            items,
            orderId,
            newOrder,
        } = req.body;

        const order =
            await customerOrderService.create(
                req.customer.id,
                tableId,
                items,
                {
                    orderId,
                    newOrder,
                }
            );

        return res.status(201).json({
            success: true,
            data: order,
        });

    } catch (err) {

        console.error(
            "CUSTOMER CREATE ORDER ERROR:",
            err
        );

        return res.status(
            err.statusCode || 400
        ).json({
            success: false,

            message:
                err.message,

            code:
                err.code || null,

            data:
                err.data || null,
        });
    }
};

module.exports = {
    create,
};