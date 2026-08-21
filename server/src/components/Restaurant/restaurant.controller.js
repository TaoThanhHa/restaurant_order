const restaurantService =
    require("./restaurant.service");

const response =
    require("../../utils/response");

const getPublicInfo = async (req, res) => {

    try {

        const restaurant =
            await restaurantService.getPublicInfo();

        return response.success(
            res,
            restaurant
        );

    } catch (error) {

        console.error(
            "GET RESTAURANT INFO ERROR:",
            error
        );

        return response.error(
            res,
            error.message,
            500
        );

    }
};

module.exports = {
    getPublicInfo,
};