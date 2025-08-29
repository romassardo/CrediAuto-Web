const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verificando usuarios existentes...');
  
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      dealerId: true
    }
  });
  
  console.log('📋 Usuarios encontrados:');
  users.forEach(user => {
    console.log(`- ${user.email} (${user.role}) - Status: ${user.status}`);
  });
  
  // Verificar si existe dealer@test.com
  const dealerUser = users.find(u => u.email === 'dealer@test.com');
  
  if (!dealerUser) {
    console.log('\n❌ Usuario dealer@test.com no encontrado');
    console.log('✅ Creando usuario dealer@test.com...');
    
    // Crear dealer primero
    const dealer = await prisma.dealer.create({
      data: {
        publicId: require('crypto').randomUUID(),
        tradeName: 'Concesionario Test',
        status: 'APPROVED'
      }
    });
    
    // Crear usuario dealer
    const hashedPassword = await bcrypt.hash('dealer123', 12);
    
    await prisma.user.create({
      data: {
        publicId: require('crypto').randomUUID(),
        email: 'dealer@test.com',
        firstName: 'Dealer',
        lastName: 'Test',
        passwordHash: hashedPassword,
        role: 'DEALER',
        status: 'ACTIVE',
        dealerId: dealer.id
      }
    });
    
    console.log('✅ Usuario dealer@test.com creado exitosamente');
  } else {
    console.log('\n✅ Usuario dealer@test.com ya existe');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
