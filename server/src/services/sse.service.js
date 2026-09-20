const clients = {
    customers: new Map(),
    branches: new Map(),
};

const addClient = (map, id, res) => {
    id = Number(id);

    if (!map.has(id)) {
        map.set(id, new Set());
    }

    map.get(id).add(res);
};

const removeClient = (map, id, res) => {
    id = Number(id);

    const set = map.get(id);

    if (!set) return;

    set.delete(res);

    if (set.size === 0) {
        map.delete(id);
    }
};

const send = (res, event, data = {}) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
};

const sendToCustomer = (
    customerId,
    event,
    data = {}
) => {
    const set =
        clients.customers.get(
            Number(customerId)
        );

    if (!set) return;

    for (const res of set) {
        try {
            send(res, event, data);
        } catch (error) {
            console.error(
                "SSE CUSTOMER SEND ERROR:",
                error
            );
        }
    }
};

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
        console.log(
            "SSE BRANCH NOT FOUND:",
            branchId
        );
        return;
    }

    for (const res of set) {
        try {
            send(res, event, data);
        } catch (error) {
            console.error(
                "SSE BRANCH SEND ERROR:",
                error
            );
        }
    }
};

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
            message: "SSE connected"
        }
    );

    const heartbeat = setInterval(() => {
        try {
            res.write(
                `: heartbeat ${Date.now()}\n\n`
            );
        } catch {
            clearInterval(heartbeat);
        }
    }, 25000);

    req.on("close", () => {
        clearInterval(heartbeat);

        removeClient(
            clients.customers,
            customerId,
            res
        );
    });
};

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
            message: "SSE connected"
        }
    );

    const heartbeat = setInterval(() => {
        try {
            res.write(
                `: heartbeat ${Date.now()}\n\n`
            );
        } catch {
            clearInterval(heartbeat);
        }
    }, 25000);

    req.on("close", () => {
        clearInterval(heartbeat);

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
    connectBranch
};