const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    await prisma.role.upsert({
        where: {
            name: "ORDER",
        },
        update: {},
        create: {
            name: "ORDER",
        },
    });

    console.log("✅ ORDER role đã được thêm.");
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });