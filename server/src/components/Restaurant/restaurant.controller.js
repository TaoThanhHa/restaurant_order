const restaurantService = require("./restaurant.service");

const getPublicInfo = async (req, res) => {
    try {
        const restaurantId = req.params.restaurantId;

        const data = await restaurantService.getPublicInfo(restaurantId);

        return res.json(data);
    } catch (error) {
        console.error("GET PUBLIC INFO ERROR:", error);
        return res.status(500).json({
            message: error.message,
        });
    }
};

module.exports = {
    getPublicInfo,
};