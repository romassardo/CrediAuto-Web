const { PrismaClient } = require('@prisma/client');

async function checkDealers() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Verificando dealers en la base de datos...');
    
    const dealers = await prisma.dealer.findMany({
      select: {
        id: true,
        legalName: true,
        tradeName: true,
        status: true,
        createdAt: true
      }
    });
    
    if (dealers.length === 0) {
      console.log('❌ No hay dealers en la base de datos');
      console.log('💡 Necesitas crear un dealer antes de enviar solicitudes');
    } else {
      console.log(`✅ Encontrados ${dealers.length} dealers:`);
      dealers.forEach(dealer => {
        console.log(`  - ID: ${dealer.id}, Nombre: ${dealer.legalName || dealer.tradeName}, Estado: ${dealer.status}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error verificando dealers:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDealers();
