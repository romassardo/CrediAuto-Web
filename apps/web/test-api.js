// Script para probar la API de tasas directamente
const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('🔍 Probando API de tasas...');
    
    // Probar la API para año 2005
    const response = await fetch('http://localhost:3000/api/rates/by-year?year=2005');
    const data = await response.json();
    
    console.log('📊 Respuesta de la API:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(data, null, 2));
    
    if (!data.success && data.availableRanges) {
      console.log('\n📋 Rangos disponibles:');
      data.availableRanges.forEach(range => {
        console.log(`- ${range.name}: ${range.yearFrom}-${range.yearTo} (${(range.interestRate * 100).toFixed(1)}%)`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error al probar API:', error.message);
  }
}

testAPI();
