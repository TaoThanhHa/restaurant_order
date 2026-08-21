const customerOrderService = require("./customerOrder.service");

const create = async (req, res) => {

    try {

        const {
            tableId,
            items,
        } = req.body;

        const order =
            await customerOrderService.create(
                req.customer.id,
                tableId,
                items
            );

        return res.json({
            success: true,
            data: order,
        });

    } catch (err) {

        return res.status(400).json({
            success: false,
            message: err.message,
        });

    }

};

module.exports = {
    create,
};