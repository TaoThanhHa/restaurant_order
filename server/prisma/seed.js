const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

    
  // PASSWORD
    

  const password = await bcrypt.hash("123456", 10);

    
  // ROLES
    

  const adminRole = await prisma.role.upsert({
    where: {
      name: "ADMIN",
    },
    update: {},
    create: {
      name: "ADMIN",
    },
  });

  const cashierRole = await prisma.role.upsert({
    where: {
      name: "CASHIER",
    },
    update: {},
    create: {
      name: "CASHIER",
    },
  });

  const orderRole = await prisma.role.upsert({
    where: {
        name: "ORDER",
    },
    update: {},
    create: {
        name: "ORDER",
    },
});

const kitchenRole = await prisma.role.upsert({
    where: {
        name: "KITCHEN",
    },
    update: {},
    create: {
        name: "KITCHEN",
    },
});

  console.log("✅ Roles seeded");

    
  // BRANCHES
    

  const branch1 = await prisma.branch.create({
    data: {
      name: "Chi nhánh Quận 1",
      address: "01 Nguyễn Huệ, Quận 1, TP.HCM",
      phone: "0900000001",
      email:"akjcn1@gmail.com",
    },
  });

  const branch2 = await prisma.branch.create({
    data: {
      name: "Chi nhánh Thủ Đức",
      address: "100 Võ Văn Ngân, Thủ Đức, TP.HCM",
      phone: "0900000002",
      email:"akjcn2@gmail.com",
    },
  });

  console.log("✅ Branches seeded");

    
  // USERS
    

  const admin = await prisma.user.upsert({
    where: {
      username: "admin",
    },
    update: {},
    create: {
      username: "admin",
      password,
      email: "admin@gmail.com",
      roleId: adminRole.id,
      branchId: null,
    },
  });

  const cashier = await prisma.user.upsert({
    where: {
      username: "cashier",
    },
    update: {},
    create: {
      username: "cashier",
      password,
      email: "cashier@gmail.com",
      roleId: cashierRole.id,
      branchId: branch1.id,
    },
  });

  console.log("✅ Users seeded");

      
  // FLOORS
    

  const floor1 = await prisma.floor.upsert({
    where: {
      branchId_floorNumber: {
        branchId: branch1.id,
        floorNumber: 1,
      },
    },
    update: {},
    create: {
      branchId: branch1.id,
      floorNumber: 1,
      name: "Tầng 1",
    },
  });

  const floor2 = await prisma.floor.upsert({
    where: {
      branchId_floorNumber: {
        branchId: branch1.id,
        floorNumber: 2,
      },
    },
    update: {},
    create: {
      branchId: branch1.id,
      floorNumber: 2,
      name: "Tầng 2",
    },
  });

  const floor3 = await prisma.floor.upsert({
    where: {
      branchId_floorNumber: {
        branchId: branch2.id,
        floorNumber: 1,
      },
    },
    update: {},
    create: {
      branchId: branch2.id,
      floorNumber: 1,
      name: "Tầng 1",
    },
  });

  console.log("✅ Floors seeded");

    
  // TABLES
    

  // Chi nhánh Quận 1 - Tầng 1 (B1 -> B10)
  for (let i = 1; i <= 10; i++) {
    await prisma.table.upsert({
      where: {
        floorId_tableNumber: {
          floorId: floor1.id,
          tableNumber: i,
        },
      },
      update: {},
      create: {
        floorId: floor1.id,
        tableNumber: i,
        qrCode: `Q1-T1-B${i}`,
        status: "AVAILABLE",
      },
    });
  }

  // Chi nhánh Quận 1 - Tầng 2 (B11 -> B15)
  for (let i = 11; i <= 15; i++) {
    await prisma.table.upsert({
      where: {
        floorId_tableNumber: {
          floorId: floor2.id,
          tableNumber: i,
        },
      },
      update: {},
      create: {
        floorId: floor2.id,
        tableNumber: i,
        qrCode: `Q1-T2-B${i}`,
        status: "AVAILABLE",
      },
    });
  }

  // Chi nhánh Thủ Đức - Tầng 1 (B1 -> B10)
  for (let i = 1; i <= 10; i++) {
    await prisma.table.upsert({
      where: {
        floorId_tableNumber: {
          floorId: floor3.id,
          tableNumber: i,
        },
      },
      update: {},
      create: {
        floorId: floor3.id,
        tableNumber: i,
        qrCode: `TD-T1-B${i}`,
        status: "AVAILABLE",
      },
    });
  }

  console.log("✅ Tables seeded");
      
  // CATEGORIES
    

  const bun = await prisma.category.upsert({
    where: { name: "Bún" },
    update: {},
    create: {
      name: "Bún",
      description: "Các món bún",
    },
  });

  const com = await prisma.category.upsert({
    where: { name: "Cơm" },
    update: {},
    create: {
      name: "Cơm",
      description: "Các món cơm",
    },
  });

  const lau = await prisma.category.upsert({
    where: { name: "Lẩu" },
    update: {},
    create: {
      name: "Lẩu",
      description: "Các món lẩu",
    },
  });

  const drink = await prisma.category.upsert({
    where: { name: "Đồ uống" },
    update: {},
    create: {
      name: "Đồ uống",
      description: "Các loại nước uống",
    },
  });

  const dessert = await prisma.category.upsert({
    where: { name: "Tráng miệng" },
    update: {},
    create: {
      name: "Tráng miệng",
      description: "Các món tráng miệng",
    },
  });

  console.log("✅ Categories seeded");

    
  // FOODS
    

  const foods = [
    // Bún
    {
      categoryId: bun.id,
      name: "Bún bò Huế",
      price: 55000,
      description: "Bún bò Huế truyền thống",
      image: "/foods/bun-bo-hue.jpg",
    },
    {
      categoryId: bun.id,
      name: "Bún riêu",
      price: 50000,
      description: "Bún riêu cua",
      image: "/foods/bun-rieu.jpg",
    },
    {
      categoryId: bun.id,
      name: "Bún chả",
      price: 60000,
      description: "Bún chả Hà Nội",
      image: "/foods/bun-cha.jpg",
    },
    {
      categoryId: bun.id,
      name: "Bún thịt nướng",
      price: 58000,
      description: "Bún thịt nướng",
      image: "/foods/bun-thit-nuong.jpg",
    },

    // Cơm
    {
      categoryId: com.id,
      name: "Cơm gà",
      price: 55000,
      description: "Cơm gà xối mỡ",
      image: "/foods/com-ga.jpg",
    },
    {
      categoryId: com.id,
      name: "Cơm sườn",
      price: 60000,
      description: "Cơm sườn nướng",
      image: "/foods/com-suon.jpg",
    },
    {
      categoryId: com.id,
      name: "Cơm bò lúc lắc",
      price: 75000,
      description: "Cơm bò lúc lắc",
      image: "/foods/com-bo.jpg",
    },
    {
      categoryId: com.id,
      name: "Cơm cá kho",
      price: 65000,
      description: "Cơm cá kho tộ",
      image: "/foods/com-ca.jpg",
    },

    // Lẩu
    {
      categoryId: lau.id,
      name: "Lẩu Thái",
      price: 299000,
      description: "Lẩu Thái chua cay",
      image: "/foods/lau-thai.jpg",
    },
    {
      categoryId: lau.id,
      name: "Lẩu Kim Chi",
      price: 329000,
      description: "Lẩu Kim Chi",
      image: "/foods/lau-kimchi.jpg",
    },
    {
      categoryId: lau.id,
      name: "Lẩu Hải Sản",
      price: 399000,
      description: "Lẩu hải sản",
      image: "/foods/lau-haisan.jpg",
    },
    {
      categoryId: lau.id,
      name: "Lẩu Bò",
      price: 359000,
      description: "Lẩu bò",
      image: "/foods/lau-bo.jpg",
    },

    // Đồ uống
    {
      categoryId: drink.id,
      name: "Coca Cola",
      price: 18000,
      description: "Nước ngọt Coca Cola",
      image: "/foods/coca.jpg",
    },
    {
      categoryId: drink.id,
      name: "Pepsi",
      price: 18000,
      description: "Nước ngọt Pepsi",
      image: "/foods/pepsi.jpg",
    },
    {
      categoryId: drink.id,
      name: "Trà Đào",
      price: 35000,
      description: "Trà đào cam sả",
      image: "/foods/tra-dao.jpg",
    },
    {
      categoryId: drink.id,
      name: "Trà Chanh",
      price: 25000,
      description: "Trà chanh",
      image: "/foods/tra-chanh.jpg",
    },

    // Tráng miệng
    {
      categoryId: dessert.id,
      name: "Bánh Flan",
      price: 25000,
      description: "Bánh flan caramel",
      image: "/foods/flan.jpg",
    },
    {
      categoryId: dessert.id,
      name: "Kem Vanilla",
      price: 30000,
      description: "Kem Vanilla",
      image: "/foods/kem.jpg",
    },
    {
      categoryId: dessert.id,
      name: "Chè Khúc Bạch",
      price: 35000,
      description: "Chè khúc bạch",
      image: "/foods/che.jpg",
    },
    {
      categoryId: dessert.id,
      name: "Trái cây",
      price: 45000,
      description: "Đĩa trái cây",
      image: "/foods/fruit.jpg",
    },
  ];

  for (const food of foods) {
    await prisma.food.upsert({
      where: {
        categoryId_name: {
          categoryId: food.categoryId,
          name: food.name,
        },
      },
      update: {},
      create: food,
    });
  }

  console.log("✅ Foods seeded");
      
  // BRANCH FOODS
    

  const branches = await prisma.branch.findMany();

  const allFoods = await prisma.food.findMany();

  for (const branch of branches) {
    for (const food of allFoods) {
      let status = "AVAILABLE";

      // Demo một vài món hết hàng ở Quận 1
      if (
        branch.id === branch1.id &&
        ["Trà Đào", "Lẩu Hải Sản"].includes(food.name)
      ) {
        status = "OUT_OF_STOCK";
      }

      // Demo một vài món hết hàng ở Thủ Đức
      if (
        branch.id === branch2.id &&
        ["Pepsi", "Bánh Flan"].includes(food.name)
      ) {
        status = "OUT_OF_STOCK";
      }

      await prisma.branchFood.upsert({
        where: {
          branchId_foodId: {
            branchId: branch.id,
            foodId: food.id,
          },
        },
        update: {
          status,
        },
        create: {
          branchId: branch.id,
          foodId: food.id,
          status,
        },
      });
    }
  }

  console.log("✅ Branch Foods seeded");

    
// GET SAMPLE FOODS
  

const comGa = await prisma.food.findFirst({
  where: {
    name: "Cơm gà",
  },
});

const coca = await prisma.food.findFirst({
  where: {
    name: "Coca Cola",
  },
});
      
  // DINING SESSION
    

  const tableB1 = await prisma.table.findFirst({
    where: {
      tableNumber: 1,
      floor: {
        branchId: branch1.id,
      },
    },
  });

  const diningSession = await prisma.diningSession.create({
    data: {
      tableId: tableB1.id,
      status: "ACTIVE",
    },
  });

  console.log("✅ Dining Session seeded");

    
  // CUSTOMERS
    

  const customer = await prisma.customer.create({
    data: {
      sessionId: diningSession.id,
      name: "Nguyễn Văn A",
      phone: "0909999999",
      password: password,
    },
  });

  const guest = await prisma.customer.create({
    data: {
      sessionId: diningSession.id,
      name: "Khách vãng lai",
      guestToken: "guest-demo-token",
    },
  });

  console.log("✅ Customers seeded");

  
// ORDER 1
  

const order1 = await prisma.order.create({
  data: {
    orderCode: `B-${Date.now()}-1`,
    branchId: branch1.id,
    sessionId: diningSession.id,
    createdById: customer.id,
    status: "SERVED", // đã phục vụ
    orderType: "DINE_IN",
    totalAmount: 0,
  },
});

await prisma.orderMember.create({
  data: {
    orderId: order1.id,
    customerId: customer.id,
  },
});

await prisma.orderItem.createMany({
  data: [
    {
      orderId: order1.id,
      foodId: comGa.id,
      quantity: 2,
      price: comGa.price,
      note: "Ít cơm",
      status: "SERVED",
    },
    {
      orderId: order1.id,
      foodId: coca.id,
      quantity: 1,
      price: coca.price,
      note: "Không đá",
      status: "PENDING",
    },
  ],
});

await prisma.payment.create({
  data: {
    orderId: order1.id,
    paymentMethod: "CASH",
    totalAmount: Number(comGa.price) * 2 + Number(coca.price),
    paymentStatus: "UNPAID",
  },
});

console.log("✅ Order 1 seeded");

  
// CUSTOMER 2
  

const customer2 = await prisma.customer.create({
  data: {
    sessionId: diningSession.id,
    name: "Trần Văn B",
    phone: "0908888888",
    password,
  },
});

  
// ORDER 2
  

const order2 = await prisma.order.create({
  data: {
    orderCode: `B-${Date.now()}-2`,
    branchId: branch1.id,
    sessionId: diningSession.id,
    createdById: customer2.id,
    status: "SERVED", // đã phục vụ
    orderType: "DINE_IN",
    totalAmount: 0,
  },
});

await prisma.orderMember.create({
  data: {
    orderId: order2.id,
    customerId: customer2.id,
  },
});

await prisma.orderItem.createMany({
  data: [
    {
      orderId: order2.id,
      foodId: comGa.id,
      quantity: 1,
      price: comGa.price,
      note: "",
      status: "SERVED",
    },
    {
      orderId: order2.id,
      foodId: coca.id,
      quantity: 2,
      price: coca.price,
      note: "",
      status: "SERVED",
    },
  ],
});

await prisma.payment.create({
  data: {
    orderId: order2.id,
    paymentMethod: "CASH",
    totalAmount: Number(comGa.price) + Number(coca.price) * 2,
    paymentStatus: "UNPAID",
  },
});

console.log("✅ Order 2 seeded");

  
// TABLE STATUS
  

await prisma.table.update({
  where: {
    id: tableB1.id,
  },
  data: {
    status: "OCCUPIED",
  },
});
    
  // CART
    

  const cart = await prisma.cart.create({
    data: {
      customerId: customer.id,
    },
  });

  console.log("✅ Cart seeded");

    
  // CART ITEMS
    

  await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      foodId: comGa.id,
      quantity: 2,
      note: "Ít cơm",
    },
  });

  await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      foodId: coca.id,
      quantity: 1,
      note: "Không đá",
    },
  });

  console.log("✅ Cart Items seeded");
}

main()
  .then(() => {
    console.log("🌱 Seed completed successfully.");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
