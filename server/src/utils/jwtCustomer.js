const jwt = require("jsonwebtoken");

const generateCustomerToken = customer => {
    return jwt.sign(
        {
            id: customer.id,
            restaurantId: customer.restaurantId,
            isGuest: customer.isGuest
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "30d"
        }
    );
};

const verifyCustomerToken = token => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
    generateCustomerToken,
    verifyCustomerToken
};