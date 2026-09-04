const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const roles = [
    "ADMIN",
    "BRANCH",
    "CASHIER",
    "ORDER",
    "WAREHOUSE",
  ];

  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log("Default roles created successfully!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });