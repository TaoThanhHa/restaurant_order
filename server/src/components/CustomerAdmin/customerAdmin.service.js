const prisma = require("../../config/prisma");

const getDateRange = (period = "month", year, value) => {
    const now = new Date();
    const targetYear = Number(year) || now.getFullYear();
    if (period === "month") {
        const month =  Number(value) || now.getMonth() + 1;
        return {
            from: new Date(targetYear, month - 1, 1),
            to: new Date( targetYear, month, 1),
        };
    }
    if (period === "quarter") {
        const quarter = Number(value) || 1;
        const startMonth = (quarter - 1) * 3;
        return {
            from: new Date(targetYear,startMonth,1),
            to: new Date(targetYear,startMonth + 3,1),
        };
    }
    // YEAR
    if (period === "year") {
        return {
            from: new Date(targetYear,0,1),
            to: new Date(targetYear + 1,0,1),
        };
    }
    throw new Error(
        "Khoảng thời gian không hợp lệ."
    );
};

// GET CUSTOMERS
const getCustomers = async ({
    search,
    period = "month",
    year,
    value,
    sort = "visits_desc",
} = {}) => {
    const { from, to } = getDateRange(period, year, value);

    const customers = await prisma.customer.findMany({
        where: {
            isGuest: false,
            orderMembers: {
                some: {
                    order: {
                        createdAt: { gte: from, lt: to },
                    },
                },
            },
            ...(search
                ? {
                      OR: [
                          { name: { contains: search, mode: "insensitive" } },
                          { email: { contains: search, mode: "insensitive" } },
                          { phone: { contains: search, mode: "insensitive" } },
                      ],
                  }
                : {}),
        },
        include: {
            orderMembers: {
                where: {
                    order: {
                        createdAt: { gte: from, lt: to },
                    },
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
                                                include: {
                                                    branch: true,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        orderBy: { id: "desc" },
    });

    const result = customers.map((customer) => {
        const orders = customer.orderMembers
            .map((member) => member.order)
            .filter(Boolean);

        const sessionIds = new Set();
        let takeawayVisits = 0;

        orders.forEach((order) => {
            if (order.sessionId) sessionIds.add(order.sessionId);
            else if (order.orderType === "TAKE_AWAY") takeawayVisits++;
        });

        const visits = sessionIds.size + takeawayVisits;

        const totalSpent = orders.reduce(
            (sum, order) => sum + Number(order.totalAmount || 0),
            0
        );

        const branchMap = new Map();

        orders.forEach((order) => {
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
                    totalSpent: 0,
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
            .map((branch) => ({
                branchId: branch.branchId,
                branchName: branch.branchName,
                visits:
                    branch.sessionIds.size +
                    branch.takeawayCount,
                totalSpent: branch.totalSpent,
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
            branches,
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
                return new Date(b.lastVisit) - new Date(a.lastVisit);
            case "last_visit_asc":
                return new Date(a.lastVisit) - new Date(b.lastVisit);
            default:
                return b.visits - a.visits;
        }
    });

    const registeredCustomers = await prisma.customer.findMany({
        where: {
            isGuest: false,
            orderMembers: {
                some: {
                    order: {
                        createdAt: { gte: from, lt: to },
                    },
                },
            },
        },
        select: {
            id: true,
            createdAt: true,
        },
    });

    const newCustomers = registeredCustomers.filter((customer) => {
        const createdAt = new Date(customer.createdAt);
        return createdAt >= from && createdAt < to;
    }).length;

    const returningCustomers = registeredCustomers.length - newCustomers;

    const guestCustomers = await prisma.customer.count({
        where: {
            isGuest: true,
            orderMembers: {
                some: {
                    order: {
                        createdAt: { gte: from, lt: to },
                    },
                },
            },
        },
    });

    const statisticsOrders = await prisma.order.findMany({
        where: {
            createdAt: { gte: from, lt: to },
            orderMembers: {
                some: {},
            },
        },
        select: {
            totalAmount: true,
        },
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
            totalCustomers: newCustomers + returningCustomers + guestCustomers,
            guestCustomers,
            returningCustomers,
            newCustomers,
            totalSpent,
        },
        customers: result,
    };
};

// GET CUSTOMER DETAIL
 const getCustomerById = async (
    customerId,
    {
        period = "year",
        year,
        value,
    } = {}
) => {
    const id = Number(customerId);
    if (!id) {
        throw new Error(
            "Customer ID không hợp lệ."
        );
    }
    const customer = await prisma.customer.findUnique({
            where: {
                id,
            },
            include: {
                orderMembers: {
                    include: {
                        order: {
                            include: {
                                payment: true,
                                orderItems: {
                                    include: {
                                        food: true,
                                    },
                                },
                                branch: true,
                                session: {
                                    include: {
                                        table: {
                                            include: {
                                                floor: {
                                                    include: {
                                                        branch: true,
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

    if (!customer) {
        throw new Error(
            "Khách hàng không tồn tại."
        );
    }
    const {
        from,
        to,
    } = getDateRange(
        period,
        year,
        value
    );


    const orders = customer.orderMembers.map( (member) => member.order )
        .filter(Boolean)
        .filter((order) => {
                return (
                    order.createdAt >= from &&
                    order.createdAt < to
                );
            });
    // BRANCH STATISTICS
    const branchMap = new Map();
    orders.forEach(
        (order) => {
            const branch =
    order.branch ||
    order.session?.table?.floor?.branch;

            if (!branch) {
                return;
            }

            if (!branchMap.has(branch.id)) {
                branchMap.set(
                    branch.id,
                    {
                        branchId: branch.id,
                        branchName: branch.name,
                        visits: 0,
                        totalSpent: 0,
                    }
                );
            }
            const item = branchMap.get(branch.id);
            item.visits += 1;
            item.totalSpent += Number( order.totalAmount || 0 );
        }
    );

    const branches = Array.from( branchMap.values()).sort(
        (a, b) =>
            b.visits -
            a.visits
    );      
    // SESSION COUNT
    const sessionIds = new Set();
let takeawayVisits = 0;

orders.forEach((order) => {
    if (order.sessionId) {
        sessionIds.add(order.sessionId);
    } else if (order.orderType === "TAKE_AWAY") {
        takeawayVisits += 1;
    }
});

const visitCount =
    sessionIds.size + takeawayVisits;
    // TOTAL SPENT
    const totalSpent =
        orders.reduce(
            (sum, order) =>
                sum +
                Number(
                    order.totalAmount || 0
                ),
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
            branches,
        },
        orders,
    };
};
// GET OVERVIEW STATISTICS
const getStatistics = async ({
    period = "month",
    year,
    value,
} = {}) => {

    const {
        from,
        to,
    } = getDateRange(
        period,
        year,
        value
    );
    // CUSTOMER COUNT
    const totalCustomers =
        await prisma.customer.count({
            where: {
                isGuest: false,
                createdAt: {
                    lt: to,
                },
            },
        });
    // ORDERS
    const orders =
        await prisma.order.findMany({
            where: {
                createdAt: {
                    gte: from,
                    lt: to,
                },
                orderMembers: {
                    some: {
                        customer: {
                            isGuest: false,
                        },
                    },
                },
            },

            include: {
                orderMembers: {
                    include: {
                        customer: true,
                    },
                },
                branch: true,
                session: {
                    include: {
                        table: {
                            include: {
                                floor: {
                                    include: {
                                        branch: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
    // UNIQUE CUSTOMERS
    const customerIds =
        new Set();
    orders.forEach(
        (order) => {
            order.orderMembers
                .forEach(
                    (member) => {
                        if (!member.customer ?.isGuest ) {
                            customerIds.add(
                                member.customer.id
                            );
                        }
                    }
                );
        }
    );

    // BRANCH STATISTICS
    const branchMap = new Map();
    orders.forEach(
        (order) => {
            const branch =
    order.branch ||
    order.session?.table?.floor?.branch;

            if (!branch) {
                return;
            }
            if (!branchMap.has(branch.id)) {
                branchMap.set(
                    branch.id,
                    {
                        branchId: branch.id,
                        branchName: branch.name,
                        visits: 0,
                        totalSpent: 0,
                    }
                );
            }

            const branchData =
                branchMap.get(
                    branch.id
                );
            branchData.visits += 1;
            branchData.totalSpent += Number(order.totalAmount || 0);
        }
    );

    const branches =
        Array.from(
            branchMap.values()
        ).sort(
            (a, b) =>
                b.visits -
                a.visits
        );

    return {
        period,
        year: Number(year) || new Date().getFullYear(),
        from,
        to,
        totalCustomers,
        activeCustomers: customerIds.size,
        totalOrders: orders.length,
        totalRevenue:
            orders.reduce(
                (sum, order) =>
                    sum +
                    Number(
                        order.totalAmount || 0
                    ),
                0
            ),
        branches,
    };
};
// EXPORT

module.exports = {
    getCustomers,
    getCustomerById,
    getStatistics,
};