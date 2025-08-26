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