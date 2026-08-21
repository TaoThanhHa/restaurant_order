const joinSession = async (tx, customerId, tableId) => {

    const table = await tx.table.findUnique({
        where: {
            qrCode: tableId,
        },
    });

    if (!table) {
        throw new Error("Bàn không tồn tại.");
    }

    if (table.status === "DISABLED") {
        throw new Error("Bàn đang ngừng sử dụng.");
    }

    return {
        table,
    };
};

module.exports = joinSession;