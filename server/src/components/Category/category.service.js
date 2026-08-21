const prisma = require("../../config/prisma");

const getAll = async () => {
  return await prisma.category.findMany({
    include: {
        _count: {
        select: {
            foods: true,
        },
        },
    },
    orderBy: {
        id: "asc",
    },
    });
};

const getById = async (id) => {
    const category = await prisma.category.findUnique({
        where:{id},
        include:{
            foods:true
        }
    });
    if (!category) {
        throw new Error("Danh mục không tồn tại.");
    }
    return category;
};

const create = async (data) => {
    const name = data.name?.trim();
    const description = data.description?.trim();
    if (!name) {
        throw new Error("Tên danh mục không được để trống.");
    }
    const exists = await prisma.category.findUnique({
        where: {
            name
        }
    });
    if (exists) {
        throw new Error("Danh mục đã tồn tại.");
    }
    return await prisma.category.create({
        data: {
            name,
            description
        }
    });
};

const update = async (id, data) => {
    const category = await prisma.category.findUnique({
        where: {
            id
        }
    });

    if (!category) {
        throw new Error("Danh mục không tồn tại.");
    }

    if (data.name !== undefined) {
        const exists = await prisma.category.findFirst({
            where: {
                name: data.name.trim(),
                NOT: {
                    id
                }
            }
        });

        if (exists) {
            throw new Error("Tên danh mục đã tồn tại.");
        }
    }

    const updateData = {};

    if (data.name !== undefined) {
        updateData.name = data.name.trim();
    }

    if (data.description !== undefined) {
        updateData.description = data.description;
    }

    return await prisma.category.update({
        where: {
            id
        },
        data: updateData
    });
};

const remove = async (id) => {
    const category = await prisma.category.findUnique({
        where: {
            id
        },
        include: {
            foods: true
        }
    });
    if (!category) {
        throw new Error("Danh mục không tồn tại.");
    }
    if (category.foods.length > 0) {
        throw new Error(
            "Danh mục đang có món ăn, không thể xóa."
        );
    }
    await prisma.category.delete({
        where: {
            id
        }
    });
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};