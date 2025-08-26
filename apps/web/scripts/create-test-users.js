const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function createTestUsers() {
  try {
    console.log('🔄 Creando usuarios de prueba...');

    // Generar hashes de contraseñas
    const adminHash = await bcrypt.hash('admin123', 12);
    const dealerHash = await bcrypt.hash('dealer123', 12);
    const ejecutivoHash = await bcrypt.hash('ejecutivo123', 12);

    // Crear dealer de prueba
    const dealer = await prisma.dealer.upsert({
      where: { publicId: 'dealer-test-001' },
      update: {},
      create: {
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
        approvedAt: new Date()
      }
    });

    console.log('✅ Dealer creado:', dealer.tradeName);

    // Crear usuario ADMIN
    const admin = await prisma.user.upsert({
      where: { email: 'admin@crediauto.com' },
      update: {
        passwordHash: adminHash,
        status: 'ACTIVE'
      },
      create: {
        publicId: 'admin-001',
        email: 'admin@crediauto.com',
        firstName: 'Admin',
        lastName: 'Sistema',
        phone: '+54 11 9999-0000',
        passwordHash: adminHash,
        role: 'ADMIN',
        status: 'ACTIVE'
      }
    });

    console.log('✅ Admin creado:', admin.email);

    // Crear usuario DEALER
    const dealerUser = await prisma.user.upsert({
      where: { email: 'dealer@test.com' },
      update: {
        passwordHash: dealerHash,
        status: 'ACTIVE',
        dealerId: dealer.id
      },
      create: {
        publicId: 'dealer-001',
        email: 'dealer@test.com',
        firstName: 'Juan',
        lastName: 'Pérez',
        phone: '+54 11 5555-1234',
        passwordHash: dealerHash,
        role: 'DEALER',
        status: 'ACTIVE',
        dealerId: dealer.id
      }
    });

    console.log('✅ Dealer user creado:', dealerUser.email);

    // Crear usuario EJECUTIVO_CUENTAS
    const ejecutivo = await prisma.user.upsert({
      where: { email: 'ejecutivo@test.com' },
      update: {
        passwordHash: ejecutivoHash,
        status: 'ACTIVE',
        dealerId: dealer.id
      },
      create: {
        publicId: 'ejecutivo-001',
        email: 'ejecutivo@test.com',
        firstName: 'María',
        lastName: 'González',
        phone: '+54 11 5555-5678',
        passwordHash: ejecutivoHash,
        role: 'EJECUTIVO_CUENTAS',
        status: 'ACTIVE',
        dealerId: dealer.id
      }
    });

    console.log('✅ Ejecutivo creado:', ejecutivo.email);

    // Actualizar dealer con approvedByUserId
    await prisma.dealer.update({
      where: { id: dealer.id },
      data: { approvedByUserId: admin.id }
    });

    console.log('🎉 Usuarios de prueba creados exitosamente!');
    console.log('\n📋 Credenciales de acceso:');
    console.log('Admin: admin@crediauto.com / admin123');
    console.log('Dealer: dealer@test.com / dealer123');
    console.log('Ejecutivo: ejecutivo@test.com / ejecutivo123');

  } catch (error) {
    console.error('❌ Error creando usuarios:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUsers();
