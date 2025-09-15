const crypto = require('node:crypto');

// Generar token temporal para testing UI (no válido para cambio real)
const testToken = crypto.randomBytes(32).toString('hex');
const testUrl = `http://localhost:3000/set-password?token=${testToken}`;

console.log('🔗 URL temporal para ver el diseño:');
console.log(testUrl);
console.log('');
console.log('⚠️  NOTA: Este token es solo para ver el diseño.');
console.log('   No funcionará para cambiar contraseña real.');
console.log('   Para testing completo, usa el token del admin.');
