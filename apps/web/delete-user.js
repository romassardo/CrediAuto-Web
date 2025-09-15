const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteUser() {
  try {
    console.log('🔍 Buscando usuario Roger Waters...');
    
    const user = await prisma.user.findFirst({
      where: {
        id: 4,
        publicId: 'bf7ab6fc-8e5f-4677-a5a6-acd317a9c666'
      }
    });

    if (!user) {
      console.log('❌ Usuario no encontrado');
      return;
    }

    console.log('📋 Usuario encontrado:', {
      id: user.id,
      publicId: user.publicId,
      email: user.email,
      firstName: user.firstName,
      status: user.status,
      deletedAt: user.deletedAt
    });

    console.log('🗑️ Eliminando físicamente...');
    
    // Eliminar tokens relacionados primero (FK constraint)
    await prisma.refreshToken.deleteMany({
      where: { userId: user.id }
    });
    
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id }
    });

    // Eliminar el usuario
    await prisma.user.delete({
      where: { id: user.id }
    });

    console.log('✅ Usuario eliminado físicamente de la base de datos');
    console.log('🔄 Ya podés registrar nuevamente con romassardo@gmail.com');

  } catch (error) {
    console.error('❌ Error eliminando usuario:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

deleteUser();
