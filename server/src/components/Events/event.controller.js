const sseService =
    require("../../services/sse.service");


// ======================================================
// CUSTOMER SSE
// ======================================================

const customerStream = (req, res) => {

    const customerId =
        req.customer?.id ||
        req.user?.id;

    if (!customerId) {

        return res.status(401).end();

    }


    res.setHeader(
        "Content-Type",
        "text/event-stream"
    );

    res.setHeader(
        "Cache-Control",
        "no-cache, no-transform"
    );

    res.setHeader(
        "Connection",
        "keep-alive"
    );

    res.setHeader(
        "X-Accel-Buffering",
        "no"
    );


    if (res.flushHeaders) {
        res.flushHeaders();
    }


    sseService.connectCustomer(
        customerId,
        req,
        res
    );

};


// ======================================================
// STAFF / BRANCH SSE
// ======================================================

const branchStream = (req, res) => {

    const branchId =
        req.user?.branchId;

    if (!branchId) {

        return res.status(401).end();

    }


    res.setHeader(
        "Content-Type",
        "text/event-stream"
    );

    res.setHeader(
        "Cache-Control",
        "no-cache, no-transform"
    );

    res.setHeader(
        "Connection",
        "keep-alive"
    );

    res.setHeader(
        "X-Accel-Buffering",
        "no"
    );


    if (res.flushHeaders) {
        res.flushHeaders();
    }


    sseService.connectBranch(
        branchId,
        req,
        res
    );

};


module.exports = {
    customerStream,
    branchStream,
};