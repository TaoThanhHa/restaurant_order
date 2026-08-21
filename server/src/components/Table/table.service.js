const prisma = require("../../config/prisma");
const { v4: uuidv4 } = require("uuid");

const getAll = async () => {
  return await prisma.table.findMany({
    include: {
      floor: {
        include: {
          branch: true,
        },
      },
    },
    orderBy: [
      {
        floor: {
          branchId: "asc",
        },
      },
      {
        floor: {
          floorNumber: "asc",
        },
      },
      {
        tableNumber: "asc",
      },
    ],
  });
};

// GET TABLES BY FLOOR
const getByFloor = async (branchId, floorId) => {

  if (!floorId) {
    throw new Error("Vui lòng chọn tầng.");
  }

  const floor = await prisma.floor.findFirst({
    where: {
      id: floorId,
      branchId,
    },
  });

  if (!floor) {
    throw new Error("Tầng không tồn tại.");
  }

  const tables = await prisma.table.findMany({
    where: {
      floorId,
    },
    include: {
      sessions: {
        where: {
          status: "ACTIVE",
        },
        include: {
          orders: {
            where: {
              status: {
                notIn: ["COMPLETED", "CANCELLED"],
              },
            },
            include: {
              createdBy: true,
              orderItems: true,
            },
          },
        },
      },
    },
    orderBy: {
      tableNumber: "asc",
    },
  });

  return tables.map((table) => {
    const session = table.sessions[0];
    const orders = session
        ? session.orders.map(order => ({
              ...order,
              customer: order.createdBy,
          }))
        : [];

    return {
        ...table,
        orders, // tất cả đơn của bàn
        currentOrder: orders[0] || null, // giữ lại nếu chỗ khác đang dùng
        hasOrder: orders.length > 0,
        totalItems: orders.reduce(
            (sum, order) => sum + order.orderItems.length,
            0
        ),
    };
  });
};

const getById = async (id) => {
  const table = await prisma.table.findUnique({
    where: {
      id,
    },
    include: {
      floor: {
        include: {
          branch: true,
        },
      },
      sessions: {
        where: {
          status: "ACTIVE",
        },
        include: {
          customers: true,
          orders:{
            where:{
                status:{
                    in:[
                        "PENDING",
                        "CONFIRMED",
                        "PREPARING",
                        "SERVED",
                    ]
                }
            },
            include:{
                createdBy:true,
                orderMembers:{
                    include:{
                        customer:true
                    }
                },
                orderItems:{
                    include:{
                        food:true
                    }
                }
            },
            orderBy:{
                createdAt:"desc"
            }
        }
        },
      },
    },
  });

  if (!table) {
    throw new Error("Bàn không tồn tại.");
  }

  const session = table.sessions[0];

  const orders = session
      ? session.orders.map(order => ({
            ...order,
            customer: order.createdBy, // dùng người tạo đơn làm khách đại diện
        }))
      : [];

  return {
      ...table,
      session,
      customers: session ? session.customers : [],
      orders,
  };
};

const create = async (data) => {
  const {
    floorId
  } = data;

  const tableNumber =
    Number(data.tableNumber);

  if (!floorId) {
    throw new Error("Vui lòng chọn tầng.");
  }

  if (!tableNumber) {
    throw new Error("Vui lòng nhập số bàn.");
  }

  const floor = await prisma.floor.findUnique({
    where: {
      id: Number(floorId),
    },
  });

  if (!floor) {
    throw new Error("Tầng không tồn tại.");
  }

  const existed = await prisma.table.findUnique({
    where: {
      floorId_tableNumber: {
        floorId: Number(floorId),
        tableNumber,
      },
    },
  });

  if (existed) {
    throw new Error("Bàn đã tồn tại.");
  }

  return await prisma.table.create({
    data: {
      floorId: Number(floorId),
      tableNumber,
      qrCode: uuidv4(),
    },
  });
};

const update = async (id, data) => {
  const table = await prisma.table.findUnique({
    where: {
      id,
    },
  });

  if (!table) {
    throw new Error("Bàn không tồn tại.");
  }

  const floorId = Number(data.floorId ?? table.floorId);
  const tableNumber = Number(data.tableNumber);

  const existed = await prisma.table.findFirst({
    where: {
      floorId,
      tableNumber,
      NOT: {
        id,
      },
    },
  });

  if (existed) {
    throw new Error("Số bàn đã tồn tại.");
  }

  return await prisma.table.update({
    where: {
      id,
    },
    data: {
      floorId,
      tableNumber,
    },
  });
};

const remove = async (id) => {
    const table = await prisma.table.findUnique({
      where: {
          id: Number(id),
      },
      include: {
          sessions: {
              include: {
                  orders: true,
              },
          },
      },
  });

  if (!table) {
      throw new Error("Bàn không tồn tại.");
  }

  const hasOrders = table.sessions.some(
      session => session.orders.length > 0
  );

  if (hasOrders) {
      throw new Error("Bàn đã phát sinh đơn hàng, không thể xóa.");
  }

  await prisma.table.delete({
      where: {
          id: Number(id),
      },
  });
};

  
// SCAN QR
  

const scanQr = async (qrCode) => {

  const table = await prisma.table.findUnique({
    where: {
      qrCode,
    },
    include: {
      floor: {
        include: {
          branch: true,
        },
      },
    },
  });

  if (!table) {
    throw new Error("QR Code không hợp lệ.");
  }

  // Menu của chi nhánh
  const foods = await prisma.branchFood.findMany({
    where: {
      branchId: table.floor.branchId,
      status: "AVAILABLE",
    },
    include: {
      food: {
        include: {
          category: true,
        },
      },
    },
    orderBy: {
      food: {
        name: "asc",
      },
    },
  });

// Phiên phục vụ đang hoạt động
  const session = await prisma.diningSession.findFirst({
    where: {
      tableId: table.id,
      status: "ACTIVE",
    },
    include: {
      customers: true,
      orders: {
        where: {
          status: {
            in: ["PENDING", "CONFIRMED", "PREPARING"],
          },
        },
        include: {
          customer: true,
          orderItems: {
            include: {
              food: true,
            },
          },
        },
      },
    },
  });

  return {
    table,
    branch: table.floor.branch,
    foods,

    hasActiveOrder:
      session && session.orders.length > 0,

    session,

    currentOrders: session
      ? session.orders
      : [],
  };
};

  
// OPEN TABLE
  

const open = async (tableId, data) => {

    const { name, phone } = data;

    if (!name?.trim()) {
        throw new Error("Vui lòng nhập tên khách.");
    }

    const table = await prisma.table.findUnique({
        where: {
            id: Number(tableId),
        },
        include: {
            floor: true,
        },
    });

    if (!table) {
        throw new Error("Bàn không tồn tại.");
    }

    // Tìm phiên phục vụ đang hoạt động
    let session = await prisma.diningSession.findFirst({
        where: {
            tableId: Number(tableId),
            status: "ACTIVE",
        },
    });

    // Nếu chưa có thì tạo mới
    if (!session) {

        session = await prisma.diningSession.create({
            data: {
                tableId: Number(tableId),
                status: "ACTIVE",
            },
        });

    }

    // Tạo khách
    const customer = await prisma.customer.create({
        data: {
            sessionId: session.id,
            name: name.trim(),
            phone: phone || null,
        },
    });

    // Cập nhật trạng thái bàn
    await prisma.table.update({
        where: {
            id: Number(tableId),
        },
        data: {
            status: "OCCUPIED",
        },
    });

    return {
        session,
        customer,
    };
};

module.exports = {
  getAll,
  getByFloor,
  getById,
  create,
  update,
  remove,
  scanQr,
  open
};