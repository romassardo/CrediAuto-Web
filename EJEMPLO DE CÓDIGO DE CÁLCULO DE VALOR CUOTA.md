EJEMPLO DE CÓDIGO DE CÁLCULO DE VALOR CUOTA


function calcularCuota(monto, cuotas, tna_aprox){
	var tem   = (tna_aprox / 365) * 30;	
	var valor = (monto * tem) / (1 - Math.pow(1+tem,-cuotas));
	return valor.round(0);
}

function calculoCFT(monto, cuotas, valor, alic_iva, gastos){
	var iva = 1 + alic_iva;
	var dto_tot  = monto * gastos;
	var dto_neto = dto_tot / iva;
	var tem = interpolarTasa(monto, cuotas, valor)/iva * 100;
	var tna = tem*365/30;
	var tea = (Math.pow(1+tem/100,365/30)-1) * 100;
	var tna_iva = tna * iva;	
	var cft_tem_neto = interpolarTasa(monto-dto_neto, cuotas, valor)/iva * 100;
	var cft_tea_neto = (Math.pow(1+cft_tem_neto/100,365/30)-1) * 100;
	var cft_tea_tot  = cft_tea_neto * iva;
		
	var info = {tem:     tem,          // Tasa Periódica ó Tasa Efectiva Mensual (sin IVA)
				tna:     tna,          // Tasa Nominal Anual (sin IVA)
				tna_iva: tna_iva,      // Tasa Nominal Anual (con IVA)
				tea:     tea,          // Tasa Efectiva Anual (sin IVA)
				cft:     cft_tea_neto, // CFT sin IVA
				cft_iva: cft_tea_tot   // CFT Iva incluido				
				};
	return info;
}

function interpolarTasa(monto, cuotas, valor){
	var tasa_min = (cuotas*valor - monto) / (monto * cuotas);
	var tasa_max = (cuotas*valor - monto) / monto;
	var loop=0;
	var limite = 50;
	var tasa=null, calc_cuota=null;
	
	while(loop++ < limite){
		tasa = (tasa_min + tasa_max) / 2;
		if(tasa == 0.00){
			calc_cuota = monto / valor;
		}else{
			calc_cuota = monto * tasa / (1 - Math.pow(1+tasa,-cuotas));
		}
		if(calc_cuota > valor){
			tasa_max = tasa;
		}
		if(calc_cuota < valor){
			tasa_min = tasa;
		}
		if(calc_cuota==valor)	
		  loop=limite;
	}	
	return tasa;	
}
