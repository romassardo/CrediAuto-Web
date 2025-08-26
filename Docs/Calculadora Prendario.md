# Qué debe calcular (outputs)

* **Cuota mensual total** (capital + interés + IVA sobre intereses + seguros y otros cargos).
* **Detalle por período**: interés, amortización, IVA, seguros, saldo.
* **Costos iniciales**: sellos, gastos de otorgamiento, registrales/prenda.
* **CFT (Costo Financiero Total) efectivo anual** calculado con flujo de caja real (lo exige la transparencia BCRA). ([Banco Central de la República Argentina][1])

# Variables de entrada (inputs)

* **Monto a financiar** (P).
* **Plazo** (n, en meses).
* **Tasa**:

  * **TNA** nominal anual con capitalización mensual → i = TNA/12.
  * **TEA** → i = (1+TEA)^(1/12) − 1. (Definiciones y conversiones usuarias en AR). ([Banco Central de la República Argentina][2], [iKiwi Argentina][3])
* **Impuestos y cargos**:

  * **IVA sobre intereses/comisiones** (alícuota según tu operatoria: muchas entidades publican 21% sobre intereses; en algunos casos bancarios aplica 10,5%—ver con tu contador). ([Bancor][4], [Santander Trade][5])
  * **Impuesto de sellos** (provincial, suele aplicar a contratos y prendas; ej., PBA: **12‰** para constitución de prenda). **Varía por jurisdicción**. ([Colegio de Abogados de San Isidro][6])
  * **Gastos de otorgamiento** (fijo o %), **gastos registrales/prenda**.
  * **Seguros**: “seguro de vida sobre saldo” (SVS) mensual (% sobre saldo) y, si corresponde, seguro del automotor (si lo querés incluir en la cuota).
* **Opción avanzada**: préstamos **UVA** (la cuota se calcula en UVA y se pesifica al valor del día). ([Mi Presupuesto Familiar][7])

# Fórmulas clave (sistema francés)

* **Cuota base** (sin impuestos/seguros):

  $$
  \text{cuota} = P \cdot \frac{i}{1 - (1+i)^{-n}}
  $$

  Donde $i$ es **tasa mensual efectiva**. (Sistema francés: cuotas iguales; interés decrece y capital amortizado crece). ([BBVA Argentina][8], [naranjax.com][9], [iKiwi Argentina][10])

* **Interés del mes t**: $\text{interés}_t = \text{saldo}_{t-1} \cdot i$

* **Amortización del mes t**: $\text{amort}_t = \text{cuota} - \text{interés}_t$

* **IVA sobre intereses (si aplica)**: $\text{IVA}_t = \text{interés}_t \cdot \text{alícuota\_IVA}$

* **Cuota total**: $\text{cuota\_total}_t = \text{cuota} + \text{IVA}_t + \text{seguros}_t + \text{otros}_t$

> **CFT (EA)**: calculalo con la **TIR mensual** de los flujos reales (monto neto desembolsado vs. sumatoria de cuotas totales) y anualizá: $\text{CFT\_EA} = (1+\text{TIR\_m})^{12}-1$. El BCRA pide incluir **intereses, comisiones y cargos vigentes**, dejando claro si hay impuestos/seguros. ([Banco Central de la República Argentina][1])

# Algoritmo paso a paso

1. Convertí la tasa a **mensual** (desde TNA o TEA). ([Banco Central de la República Argentina][2], [iKiwi Argentina][3])
2. Calculá **cuota base** (fórmula francesa). ([BBVA Argentina][8])
3. Mes a mes: interés, amortización y **saldo**.
4. Sumá **IVA sobre intereses** (alícuota que corresponda), **seguros** y **otros cargos**. ([Bancor][4], [Santander Trade][5])
5. Restá del monto bruto los **costos iniciales** (sellos, otorgamiento, registrales) para obtener el **neto desembolsado**. (Para sellos, recordá variaciones por provincia; p.ej. PBA 12‰ en prenda). ([Colegio de Abogados de San Isidro][6])
6. Calculá **TIR mensual** con los flujos y anualizá a **CFT EA**. ([Banco Central de la República Argentina][1])

# Código listo para pegar (TypeScript)

Este módulo te genera el plan de pagos y el CFT. Úsalo tal cual en tu Next.js (server o client).

```ts
// loan-calculator.ts
export type RateInput =
  | { tipo: 'TNA'; valor: number; capitalizaciones?: number } // ej. 12 (mensual)
  | { tipo: 'TEA'; valor: number }
  | { tipo: 'MENSUAL'; valor: number }; // ya efectiva mensual

export type Inputs = {
  monto: number;              // P
  plazoMeses: number;         // n
  tasa: RateInput;            // TNA/TEA/MENSUAL en decimales (0.60 = 60%)
  ivaInteres: number;         // 0 | 0.105 | 0.21
  gastosOtorgamientoPct?: number; // ej. 0.03
  gastosFijosIniciales?: number;  // ej. registrales/prenda fijos
  sellosPct?: number;             // ej. 0.012 (12‰)
  svsPctMensual?: number;         // % sobre saldo/mes (opcional)
  seguroAutoMensual?: number;     // monto fijo/mes (opcional)
};

export type Row = {
  periodo: number;
  cuotaBase: number;
  interes: number;
  amortizacion: number;
  ivaInteres: number;
  svs: number;
  otros: number;
  cuotaTotal: number;
  saldo: number;
};

export type Result = {
  rows: Row[];
  totales: {
    desembolsoBruto: number;
    costosIniciales: number;
    desembolsoNeto: number;
    sumaCuotas: number;
    cftMensual: number;
    cftEfectivoAnual: number;
  };
};

function toMensual(tasa: RateInput): number {
  if (tasa.tipo === 'MENSUAL') return tasa.valor;
  if (tasa.tipo === 'TEA') return Math.pow(1 + tasa.valor, 1 / 12) - 1;
  const caps = tasa.capitalizaciones ?? 12;
  return tasa.valor / caps;
}

function cuotaFrances(P: number, i: number, n: number): number {
  return P * i / (1 - Math.pow(1 + i, -n));
}

function irr(cashflows: number, guess = 0.02): number {
  // Implementación simple de TIR por Newton-Raphson
  let r = guess;
  for (let k = 0; k < 100; k++) {
    let npv = 0, d = 0;
    for (let t = 0; t < cashflows.length; t++) {
      const cf = cashflows[t];
      npv += cf / Math.pow(1 + r, t);
      if (t > 0) d += -t * cf / Math.pow(1 + r, t + 1);
    }
    const rNew = r - npv / (d || 1e-12);
    if (Math.abs(rNew - r) < 1e-12) return rNew;
    r = rNew;
  }
  return r;
}

export function calcular(inputs: Inputs): Result {
  const {
    monto: P,
    plazoMeses: n,
    tasa,
    ivaInteres,
    gastosOtorgamientoPct = 0,
    gastosFijosIniciales = 0,
    sellosPct = 0,
    svsPctMensual = 0,
    seguroAutoMensual = 0,
  } = inputs;

  const i = toMensual(tasa);
  const cuotaBase = cuotaFrances(P, i, n);

  const costosIniciales =
    P * (gastosOtorgamientoPct + sellosPct) + gastosFijosIniciales;
  const desembolsoNeto = P - costosIniciales;

  let saldo = P;
  const rows: Row[] = [];
  const cashflows: number[] = [desembolsoNeto];

  for (let t = 1; t <= n; t++) {
    const interes = saldo * i;
    const amortizacion = cuotaBase - interes;

    const iva = interes * ivaInteres;
    const svs = saldo * svsPctMensual;
    const otros = seguroAutoMensual; // u otros cargos mensuales fijos
    const cuotaTotal = cuotaBase + iva + svs + otros;

    saldo -= amortizacion;

    rows.push({
      periodo: t,
      cuotaBase: round(cuotaBase),
      interes: round(interes),
      amortizacion: round(amortizacion),
      ivaInteres: round(iva),
      svs: round(svs),
      otros: round(otros),
      cuotaTotal: round(cuotaTotal),
      saldo: round(Math.max(0, saldo)),
    });

    cashflows.push(-cuotaTotal);
  }

  const tirMensual = irr(cashflows);
  const cftEA = Math.pow(1 + tirMensual, 12) - 1;

  return {
    rows,
    totales: {
      desembolsoBruto: P,
      costosIniciales: round(costosIniciales),
      desembolsoNeto: round(desembolsoNeto),
      sumaCuotas: round(rows.reduce((a, r) => a + r.cuotaTotal, 0)),
      cftMensual: round(tirMensual),
      cftEfectivoAnual: round(cftEA),
    },
  };
}

function round(x: number, d = 2): number {
  const m = Math.pow(10, d);
  return Math.round((x + Number.EPSILON) * m) / m;
}
```

> **Tip legal/fiscal**: el **CFT** debe informar *todo* (intereses, comisiones, cargos, seguros e impuestos que apliquen). El IVA sobre intereses/comisiones y el impuesto de sellos dependen del tipo de entidad y de la provincia: **definilo como variables** y validalo con tu contador. ([Banco Central de la República Argentina][1], [Colegio de Abogados de San Isidro][6])

# Ejemplo numérico rápido

* Monto: **\$5.000.000**, Plazo: **36** meses, **TNA 60%** → i mensual = 0,60/12 = **5%**.
* **Cuota base** ≈ **\$302.172,29**.
* Mes 1: interés \$250.000; amortización \$52.172,29;

  * con **IVA 21%** sobre interés: \$52.500 → **cuota total** ≈ **\$354.672,29**.
  * con **IVA 10,5%**: \$26.250 → **cuota total** ≈ **\$328.422,29**.
* Si asumís costos iniciales 3% (otorg.) + 1,2% (sellos PBA) → neto desembolsado = \$4.790.000 y, sin seguros, la TIR mensual ≈ **6,43%**, CFT EA ≈ **111%**. *(Valores ilustrativos; los reales dependen de tus cargos/seguros exactos).* ([Colegio de Abogados de San Isidro][6])

# UX / Controles recomendados

* **Modo simple**: Monto, Plazo, TNA/TEA, IVA (selector 0 / 10,5% / 21%), gastos iniciales % y fijos.
* **Modo avanzado**: SVS % mensual sobre saldo, seguro auto mensual, provincia (para sugerir alícuota de sellos), opción UVA.
* **Salidas**: tabla mes a mes, totales, **CFT EA** grande y visible, descarga CSV/PDF.
* **Transparencia BCRA**: explicitar qué incluye el CFT y las alícuotas usadas. ([Banco Central de la República Argentina][1])

Si te sirve, en el próximo paso te lo envuelvo en un **componente React** con Tailwind (inputs, validaciones y una grilla bonita) y te lo dejo listo para tu **page.tsx** de Next. ¿Lo querés “simple” o “pro” (con UVA, SVS y selector de provincia)?

[1]: https://www.bcra.gob.ar/BCRAyVos/Preg-Frec-Qu%C3%A9-%C3%ADtems-conforman-el-costo-de-un-cr%C3%A9dito.asp?utm_source=chatgpt.com "¿Qué ítems conforman el costo de un crédito?"
[2]: https://www.bcra.gob.ar/pdfs/texord/t-tasint.pdf?utm_source=chatgpt.com "Tasas de interés en las operaciones de crédito"
[3]: https://ikiwi.net.ar/calculadoras/tna-a-tea/?utm_source=chatgpt.com "Calculadora de TNA a TEA (y de TEA a TNA)"
[4]: https://www.bancor.com.ar/prestamos-bancon/?utm_source=chatgpt.com "Préstamos Bancón - Córdoba"
[5]: https://santandertrade.com/es/portal/establecerse-extranjero/argentina/fiscalidad?utm_source=chatgpt.com "Fiscalidad en Argentina - Santandertrade.com"
[6]: https://www.casi.com.ar/sites/default/files/2023-SELLOS.pdf?utm_source=chatgpt.com "IMPUESTO DE SELLOS LEY IMPOSITIVA 15.391 (B.O: 27/ ..."
[7]: https://presupuestofamiliar.com.ar/comprar-autos-prestamos-uva-lo-que-tenes-que-saber/?utm_source=chatgpt.com "Préstamos UVA: qué tenés que analizar antes de endeudarte"
[8]: https://www.bbva.com.ar/economia-para-tu-dia-a-dia/ef/prestamos/que-es-el-sistema-de-amortizacion-frances.html?utm_source=chatgpt.com "Qué es el sistema de amortización francés"
[9]: https://www.naranjax.com/blog/que-es-sistema-amortizacion-frances?utm_source=chatgpt.com "🤓¿Qué es el sistema de amortización francés?"
[10]: https://ikiwi.net.ar/prestamos/sistema-amortizacion-frances/?utm_source=chatgpt.com "Sistema de Amortización Francés"
