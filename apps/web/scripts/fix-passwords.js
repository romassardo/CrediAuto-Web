const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function fixPasswords() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'crediauto_app',
    password: '123456',
    database: 'crediauto'
  });

  console.log('🔧 Actualizando contraseñas...');

  // Generar nuevos hashes
  const adminHash = await bcrypt.hash('admin123', 12);
  const dealerHash = await bcrypt.hash('dealer123', 12);
  const ejecutivoHash = await bcrypt.hash('ejecutivo123', 12);

  // Actualizar contraseñas
  await connection.execute('UPDATE users SET passwordHash = ? WHERE email = ?', [adminHash, 'admin@crediauto.com']);
  await connection.execute('UPDATE users SET passwordHash = ? WHERE email = ?', [dealerHash, 'dealer@test.com']);
  await connection.execute('UPDATE users SET passwordHash = ? WHERE email = ?', [ejecutivoHash, 'ejecutivo@test.com']);

  console.log('✅ Contraseñas actualizadas');
  console.log('📋 Credenciales:');
  console.log('admin@crediauto.com / admin123');
  console.log('dealer@test.com / dealer123');
  console.log('ejecutivo@test.com / ejecutivo123');

  await connection.end();
}

fixPasswords().catch(console.error);
