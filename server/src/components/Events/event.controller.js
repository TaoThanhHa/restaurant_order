const sseService = require("../../services/sse.service");

const setSSEHeaders = (res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    if (res.flushHeaders) {
        res.flushHeaders();
    }
};

const customerStream = (req, res) => {
    const customerId = req.customer?.id || req.user?.id;

    if (!customerId) {
        return res.status(401).end();
    }

    setSSEHeaders(res);

    sseService.connectCustomer(customerId, req, res);
};

const branchStream = (req, res) => {
    const branchId = req.user?.branchId;

    if (!branchId) {
        return res.status(401).end();
    }

    setSSEHeaders(res);

    sseService.connectBranch(branchId, req, res);
};

const restaurantStream = (req, res) => {
    const restaurantId = req.user?.restaurantId;

    if (!restaurantId) {
        return res.status(401).end();
    }

    setSSEHeaders(res);

    sseService.connectRestaurant(restaurantId, req, res);
};

module.exports = {
    customerStream,
    branchStream,
    restaurantStream
};

