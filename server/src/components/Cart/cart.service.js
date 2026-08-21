const prisma = require("../../config/prisma");

  
// GET CUSTOMER
  

const getCustomer = async (guestToken) => {
  const customer = await prisma.customer.findUnique({
    where: {
      guestToken,
    },
    include:{
      cart:true,
      session:{
        include:{
          table:{
            include:{
              floor:true
            }
          }
        }
      }
    }
  });

  if (!customer) {
    throw new Error("Khách hàng không tồn tại.");
  }

  if (!customer.cart) {
    throw new Error("Giỏ hàng không tồn tại.");
  }

  return customer;
};

  
// CALCULATE TOTAL
  

const calculateTotal = (items) => {
  return items.reduce((total, item) => {
    return total + Number(item.food.price) * item.quantity;
  }, 0);
};

  
// GET CART
  

const getCart = async (guestToken) => {

  const customer = await getCustomer(guestToken);

  const cart = await prisma.cart.findUnique({
    where: {
      id: customer.cart.id,
    },
    include: {
      items: {
        include: {
          food: {
            include: {
              category: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  return {
    ...cart,
    total: calculateTotal(cart.items),
  };
};

  
// ADD ITEM
  

const addItem = async (data) => {

  const {
    guestToken,
    foodId,
    quantity,
    note,
  } = data;

    
  // VALIDATE
    

  if (!guestToken) {
    throw new Error("Guest token không hợp lệ.");
  }

  if (!foodId) {
    throw new Error("Vui lòng chọn món.");
  }

  if (quantity !== undefined && Number(quantity) <= 0) {
    throw new Error("Số lượng phải lớn hơn 0.");
  }

    
  // CUSTOMER
    

  const customer = await getCustomer(guestToken);

  if (!customer.session) {
    throw new Error("Khách hàng chưa có phiên phục vụ.");
  }

    
  // FOOD
    

  const food = await prisma.food.findUnique({
    where: {
      id: Number(foodId),
    },
  });

  if (!food) {
    throw new Error("Món ăn không tồn tại.");
  }
    
  // BRANCH FOOD
    

  const branchFood = await prisma.branchFood.findUnique({
    where: {
      branchId_foodId: {
        branchId: customer.session.table.floor.branchId,
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

    
  // CART ITEM
    

  const cartItem = await prisma.cartItem.findUnique({
    where: {
      cartId_foodId: {
        cartId: customer.cart.id,
        foodId: Number(foodId),
      },
    },
  });

  if (cartItem) {

    await prisma.cartItem.update({
      where: {
        id: cartItem.id,
      },
      data: {
        quantity: cartItem.quantity + Number(quantity || 1),
        note: note ?? cartItem.note,
      },
    });

  } else {

    await prisma.cartItem.create({
      data: {
        cartId: customer.cart.id,
        foodId: Number(foodId),
        quantity: Number(quantity || 1),
        note,
      },
    });

  }
  return await getCart(guestToken);

};

  
// REMOVE ITEM
  

const removeItem = async (itemId) => {

  const item = await prisma.cartItem.findUnique({
    where: {
      id: Number(itemId),
    },
    include: {
      cart: {
        include: {
          customer: true,
        },
      },
    },
  });

  if (!item) {
    throw new Error("Món ăn không tồn tại.");
  }

  await prisma.cartItem.delete({
    where: {
      id: Number(itemId),
    },
  });

  return await getCart(item.cart.customer.guestToken);

};

module.exports = {
  getCart,
  addItem,
  removeItem,
};