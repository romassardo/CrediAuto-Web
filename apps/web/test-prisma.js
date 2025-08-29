const { PrismaClient } = require('@prisma/client');

async function testPrisma() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testing Prisma connection...');
    await prisma.$connect();
    console.log('✅ Prisma connected successfully');
    
    // Test simple query
    const userCount = await prisma.user.count();
    console.log(`📊 Users in database: ${userCount}`);
    
    const dealerCount = await prisma.dealer.count();
    console.log(`🏢 Dealers in database: ${dealerCount}`);
    
  } catch (error) {
    console.error('❌ Prisma error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testPrisma();
