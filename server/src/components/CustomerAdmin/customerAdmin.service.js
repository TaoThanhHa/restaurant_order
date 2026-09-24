const prisma = require("../../config/prisma");

const getDateRange = (period = "month", year, value) => {
    const now = new Date();
    const targetYear = Number(year) || now.getFullYear();

    if (period === "month") {
        const month = Number(value) || now.getMonth() + 1;
        return {
            from: new Date(targetYear, month - 1, 1),
            to: new Date(targetYear, month, 1)
        };
    }

    if (period === "quarter") {
        const quarter = Number(value) || 1;
        const startMonth = (quarter - 1) * 3;
        return {
            from: new Date(targetYear, startMonth, 1),
            to: new Date(targetYear, startMonth + 3, 1)
        };
    }

    if (period === "year") {
        return {
            from: new Date(targetYear, 0, 1),
            to: new Date(targetYear + 1, 0, 1)
        };
    }

    throw new Error("Khoảng thời gian không hợp lệ.");
};

const getScope = ({ restaurantId, branchId } = {}) => {
    const resolvedRestaurantId = Number(restaurantId) || null;
    const resolvedBranchId = Number(branchId) || null;

    if (!resolvedRestaurantId) {
        throw new Error("Không xác định được nhà hàng.");
    }

    return {
        restaurantId: resolvedRestaurantId,
        branchId: resolvedBranchId
    };
};

const getOrderScope = ({ restaurantId, branchId }) => {
    const scope = {
        OR: [
            {
                branch: {
                    restaurantId
                }
            },
            {
                session: {
                    table: {
                        floor: {
                            branch: {
                                restaurantId
                            }
                        }
                    }
                }
            }
        ]
    };

    if (branchId) {
        scope.OR = [
            {
                branch: {
                    id: branchId,
                    restaurantId
                }
            },
            {
                session: {
                    table: {
                        floor: {
                            branch: {
                                id: branchId,
                                restaurantId
                            }
                        }
                    }
                }
            }
        ];
    }

    return scope;
};


const getCustomers = async ({
    restaurantId,
    branchId,
    search,
    period = "month",
    year,
    value,
    sort = "visits_desc"
} = {}) => {
    const scope = getScope({ restaurantId, branchId });
    const { from, to } = getDateRange(period, year, value);
    const orderScope = getOrderScope(scope);

    const customers = await prisma.customer.findMany({
        where: {
            restaurantId,
            isGuest: false,
            orderMembers: {
                some: {
                    order: {
                        ...orderScope,
                        createdAt: { gte: from, lt: to }
                    }
                }
            },
            ...(search
                ? {
                      OR: [
                          { name: { contains: search, mode: "insensitive" } },
                          { email: { contains: search, mode: "insensitive" } },
                          { phone: { contains: search, mode: "insensitive" } }
                      ]
                  }
                : {})
        },
        include: {
            orderMembers: {
                where: {
                    order: {
                        ...orderScope,
                        createdAt: { gte: from, lt: to }
                    }
                },
                include: {
                    order: {
                        include: {
                            branch: true,
                            session: {
                                include: {
                                    table: {
                                        include: {
                                            floor: {
                                                include: { branch: true }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        orderBy: { id: "desc" }
    });

    const result = customers.map(customer => {
        const orders = customer.orderMembers
            .map(member => member.order)
            .filter(Boolean);

        const sessionIds = new Set();
        let takeawayVisits = 0;

        orders.forEach(order => {
            if (order.sessionId) {
                sessionIds.add(order.sessionId);
            } else if (order.orderType === "TAKE_AWAY") {
                takeawayVisits++;
            }
        });

        const visits = sessionIds.size + takeawayVisits;

        const totalSpent = orders.reduce(
            (sum, order) => sum + Number(order.totalAmount || 0),
            0
        );

        const branchMap = new Map();

        orders.forEach(order => {
            const branch =
                order.branch ||
                order.session?.table?.floor?.branch;

            if (!branch) return;

            if (!branchMap.has(branch.id)) {
                branchMap.set(branch.id, {
                    branchId: branch.id,
                    branchName: branch.name,
                    sessionIds: new Set(),
                    takeawayCount: 0,
                    totalSpent: 0
                });
            }

            const branchData = branchMap.get(branch.id);

            if (order.sessionId) {
                branchData.sessionIds.add(order.sessionId);
            } else if (order.orderType === "TAKE_AWAY") {
                branchData.takeawayCount++;
            }

            branchData.totalSpent += Number(order.totalAmount || 0);
        });

        const branches = Array.from(branchMap.values())
            .map(branch => ({
                branchId: branch.branchId,
                branchName: branch.branchName,
                visits:
                    branch.sessionIds.size +
                    branch.takeawayCount,
                totalSpent: branch.totalSpent
            }))
            .sort((a, b) => b.visits - a.visits);

        const latestOrder = orders.reduce(
            (latest, order) =>
                !latest || order.createdAt > latest.createdAt
                    ? order
                    : latest,
            null
        );

        return {
            id: customer.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            avatar: customer.avatar,
            isActive: customer.isActive,
            createdAt: customer.createdAt,
            visits,
            totalSpent,
            lastVisit: latestOrder?.createdAt || null,
            favoriteBranch: branches[0]?.branchName || null,
            branches
        };
    });

    result.sort((a, b) => {
        switch (sort) {
            case "visits_asc":
                return a.visits - b.visits;
            case "spent_desc":
                return b.totalSpent - a.totalSpent;
            case "spent_asc":
                return a.totalSpent - b.totalSpent;
            case "last_visit_desc":
                return (
                    new Date(b.lastVisit || 0) -
                    new Date(a.lastVisit || 0)
                );
            case "last_visit_asc":
                return (
                    new Date(a.lastVisit || 0) -
                    new Date(b.lastVisit || 0)
                );
            default:
                return b.visits - a.visits;
        }
    });

    const registeredCustomers = await prisma.customer.findMany({
        where: {
            restaurantId,
            isGuest: false,
            orderMembers: {
                some: {
                    order: {
                        ...orderScope,
                        createdAt: { gte: from, lt: to }
                    }
                }
            }
        },
        select: {
            id: true,
            createdAt: true
        }
    });

    const newCustomers = registeredCustomers.filter(customer => {
        const createdAt = new Date(customer.createdAt);
        return createdAt >= from && createdAt < to;
    }).length;

    const returningCustomers =
        registeredCustomers.length - newCustomers;

    const guestOrderMembers = await prisma.orderMember.findMany({
    where: {
        customer: {
            isGuest: true
        },
        order: {
            ...orderScope,
            createdAt: { gte: from, lt: to }
        }
    },
    select: {
        customerId: true
    }
});

const guestCreatedOrders = await prisma.order.findMany({
    where: {
        ...orderScope,
        createdAt: { gte: from, lt: to },
        createdByCustomer: {
            is: {
                isGuest: true
            }
        }
    },
    select: {
        createdByCustomerId: true
    }
});

const guestCustomerIds = new Set([
    ...guestOrderMembers.map(item => item.customerId),
    ...guestCreatedOrders
        .map(order => order.createdByCustomerId)
        .filter(Boolean)
]);

const guestCustomers = guestCustomerIds.size;

const statisticsOrders = await prisma.order.findMany({
    where: {
        ...orderScope,
        createdAt: { gte: from, lt: to }
    },
    select: {
        totalAmount: true
    }
});

const totalSpent = statisticsOrders.reduce(
    (sum, order) => sum + Number(order.totalAmount || 0),
    0
);

    return {
        period,
        year: Number(year) || new Date().getFullYear(),
        value: Number(value),
        from,
        to,
        statistics: {
            totalCustomers:
                newCustomers +
                returningCustomers +
                guestCustomers,
            guestCustomers,
            returningCustomers,
            newCustomers,
            totalSpent
        },
        customers: result
    };
};

const getCustomerById = async (
    customerId,
    { restaurantId, branchId, period = "year", year, value } = {}
) => {
    const scope = getScope({ restaurantId, branchId });
    const {
        restaurantId: resolvedRestaurantId,
        branchId: resolvedBranchId
    } = scope;

    const orderScope = getOrderScope(scope);
    const id = Number(customerId);

    if (!id) {
        throw new Error("Customer ID không hợp lệ.");
    }

    const customer = await prisma.customer.findFirst({
        where: {
            id,
            restaurantId: resolvedRestaurantId
        },
        include: {
            orderMembers: {
                include: {
                    order: {
                        include: {
                            payment: true,
                            orderItems: {
                                include: { food: true }
                            },
                            branch: true,
                            session: {
                                include: {
                                    table: {
                                        include: {
                                            floor: {
                                                include: { branch: true }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!customer) throw new Error("Khách hàng không tồn tại.");

    const { from, to } = getDateRange(period, year, value);

    const orders = customer.orderMembers
        .map(member => member.order)
        .filter(Boolean)
        .filter(order => {
            if (order.createdAt < from || order.createdAt >= to) {
                return false;
            }

            const orderBranch =
                order.branch ||
                order.session?.table?.floor?.branch;

            if (!orderBranch) {
                return false;
            }

            if (orderBranch.restaurantId !== resolvedRestaurantId) {
                return false;
            }

            if (
                resolvedBranchId &&
                orderBranch.id !== resolvedBranchId
            ) {
                return false;
            }

            return true;
        });

    const branchMap = new Map();

    orders.forEach(order => {
        const branch =
            order.branch ||
            order.session?.table?.floor?.branch;

        if (!branch) return;

        if (!branchMap.has(branch.id)) {
            branchMap.set(branch.id, {
                branchId: branch.id,
                branchName: branch.name,
                sessionIds: new Set(),
                takeawayCount: 0,
                totalSpent: 0
            });
        }

        const item = branchMap.get(branch.id);

        if (order.sessionId) {
            item.sessionIds.add(order.sessionId);
        } else if (order.orderType === "TAKE_AWAY") {
            item.takeawayCount++;
        }

        item.totalSpent += Number(order.totalAmount || 0);
    });

    const branches = Array.from(branchMap.values())
        .map(branch => ({
            branchId: branch.branchId,
            branchName: branch.branchName,
            visits:
                branch.sessionIds.size +
                branch.takeawayCount,
            totalSpent: branch.totalSpent
        }))
        .sort((a, b) => b.visits - a.visits);

    const sessionIds = new Set();
    let takeawayVisits = 0;

    orders.forEach(order => {
        if (order.sessionId) {
            sessionIds.add(order.sessionId);
        } else if (order.orderType === "TAKE_AWAY") {
            takeawayVisits++;
        }
    });

    const visitCount = sessionIds.size + takeawayVisits;

    const totalSpent = orders.reduce(
        (sum, order) => sum + Number(order.totalAmount || 0),
        0
    );

    return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        avatar: customer.avatar,
        isActive: customer.isActive,
        createdAt: customer.createdAt,
        statistics: {
            orderCount: orders.length,
            visitCount,
            totalSpent,
            favoriteBranch: branches[0] || null,
            branches
        },
        orders
    };
};

const getStatistics = async ({
    restaurantId,
    branchId,
    period = "month",
    year,
    value
} = {}) => {
    const scope = getScope({ restaurantId, branchId });
    const { from, to } = getDateRange(period, year, value);
    const orderScope = getOrderScope(scope);

    const registeredCustomers = await prisma.customer.findMany({
        where: {
            restaurantId,
            isGuest: false,
            orderMembers: {
                some: {
                    order: {
                        ...orderScope,
                        createdAt: { gte: from, lt: to }
                    }
                }
            }
        },
        select: {
            id: true,
            createdAt: true
        }
    });

    const newCustomers = registeredCustomers.filter(customer => {
        const createdAt = new Date(customer.createdAt);
        return createdAt >= from && createdAt < to;
    }).length;

    const returningCustomers =
        registeredCustomers.length - newCustomers;

    const guestOrderMembers = await prisma.orderMember.findMany({
        where: {
            customer: {
                isGuest: true
            },
            order: {
                ...orderScope,
                createdAt: { gte: from, lt: to }
            }
        },
        select: {
            customerId: true
        }
    });

    const guestCreatedOrders = await prisma.order.findMany({
        where: {
            ...orderScope,
            createdAt: { gte: from, lt: to },
            createdByCustomer: {
                is: {
                    isGuest: true
                }
            }
        },
        select: {
            createdByCustomerId: true
        }
    });

    const guestCustomerIds = new Set([
        ...guestOrderMembers.map(item => item.customerId),
        ...guestCreatedOrders
            .map(order => order.createdByCustomerId)
            .filter(Boolean)
    ]);

    const guestCustomers = guestCustomerIds.size;

    const orders = await prisma.order.findMany({
        where: {
            ...orderScope,
            createdAt: { gte: from, lt: to }
        },
        include: {
            createdByCustomer: {
                select: {
                    id: true,
                    name: true,
                    phone: true,
                    isGuest: true,
                    restaurantId: true
                }
            },
            orderMembers: {
                include: {
                    customer: true
                }
            },
            branch: true,
            session: {
                include: {
                    table: {
                        include: {
                            floor: {
                                include: {
                                    branch: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    const registeredCustomerIds = new Set();

    orders.forEach(order => {
        order.orderMembers.forEach(member => {
            const customer = member.customer;

            if (
                customer &&
                Number(customer.restaurantId) === Number(restaurantId) &&
                !customer.isGuest
            ) {
                registeredCustomerIds.add(customer.id);
            }
        });

        const customer = order.createdByCustomer;

        if (
            customer &&
            Number(customer.restaurantId) === Number(restaurantId) &&
            !customer.isGuest
        ) {
            registeredCustomerIds.add(customer.id);
        }
    });

    const branchMap = new Map();

    orders.forEach(order => {
        const branch =
            order.branch ||
            order.session?.table?.floor?.branch;

        if (!branch) return;

        if (!branchMap.has(branch.id)) {
            branchMap.set(branch.id, {
                branchId: branch.id,
                branchName: branch.name,
                visits: 0,
                totalSpent: 0
            });
        }

        const branchData = branchMap.get(branch.id);

        branchData.visits += 1;
        branchData.totalSpent += Number(order.totalAmount || 0);
    });

    const branches = Array.from(branchMap.values()).sort(
        (a, b) => b.visits - a.visits
    );

    const totalRevenue = orders.reduce(
        (sum, order) => sum + Number(order.totalAmount || 0),
        0
    );

    return {
        period,
        year: Number(year) || new Date().getFullYear(),
        value: Number(value),
        from,
        to,
        totalCustomers:
            registeredCustomers.length + guestCustomers,
        activeCustomers: registeredCustomerIds.size,
        registeredCustomers: registeredCustomers.length,
        newCustomers,
        returningCustomers,
        guestCustomers,
        totalOrders: orders.length,
        totalRevenue,
        branches
    };
};

module.exports = {
    getCustomers,
    getCustomerById,
    getStatistics
};