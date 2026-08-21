const prisma =
    require("../../config/prisma");


// ============================================================
// DATE HELPERS
// ============================================================

const startOfDay = (date) => {

    const d =
        new Date(date);

    d.setHours(
        0,
        0,
        0,
        0
    );

    return d;

};


const endOfDay = (date) => {

    const d =
        new Date(date);

    d.setHours(
        23,
        59,
        59,
        999
    );

    return d;

};


const addDays = (
    date,
    days
) => {

    const d =
        new Date(date);

    d.setDate(
        d.getDate() + days
    );

    return d;

};


const addMonths = (
    date,
    months
) => {

    const d =
        new Date(date);

    d.setMonth(
        d.getMonth() + months
    );

    return d;

};


const formatDate = (date) => {

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );

    return `${year}-${month}-${day}`;

};


const formatLabel = (date) => {

    return `${String(
        date.getDate()
    ).padStart(
        2,
        "0"
    )}/${String(
        date.getMonth() + 1
    ).padStart(
        2,
        "0"
    )}`;

};


const money = (value) => {

    return Number(
        value || 0
    );

};


// ============================================================
// WEEK
// ============================================================

const getMonday = (date) => {

    const d =
        startOfDay(date);

    const day =
        d.getDay();

    const diff =
        day === 0
            ? -6
            : 1 - day;

    d.setDate(
        d.getDate() + diff
    );

    return startOfDay(d);

};


// ============================================================
// PERIOD
// ============================================================

const getPeriod = (
    period,
    filters = {}
) => {

    const today =
        startOfDay(
            new Date()
        );


    // ========================================================
    // WEEK
    // ========================================================

    if (
        period === "week"
    ) {

        const selectedDate =
            filters.weekStart
                ? new Date(
                    `${filters.weekStart}T00:00:00`
                )
                : today;


        if (
            Number.isNaN(
                selectedDate.getTime()
            )
        ) {

            throw new Error(
                "Ngày chọn tuần không hợp lệ."
            );

        }


        const fromDate =
            getMonday(
                selectedDate
            );


        const toDate =
            endOfDay(
                addDays(
                    fromDate,
                    6
                )
            );


        return {

            fromDate,

            toDate,

        };

    }


    // ========================================================
    // MONTH
    // ========================================================

    if (
        period === "month"
    ) {

        const year =
            Number(
                filters.year
            );

        const month =
            Number(
                filters.month
            );


        if (
            !year ||
            !month ||
            month < 1 ||
            month > 12
        ) {

            throw new Error(
                "Năm hoặc tháng không hợp lệ."
            );

        }


        const fromDate =
            new Date(
                year,
                month - 1,
                1
            );


        const toDate =
            new Date(
                year,
                month,
                0
            );


        return {

            fromDate:
                startOfDay(
                    fromDate
                ),

            toDate:
                endOfDay(
                    toDate
                ),

        };

    }


    // ========================================================
    // QUARTER
    // ========================================================

    if (
        period === "quarter"
    ) {

        const year =
            Number(
                filters.year
            );

        const quarter =
            Number(
                filters.quarter
            );


        if (
            !year ||
            !quarter ||
            quarter < 1 ||
            quarter > 4
        ) {

            throw new Error(
                "Năm hoặc quý không hợp lệ."
            );

        }


        const startMonth =
            (quarter - 1) * 3;


        const fromDate =
            new Date(
                year,
                startMonth,
                1
            );


        const toDate =
            new Date(
                year,
                startMonth + 3,
                0
            );


        return {

            fromDate:
                startOfDay(
                    fromDate
                ),

            toDate:
                endOfDay(
                    toDate
                ),

        };

    }


    throw new Error(
        "Loại thống kê không hợp lệ."
    );

};


// ============================================================
// BUCKETS
// ============================================================

const createBuckets = (
    period,
    fromDate,
    toDate
) => {

    const buckets = [];


    // ========================================================
    // WEEK
    // ========================================================

    if (
        period === "week"
    ) {

        for (
            let i = 0;
            i < 7;
            i++
        ) {

            const date =
                addDays(
                    fromDate,
                    i
                );


            buckets.push({

                key:
                    formatDate(
                        date
                    ),

                label:
                    formatLabel(
                        date
                    ),

                from:
                    startOfDay(
                        date
                    ),

                to:
                    endOfDay(
                        date
                    ),

            });

        }


        return buckets;

    }


    // ========================================================
    // MONTH
    // Chia thành các tuần
    // ========================================================

    if (
        period === "month"
    ) {

        let current =
            getMonday(
                fromDate
            );


        let index = 1;


        while (
            current <= toDate
        ) {

            let bucketFrom =
                new Date(
                    current
                );


            let bucketTo =
                endOfDay(
                    addDays(
                        current,
                        6
                    )
                );


            if (
                bucketFrom < fromDate
            ) {

                bucketFrom =
                    new Date(
                        fromDate
                    );

            }


            if (
                bucketTo > toDate
            ) {

                bucketTo =
                    new Date(
                        toDate
                    );

            }


            buckets.push({

                key:
                    formatDate(
                        bucketFrom
                    ),

                label:
                    `Tuần ${index}`,

                from:
                    startOfDay(
                        bucketFrom
                    ),

                to:
                    endOfDay(
                        bucketTo
                    ),

            });


            current =
                addDays(
                    current,
                    7
                );


            index++;

        }


        return buckets;

    }


    // ========================================================
    // QUARTER
    // ========================================================

    if (
        period === "quarter"
    ) {

        for (
            let i = 0;
            i < 3;
            i++
        ) {

            const bucketFrom =
                addMonths(
                    fromDate,
                    i
                );


            const bucketTo =
                new Date(
                    bucketFrom.getFullYear(),
                    bucketFrom.getMonth() + 1,
                    0
                );


            buckets.push({

                key:
                    `${bucketFrom.getFullYear()}-${bucketFrom.getMonth() + 1}`,

                label:
                    `Tháng ${bucketFrom.getMonth() + 1}`,

                from:
                    startOfDay(
                        bucketFrom
                    ),

                to:
                    endOfDay(
                        bucketTo
                    ),

            });

        }


        return buckets;

    }


    return buckets;

};


// ============================================================
// GET PAID PAYMENTS
// ============================================================

async function getPayments(
    branchId,
    fromDate,
    toDate
) {

    const where = {

        paymentStatus: "PAID",

        paidAt: {
            gte: fromDate,
            lte: toDate
        }

    };

    if (branchId) {

        where.order = {
            branchId: Number(branchId)
        };

    }

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

                    branch: {

                        select: {

                            id: true,

                            name: true

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

                    },

                    orderItems: {

                        where: {

                            status: {
                                not: "CANCELLED"
                            }

                        },

                        select: {

                            quantity: true,

                            price: true,

                            food: {

                                select: {

                                    id: true,

                                    name: true

                                }

                            }

                        }

                    }

                }

            }

        },

        orderBy: {

            paidAt: "asc"

        }

    });

}


// ============================================================
// MAIN STATISTICS
// ============================================================
const getStatistics = async (
    branchId,
    period,
    filters = {}
) => {

    const {
        fromDate,
        toDate
    } = getPeriod(
        period,
        filters
    );

    // ========================================
    // FILTER CHI NHÁNH
    // ========================================

    const branchFilter = branchId
        ? Number(branchId)
        : undefined;

    // ========================================
    // LẤY PAYMENT
    // ========================================

    const payments = await getPayments(
        branchFilter,
        fromDate,
        toDate
    );

    // ========================================
    // BUCKET
    // ========================================

    const buckets = createBuckets(
        period,
        fromDate,
        toDate
    );

    // ========================================
    // DOANH THU THEO THỜI GIAN
    // ========================================

    const timeline = buckets.map(
        bucket => {

            const bucketPayments =
                payments.filter(payment => {

                    const paidAt =
                        new Date(
                            payment.paidAt
                        );

                    return (
                        paidAt >= bucket.from &&
                        paidAt <= bucket.to
                    );

                });

            const total =
                bucketPayments.reduce(
                    (
                        sum,
                        payment
                    ) =>
                        sum +
                        Number(
                            payment.totalAmount || 0
                        ),
                    0
                );

            return {
                key: bucket.key,
                label: bucket.label,
                total
            };

        }
    );

    // ========================================
    // TỔNG DOANH THU
    // ========================================

    const totalRevenue =
        payments.reduce(
            (
                sum,
                payment
            ) =>
                sum +
                Number(
                    payment.totalAmount || 0
                ),
            0
        );

    // ========================================
    // TẠI CHỖ
    // ========================================

    const totalDineIn =
        payments
            .filter(
                payment =>
                    payment.order?.orderType ===
                    "DINE_IN"
            )
            .reduce(
                (
                    sum,
                    payment
                ) =>
                    sum +
                    Number(
                        payment.totalAmount || 0
                    ),
                0
            );

    // ========================================
    // MANG VỀ
    // ========================================

    const totalTakeAway =
        payments
            .filter(
                payment =>
                    payment.order?.orderType ===
                    "TAKE_AWAY"
            )
            .reduce(
                (
                    sum,
                    payment
                ) =>
                    sum +
                    Number(
                        payment.totalAmount || 0
                    ),
                0
            );

    // ========================================
    // CUSTOMER
    // ========================================

    const customerTimeline =
        buckets.map(
            bucket => {

                const bucketPayments =
                    payments.filter(payment => {

                        const paidAt =
                            new Date(
                                payment.paidAt
                            );

                        return (
                            paidAt >= bucket.from &&
                            paidAt <= bucket.to
                        );

                    });

                let member = 0;
                let guest = 0;

                bucketPayments.forEach(
                    payment => {

                        const members =
                            payment.order
                                ?.orderMembers || [];

                        const hasMember =
                            members.some(
                                item =>
                                    item.customer &&
                                    item.customer.isGuest === false
                            );

                        if (hasMember) {

                            member +=
                                Number(
                                    payment.totalAmount || 0
                                );

                        } else {

                            guest +=
                                Number(
                                    payment.totalAmount || 0
                                );

                        }

                    }
                );

                return {
                    key: bucket.key,
                    label: bucket.label,
                    member,
                    guest
                };

            }
        );

    // ========================================
    // ORDER TYPE
    // ========================================

    const orderTypeTimeline =
        buckets.map(
            bucket => {

                const bucketPayments =
                    payments.filter(payment => {

                        const paidAt =
                            new Date(
                                payment.paidAt
                            );

                        return (
                            paidAt >= bucket.from &&
                            paidAt <= bucket.to
                        );

                    });

                const dineIn =
                    bucketPayments
                        .filter(
                            payment =>
                                payment.order?.orderType ===
                                "DINE_IN"
                        )
                        .reduce(
                            (
                                sum,
                                payment
                            ) =>
                                sum +
                                Number(
                                    payment.totalAmount || 0
                                ),
                            0
                        );

                const takeAway =
                    bucketPayments
                        .filter(
                            payment =>
                                payment.order?.orderType ===
                                "TAKE_AWAY"
                        )
                        .reduce(
                            (
                                sum,
                                payment
                            ) =>
                                sum +
                                Number(
                                    payment.totalAmount || 0
                                ),
                            0
                        );

                return {
                    key: bucket.key,
                    label: bucket.label,
                    dineIn,
                    takeAway
                };

            }
        );

    // ========================================
    // SỐ ĐƠN
    // ========================================

    const orderIds =
        new Set(
            payments
                .map(
                    payment =>
                        payment.order?.id
                )
                .filter(Boolean)
        );

    const orderCount =
        orderIds.size;

    const averageOrder =
        orderCount > 0
            ? totalRevenue / orderCount
            : 0;

    // ========================================
    // MÓN ĂN
    // ========================================

    const foodMap = new Map();

    payments.forEach(
        payment => {

            const items =
                payment.order
                    ?.orderItems || [];

            items.forEach(
                item => {

                    if (!item.food) {
                        return;
                    }

                    const foodId =
                        item.food.id;

                    const quantity =
                        Number(
                            item.quantity || 0
                        );

                    const revenue =
                        quantity *
                        Number(
                            item.price || 0
                        );

                    if (!foodMap.has(foodId)) {

                        foodMap.set(
                            foodId,
                            {
                                id: foodId,
                                name: item.food.name,
                                quantity: 0,
                                revenue: 0
                            }
                        );

                    }

                    const current =
                        foodMap.get(foodId);

                    current.quantity +=
                        quantity;

                    current.revenue +=
                        revenue;

                }
            );

        }
    );

    const foods =
        Array.from(
            foodMap.values()
        );

    const bestSelling =
        [...foods]
            .sort(
                (a, b) =>
                    b.quantity -
                    a.quantity
            )
            .slice(0, 10);

    const leastSelling =
        [...foods]
            .sort(
                (a, b) =>
                    a.quantity -
                    b.quantity
            )
            .slice(0, 10);

    // ========================================
    // DOANH THU CHI NHÁNH
    // ========================================

    const branchMap =
        new Map();

    payments.forEach(
        payment => {

            const branch =
                payment.order?.branch;

            if (!branch) {
                return;
            }

            if (!branchMap.has(branch.id)) {

                branchMap.set(
                    branch.id,
                    {
                        id: branch.id,
                        name: branch.name,
                        revenue: 0
                    }
                );

            }

            const current =
                branchMap.get(branch.id);

            current.revenue +=
                Number(
                    payment.totalAmount || 0
                );

        }
    );

    const branchRevenue =
        Array.from(
            branchMap.values()
        )
        .sort(
            (a, b) =>
                b.revenue -
                a.revenue
        );

    // ========================================
    // RETURN
    // ========================================

    return {

        period,

        branchId:
            branchFilter || null,

        fromDate:
            formatDate(
                fromDate
            ),

        toDate:
            formatDate(
                toDate
            ),

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

        branchRevenue

    };

};

module.exports = {

    getStatistics,

};