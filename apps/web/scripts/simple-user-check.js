// Script simple para verificar usuarios en la BD
require('dotenv').config();
const bcrypt = require('bcryptjs');

async function checkUsers() {
  const mysql = require('mysql2/promise');
  
  try {
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'crediauto_app',
      password: '123456',
      database: 'crediauto'
    });

    console.log('✅ Conectado a MySQL');

    // Verificar usuarios existentes
    const [users] = await connection.execute('SELECT email, role, status, passwordHash IS NOT NULL as has_password FROM users');
    
    console.log('\n📋 Usuarios en la base de datos:');
    users.forEach(user => {
      console.log(`- ${user.email} (${user.role}) - Status: ${user.status} - Password: ${user.has_password ? 'YES' : 'NO'}`);
    });

    if (users.length === 0) {
      console.log('\n🔄 No hay usuarios. Creando usuarios de prueba...');
      
      // Crear hashes
      const adminHash = await bcrypt.hash('admin123', 12);
      const dealerHash = await bcrypt.hash('dealer123', 12);
      const ejecutivoHash = await bcrypt.hash('ejecutivo123', 12);

      // Crear dealer
      await connection.execute(`
        INSERT IGNORE INTO dealers (publicId, legalName, tradeName, cuit, email, phone, addressStreet, addressCity, addressProvince, postalCode, status, approvedAt, createdAt) 
        VALUES ('dealer-test-001', 'Concesionario Test S.A.', 'AutoCenter Test', '20-12345678-9', 'test@concesionario.com', '+54 11 1234-5678', 'Av. Libertador 1234', 'Buenos Aires', 'CABA', '1425', 'APPROVED', NOW(), NOW())
      `);

      const [dealerResult] = await connection.execute('SELECT id FROM dealers WHERE publicId = ?', ['dealer-test-001']);
      const dealerId = dealerResult[0].id;

      // Crear usuarios
      await connection.execute(`
        INSERT IGNORE INTO users (publicId, email, firstName, lastName, phone, passwordHash, role, status, dealerId, createdAt) 
        VALUES ('admin-001', 'admin@crediauto.com', 'Admin', 'Sistema', '+54 11 9999-0000', ?, 'ADMIN', 'ACTIVE', NULL, NOW())
      `, [adminHash]);

      await connection.execute(`
        INSERT IGNORE INTO users (publicId, email, firstName, lastName, phone, passwordHash, role, status, dealerId, createdAt) 
        VALUES ('dealer-001', 'dealer@test.com', 'Juan', 'Pérez', '+54 11 5555-1234', ?, 'DEALER', 'ACTIVE', ?, NOW())
      `, [dealerHash, dealerId]);

      await connection.execute(`
        INSERT IGNORE INTO users (publicId, email, firstName, lastName, phone, passwordHash, role, status, dealerId, createdAt) 
        VALUES ('ejecutivo-001', 'ejecutivo@test.com', 'María', 'González', '+54 11 5555-5678', ?, 'EJECUTIVO_CUENTAS', 'ACTIVE', ?, NOW())
      `, [ejecutivoHash, dealerId]);

      console.log('✅ Usuarios creados exitosamente');
    }

    // Verificar contraseñas
    console.log('\n🔐 Verificando contraseñas:');
    const [adminUser] = await connection.execute('SELECT passwordHash FROM users WHERE email = ?', ['admin@crediauto.com']);
    if (adminUser.length > 0) {
      const isValid = await bcrypt.compare('admin123', adminUser[0].passwordHash);
      console.log(`Admin password check: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    }

    await connection.end();
    console.log('\n🎉 Verificación completada');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkUsers();
