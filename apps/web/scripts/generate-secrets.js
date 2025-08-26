// Script para generar secretos JWT seguros para producción
const crypto = require('crypto');

console.log('🔐 Secretos JWT para Producción:');
console.log('');
console.log('JWT_SECRET="' + crypto.randomBytes(64).toString('hex') + '"');
console.log('JWT_REFRESH_SECRET="' + crypto.randomBytes(64).toString('hex') + '"');
console.log('');
console.log('⚠️  IMPORTANTE: Guarda estos secretos de forma segura y úsalos solo en producción');