// Script: seed-auto-rates-from-legacy.js
// Copia los rangos existentes de interest_rate_ranges a auto_interest_rate_ranges
// creando 4 entradas por cada rango (termMonths: 6,12,24,48) con la misma tasa.
// Uso:
//   1) Ejecutar migraciones para crear las tablas nuevas
//   2) node scripts/seed-auto-rates-from-legacy.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const TERMS = [6, 12, 24, 48];
  console.log('🔍 Leyendo rangos legacy (interest_rate_ranges)...');
  const legacy = await prisma.interestRateRange.findMany({
    where: { isActive: true },
    orderBy: [{ yearFrom: 'asc' }],
  });
  console.log(`📊 Rangos legacy activos: ${legacy.length}`);

  let created = 0;
  for (const r of legacy) {
    for (const term of TERMS) {
      const exists = await prisma.autoInterestRateRange.findFirst({
        where: {
          yearFrom: r.yearFrom,
          yearTo: r.yearTo,
          termMonths: term,
          isActive: true,
        },
      });
      if (!exists) {
        await prisma.autoInterestRateRange.create({
          data: {
            name: `${r.name} · ${term} meses`,
            description: r.description,
            yearFrom: r.yearFrom,
            yearTo: r.yearTo,
            termMonths: term,
            interestRate: r.interestRate,
            isActive: true,
            createdByUserId: r.createdByUserId ?? null,
          },
        });
        created++;
        console.log(`✅ AUTO ${r.yearFrom}-${r.yearTo} · ${term}m → tasa ${(Number(r.interestRate) * 100).toFixed(2)}%`);
      } else {
        console.log(`↪️  Ya existe AUTO ${r.yearFrom}-${r.yearTo} · ${term}m (omitido)`);
      }
    }
  }

  console.log(`\n✨ Seed completado. Nuevos registros creados: ${created}`);
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e?.message || e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
