const prisma = require("../../config/prisma");

  
// GET ORDER
  

const getById = async (orderId, customer) => {

    const order = await prisma.order.findUnique({
        where: {
            id: Number(orderId),
        },
        include: {
            orderMembers: true,
            orderItems: {
                include: {
                    food: true,
                },
            },
        },
    });

    if (!order) {
        throw new Error("Đơn hàng không tồn tại.");
    }

    const isMember = order.orderMembers.some(
        x => x.customerId === customer.id
    );

    if (!isMember) {
        throw new Error("Bạn không thuộc đơn hàng này.");
    }

    return order;
};

const addItem = async (orderId, data, customer) => {

    const { foodId, quantity, note } = data;

    const order = await prisma.order.findUnique({
        where: {
            id: Number(orderId),
        },
        include: {
            orderMembers: true,
        },
    });

    if (!order) {
        throw new Error("Đơn hàng không tồn tại.");
    }

    const isMember = order.orderMembers.some(
        x => x.customerId === customer.id
    );

    if (!isMember) {
        throw new Error("Bạn không thuộc đơn hàng này.");
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
        throw new Error("Món không tồn tại.");
    }

    return prisma.orderItem.create({
        data: {
            orderId: order.id,
            foodId: Number(foodId),
            quantity: Number(quantity),
            note,
            price: food.price,
            status: "PENDING",
        },
        include: {
            food: true,
        },
    });

};

  
// UPDATE ITEM
  

const updateItem = async (itemId, data, customer) => {
  const { quantity, note } = data;

  const item = await prisma.orderItem.findUnique({
    where: {
      id: Number(itemId),
    },
    include: {
      order: {
        include: {
          orderMembers: true,
        },
      },
      food: true,
    },
  });

  if (!item) {
    throw new Error("Món không tồn tại.");
  }

  // Kiểm tra khách có thuộc order không
  const isMember = item.order.orderMembers.some(
    (member) => member.customerId === customer.id
  );

  if (!isMember) {
    throw new Error("Bạn không thuộc đơn hàng này.");
  }

  // Kiểm tra trạng thái order
  if (
    item.order.status === "COMPLETED" ||
    item.order.status === "CANCELLED"
  ) {
    throw new Error("Đơn hàng đã đóng.");
  }

  // Kiểm tra trạng thái món
  if (item.status !== "PENDING") {
    throw new Error(
      "Món đã được bếp xác nhận, không thể chỉnh sửa."
    );
  }

  if (
    quantity !== undefined &&
    Number(quantity) <= 0
  ) {
    throw new Error("Số lượng phải lớn hơn 0.");
  }

  return await prisma.orderItem.update({
    where: {
      id: item.id,
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
};

  
// REMOVE ITEM
  

const removeItem = async (itemId, customer) => {

  const item = await prisma.orderItem.findUnique({
    where: {
      id: Number(itemId),
    },
    include: {
      order: {
        include: {
          orderMembers: true,
        },
      },
    },
  });

  if (!item) {
    throw new Error("Món không tồn tại.");
  }

  // Kiểm tra khách có thuộc order không
  const isMember = item.order.orderMembers.some(
    (member) => member.customerId === customer.id
  );

  if (!isMember) {
    throw new Error("Bạn không thuộc đơn hàng này.");
  }

  // Kiểm tra trạng thái order
  if (
    item.order.status === "COMPLETED" ||
    item.order.status === "CANCELLED"
  ) {
    throw new Error("Đơn hàng đã đóng.");
  }

  // Chỉ được hủy khi còn chờ xác nhận
  if (item.status !== "PENDING") {
    throw new Error(
      "Chỉ được hủy món khi đang chờ xác nhận."
    );
  }

  await prisma.orderItem.update({
    where: {
      id: item.id,
    },
    data: {
      status: "CANCELLED",
    },
  });

  return true;
};

module.exports = {
  getById,
  addItem,
  updateItem,
  removeItem,
};