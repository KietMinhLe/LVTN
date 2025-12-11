import { PrismaClient } from '@prisma/client';

// Tạo Prisma Client instance
const prisma = new PrismaClient({
    log: ['info', 'warn', 'error'],
});

// Kiểm tra kết nối ban đầu
async function testConnection() {
    try {
        await prisma.$connect();
        console.log("✅ Kết nối database thành công!");
    } catch (err) {
        console.error("❌ Kết nối database thất bại:", err);
    }
}

testConnection();

// Xử lý graceful shutdown
process.on('beforeExit', async () => {
    await prisma.$disconnect();
});

export default prisma;
