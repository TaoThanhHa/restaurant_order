const prisma = require("../../config/prisma");

const sseService =  require("../../services/sse.service");
const notifyOrderCustomers = async (
    orderId,
    event = "order.updated"
) => {

    const order = await prisma.order.findUnique({
        where: {
            id: Number(orderId),
        },
        select: {
            id: true,
            branchId: true,

            session: {
                select: {
                    tableId: true,
                },
            },

            orderMembers: {
                select: {
                    customerId: true,
                },
            },
        },
    });

    if (!order) {
        return;
    }

    const payload = {
        orderId: order.id,
        tableId: order.session?.tableId || null,
    };

    // ========================================
    // GỬI CHO CUSTOMER
    // ========================================

    const customerIds = [
        ...new Set(
            order.orderMembers
                .map(item => item.customerId)
                .filter(Boolean)
        ),
    ];

    for (const customerId of customerIds) {

        sseService.sendToCustomer(
            customerId,
            event,
            payload
        );

    }

    // ========================================
    // GỬI CHO BRANCH / STAFF CHI NHÁNH
    // ========================================

    sseService.sendToBranch(
        order.branchId,
        event,
        payload
    );
};

// ORDER
const create = async (data) => {
    const { customerId, joinOrderId, userId } = data;

  if (!customerId) {
    throw new Error("Vui lòng chọn khách hàng.");
  }

  const customer = await prisma.customer.findUnique({
      where: {
          id: Number(customerId),
      },
      include: {
          session: {
              include: {
                  table: {
                      include: {
                          floor: true,
                      },
                  },
              },
          },
      },
  });

  if (!customer) {
      throw new Error("Khách hàng không tồn tại.");
  }

  if (!customer.session) {
      throw new Error("Khách chưa thuộc phiên phục vụ.");
  }
  if (joinOrderId) {
      const order = await prisma.order.findUnique({
          where: {
              id: Number(joinOrderId),
          },
          include: {
              orderMembers: true,
          },
      });

      if (!order) {
          throw new Error("Không tìm thấy hóa đơn.");
      }

      if (
        order.status === "COMPLETED" ||
        order.status === "CANCELLED"
      ) {
        throw new Error("Hóa đơn đã đóng.");
      }

      const existed = order.orderMembers.find(
          x => x.customerId === customer.id
      );

      if (!existed) {

          await prisma.orderMember.create({
              data: {
                  customerId: customer.id,
                  orderId: order.id,
              },
          });
      }

      return order;
  }

  if (!customer.session) {
    throw new Error("Khách chưa thuộc phiên phục vụ.");
  }
  console.log("USER ID TẠO ĐƠN:", userId);
console.log("USER ID NUMBER:", Number(userId));
  const session = customer.session;
  const order = await prisma.order.create({
        data: {
            orderCode: `B-${Date.now()}`,
            branchId: session.table.floor.branchId,
            sessionId: session.id,
            createdByUserId: Number(userId),
            createdByCustomerId: customer.id,
            status: "PENDING",
            orderType: "DINE_IN",
            totalAmount: 0,
        },
    });

  await prisma.orderMember.create({
      data: {
          customerId: customer.id,
          orderId: order.id,
      },
  });

  

  await updateTableStatus(customer.session.tableId);

  const tableUpdated = await prisma.table.update({
  where: {
    id: customer.session.tableId,
  },
  data: {
    status: "OCCUPIED",
  },
});

await notifyOrderCustomers(order.id);
  return await getById(order.id);
};


  
// UPDATE TABLE STATUS
const updateTableStatus = async (tableId) => {

    const session = await prisma.diningSession.findFirst({
        where: {
            tableId,
            status: "ACTIVE",
        },
        include: {
            orders: {
                where: {
                    status: {
                        in: ["PENDING", "CONFIRMED", "PREPARING",],
                    },
                },
            },
        },
    });

    const status =
        session && session.orders.length > 0
            ? "OCCUPIED"
            : "AVAILABLE";

    await prisma.table.update({
        where: {
            id: tableId,
        },
        data: {
            status,
        },
    });
};

// GET ORDER DETAIL
const getById = async (id) => {

    const order = await prisma.order.findUnique({

        where: {
            id: Number(id),
        },

        include: {

            // Quan hệ khách hàng của Order
            createdByUser: true,

            // Bàn / phiên phục vụ
            session: {
                include: {
                    table: true,
                },
            },

            // Danh sách món
            orderItems: {
                include: {
                    food: true,
                },
            },

            // Thanh toán
            payment: true,
        },
    });

    if (!order) {
        throw new Error("Đơn hàng không tồn tại.");
    }

    // Không tính món đã hủy
    const totalAmount = order.orderItems
        .filter(item => item.status !== "CANCELLED")
        .reduce(
            (sum, item) =>
                sum + Number(item.price) * item.quantity,
            0
        );

    return {

        ...order,

        // Để FE vẫn có thể dùng order.customer
        customer: order.createdByUser,

        totalAmount,
    };
};
// ADD ITEM
const addItem = async (orderId, data) => {
    const { foodId, quantity, note } = data;

    if (!foodId) {
        throw new Error("Vui lòng chọn món.");
    }

    if (!quantity || quantity <= 0) {
        throw new Error("Số lượng không hợp lệ.");
    }

    const order = await prisma.order.findUnique({
        where: {
            id: Number(orderId),
        },
    });

    if (!order) {
        throw new Error("Đơn hàng không tồn tại.");
    }

    if (
        order.status === "COMPLETED" ||
        order.status === "CANCELLED"
    ) {
        throw new Error("Đơn hàng đã đóng.");
    }

    const food = await prisma.food.findUnique({
        where: {
            id: Number(foodId),
        },
    });

    if (!food) {
        throw new Error("Món ăn không tồn tại.");
    }

    const branchFood = await prisma.branchFood.findUnique({
        where: {
            branchId_foodId: {
                branchId: order.branchId,
                foodId: Number(foodId),
            },
        },
    });

    if (!branchFood) {
        throw new Error("Chi nhánh chưa có món này.");
    }

    if (branchFood.status === "OUT_OF_STOCK") {
        throw new Error("Món ăn đã hết.");
    }

    // ========================================
    // MÓN MỚI LUÔN CHỜ XÁC NHẬN
    // ========================================

    const item = await prisma.orderItem.create({
        data: {
            orderId: Number(orderId),
            foodId: Number(foodId),
            quantity: Number(quantity),
            price: food.price,
            note: note || null,
            status: "PENDING",
        },
        include: {
            food: true,
        },
    });

    // ========================================
    // ORDER CÓ MÓN MỚI
    // → CHỜ XÁC NHẬN
    // ========================================

    await prisma.order.update({
        where: {
            id: Number(orderId),
        },
        data: {
            status: "PENDING",
        },
    });

    // ========================================
    // SSE
    // ========================================

    await notifyOrderCustomers(
        Number(orderId),
        "order.updated"
    );

    return item;
};

const confirmItems = async (orderId) => {

    const id = Number(orderId);

    if (!Number.isInteger(id)) {
        throw new Error("Order ID không hợp lệ.");
    }

    // =========================
    // LẤY ORDER
    // =========================

    const order = await prisma.order.findUnique({
        where: {
            id: id
        },
        include: {
            orderItems: true
        }
    });

    if (!order) {
        throw new Error("Đơn hàng không tồn tại.");
    }

    // =========================
    // KIỂM TRA ORDER
    // =========================

    if (
        order.status === "COMPLETED" ||
        order.status === "CANCELLED"
    ) {
        throw new Error("Đơn hàng đã đóng.");
    }

    // =========================
    // LẤY MÓN CHỜ XÁC NHẬN
    // =========================

    const pendingItems = order.orderItems.filter(
        item => item.status === "PENDING"
    );

    if (pendingItems.length === 0) {
        throw new Error(
            "Không có món mới cần xác nhận."
        );
    }

    // =========================
    // XÁC NHẬN MÓN
    // =========================

    await prisma.orderItem.updateMany({
        where: {
            orderId: id,
            status: "PENDING"
        },
        data: {
            status: "CONFIRMED"
        }
    });

    // =========================
    // CẬP NHẬT ORDER
    // =========================

    if (order.status === "PENDING") {

        await prisma.order.update({
            where: {
                id: id
            },
            data: {
                status: "CONFIRMED"
            }
        });

    }

    // =========================
    // LẤY LẠI ORDER
    // =========================

    const updatedOrder = await prisma.order.findUnique({
        where: {
            id: id
        },
        include: {
            orderItems: {
                include: {
                    food: true
                }
            }
        }
    });

    if (!updatedOrder) {
        throw new Error(
            "Không thể lấy đơn hàng sau khi xác nhận."
        );
    }

    // =========================
    // TÍNH TỔNG
    // =========================

    const totalAmount = updatedOrder.orderItems
        .filter(
            item => item.status !== "CANCELLED"
        )
        .reduce(
            (sum, item) =>
                sum +
                Number(item.price) *
                item.quantity,
            0
        );
        await notifyOrderCustomers(
            orderId
        );

    return {
        ...updatedOrder,
        totalAmount
    };
};

  
// UPDATE ITEM
const updateItem = async (itemId, data) => {
  const { quantity, note } = data;

  const item = await prisma.orderItem.findUnique({
    where: {
      id: itemId,
    },
    include: {
      order: true,
    },
  });

  if (!item) {
    throw new Error("Món không tồn tại.");
  }

  if (
    item.order.status === "COMPLETED" ||
    item.order.status === "CANCELLED"  
  ) {
    throw new Error("Đơn hàng đã đóng.");
  }

  if (quantity !== undefined) {
    if (Number(quantity) <= 0) {
      throw new Error("Số lượng phải lớn hơn 0.");
    }
  }

  if(item.status!="PENDING"){
    throw new Error("Món đã được bếp xác nhận, không thể chỉnh sửa.");
  }
  const updatedItem =
    await prisma.orderItem.update({
        where: {
            id: itemId,
        },
        data: {
            quantity:
                quantity !== undefined
                    ? Number(quantity)
                    : item.quantity,

            note:
                note !== undefined
                    ? note
                    : item.note,
        },
        include: {
            food: true,
        },
    });


await notifyOrderCustomers(
    item.order.id
);


return updatedItem;
};

  
// REMOVE ITEM
const removeItem = async (itemId) => {

  const item = await prisma.orderItem.findUnique({
    where: {
      id: Number(itemId),
    },
    include: {
      order: true,
    },
  });

  if (!item) {
    throw new Error("Món không tồn tại.");
  }

  if (
    item.order.status === "COMPLETED" ||
    item.order.status === "CANCELLED"
  ) {
    throw new Error("Đơn hàng đã đóng.");
  }

  if (item.status !== "PENDING") {
    throw new Error(
      "Chỉ được hủy món khi đang chờ xác nhận."
    );
  }

  await prisma.orderItem.update({
    where: {
      id: Number(itemId),
    },
    data: {
      status: "CANCELLED",
    },
  });

  return true;
};

  
// UPDATE STATUS
const updateStatus = async (orderId, status) => {

    const order = await prisma.order.findUnique({
        where: {
            id: orderId,
        },
    });

    if (!order) {
        throw new Error("Đơn hàng không tồn tại.");
    }

    const allowStatus = [
        "PENDING",
        "CONFIRMED",
        "PREPARING",
        "SERVED",
        "COMPLETED",
        "CANCELLED",
    ];

    if (!allowStatus.includes(status)) {
        throw new Error("Trạng thái không hợp lệ.");
    }

    switch (status) {

        case "PREPARING":
            await prisma.orderItem.updateMany({
                where: {
                    orderId,
                    status: "CONFIRMED",
                },
                data: {
                    status: "PREPARING",
                },
            });
            break;

        case "SERVED":
            await prisma.orderItem.updateMany({
                where: {
                    orderId,
                    status: "PREPARING",
                },
                data: {
                    status: "SERVED",
                },
            });
            break;

        case "CANCELLED":
            await prisma.orderItem.updateMany({
                where: {
                    orderId,
                },
                data: {
                    status: "CANCELLED",
                },
            });
            break;
    }

const updatedOrder =
    await prisma.order.update({
        where: {
            id: orderId,
        },
        data: {
            status,
        },
    });


await notifyOrderCustomers(
    orderId
);


return updatedOrder;
};

  
// PAYMENT
// PAYMENT
const payment = async (orderId, data) => {

    const id = Number(orderId);

    const { paymentMethod } = data;

    if (!Number.isInteger(id)) {
        throw new Error("Order ID không hợp lệ.");
    }

    if (!["CASH", "BANKING"].includes(paymentMethod)) {
        throw new Error("Phương thức thanh toán không hợp lệ.");
    }

    // ========================================
    // LẤY ORDER
    // ========================================

    const order = await prisma.order.findUnique({

        where: {
            id,
        },

        include: {

            // Quan trọng:
            // payment cần dùng session.tableId
            session: {
                include: {
                    table: true,
                },
            },

            orderItems: {
                where: {
                    status: {
                        not: "CANCELLED",
                    },
                },
            },

            payment: true,
        },
    });


    if (!order) {
        throw new Error("Đơn hàng không tồn tại.");
    }


    // ========================================
    // KIỂM TRA ORDER
    // ========================================

    if (
        order.status === "COMPLETED" ||
        order.status === "CANCELLED"
    ) {
        throw new Error("Đơn hàng đã đóng.");
    }


    // ========================================
    // KIỂM TRA MÓN
    // ========================================

    if (order.orderItems.length === 0) {
        throw new Error("Đơn hàng chưa có món.");
    }


    // ========================================
    // TẤT CẢ MÓN PHẢI ĐÃ PHỤC VỤ
    // ========================================

    const unfinished = order.orderItems.find(
        item => item.status !== "SERVED"
    );

    if (unfinished) {
        throw new Error(
            "Vẫn còn món chưa phục vụ."
        );
    }


    // ========================================
    // TÍNH TIỀN
    // ========================================

    const totalAmount = order.orderItems.reduce(

        (sum, item) =>

            sum +
            Number(item.price) *
            item.quantity,

        0
    );


    // ========================================
    // TRANSACTION
    // ========================================

    await prisma.$transaction(async (tx) => {


        // ------------------------------------
        // PAYMENT
        // ------------------------------------

        if (order.payment) {

            await tx.payment.update({

                where: {
                    orderId: id,
                },

                data: {

                    paymentMethod,

                    cashAmount:
                        paymentMethod === "CASH"
                            ? totalAmount
                            : null,

                    bankAmount:
                        paymentMethod === "BANKING"
                            ? totalAmount
                            : null,

                    totalAmount,

                    paymentStatus: "PAID",

                    paidAt: new Date(),
                },
            });

        } else {

            await tx.payment.create({

                data: {

                    orderId: id,

                    paymentMethod,

                    cashAmount:
                        paymentMethod === "CASH"
                            ? totalAmount
                            : null,

                    bankAmount:
                        paymentMethod === "BANKING"
                            ? totalAmount
                            : null,

                    totalAmount,

                    paymentStatus: "PAID",

                    paidAt: new Date(),
                },
            });
        }


        // ------------------------------------
        // ĐÓNG ORDER
        // ------------------------------------

        await tx.order.update({

            where: {
                id,
            },

            data: {

                totalAmount,

                status: "COMPLETED",
            },
        });


        // ------------------------------------
        // KHÔNG CÓ SESSION
        // Ví dụ order mang về
        // ------------------------------------

        if (!order.sessionId) {
            return;
        }


        // ------------------------------------
        // KIỂM TRA CÒN ORDER KHÁC KHÔNG
        // ------------------------------------

        const openOrders = await tx.order.count({

            where: {

                sessionId: order.sessionId,

                status: {
                    in: [
                        "PENDING",
                        "CONFIRMED",
                        "PREPARING",
                        "SERVED",
                    ],
                },
            },
        });


        // ------------------------------------
        // KHÔNG CÒN ORDER
        // → ĐÓNG SESSION
        // → BÀN TRỐNG
        // ------------------------------------

        if (openOrders === 0) {

            await tx.diningSession.update({

                where: {
                    id: order.sessionId,
                },

                data: {

                    status: "CLOSED",

                    closedAt: new Date(),
                },
            });


            // Có session thì chắc chắn lấy được table
            if (order.session?.tableId) {

                await tx.table.update({

                    where: {
                        id: order.session.tableId,
                    },

                    data: {
                        status: "AVAILABLE",
                    },
                });
            }
        }

    });
await notifyOrderCustomers(
    orderId
);

    return {

        orderId: id,

        orderCode: order.orderCode,

        totalAmount,

        paymentMethod,

        paymentStatus: "PAID",
    };
};

const createTakeAway = async (branchId, data, userId) => {

    const {
        items,
        note,
        phone,
        paymentMethod = "CASH",
    } = data;

    if (!items || items.length === 0) {
        throw new Error("Chưa chọn món.");
    }

    return await prisma.$transaction(async (tx) => {

        let total = 0;
        const orderItems = [];

        // -----------------------------------------
        // TÍNH TIỀN
        // -----------------------------------------

        for (const item of items) {

            const food = await tx.food.findUnique({
                where: {
                    id: Number(item.foodId),
                },
            });

            if (!food) {
                throw new Error("Món ăn không tồn tại.");
            }

            const price = Number(food.price);
            const quantity = Number(item.quantity);

            total += price * quantity;

            orderItems.push({
                foodId: food.id,
                quantity,
                price,
                note: item.note || null,
                status: "CONFIRMED",
            });
        }


        // -----------------------------------------
        // TÌM KHÁCH HÀNG THEO SĐT
        // -----------------------------------------

        let customer = null;

        if (phone?.trim()) {

            customer = await tx.customer.findFirst({
                where: {
                    phone: phone.trim(),
                    isGuest: false,
                },
            });

        }


        // -----------------------------------------
        // TẠO ORDER
        // -----------------------------------------

        const order = await tx.order.create({
            data: {
                orderCode: `TA-${Date.now()}`,
                branchId,
                orderType: "TAKE_AWAY",
                status: "COMPLETED",
                note,
                totalAmount: total,

                // Thu ngân tạo đơn
                createdByUserId: Number(userId),

                // Nếu tìm được khách thì lưu khách
                ...(customer
                    ? {
                        createdByCustomerId: customer.id,
                    }
                    : {}),

                orderItems: {
                    create: orderItems,
                },
            },

            include: {

                orderItems: {
                    include: {
                        food: true,
                    },
                },

            },

        });


        // -----------------------------------------
        // NẾU KHÁCH ĐÃ CÓ TÀI KHOẢN
        // → GẮN ORDER VÀO KHÁCH
        // -----------------------------------------

        if (customer) {

            await tx.orderMember.create({

                data: {
                    customerId: customer.id,
                    orderId: order.id,
                },

            });

        }


        // -----------------------------------------
        // TẠO PAYMENT
        // -----------------------------------------

        await tx.payment.create({

            data: {

                orderId: order.id,

                paymentMethod,

                cashAmount:
                    paymentMethod === "CASH"
                        ? total
                        : null,

                bankAmount:
                    paymentMethod === "BANKING"
                        ? total
                        : null,

                totalAmount: total,

                paymentStatus: "PAID",

                paidAt: new Date(),

            },

        });


        // -----------------------------------------
        // TRẢ VỀ ORDER ĐẦY ĐỦ
        // -----------------------------------------

        return await tx.order.findUnique({

            where: {
                id: order.id,
            },

            include: {

                orderItems: {
                    include: {
                        food: true,
                    },
                },

                orderMembers: {
                    include: {
                        customer: true,
                    },
                },

                payment: true,

            },

        });

    });

};

const getTakeAway = async (branchId) => {

    return await prisma.order.findMany({

        where: {
            branchId,
            orderType: "TAKE_AWAY",

            payment: {
                paymentStatus: "PAID",
            },
        },

        include: {

            orderItems: {
                include: {
                    food: true,
                },
            },

            orderMembers: {
                include: {
                    customer: true,
                },
            },

            payment: true,

        },

        orderBy: {
            createdAt: "desc",
        },

    });

};
// ORDER HISTORY
const getHistory = async (branchId) => {
    const orders = await prisma.order.findMany({
        
        where: {
            branchId: Number(branchId),
            status: "COMPLETED",
        },

        include: {
            // Người tạo đơn: nhân viên / thu ngân
            createdByUser: true,

            // Khách hàng
            createdByCustomer: true,

            session: {
                include: {
                    table: true,
                },
            },

            payment: true,

            orderItems: {
                include: {
                    food: true,
                },
            },
        },

        orderBy: {
            createdAt: "desc",
        },
    });
    console.log(
    orders.map(order => ({
        id: order.id,
        orderCode: order.orderCode,
        createdByUserId: order.createdByUserId,
        createdByUser: order.createdByUser,
        createdByCustomerId: order.createdByCustomerId,
        createdByCustomer: order.createdByCustomer,
    }))
);
    

    return orders.map((order) => ({
        
        id: order.id,
        orderCode: order.orderCode,

        // ==============================
        // KHÁCH HÀNG
        // ==============================
        customer: order.createdByCustomer
            ? {
                id: order.createdByCustomer.id,
                name: order.createdByCustomer.name,
                phone: order.createdByCustomer.phone,
            }
            : null,

        // ==============================
        // NHÂN VIÊN / THU NGÂN
        // ==============================
        createdByUser: order.createdByUser
            ? {
                id: order.createdByUser.id,
                name: order.createdByUser.username,
                role: order.createdByUser.role,
            }
            : null,
        tableName: order.session?.table?.name || null,

        orderType: order.orderType,

        totalItems: order.orderItems.reduce(
            (sum, item) => sum + item.quantity,
            0
        ),

        totalAmount: Number(order.totalAmount),

        paymentMethod: order.payment?.paymentMethod,

        createdAt: order.createdAt,
        
    }));

};

const mergeOrders = async ({
    targetOrderId,
    sourceOrderIds
}) => {

    targetOrderId = Number(targetOrderId);

    sourceOrderIds = sourceOrderIds
        .map(Number)
        .filter(id => id !== targetOrderId);

    if (!targetOrderId) {
        throw new Error("Vui lòng chọn đơn chính");
    }

    if (sourceOrderIds.length === 0) {
        throw new Error("Vui lòng chọn ít nhất một đơn để gộp");
    }

    return prisma.$transaction(async tx => {

        const orders = await tx.order.findMany({
            where: {
                id: {
                    in: [
                        targetOrderId,
                        ...sourceOrderIds
                    ]
                }
            },
            include: {
                orderItems: true
            }
        });

        if (orders.length !== sourceOrderIds.length + 1) {
            throw new Error("Có đơn không tồn tại");
        }

        const targetOrder = orders.find(
            order => order.id === targetOrderId
        );

        if (!targetOrder) {
            throw new Error("Không tìm thấy đơn chính");
        }

        // Không cho gộp đơn đã hoàn thành hoặc đã hủy
        const invalidOrders = orders.filter(
            order =>
                order.status === "COMPLETED" ||
                order.status === "CANCELLED"
        );

        if (invalidOrders.length > 0) {
            throw new Error(
                "Không thể gộp đơn đã hoàn thành hoặc đã hủy"
            );
        }

        // Kiểm tra cùng DiningSession
        const isSameSession = orders.every(
            order =>
                order.diningSessionId === targetOrder.diningSessionId
        );

        if (!isSameSession) {
            throw new Error(
                "Chỉ có thể gộp các đơn thuộc cùng một bàn"
            );
        }

        // Chuyển toàn bộ món từ đơn nguồn sang đơn chính
        await tx.orderItem.updateMany({
            where: {
                orderId: {
                    in: sourceOrderIds
                }
            },
            data: {
                orderId: targetOrderId
            }
        });

        // Hủy các đơn đã được gộp
        await tx.order.updateMany({
            where: {
                id: {
                    in: sourceOrderIds
                }
            },
            data: {
                status: "CANCELLED"
            }
        });

        // Trả về đơn sau khi gộp
        return tx.order.findUnique({
    where: {
        id: targetOrderId
    },
    include: {
        orderItems: {
            include: {
                food: true
            }
        }
    }
});

    });

};

const getActiveOrderByTable = async (tableQrCode) => {

    if (!tableQrCode) {
        throw new Error("Thiếu mã bàn.");
    }

    const table = await prisma.table.findUnique({
        where: {
            qrCode: tableQrCode,
        },

        include: {
            floor: true,

            sessions: {
                where: {
                    status: "ACTIVE",
                },

                include: {
                    orders: {
                        where: {
                            status: {
                                in: ACTIVE_ORDER_STATUSES,
                            },
                        },

                        orderBy: {
                            createdAt: "asc",
                        },

                        select: {
                            id: true,
                            orderCode: true,
                            totalAmount: true,
                            status: true,
                            createdAt: true,
                        },
                    },
                },
            },
        },
    });

    if (!table) {
        throw new Error("Bàn không tồn tại.");
    }

    const session = table.sessions[0];

    if (!session) {
        return {
            hasActiveOrder: false,
            table: {
                id: table.id,
                tableNumber: table.tableNumber,
                qrCode: table.qrCode,
            },
        };
    }

    const orders = session.orders;

    return {
        hasActiveOrder: orders.length > 0,

        table: {
            id: table.id,
            tableNumber: table.tableNumber,
            qrCode: table.qrCode,
        },

        sessionId: session.id,

        orders,
    };
};

// ========================================
// STAFF LẤY ORDER ĐANG CHỜ XÁC NHẬN
// ========================================
const getPendingOrders = async (branchId) => {

    return await prisma.order.findMany({

        where: {
            branchId: Number(branchId),

            status: "PENDING",

            orderType: {
                in: [
                    "DINE_IN",
                    "TAKE_AWAY",
                ],
            },
        },

        include: {

            createdByUser: {
                select: {
                    id: true,
                    username: true,
                },
            },

            session: {
                include: {
                    table: {
                        select: {
                            id: true,
                            tableNumber: true,
                            qrCode: true,
                        },
                    },
                },
            },

            orderItems: {
                where: {
                    status: "PENDING",
                },

                include: {
                    food: {
                        select: {
                            id: true,
                            name: true,
                            price: true,
                        },
                    },
                },
            },

        },

        orderBy: {
            createdAt: "asc",
        },

    });

};

module.exports = {
  create,
  updateTableStatus,
  notifyOrderCustomers,
  getById,

  addItem,
  confirmItems,
  updateItem,
  removeItem,

  updateStatus,

  payment,

  createTakeAway,
  getTakeAway,

  getHistory,
  mergeOrders,
  getActiveOrderByTable,
  getPendingOrders,
};