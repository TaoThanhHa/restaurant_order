const prisma = require("../../config/prisma");

const getAll = async (branchId) => {
  return await prisma.branchFood.findMany({
    where: {
      branchId,
      status:{
        not:"INACTIVE"
      }
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
};

const updateStatus = async (
  branchId,
  foodId,
  status
) => {
  const validStatus = [
    "AVAILABLE",
    "OUT_OF_STOCK",
    "INACTIVE",
  ];

  if (!validStatus.includes(status)) {
    throw new Error("Trạng thái không hợp lệ.");
  }
  const branchFood = await prisma.branchFood.findUnique({
    where: {
      branchId_foodId: {
        branchId,
        foodId,
      },
    },
  });
  if (!branchFood) {
    throw new Error("Không tìm thấy món ăn.");
  }
  return await prisma.branchFood.update({
    where: {
      branchId_foodId: {
        branchId,
        foodId,
      },
    },
    data: {
      status,
    },
  });
};

module.exports = {
  getAll,
  updateStatus,
}