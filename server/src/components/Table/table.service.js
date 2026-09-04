const prisma = require("../../config/prisma");
const { v4: uuidv4 } = require("uuid");
const sseService = require("../../services/sse.service");

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

const notifyOrderCustomers = async (
    orderId,
    event = "order.updated"
) => {

    const members =
        await prisma.orderMember.findMany({

            where: {
                orderId: Number(orderId),
            },

            select: {
                customerId: true,
            },

        });

    const customerIds =
        [
            ...new Set(
                members
                    .map(item => item.customerId)
                    .filter(Boolean)
            ),
        ];

    for (const customerId of customerIds) {

        sseService.sendToCustomer(
            customerId,
            event,
            {
                orderId: Number(orderId),
            }
        );

    }

};

// GET TABLES BY FLOOR
// GET TABLES BY FLOOR
const getByFloor = async (branchId, floorId) => {

  if (!floorId) {
    throw new Error("Vui lòng chọn tầng.");
  }

  const floor = await prisma.floor.findFirst({
    where: {
      id: Number(floorId),
      branchId: Number(branchId),
    },
  });

  if (!floor) {
    throw new Error("Tầng không tồn tại.");
  }

  const tables = await prisma.table.findMany({
    where: {
      floorId: Number(floorId),
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
              // Người tạo đơn có thể là nhân viên
              createdByUser: true,

              // Hoặc khách hàng
              createdByCustomer: true,

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
      ? session.orders.map((order) => ({
          ...order,

          // Chuẩn hóa lại để frontend cashier vẫn có thể dùng `customer`
          customer:
            order.createdByCustomer ||
            order.createdByUser ||
            null,
        }))
      : [];

    return {
      ...table,

      orders,

      currentOrder: orders[0] || null,

      hasOrder: orders.length > 0,

      totalItems: orders.reduce(
        (sum, order) =>
          sum + order.orderItems.length,
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
                createdByUser:true,
                createdByCustomer: true,
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
    ? session.orders.map((order) => ({
          ...order,
          customer:
              order.createdByCustomer ||
              order.createdByUser ||
              null,
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
    floorId,
    tableNumber,
    capacity = 4,
  } = data;

  const floorIdNumber = Number(floorId);
  const tableNumberNumber = Number(tableNumber);
  const capacityNumber = Number(capacity);

  if (!floorIdNumber) {
    throw new Error("Vui lòng chọn tầng.");
  }

  if (!tableNumberNumber) {
    throw new Error("Vui lòng nhập số bàn.");
  }

  if (!capacityNumber || capacityNumber < 1) {
    throw new Error("Số người trong bàn không hợp lệ.");
  }

  const floor = await prisma.floor.findUnique({
    where: {
      id: floorIdNumber,
    },
  });

  if (!floor) {
    throw new Error("Tầng không tồn tại.");
  }

  const existed = await prisma.table.findUnique({
    where: {
      floorId_tableNumber: {
        floorId: floorIdNumber,
        tableNumber: tableNumberNumber,
      },
    },
  });

  if (existed) {
    throw new Error("Bàn đã tồn tại.");
  }

  return await prisma.table.create({
    data: {
      floorId: floorIdNumber,
      tableNumber: tableNumberNumber,
      capacity: capacityNumber,

      // QR chỉ tạo một lần khi tạo bàn
      qrCode: uuidv4(),
    },
  });

};

const update = async (id, data) => {

  const table = await prisma.table.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!table) {
    throw new Error("Bàn không tồn tại.");
  }

  const floorId = Number(
    data.floorId ?? table.floorId
  );

  const tableNumber = Number(
    data.tableNumber ?? table.tableNumber
  );

  const capacity = Number(
    data.capacity ?? table.capacity
  );

  if (!capacity || capacity < 1) {
    throw new Error(
      "Số người trong bàn không hợp lệ."
    );
  }

  const existed = await prisma.table.findFirst({
    where: {
      floorId,
      tableNumber,
      NOT: {
        id: Number(id),
      },
    },
  });

  if (existed) {
    throw new Error("Số bàn đã tồn tại.");
  }

  return await prisma.table.update({
    where: {
      id: Number(id),
    },

    data: {
      floorId,
      tableNumber,
      capacity,
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
          createdByCustomer: true,
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

    let session = await prisma.diningSession.findFirst({
        where: {
            tableId: Number(tableId),
            status: "ACTIVE",
        },
    });

    if (!session) {
        session = await prisma.diningSession.create({
            data: {
                tableId: Number(tableId),
                status: "ACTIVE",
            },
        });
    }

    const customer = await prisma.customer.create({
        data: {
            sessionId: session.id,
            name: name.trim(),
            phone: phone || null,
        },
    });

    await prisma.table.update({
        where: {
            id: Number(tableId),
        },
        data: {
            status: "OCCUPIED",
        },
    });

    // Báo Cashier bàn vừa thay đổi
    sseService.sendToBranch(
        table.floor.branchId,
        "table.updated",
        {
            tableId: table.id,
        }
    );

    return {
        session,
        customer,
    };
};

module.exports = {
  getAll,
  notifyOrderCustomers,
  getByFloor,
  getById,
  create,
  update,
  remove,
  scanQr,
  open
};