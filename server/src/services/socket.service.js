let io = null;

const setIO = socketIO => {
    io = socketIO;
};

const sendToBranch = (branchId, event, data) => {
    if (!io || !branchId) return;

    io.to(`branch:${Number(branchId)}`).emit(event, data);
};

module.exports = {
    setIO,
    sendToBranch,
};