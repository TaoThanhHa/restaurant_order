const prisma = require("../../config/prisma");

const checkBranchAccess = async (branchId, user) => {
  const branch = await prisma.branch.findUnique({
    where: {
      id: Number(branchId),
    },
    select: {
      id: true,
      restaurantId: true,
    },
  });

  if (!branch) {
    throw new Error("Chi nhánh không tồn tại.");
  }

  if (user.role === "BRANCH") {
    if (Number(user.branchId) !== branch.id) {
      throw new Error(
        "Bạn không có quyền thực hiện trên chi nhánh này."
      );
    }
  }

  if (user.role === "ADMIN") {
    if (
      Number(user.restaurantId) !==
      Number(branch.restaurantId)
    ) {
      throw new Error(
        "Bạn không có quyền thực hiện trên chi nhánh này."
      );
    }
  }

  return branch;
};

const checkFloorAccess = async (floorId, user) => {
  const floor = await prisma.floor.findUnique({
    where: {
      id: Number(floorId),
    },
    select: {
      id: true,
      branchId: true,
    },
  });

  if (!floor) {
    throw new Error("Tầng không tồn tại.");
  }

  await checkBranchAccess(floor.branchId, user);

  return floor;
};

const getAll = async (user) => {
  if (!user?.restaurantId && user?.role === "ADMIN") {
    throw new Error("Tài khoản chưa thuộc nhà hàng.");
  }

  if (
    ["BRANCH", "CASHIER", "ORDER", "KITCHEN"].includes(user?.role) &&
    !user?.branchId
  ) {
    throw new Error("Tài khoản chưa thuộc chi nhánh.");
  }

  const where =
    user.role === "ADMIN"
      ? {
          branch: {
            restaurantId: Number(user.restaurantId),
          },
        }
      : {
          branchId: Number(user.branchId),
          branch: {
            restaurantId: Number(user.restaurantId),
          },
        };

  const floors = await prisma.floor.findMany({
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

  return floors;
};

const getByBranch = async (branchId, user) => {
  await checkBranchAccess(branchId, user);

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

// ======================================================
// GET BY ID
// ======================================================

const getById = async (id, user) => {
  await checkFloorAccess(id, user);

  return await prisma.floor.findUnique({
    where: {
      id: Number(id),
    },
    include: {
      branch: true,
      tables: true,
    },
  });
};

// ======================================================
// CREATE
// ======================================================

const create = async (data, user) => {
  const branchId = Number(data.branchId);

  if (!branchId) {
    throw new Error("Vui lòng chọn chi nhánh.");
  }

  await checkBranchAccess(branchId, user);

  const floorNumber = Number(data.floorNumber);

  if (isNaN(floorNumber) || floorNumber < 1) {
    throw new Error("Vui lòng nhập số tầng.");
  }

  const name =
    data.name?.trim() || `Tầng ${floorNumber}`;

  const existed = await prisma.floor.findUnique({
    where: {
      branchId_floorNumber: {
        branchId,
        floorNumber,
      },
    },
  });

  if (existed) {
    throw new Error("Tầng đã tồn tại.");
  }

  return await prisma.floor.create({
    data: {
      branchId,
      floorNumber,
      name,
    },
  });
};

// ======================================================
// UPDATE
// ======================================================

const update = async (id, data, user) => {
  const floor = await checkFloorAccess(id, user);

  const branchId = Number(
    data.branchId ?? floor.branchId
  );

  await checkBranchAccess(branchId, user);

  const floorNumber = Number(
    data.floorNumber ?? floor.floorNumber
  );

  if (isNaN(floorNumber) || floorNumber < 1) {
    throw new Error("Vui lòng nhập số tầng.");
  }

  const name =
    data.name?.trim() || `Tầng ${floorNumber}`;

  const existed = await prisma.floor.findFirst({
    where: {
      branchId,
      floorNumber,
      NOT: {
        id: Number(id),
      },
    },
  });

  if (existed) {
    throw new Error("Số tầng đã tồn tại.");
  }

  return await prisma.floor.update({
    where: {
      id: Number(id),
    },
    data: {
      branchId,
      floorNumber,
      name,
    },
  });
};

const remove = async (id, user) => {
    const floor = await checkFloorAccess(id, user);

    await prisma.$transaction(async (tx) => {
        await tx.table.deleteMany({
            where: {
                floorId: floor.id,
            },
        });

        await tx.floor.delete({
            where: {
                id: floor.id,
            },
        });
    });

    return {
        message: "Xóa tầng và toàn bộ bàn thành công.",
    };
};

module.exports = {
  getAll,
  getById,
  getByBranch,
  create,
  update,
  remove,
};