const prisma = require("../../config/prisma");

const getCustomer = async customerId => {
    const customer = await prisma.customer.findUnique({
        where: { id: Number(customerId) },
        include: {
            cart: true,
            table: {
                include: {
                    floor: true
                }
            },
            session: {
                include: {
                    table: {
                        include: {
                            floor: true
                        }
                    }
                }
            }
        }
    });

    if (!customer) {
        throw new Error("Khách hàng không tồn tại.");
    }

    if (!customer.isActive) {
        throw new Error("Tài khoản không còn hoạt động.");
    }

    if (!customer.cart) {
        await prisma.cart.create({
            data: { customerId: customer.id }
        });

        customer.cart = await prisma.cart.findUnique({
            where: { customerId: customer.id }
        });
    }

    return customer;
};

const calculateTotal = items => {
    return items.reduce(
        (total, item) =>
            total + Number(item.food.price) * Number(item.quantity),
        0
    );
};

const getCart = async customerId => {
    const customer = await getCustomer(customerId);

    const cart = await prisma.cart.findUnique({
        where: { id: customer.cart.id },
        include: {
            items: {
                include: {
                    food: {
                        include: { category: true }
                    }
                },
                orderBy: { createdAt: "asc" }
            }
        }
    });

    return {
        ...cart,
        total: calculateTotal(cart.items)
    };
};

const addItem = async (customerId, data) => {
    const { foodId, quantity, note } = data;

    if (!foodId) {
        throw new Error("Vui lòng chọn món.");
    }

    if (quantity !== undefined && Number(quantity) <= 0) {
        throw new Error("Số lượng phải lớn hơn 0.");
    }

    const customer = await getCustomer(customerId);

    if (!customer.restaurantId) {
        throw new Error("Khách hàng chưa thuộc nhà hàng.");
    }

    const food = await prisma.food.findFirst({
        where: {
            id: Number(foodId),
            restaurantId: customer.restaurantId
        }
    });

    if (!food) {
        throw new Error("Món ăn không thuộc nhà hàng này.");
    }

    const cartItem = await prisma.cartItem.findUnique({
        where: {
            cartId_foodId: {
                cartId: customer.cart.id,
                foodId: Number(foodId)
            }
        }
    });

    if (cartItem) {
        await prisma.cartItem.update({
            where: { id: cartItem.id },
            data: {
                quantity: cartItem.quantity + Number(quantity || 1),
                note: note ?? cartItem.note
            }
        });
    } else {
        await prisma.cartItem.create({
            data: {
                cartId: customer.cart.id,
                foodId: Number(foodId),
                quantity: Number(quantity || 1),
                note: note || null
            }
        });
    }

    return getCart(customer.id);
};

const removeItem = async (customerId, itemId) => {
    const customer = await getCustomer(customerId);

    const item = await prisma.cartItem.findFirst({
        where: {
            id: Number(itemId),
            cartId: customer.cart.id
        }
    });

    if (!item) {
        throw new Error("Món ăn không tồn tại trong giỏ hàng.");
    }

    await prisma.cartItem.delete({
        where: { id: item.id }
    });

    return getCart(customer.id);
};

module.exports = {
    getCart,
    addItem,
    removeItem
};
