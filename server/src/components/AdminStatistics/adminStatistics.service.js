const prisma = require("../../config/prisma");

const startOfDay = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

const endOfDay = (date) => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
};

const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
};

const addMonths = (date, months) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
};

const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const formatLabel = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}`;
};

const toNumber = (value) => Number(value || 0);

const getMonday = (date) => {
    const d = startOfDay(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return startOfDay(d);
};

const getPeriod = (period, filters = {}) => {
    const today = startOfDay(new Date());

    if (period === "day") {
        const selectedDate = filters.date ? new Date(`${filters.date}T00:00:00`) : today;
        if (Number.isNaN(selectedDate.getTime())) 
        throw new Error("Ngày chọn không hợp lệ.");
        return { fromDate: startOfDay(selectedDate), toDate: endOfDay(selectedDate) };
    }

    if (period === "week") {
        const selectedDate = filters.weekStart ? new Date(`${filters.weekStart}T00:00:00`) : today;
        if (Number.isNaN(selectedDate.getTime())) 
        throw new Error("Ngày chọn tuần không hợp lệ.");
        const fromDate = getMonday(selectedDate);
        return { fromDate, toDate: endOfDay(addDays(fromDate, 6)) };
    }

    if (period === "month") {
        const year = Number(filters.year);
        const month = Number(filters.month);
        if (!year || !month || month < 1 || month > 12) 
        throw new Error("Năm hoặc tháng không hợp lệ.");
        const fromDate = new Date(year, month - 1, 1);
        const toDate = new Date(year, month, 0);
        return { fromDate: startOfDay(fromDate), toDate: endOfDay(toDate) };
    }

    if (period === "quarter") {
        const year = Number(filters.year);
        const quarter = Number(filters.quarter);
        if (!year || !quarter || quarter < 1 || quarter > 4) 
        throw new Error("Năm hoặc quý không hợp lệ.");
        const startMonth = (quarter - 1) * 3;
        const fromDate = new Date(year, startMonth, 1);
        const toDate = new Date(year, startMonth + 3, 0);
        return { fromDate: startOfDay(fromDate), toDate: endOfDay(toDate) };
    }

    
        throw new Error("Loại thống kê không hợp lệ.");
};

const getPreviousPeriod = (period, fromDate) => {
    if (period === "week") {
        return {
            fromDate: startOfDay(addDays(fromDate, -7)),
            toDate: endOfDay(addDays(fromDate, -1))
        };
    }

    if (period === "month") {
        const previousTo = endOfDay(addDays(fromDate, -1));
        const previousFrom = startOfDay(new Date(previousTo.getFullYear(), previousTo.getMonth(), 1));
        return { fromDate: previousFrom, toDate: previousTo };
    }

    return null;
};

const createBuckets = (period, fromDate, toDate) => {
    const buckets = [];

    if (period === "day") {
        return [{
            key: formatDate(fromDate),
            label: formatLabel(fromDate),
            from: startOfDay(fromDate),
            to: endOfDay(fromDate)
        }];
    }

    if (period === "week") {
        for (let i = 0; i < 7; i++) {
            const date = addDays(fromDate, i);
            buckets.push({
                key: formatDate(date),
                label: formatLabel(date),
                from: startOfDay(date),
                to: endOfDay(date)
            });
        }
        return buckets;
    }

    if (period === "month") {
        let current = getMonday(fromDate);

        while (current <= toDate) {
            let bucketFrom = new Date(current);
            let bucketTo = endOfDay(addDays(current, 6));

            if (bucketFrom < fromDate) bucketFrom = new Date(fromDate);
            if (bucketTo > toDate) bucketTo = new Date(toDate);

            buckets.push({
                key: formatDate(bucketFrom),
                label: `${formatLabel(bucketFrom)} - ${formatLabel(bucketTo)}`,
                from: startOfDay(bucketFrom),
                to: endOfDay(bucketTo)
            });

            current = addDays(current, 7);
        }

        return buckets;
    }

    if (period === "quarter") {
        for (let i = 0; i < 3; i++) {
            const bucketFrom = addMonths(fromDate, i);
            const bucketTo = new Date(bucketFrom.getFullYear(), bucketFrom.getMonth() + 1, 0);

            buckets.push({
                key: `${bucketFrom.getFullYear()}-${String(bucketFrom.getMonth() + 1).padStart(2, "0")}`,
                label: `Tháng ${bucketFrom.getMonth() + 1}`,
                from: startOfDay(bucketFrom),
                to: endOfDay(bucketTo)
            });
        }
        return buckets;
    }

    return buckets;
};

const getPayments = async (branchId, fromDate, toDate) => {
    const where = {
        paymentStatus: "PAID",
        paidAt: { gte: fromDate, lte: toDate }
    };

    if (branchId) where.order = { branchId: Number(branchId) };

    return prisma.payment.findMany({
        where,
        select: {
            id: true,
            totalAmount: true,
            paidAt: true,
            order: {
                select: {
                    id: true,
                    branchId: true,
                    orderType: true,
                    branch: { select: { id: true, name: true } },
                    orderMembers: {
                        select: {
                            customer: { select: { id: true, isGuest: true } }
                        }
                    },
                    orderItems: {
                        where: { status: { not: "CANCELLED" } },
                        select: {
                            quantity: true,
                            price: true,
                            food: { select: { id: true, name: true } }
                        }
                    }
                }
            }
        },
        orderBy: { paidAt: "asc" }
    });
};

const findBucketIndex = (date, buckets) => {
    if (!date) return -1;
    const time = new Date(date).getTime();
    return buckets.findIndex((bucket) => time >= bucket.from.getTime() && time <= bucket.to.getTime());
};

const buildFoodMap = (payments) => {
    const foodMap = new Map();

    payments.forEach((payment) => {
        const order = payment.order;
        if (!order) return;

        (order.orderItems || []).forEach((item) => {
            if (!item.food) return;

            const foodId = item.food.id;
            const quantity = toNumber(item.quantity);
            const revenue = quantity * toNumber(item.price);

            if (!foodMap.has(foodId)) {
                foodMap.set(foodId, {
                    id: foodId,
                    name: item.food.name,
                    quantity: 0,
                    revenue: 0
                });
            }

            const food = foodMap.get(foodId);
            food.quantity += quantity;
            food.revenue += revenue;
        });
    });

    return foodMap;
};

const getSellableFoods = async (branchId) => {
    const branchCondition = branchId
        ? { branchId: Number(branchId), status: { not: "INACTIVE" } }
        : { status: { not: "INACTIVE" } };

    return prisma.food.findMany({
        where: { branchFoods: { some: branchCondition } },
        select: {
            id: true,
            name: true,
            createdAt: true,
            category: { select: { id: true, name: true } }
        },
        orderBy: { name: "asc" }
    });
};

const getFoodTrend = async (branchId, period, fromDate, toDate, currentPayments = null) => {
    if (period !== "week" && period !== "month") {
        return { increased: [], decreased: [] };
    }

    const previousPeriod = getPreviousPeriod(period, fromDate);
    if (!previousPeriod) return { increased: [], decreased: [] };

    const [previousPayments, foods] = await Promise.all([
        getPayments(branchId, previousPeriod.fromDate, previousPeriod.toDate),
        getSellableFoods(branchId)
    ]);

    const currentMap = buildFoodMap(currentPayments || []);
    const previousMap = buildFoodMap(previousPayments);
    const increased = [];
    const decreased = [];

    foods.forEach((food) => {
        const createdAt = food.createdAt ? new Date(food.createdAt) : null;
        if (createdAt && createdAt >= fromDate) return;

        const currentQuantity = toNumber(currentMap.get(food.id)?.quantity);
        const previousQuantity = toNumber(previousMap.get(food.id)?.quantity);

        if (currentQuantity === 0 && previousQuantity === 0) return;
        if (previousQuantity === 0) return;

        const difference = currentQuantity - previousQuantity;
        const percentage = (difference / previousQuantity) * 100;

        const item = {
            id: food.id,
            name: food.name,
            category: food.category ? { id: food.category.id, name: food.category.name } : null,
            currentQuantity,
            previousQuantity,
            difference,
            percentage: Number(percentage.toFixed(1))
        };

        if (percentage >= 20) increased.push(item);
        if (percentage <= -20) decreased.push(item);
    });

    increased.sort((a, b) => b.percentage - a.percentage);
    decreased.sort((a, b) => a.percentage - b.percentage);

    return {
        increased: increased.slice(0, 10),
        decreased: decreased.slice(0, 10)
    };
};

const getUnsoldFoods = async (branchId, currentPayments = []) => {
    const foods = await getSellableFoods(branchId);
    const foodMap = buildFoodMap(currentPayments);

    return foods
        .filter((food) => {
            const sold = foodMap.get(food.id);
            return !sold || toNumber(sold.quantity) === 0;
        })
        .map((food) => ({
            id: food.id,
            name: food.name,
            category: food.category ? { id: food.category.id, name: food.category.name } : null
        }));
};

const addOrderItemsToFoodMap = (foodMap, orderItems = []) => {
    orderItems.forEach((item) => {
        if (!item.food) return;

        const foodId = item.food.id;
        const quantity = toNumber(item.quantity);
        const revenue = quantity * toNumber(item.price);

        if (!foodMap.has(foodId)) {
            foodMap.set(foodId, {
                id: foodId,
                name: item.food.name,
                quantity: 0,
                revenue: 0
            });
        }

        const food = foodMap.get(foodId);
        food.quantity += quantity;
        food.revenue += revenue;
    });
};

const getStatistics = async (branchId, period, filters = {}) => {
    const { fromDate, toDate } = getPeriod(period, filters);
    const branchFilter = branchId ? Number(branchId) : undefined;
    const buckets = createBuckets(period, fromDate, toDate);
    const payments = await getPayments(branchFilter, fromDate, toDate);

    const timeline = buckets.map((bucket) => ({
        key: bucket.key,
        label: bucket.label,
        total: 0
    }));

    const customerTimeline = buckets.map((bucket) => ({
        key: bucket.key,
        label: bucket.label,
        member: 0,
        guest: 0
    }));

    const orderTypeTimeline = buckets.map((bucket) => ({
        key: bucket.key,
        label: bucket.label,
        dineIn: 0,
        takeAway: 0
    }));

    let totalRevenue = 0;
    let totalDineIn = 0;
    let totalTakeAway = 0;

    const orderIds = new Set();
    const foodMap = new Map();
    const branchMap = new Map();

    payments.forEach((payment) => {
        const order = payment.order;
        if (!order) return;

        const amount = toNumber(payment.totalAmount);
        const paidAt = new Date(payment.paidAt);

        totalRevenue += amount;
        orderIds.add(order.id);

        if (order.orderType === "DINE_IN") totalDineIn += amount;
        if (order.orderType === "TAKE_AWAY") totalTakeAway += amount;

        const bucketIndex = findBucketIndex(paidAt, buckets);

        if (bucketIndex >= 0) {
            timeline[bucketIndex].total += amount;

            const members = order.orderMembers || [];
            const hasMember = members.some((member) => member.customer && member.customer.isGuest === false);

            if (hasMember) {
                customerTimeline[bucketIndex].member += amount;
            } else {
                customerTimeline[bucketIndex].guest += amount;
            }

            if (order.orderType === "DINE_IN") orderTypeTimeline[bucketIndex].dineIn += amount;
            if (order.orderType === "TAKE_AWAY") orderTypeTimeline[bucketIndex].takeAway += amount;
        }

        addOrderItemsToFoodMap(foodMap, order.orderItems);

        const branch = order.branch;

        if (branch) {
            if (!branchMap.has(branch.id)) {
                branchMap.set(branch.id, {
                    id: branch.id,
                    name: branch.name,
                    revenue: 0
                });
            }

            branchMap.get(branch.id).revenue += amount;
        }
    });

    const foods = Array.from(foodMap.values());

    const bestSelling = [...foods]
        .sort((a, b) => b.quantity !== a.quantity ? b.quantity - a.quantity : b.revenue - a.revenue)
        .slice(0, 10);

    const leastSelling = [...foods]
        .sort((a, b) => a.quantity !== b.quantity ? a.quantity - b.quantity : a.revenue - b.revenue)
        .slice(0, 10);

    const branchRevenue = Array.from(branchMap.values()).sort((a, b) => b.revenue - a.revenue);
    const orderCount = orderIds.size;
    const averageOrder = orderCount > 0 ? totalRevenue / orderCount : 0;

    let foodTrend = { increased: [], decreased: [] };
    let unsoldFoods = [];

    if (period === "week" || period === "month") {
        [foodTrend, unsoldFoods] = await Promise.all([
            getFoodTrend(branchFilter, period, fromDate, toDate, payments),
            getUnsoldFoods(branchFilter, payments)
        ]);
    }

    return {
        period,
        branchId: branchFilter || null,
        fromDate: formatDate(fromDate),
        toDate: formatDate(toDate),
        summary: {
            totalRevenue,
            totalDineIn,
            totalTakeAway,
            orderCount,
            averageOrder
        },
        timeline,
        customerTimeline,
        orderTypeTimeline,
        bestSelling,
        leastSelling,
        branchRevenue,
        foodTrend,
        unsoldFoods
    };
};

module.exports = { getStatistics };
