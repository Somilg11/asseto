"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    // Add your seed data here
    const demoUserId = "96483c79-ed13-4a8e-a317-323837a709fa";
    // create sample products
    await prisma.product.createMany({
        data: Array.from({ length: 10 }).map((_, i) => ({
            userId: demoUserId,
            name: `Product ${i + 1}`,
            price: (Math.random() * 100).toFixed(2),
            quantity: Math.floor(Math.random() * 20),
            lowStockAt: 5,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * (i * 5)),
        })),
    });
    console.log("Seed data inserted successfully.");
    console.log(`Created 25 products for user with ID: ${demoUserId}`);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
