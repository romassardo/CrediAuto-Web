const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkRates() {
  try {
    console.log('🔍 Verificando rangos de tasas en la base de datos...');
    
    // Verificar todos los rangos existentes
    const allRanges = await prisma.interestRateRange.findMany({
      orderBy: { yearFrom: 'asc' }
    });
    
    console.log(`📊 Total de rangos encontrados: ${allRanges.length}`);
    
    if (allRanges.length === 0) {
      console.log('❌ No hay rangos de tasas configurados');
      console.log('🔧 Creando rangos de prueba...');
      
      // Crear rangos de prueba
      const testRanges = [
        {
          name: 'Vehículos Antiguos (1990-2010)',
          description: 'Tasa para vehículos de 15+ años',
          yearFrom: 1990,
          yearTo: 2010,
          interestRate: 0.6000, // 60%
          isActive: true,
          priority: 1
        },
        {
          name: 'Vehículos Intermedios (2011-2018)',
          description: 'Tasa para vehículos de 7-14 años',
          yearFrom: 2011,
          yearTo: 2018,
          interestRate: 0.4500, // 45%
          isActive: true,
          priority: 2
        },
        {
          name: 'Vehículos Nuevos (2019-2025)',
          description: 'Tasa para vehículos de 0-6 años',
          yearFrom: 2019,
          yearTo: 2025,
          interestRate: 0.3500, // 35%
          isActive: true,
          priority: 3
        }
      ];
      
      for (const range of testRanges) {
        const created = await prisma.interestRateRange.create({
          data: range
        });
        console.log(`✅ Creado: ${created.name} (${created.yearFrom}-${created.yearTo}) - ${(created.interestRate * 100).toFixed(1)}%`);
      }
    } else {
      console.log('\n📋 Rangos configurados:');
      allRanges.forEach(range => {
        console.log(`${range.isActive ? '✅' : '❌'} ${range.name} (${range.yearFrom}-${range.yearTo}) - ${(range.interestRate * 100).toFixed(1)}%`);
      });
    }
    
    // Probar búsqueda para año 2005
    console.log('\n🎯 Probando búsqueda para año 2005...');
    const rateFor2005 = await prisma.interestRateRange.findFirst({
      where: {
        isActive: true,
        yearFrom: { lte: 2005 },
        yearTo: { gte: 2005 }
      },
      orderBy: {
        priority: 'desc'
      }
    });
    
    if (rateFor2005) {
      console.log(`✅ Tasa encontrada para 2005: ${rateFor2005.name} - ${(rateFor2005.interestRate * 100).toFixed(1)}%`);
    } else {
      console.log('❌ No se encontró tasa para año 2005');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkRates();
