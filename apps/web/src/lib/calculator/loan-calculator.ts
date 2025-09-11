// loan-calculator.ts
export type RateInput =
  | { tipo: 'TNA'; valor: number; capitalizaciones?: number }
  | { tipo: 'TEA'; valor: number }
  | { tipo: 'MENSUAL'; valor: number }; // efectiva mensual (sin IVA)

export type Inputs = {
  monto: number;                  // Capital P
  plazoMeses: number;             // n
  tasa: RateInput;                // TNA/TEA/MENSUAL en decimales (sin IVA)
  ivaInteres: number;             // 0 | 0.105 | 0.21
  gastosOtorgamientoPct?: number; // % sobre monto P (se usa NETO de IVA para desembolso)
  gastosFijosIniciales?: number;  // (No considerados para CFT empresarial)
  sellosPct?: number;             // (No considerados para CFT empresarial)
  svsPctMensual?: number;         // % sobre saldo/mes (opcional, fuera de CFT empresarial)
  seguroAutoMensual?: number;     // monto fijo/mes (opcional, fuera de CFT empresarial)
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
    costosIniciales: number;      // Gastos de otorgamiento NETOS de IVA
    desembolsoNeto: number;       // P - costosIniciales
    sumaCuotas: number;           // Suma de cuotas (incluye extras si se configuraran)
    cftMensual: number;           // Con IVA
    cftEfectivoAnual: number;     // Con IVA, anualización 360/30
  };
};

// Conversión a tasa efectiva mensual SIN IVA según documentación empresarial
// TNA -> TEM: (TNA/360)*30 = TNA/12 (divisor 360 confirmado por sistema productivo)
// TEA -> TEM: (1+TEA)^(30/360)-1 = (1+TEA)^(1/12)-1
function toMensualSinIVA(tasa: RateInput): number {
  if (tasa.tipo === 'MENSUAL') return tasa.valor;
  if (tasa.tipo === 'TEA') return Math.pow(1 + tasa.valor, 30 / 360) - 1;
  // Empresa usa divisor 360 (no 365) para TNA -> TEM
  return (tasa.valor / 360) * 30;
}

function cuotaFrances(P: number, i: number, n: number): number {
  return (P * i) / (1 - Math.pow(1 + i, -n));
}

function irr(cashflows: number[], guess = 0.02): number {
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
    // Los siguientes no se consideran para CFT empresarial
    svsPctMensual = 0,
    seguroAutoMensual = 0,
  } = inputs;

  const ivaFactor = 1 + ivaInteres;

  // Tasa efectiva mensual SIN IVA según estándar empresarial
  const iSinIVA = toMensualSinIVA(tasa);
  // Tasa mensual CON IVA para fórmula de cuota fija
  const iConIVA = iSinIVA * ivaFactor;

  // Cuota fija (con IVA incluido en la tasa), redondeada a entero
  const cuotaConIVA = Math.round(cuotaFrances(P, iConIVA, n));

  // Gastos de otorgamiento NETOS de IVA para desembolso
  const gastosTot = P * (gastosOtorgamientoPct || 0);     // con IVA
  const gastosNetos = gastosTot / ivaFactor;               // neto de IVA
  const desembolsoNeto = P - gastosNetos;
  const costosIniciales = gastosNetos;                     // mostrado como neto

  // Cuadro de amortización usando tasa CON IVA y cuota fija entera
  let saldo = P;
  const rows: Row[] = [];

  // Flujos para CFT (no considerar extras mensuales)
  const cashflows: number[] = [round(desembolsoNeto, 2)];

  for (let t = 1; t <= n; t++) {
    const interesConIVA = saldo * iConIVA;
    const amortizacion = cuotaConIVA - interesConIVA;

    // Separación de IVA sobre interés
    const interesNeto = interesConIVA / ivaFactor;
    const ivaInteresMonto = interesConIVA - interesNeto;

    // Extras (opcionales, fuera del CFT empresarial)
    const svs = saldo * (svsPctMensual || 0);
    const otros = seguroAutoMensual || 0;
    const cuotaTotal = cuotaConIVA + svs + otros;

    saldo -= amortizacion;

    rows.push({
      periodo: t,
      cuotaBase: round(cuotaConIVA),
      interes: round(interesNeto),
      amortizacion: round(amortizacion),
      ivaInteres: round(ivaInteresMonto),
      svs: round(svs),
      otros: round(otros),
      cuotaTotal: round(cuotaTotal),
      saldo: round(Math.max(0, saldo)),
    });

    cashflows.push(-cuotaConIVA);
  }

  // CFT mensual (con IVA) por IRR de flujos: [desembolso neto, -cuota fija, ...]
  const cftMensualConIVA = irr(cashflows);
  const cftMensualNeto = cftMensualConIVA / ivaFactor;

  // Anualización 360/30 = 12 según documentación (divisor 360 confirmado)
  const cftEaNeto = Math.pow(1 + cftMensualNeto, 360 / 30) - 1;
  const cftEaTot = cftEaNeto * ivaFactor;

  return {
    rows,
    totales: {
      desembolsoBruto: round(P),
      costosIniciales: round(costosIniciales), // neto de IVA
      desembolsoNeto: round(desembolsoNeto),
      sumaCuotas: round(rows.reduce((a, r) => a + r.cuotaTotal, 0)),
      cftMensual: round(cftMensualConIVA),
      cftEfectivoAnual: round(cftEaTot),
    },
  };
}

function round(x: number, d = 2): number {
  const m = Math.pow(10, d);
  return Math.round((x + Number.EPSILON) * m) / m;
}