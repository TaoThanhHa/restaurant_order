const clients = {
    customers: new Map(),
    branches: new Map(),
};


// ======================================================
// THÊM CLIENT
// ======================================================

const addClient = (map, id, res) => {

    id = Number(id);

    if (!map.has(id)) {
        map.set(id, new Set());
    }

    map.get(id).add(res);
};


// ======================================================
// XÓA CLIENT
// ======================================================

const removeClient = (map, id, res) => {

    id = Number(id);

    const set = map.get(id);

    if (!set) {
        return;
    }

    set.delete(res);

    if (set.size === 0) {
        map.delete(id);
    }
};


// ======================================================
// GỬI EVENT
// ======================================================

const send = (res, event, data = {}) => {

    res.write(`event: ${event}\n`);

    res.write(
        `data: ${JSON.stringify(data)}\n\n`
    );
};


// ======================================================
// GỬI CHO CUSTOMER
// ======================================================

const sendToCustomer = (
    customerId,
    event,
    data = {}
) => {

    const set =
        clients.customers.get(
            Number(customerId)
        );

    if (!set) {
        return;
    }

    for (const res of set) {

        try {

            send(
                res,
                event,
                data
            );

        } catch (error) {

            console.error(
                "SSE CUSTOMER SEND ERROR:",
                error
            );

        }

    }

};


// ======================================================
// GỬI CHO BRANCH
// ======================================================

const sendToBranch = (
    branchId,
    event,
    data = {}
) => {

    const set =
        clients.branches.get(
            Number(branchId)
        );

    if (!set) {
        return;
    }

    for (const res of set) {

        try {

            send(
                res,
                event,
                data
            );

        } catch (error) {

            console.error(
                "SSE BRANCH SEND ERROR:",
                error
            );

        }

    }

};


// ======================================================
// KẾT NỐI CUSTOMER
// ======================================================

const connectCustomer = (
    customerId,
    req,
    res
) => {

    addClient(
        clients.customers,
        customerId,
        res
    );

    send(
        res,
        "connected",
        {
            message: "SSE connected",
        }
    );

    const heartbeat =
        setInterval(() => {

            try {

                res.write(
                    `: heartbeat ${Date.now()}\n\n`
                );

            } catch (error) {
                clearInterval(heartbeat);
            }

        }, 25000);


    req.on("close", () => {

        clearInterval(
            heartbeat
        );

        removeClient(
            clients.customers,
            customerId,
            res
        );

    });

};


// ======================================================
// KẾT NỐI BRANCH
// ======================================================

const connectBranch = (
    branchId,
    req,
    res
) => {

    addClient(
        clients.branches,
        branchId,
        res
    );

    send(
        res,
        "connected",
        {
            message: "SSE connected",
        }
    );

    const heartbeat =
        setInterval(() => {

            try {

                res.write(
                    `: heartbeat ${Date.now()}\n\n`
                );

            } catch (error) {
                clearInterval(heartbeat);
            }

        }, 25000);


    req.on("close", () => {

        clearInterval(
            heartbeat
        );

        removeClient(
            clients.branches,
            branchId,
            res
        );

    });

};


module.exports = {
    clients,
    send,
    sendToCustomer,
    sendToBranch,
    connectCustomer,
    connectBranch,
};