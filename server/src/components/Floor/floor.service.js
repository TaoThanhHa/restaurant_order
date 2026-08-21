const prisma = require("../../config/prisma");

const getAll = async (user) => {

  const where =
    user.role.name === "ADMIN"
      ? {}
      : {
          branchId: user.branchId,
        };

  return await prisma.floor.findMany({
    where,
    include: {
      branch: true,
      _count: {
        select: {
          tables: true,
        },
      },
    },
    orderBy: {
      floorNumber: "asc",
    },
  });

};

const getByBranch = async (branchId) => {
    return await prisma.floor.findMany({
        where: {
            branchId: Number(branchId),
        },
        include: {
            tables: true,
        },
        orderBy: {
            id: "asc",
        },
    });
};

const getById = async (id) => {
  const floor = await prisma.floor.findUnique({
    where: {
      id,
    },
    include: {
      branch: true,
      tables: true,
    },
  });

  if (!floor) {
    throw new Error("Tầng không tồn tại.");
  }

  return floor;
};

const create = async (data) => {
  const { branchId } = data;

  if (!branchId) {
     throw new Error("Vui lòng chọn chi nhánh.");
  }

  const floorNumber = Number(data.floorNumber);

  if (isNaN(floorNumber) || floorNumber < 1) {
      throw new Error("Vui lòng nhập số tầng.");
  }

  const name = data.name?.trim() || `Tầng ${floorNumber}`;

  const branch = await prisma.branch.findUnique({
    where: {
      id: Number(branchId),
    },
  });

  if (!branch) {
    throw new Error("Chi nhánh không tồn tại.");
  }

  const existed = await prisma.floor.findUnique({
    where: {
      branchId_floorNumber: {
        branchId: Number(branchId),
        floorNumber,
      },
    },
  });

  if (existed) {
    throw new Error("Tầng đã tồn tại.");
  }

  return await prisma.floor.create({
    data: {
      branchId: Number(branchId),
      floorNumber,
      name,
    },
  });
};

const update = async (id, data) => {
  const floor = await prisma.floor.findUnique({
    where: {
      id,
    },
  });

  if (!floor) {
    throw new Error("Tầng không tồn tại.");
  }

  const branchId = Number(data.branchId ?? floor.branchId);
  const floorNumber = Number(data.floorNumber);

  const name = data.name?.trim() || `Tầng ${floorNumber}`;
  const existed = await prisma.floor.findFirst({
    where: {
      branchId,
      floorNumber,
      NOT: {
        id,
      },
    },
  });

  if (existed) {
    throw new Error("Số tầng đã tồn tại.");
  }

  return await prisma.floor.update({
    where: {
      id,
    },
    data: {
      branchId,
      floorNumber,
      name,
    },
  });
};

const remove = async (id) => {
  const floor = await prisma.floor.findUnique({
    where: {
      id,
    },
    include: {
      tables: true,
    },
  });

  if (!floor) {
    throw new Error("Tầng không tồn tại.");
  }

  if (floor.tables.length > 0) {
    throw new Error("Tầng đang có bàn, không thể xóa.");
  }

  await prisma.floor.delete({
    where: {
      id,
    },
  });
};

module.exports = {
  getAll,
  getById,
  getByBranch,
  create,
  update,
  remove,
};