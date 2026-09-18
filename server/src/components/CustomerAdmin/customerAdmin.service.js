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

const getRestaurantId = user => {
    const restaurantId = Number(user?.restaurantId);

    if (!restaurantId) {
        throw new Error("Không xác định được nhà hàng.");
    }

    return restaurantId;
};

const getBranchId = async user => {
    if (!user) {
        throw new Error("Chưa xác thực người dùng.");
    }

    if (user.role !== "BRANCH") {
        return null;
    }

    const branchId = Number(user.branchId);

    if (!branchId) {
        throw new Error("Tài khoản chưa được gán chi nhánh.");
    }

    const branch = await prisma.branch.findFirst({
        where: {
            id: branchId,
            restaurantId: Number(user.restaurantId),
            isActive: true
        },
        select: { id: true }
    });

    if (!branch) {
        throw new Error("Chi nhánh không tồn tại hoặc đã bị khóa.");
    }

    return branch.id;
};

const getOrderWhere = ({
    restaurantId,
    branchId,
    from,
    to
}) => ({
    createdAt: {
        gte: from,
        lt: to
    },
    ...(branchId
        ? { branchId }
        : { branch: { restaurantId } })
});

const getOrderRelationWhere = ({
    restaurantId,
    branchId,
    from,
    to
}) => ({
    is: getOrderWhere({
        restaurantId,
        branchId,
        from,
        to
    })
});

const calculateVisits = orders => {
    const sessionIds = new Set();
    let takeawayVisits = 0;

    orders.forEach(order => {
        if (order.sessionId) {
            sessionIds.add(order.sessionId);
        } else if (order.orderType === "TAKE_AWAY") {
            takeawayVisits++;
        }
    });

    return sessionIds.size + takeawayVisits;
};

const calculateBranches = orders => {
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

    return Array.from(branchMap.values())
        .map(branch => ({
            branchId: branch.branchId,
            branchName: branch.branchName,
            visits:
                branch.sessionIds.size +
                branch.takeawayCount,
            totalSpent: branch.totalSpent
        }))
        .sort((a, b) => b.visits - a.visits);
};

const getCustomers = async ({
    user,
    search,
    period = "month",
    year,
    value,
    sort = "visits_desc"
} = {}) => {
    const restaurantId = getRestaurantId(user);
    const branchId = await getBranchId(user);
    const { from, to } = getDateRange(period, year, value);

    const orderWhere = getOrderRelationWhere({
        restaurantId,
        branchId,
        from,
        to
    });

    const customers = await prisma.customer.findMany({
        where: {
            restaurantId,
            isGuest: false,
            orderMembers: {
                some: {
                    order: orderWhere
                }
            },
            ...(search
                ? {
                      OR: [
                          {
                              name: {
                                  contains: search,
                                  mode: "insensitive"
                              }
                          },
                          {
                              email: {
                                  contains: search,
                                  mode: "insensitive"
                              }
                          },
                          {
                              phone: {
                                  contains: search,
                                  mode: "insensitive"
                              }
                          }
                      ]
                  }
                : {})
        },
        include: {
            orderMembers: {
                where: {
                    order: orderWhere
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
                                                    branch: true
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
        }
    });

    const result = customers.map(customer => {
        const orders = customer.orderMembers
            .map(member => member.order)
            .filter(Boolean);

        const visits = calculateVisits(orders);

        const totalSpent = orders.reduce(
            (sum, order) =>
                sum + Number(order.totalAmount || 0),
            0
        );

        const branches = calculateBranches(orders);

        const latestOrder = orders.reduce(
            (latest, order) =>
                !latest ||
                order.createdAt > latest.createdAt
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
            favoriteBranch:
                branches[0]?.branchName || null,
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

    const registeredCustomers =
        await prisma.customer.findMany({
            where: {
                restaurantId,
                isGuest: false,
                orderMembers: {
                    some: {
                        order: orderWhere
                    }
                }
            },
            select: {
                id: true,
                createdAt: true
            }
        });

    const newCustomers = registeredCustomers.filter(
        customer => {
            const createdAt = new Date(
                customer.createdAt
            );

            return (
                createdAt >= from &&
                createdAt < to
            );
        }
    ).length;

    const returningCustomers =
        registeredCustomers.length - newCustomers;

    const guestOrders = await prisma.order.findMany({
        where: getOrderWhere({
            restaurantId,
            branchId,
            from,
            to
        }),
        select: {
            id: true,
            createdByCustomer: {
                select: {
                    id: true,
                    isGuest: true
                }
            },
            orderMembers: {
                select: {
                    customer: {
                        select: {
                            id: true,
                            isGuest: true
                        }
                    }
                }
            }
        }
    });

    const guestCustomerIds = new Set();

    guestOrders.forEach(order => {
        if (
            order.createdByCustomer?.isGuest
        ) {
            guestCustomerIds.add(
                order.createdByCustomer.id
            );
        }

        order.orderMembers.forEach(member => {
            if (
                member.customer?.isGuest
            ) {
                guestCustomerIds.add(
                    member.customer.id
                );
            }
        });
    });

    const guestCustomers = guestCustomerIds.size;

    const statisticsOrders =
        await prisma.order.findMany({
            where: getOrderWhere({
                restaurantId,
                branchId,
                from,
                to
            }),
            select: {
                totalAmount: true
            }
        });

    const totalSpent = statisticsOrders.reduce(
        (sum, order) =>
            sum + Number(order.totalAmount || 0),
        0
    );

    return {
        period,
        year:
            Number(year) ||
            new Date().getFullYear(),
        value: value ? Number(value) : null,
        from,
        to,
        statistics: {
            totalCustomers:
                registeredCustomers.length +
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
    {
        user,
        period = "year",
        year,
        value
    } = {}
) => {
    const restaurantId = getRestaurantId(user);
    const branchId = await getBranchId(user);
    const id = Number(customerId);

    if (!id) {
        throw new Error("Customer ID không hợp lệ.");
    }

    const customer = await prisma.customer.findFirst({
        where: {
            id,
            restaurantId
        },
        include: {
            orderMembers: {
                include: {
                    order: {
                        include: {
                            payment: true,
                            orderItems: {
                                include: {
                                    food: true
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
                    }
                }
            }
        }
    });

    if (!customer) {
        throw new Error(
            "Khách hàng không tồn tại."
        );
    }

    const { from, to } = getDateRange(
        period,
        year,
        value
    );

    const orders = customer.orderMembers
        .map(member => member.order)
        .filter(Boolean)
        .filter(order => {
            if (
                Number(order.branch?.restaurantId) !==
                restaurantId
            ) {
                return false;
            }

            if (
                order.createdAt < from ||
                order.createdAt >= to
            ) {
                return false;
            }

            if (
                branchId &&
                Number(order.branchId) !== branchId
            ) {
                return false;
            }

            return true;
        });

    if (!orders.length) {
        throw new Error(
            "Khách hàng không có dữ liệu tại chi nhánh này."
        );
    }

    const branches = calculateBranches(orders);
    const visitCount = calculateVisits(orders);

    const totalSpent = orders.reduce(
        (sum, order) =>
            sum + Number(order.totalAmount || 0),
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
            favoriteBranch:
                branches[0] || null,
            branches
        },
        orders
    };
};

const getStatistics = async ({
    user,
    period = "month",
    year,
    value
} = {}) => {
    const restaurantId = getRestaurantId(user);
    const branchId = await getBranchId(user);

    const { from, to } = getDateRange(
        period,
        year,
        value
    );

    const orders = await prisma.order.findMany({
        where: getOrderWhere({
            restaurantId,
            branchId,
            from,
            to
        }),
        include: {
            orderMembers: {
                include: {
                    customer: true
                }
            },
            createdByCustomer: true,
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
    const guestCustomerIds = new Set();

    orders.forEach(order => {
        const createdCustomer =
            order.createdByCustomer;

        if (createdCustomer) {
            if (createdCustomer.isGuest) {
                guestCustomerIds.add(
                    createdCustomer.id
                );
            } else if (
                Number(
                    createdCustomer.restaurantId
                ) === restaurantId
            ) {
                registeredCustomerIds.add(
                    createdCustomer.id
                );
            }
        }

        order.orderMembers.forEach(member => {
            const customer = member.customer;

            if (!customer) return;

            if (customer.isGuest) {
                guestCustomerIds.add(
                    customer.id
                );
            } else if (
                Number(customer.restaurantId) ===
                restaurantId
            ) {
                registeredCustomerIds.add(
                    customer.id
                );
            }
        });
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

        branchData.visits++;
        branchData.totalSpent += Number(
            order.totalAmount || 0
        );
    });

    const branches = Array.from(
        branchMap.values()
    ).sort(
        (a, b) => b.visits - a.visits
    );

    const totalRevenue = orders.reduce(
        (sum, order) =>
            sum + Number(order.totalAmount || 0),
        0
    );

    return {
        period,
        year:
            Number(year) ||
            new Date().getFullYear(),
        value: value ? Number(value) : null,
        from,
        to,
        totalCustomers:
            registeredCustomerIds.size +
            guestCustomerIds.size,
        activeCustomers:
            registeredCustomerIds.size,
        guestCustomers:
            guestCustomerIds.size,
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
