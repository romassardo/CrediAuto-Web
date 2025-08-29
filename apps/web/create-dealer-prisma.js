const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function createDealerAndUsers() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🏢 Creando dealer y usuarios de prueba...');
    
    // 1. Crear dealer
    const dealer = await prisma.dealer.create({
      data: {
        publicId: 'dealer-test-001',
        legalName: 'Concesionario Test S.A.',
        tradeName: 'AutoCenter Test',
        cuit: '20-12345678-9',
        email: 'test@concesionario.com',
        phone: '+54 11 1234-5678',
        addressStreet: 'Av. Libertador 1234',
        addressCity: 'Buenos Aires',
        addressProvince: 'CABA',
        postalCode: '1425',
        status: 'APPROVED',
        approvedAt: new Date(),
      }
    });
    
    console.log(`✅ Dealer creado: ID=${dealer.id}, Nombre=${dealer.legalName}`);
    
    // 2. Crear usuario ADMIN
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await prisma.user.create({
      data: {
        publicId: 'admin-001',
        email: 'admin@crediauto.com',
        firstName: 'Admin',
        lastName: 'Sistema',
        phone: '+54 11 9999-0000',
        passwordHash: adminPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
      }
    });
    
    console.log(`✅ Usuario ADMIN creado: ${admin.email}`);
    
    // 3. Crear usuario DEALER
    const dealerPassword = await bcrypt.hash('dealer123', 12);
    const dealerUser = await prisma.user.create({
      data: {
        publicId: 'dealer-001',
        email: 'dealer@test.com',
        firstName: 'Juan',
        lastName: 'Pérez',
        phone: '+54 11 5555-1234',
        passwordHash: dealerPassword,
        role: 'DEALER',
        status: 'ACTIVE',
        dealerId: dealer.id,
      }
    });
    
    console.log(`✅ Usuario DEALER creado: ${dealerUser.email}`);
    
    // 4. Crear usuario EJECUTIVO_CUENTAS
    const ejecutivoPassword = await bcrypt.hash('ejecutivo123', 12);
    const ejecutivo = await prisma.user.create({
      data: {
        publicId: 'ejecutivo-001',
        email: 'ejecutivo@test.com',
        firstName: 'María',
        lastName: 'González',
        phone: '+54 11 5555-5678',
        passwordHash: ejecutivoPassword,
        role: 'EJECUTIVO_CUENTAS',
        status: 'ACTIVE',
        dealerId: dealer.id,
      }
    });
    
    console.log(`✅ Usuario EJECUTIVO creado: ${ejecutivo.email}`);
    
    // 5. Actualizar dealer con approvedByUserId
    await prisma.dealer.update({
      where: { id: dealer.id },
      data: { approvedByUserId: admin.id }
    });
    
    console.log('✅ Dealer actualizado con approvedByUserId');
    
    console.log('\n🎉 Datos de prueba creados exitosamente!');
    console.log('\n📋 Credenciales de acceso:');
    console.log('- ADMIN: admin@crediauto.com / admin123');
    console.log('- DEALER: dealer@test.com / dealer123');
    console.log('- EJECUTIVO: ejecutivo@test.com / ejecutivo123');
    
  } catch (error) {
    console.error('❌ Error creando datos:', error.message);
    
    // Si el error es por duplicados, no es crítico
    if (error.code === 'P2002') {
      console.log('💡 Los datos ya existen, continuando...');
    }
  } finally {
    await prisma.$disconnect();
  }
}

createDealerAndUsers();
