const prisma = require("../../config/prisma");

const getAll = async () => {
  return await prisma.food.findMany({
    include: {
      category: true,
      branchFoods: {
        include: {
          branch: true
        }
      }
    },
    orderBy: {
      id: "asc",
    },
  });
};

const getById = async (id) => {
  const food = await prisma.food.findUnique({
    where: {
      id,
    },
    include: {
      category: true,

      branchFoods:{
        include:{
            branch:true
        }
      }
    },
  });
  if (!food) {
    throw new Error("Món ăn không tồn tại.");
  }
  return food;
};

const create = async (data) => {
    const categoryId = data.categoryId;
    const name = data.name?.trim();
    const price = data.price;
    const description = data.description?.trim();
    const image = data.image;

    if (!name) {
        throw new Error("Tên món ăn không được để trống.");
    }

    if (categoryId === undefined) {
        throw new Error("Danh mục không được để trống.");
    }

    if (price === undefined || Number(price) <= 0) {
        throw new Error("Giá phải lớn hơn 0.");
    }

    const category = await prisma.category.findUnique({
        where: {
            id: Number(categoryId),
        },
    });

    if (!category) {
        throw new Error("Danh mục không tồn tại.");
    }

    const existed = await prisma.food.findFirst({
        where: {
            categoryId: Number(categoryId),
            name,
        },
    });

    if (existed) {
        throw new Error("Món ăn đã tồn tại.");
    }

    return await prisma.$transaction(async (tx) => {
        const food = await tx.food.create({
            data: {
                categoryId: Number(categoryId),
                name,
                price: Number(price),
                description,
                image,
            },
        });

        const branchIds = data.branchIds || [];

        if (branchIds.length === 0) {
            throw new Error("Vui lòng chọn ít nhất một chi nhánh.");
        }

        await tx.branchFood.createMany({
          data: branchIds.map(branchId => ({
            branchId: Number(branchId),
            foodId:food.id,
            status: "AVAILABLE"
          }))
        });

        return food;
    });
};

const update = async (id, data) => {

    const food = await prisma.food.findUnique({
        where: {
            id,
        },
        include: {
            branchFoods: true,
        },
    });

    if (!food) {
        throw new Error("Món ăn không tồn tại.");
    }

    if (data.categoryId) {

        const category = await prisma.category.findUnique({
            where: {
                id: Number(data.categoryId),
            },
        });

        if (!category) {
            throw new Error("Danh mục không tồn tại.");
        }

    }

    if (data.name) {

        const existed = await prisma.food.findFirst({
            where: {
                name: data.name,
                categoryId: Number(
                    data.categoryId ?? food.categoryId
                ),
                NOT: {
                    id,
                },
            },
        });

        if (existed) {
            throw new Error("Tên món đã tồn tại.");
        }

    }

    return await prisma.$transaction(async (tx) => {
        // UPDATE FOOD
        const updatedFood = await tx.food.update({
            where: {
                id,
            },

            data: {
                name: data.name ?? food.name,
                categoryId:data.categoryId ? Number(data.categoryId): food.categoryId,
                price: data.price ? Number(data.price) : food.price,
                description: data.description,
                image: data.image,
            },
        });

        // UPDATE BRANCH
        if (data.branchIds) {

            const oldIds = food.branchFoods.map(
                item => item.branchId
            );

            const newIds = data.branchIds.map(Number);

            // Xóa chi nhánh bị bỏ
            await tx.branchFood.deleteMany({
                where: {
                    foodId: id,
                    branchId: {
                        in: oldIds.filter(
                            x => !newIds.includes(x)
                        )
                    }
                }
            });

            // Thêm chi nhánh mới
            const addIds = newIds.filter(
                x => !oldIds.includes(x)
            );

            if (addIds.length) {

                await tx.branchFood.createMany({

                    data: addIds.map(branchId => ({
                        branchId,
                        foodId: id,
                        status: "AVAILABLE"
                    }))

                });

            }

        }

        return updatedFood;

    });

};

const remove = async (id) => {
  const food = await prisma.food.findUnique({
    where: {
      id,
    },
    include: {
      orderItems: true,
      branchFoods:true,
    },
  });
  if (!food) {
    throw new Error("Món ăn không tồn tại.");
  }
  if (food.orderItems.length > 0) {
    throw new Error("Món ăn đã có trong đơn hàng, không thể xóa.");
  }
  if (food.branchFoods.length > 0) {
    await prisma.branchFood.deleteMany({
      where: {
        foodId: id,
      },
    });
  }
  await prisma.food.delete({
    where: {
      id,
    },
  });
};

const getByBranch = async (branchId) => {

    if (!branchId) {
        throw new Error("Chi nhánh không hợp lệ.");
    }

    return await prisma.branchFood.findMany({

        where: {
            branchId: Number(branchId),

            // Chỉ ẩn món ngừng kinh doanh
            status: {
                not: "INACTIVE",
            },
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

const getByQrCode = async (qrCode) => {

    const table = await prisma.table.findUnique({
        where: {
            qrCode,
        },

        include: {
            floor: true,
        },
    });

    if (!table) {
        throw new Error("Bàn không tồn tại.");
    }

    return prisma.branchFood.findMany({

        where: {
            branchId: table.floor.branchId,
            status: {
                not: "INACTIVE",
            },
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

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  getByBranch,
  getByQrCode,
};