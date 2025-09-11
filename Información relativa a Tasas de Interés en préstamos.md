Información relativa a Tasas de Interés en préstamos

1)	Sistema de Amortización utilizado.
Se utiliza Sistema Francés de Amortización.  Son intereses sobre saldos, con cuotas fijas y capital creciente.

2)	Fórmulas utilizadas para determinar intereses compensatorios
Se utilizan las fórmulas propias del Sistema Francés.
Para determinar los valores de las cuotas:
	ValorCuota = Capital * Tasa_TEM / ( 1 – 1/(1+Tasa_TEM)^CantCuotas)
  Donde:
ValorCuota = El valor de cada cuota (con IVA incluido).
Tasa_TEM   = Tasa de interés mensual o tasa periódica (con IVA incluido).
Capital         = Capital prestado
CantCuotas = Cantidad de Cuotas

Para separar los componentes de capital, intereses e IVA de cada cuota:
   En primer lugar se determina la amortización de capital de la primera cuota
	Amortizacion1 = ValorCuota – Capital * Tasa_TEM
A partir de ese valor se determina la amortización de capital de las cuotas siguientes utilizando la siguiente fórmula:
	AmortizacionN = Amortizacion1 * (1+Tasa_TEM) ^ (N -1)
  Donde:
ValorCuota 	= El valor de cada cuota (con IVA incluido).
Tasa_TEM   	= Tasa de interés mensual o tasa periódica (con IVA incluido).
Capital         	= Capital prestado
Amortizacion1 	= Amortización de capital de primera cuota
AmortizacionN 	= Amortización de capital de la cuota N
N  	= El número de cuota

La diferencia entre el valor de las cuotas y su amortización de capital es el interés con IVA incluido, el cual luego se separa entre Interés Neto e IVA:
	InteresFinal_N = ValorCuota – AmortizacionN
	InteresNeto_N = InteresFinal_N / (1 + Alic_IVA)
	IVA_N = InteresFinal_N – InteresNeto_N

3)	Fórmulas utilizadas para determinar intereses punitorios
Se utilizan dos modalidades, según el tipo de línea de préstamos:
3.1 – Débito Directo por CBU
Para las líneas de préstamos asociadas a procesos cobranzas mediante débito directo por CBU, se utiliza el siguiente cálculo:
Punitorios = MesesAtraso *  TasaPunitorios * ValorCuota - PunitoriosCobr
Donde:
	MesesAtraso 	= Cantidad de meses transcurridos desde el vencimiento de la cuota (aunque podría reducirse en el caso de que se haya indicado en algún mes que no se haya podido procesar el cobro por causas ajenas al deudor, en cuyo caso ese mes no se computa para la cantidad de meses de atraso).
	TasaPunitorios = La tasa mensual de intereses punitorios asignada. 
	ValorCuota 	= El valor de la cuota vencida impaga.	
	PunitoriosCobr = El importe de punitorios ya cobrado (en caso de que haya cobros parciales). 

3.2 – Pago Voluntario y otras líneas
Para las líneas de préstamos que NO están asociadas a procesos cobranzas mediante débito directo por CBU, se utiliza el siguiente cálculo:
a)	En el caso de que la línea de préstamos tenga especificada una Tasa de Punitorios Diaria:
Punitorios = DiasUltCobro *  TasaPunDiaria * Saldo
Donde:
	DiasUltCobro 	= Días transcurridos desde el vencimiento o la fecha de ultimo cobro en caso de cobros parciales.
	TasaPunDiaria 	= La tasa de punitorios diaria.
	Saldo 	= El saldo de la cuota impaga. 


b)	En el caso de que la línea de préstamos tenga especificada una Tasa de Punitorios Mensual:
Punitorios = MesesUltCobro *  TasaPunMensual * Saldo
Donde:
	MesesUltCobro 	= Días transcurridos desde el vencimiento o la fecha de ultimo cobro en caso de cobros parciales.
	TasaPunMensual 	= La tasa de punitorios mensual.
	Saldo 	= El saldo de la cuota impaga. 

4)	Fórmulas utilizadas para determinar Tasa Efectiva Anual (TEA)

A partir de la Tasa Nominal Anual, ya sea para Divisor=365 o para Divisor=360, el cálculo de Tasa Efectiva Anual es el siguiente:
TEM = TNA / Divisor * 30
TEA = ((1+Tasa_TEM) ^ Divisor/30) -1
IMPORTANTE:  Considerando que el VALOR CUOTA se redondea a números enteros sin decimales, la tasa TNA que se toma de la configuración de la línea de préstamos es una tasa “aproximada”, y para obtener las tasas exactas (Tanto TEM, TNA, TEA como CFT) se utiliza una interpolación por aproximaciones sucesivas tal como se explica en el caso siguiente para el CFT_TEM.  El mismo procedimiento se utiliza para obtener las tasas a partir del valor cuota cuando la línea de préstamos utilizada una tabla de valor cuota pre calculada.



5)	Fórmulas utilizadas para determinar Costo Financiero Total (CFT)

Considerando que no se aplican comisiones ni otros cargos mensuales, tales como gastos administrativos, seguros obligatorios, etcétera, que se adicionen a las obligaciones mensuales, el único elemento que se incorpora para determinar el “Costo Financiero Total” son los gastos de otorgamiento (en el caso que los hubiere) los cuales se descuentan del monto a desembolsar. 

Para determinar el CFT, expresado en términos efectivo anual, se está calculando así:

Paso 1 – Determinar la tasa periódica (mensual) equivalente para la cual se verifique en la fórmula de Valor Cuota de Sistema francés, que se obtiene el valor cuota del préstamo, pero considerando un capital prestado igual al monto neto desembolsado, es decir deduciendo los gastos de otorgamiento.

Se calcula por interpolación (aproximación en iteraciones sucesivas) el valor de CFT_TEM que satisfaga la siguiente igualdad:
	ValorCuota = (Capital-Gastos) * CFT_TEM / ( 1 – 1/(1+CFT_TEM)^CantCuotas)

Paso 2 – Expresar el CFT en términos efectivo anual.
Se convierte de CFT_TEM a CFT_TEA:
	CFT_TEA =  ((1+CFT_TEM)^Divisor/30) - 1






6)	Comisiones y Cargos Aplicados
No se aplican comisiones ni otros cargos mensuales.
En algunas líneas de préstamo se aplican Gastos de Otorgamiento, los cuales se determinan como un porcentaje del monto a desembolsar, y son descontados en el momento del desembolso del préstamo. 
