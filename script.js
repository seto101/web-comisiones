// Función para formatear números como moneda
function formatoMoneda(valor) {
    return new Intl.NumberFormat('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(valor);
}

// Cálculo de ventas por punto de venta
function calcularVentasPorPunto() {
    // Obtener valores de cada punto de venta
    const puntosVenta = [
        { objetivo: 'objetivo_psf', ventas: 'ventas_psf', cumplimiento: 'cumplimiento_psf', comision: 'comision_psf' },
        { objetivo: 'objetivo_rs', ventas: 'ventas_rs', cumplimiento: 'cumplimiento_rs', comision: 'comision_rs' },
        { objetivo: 'objetivo_pg', ventas: 'ventas_pg', cumplimiento: 'cumplimiento_pg', comision: 'comision_pg' },
        { objetivo: 'objetivo_eb', ventas: 'ventas_eb', cumplimiento: 'cumplimiento_eb', comision: 'comision_eb' },
        { objetivo: 'objetivo_re', ventas: 'ventas_re', cumplimiento: 'cumplimiento_re', comision: 'comision_re' }
    ];

    let objetivoTotal = 0;
    let ventasTotal = 0;
    let comisionTotal = 0;

    // Calcular cumplimiento para cada punto y acumular totales
    puntosVenta.forEach(punto => {
        const objetivo = parseFloat(document.getElementById(punto.objetivo).value) || 0;
        const ventas = parseFloat(document.getElementById(punto.ventas).value) || 0;
        
        objetivoTotal += objetivo;
        ventasTotal += ventas;
        
        const cumplimiento = objetivo > 0 ? (ventas / objetivo * 100) : 0;
        document.getElementById(punto.cumplimiento).textContent = cumplimiento.toFixed(2) + '%';
        
        // Calcular comisión por punto de venta
        let comisionPunto = 0;
        if (cumplimiento < 100) {
            comisionPunto = 2;
        } else if (cumplimiento < 125) {
            comisionPunto = 4;
        } else if (cumplimiento < 150) {
            comisionPunto = 6;
        } else if (cumplimiento < 175) {
            comisionPunto = 8;
        } else {comisionPunto = 10;
        }
        
        document.getElementById(punto.comision).textContent = comisionPunto + '%';
        
        // Cambiar color según cumplimiento
        if (cumplimiento >= 100) {
            document.getElementById(punto.cumplimiento).style.backgroundColor = '#d4edda';
            document.getElementById(punto.comision).style.backgroundColor = '#d4edda';
        } else if (cumplimiento >= 80) {
            document.getElementById(punto.cumplimiento).style.backgroundColor = '#fff3cd';
            document.getElementById(punto.comision).style.backgroundColor = '#fff3cd';
        } else {
            document.getElementById(punto.cumplimiento).style.backgroundColor = '#f8d7da';
            document.getElementById(punto.comision).style.backgroundColor = '#f8d7da';
        }
        
        comisionTotal += (ventas * (comisionPunto / 100));
    });

    // Actualizar totales
    document.getElementById('objetivo_total').textContent = '$' + formatoMoneda(objetivoTotal);
    document.getElementById('ventas_totales').textContent = '$' + formatoMoneda(ventasTotal);
    document.getElementById('ventas_totales_resumen').textContent = '$' + formatoMoneda(ventasTotal);
    
    // Calcular cumplimiento global
    const cumplimientoGlobal = objetivoTotal > 0 ? (ventasTotal / objetivoTotal * 100) : 0;
    document.getElementById('cumplimiento_global').textContent = cumplimientoGlobal.toFixed(2) + '%';
    
    // Actualizar barra de progreso
    const barraProgreso = document.getElementById('barra_cumplimiento_global');
    barraProgreso.style.width = Math.min(cumplimientoGlobal, 200) + '%';
    barraProgreso.textContent = cumplimientoGlobal.toFixed(2) + '%';
    
    // Cambiar color de la barra según cumplimiento
    if (cumplimientoGlobal >= 100) {
        barraProgreso.style.backgroundColor = '#28a745';
    } else if (cumplimientoGlobal >= 80) {
        barraProgreso.style.backgroundColor = '#ffc107';
    } else {
        barraProgreso.style.backgroundColor = '#dc3545';
    }
    
    // Calcular porcentaje de comisión basado en cumplimiento global
    let porcentajeComision = 0;
    if (cumplimientoGlobal < 100) {
        porcentajeComision = 2;
    } else if (cumplimientoGlobal < 125) {
        porcentajeComision = 4;
    } else if (cumplimientoGlobal < 150) {
        porcentajeComision = 6;
    } else if (cumplimientoGlobal < 175) {
        porcentajeComision = 8;
    } else {
        porcentajeComision = 10;
    }
    
    document.getElementById('porcentaje_comision').textContent = porcentajeComision + '%';
    document.getElementById('comision_total_generada').textContent = '$' + formatoMoneda(comisionTotal);
    
    // Calcular utilidad y fondo de comisiones
    calcularUtilidad(ventasTotal);
}

// Cálculo de utilidad bruta
function calcularUtilidad(ventasTotal) {
    // Asegurarse de obtener el valor correcto de las ventas
    let ventas;
    
    // Si se pasa ventasTotal como parámetro, usar ese valor
    if (ventasTotal !== undefined) {
        ventas = ventasTotal;
    } else {
        // De lo contrario, intentar leerlo del elemento HTML, limpiando el formato
        const ventasTexto = document.getElementById('ventas_totales_resumen').textContent;
        ventas = parseFloat(ventasTexto.replace('$', '').replace(/\./g, '').replace(',', '.')) || 0;
    }
    
    // Obtener el costo y asegurarse que sea un número
    const costos = parseFloat(document.getElementById('costos_venta').value) || 0;
    
    // Calcular la utilidad (debe ser ventas - costos)
    const utilidad = ventas - costos;
    
    // Imprimir valores para debugging
    console.log('Ventas:', ventas);
    console.log('Costos:', costos);
    console.log('Utilidad calculada:', utilidad);
    
    // Mostrar la utilidad calculada
    document.getElementById('utilidad_bruta').textContent = '$' + formatoMoneda(utilidad);
    
    // Calcular fondo de comisiones solo con utilidad positiva
    const utilidadParaComisiones = Math.max(0, utilidad);
    const porcentajeComision = parseFloat(document.getElementById('porcentaje_comision').textContent) || 0;
    const fondoComisiones = utilidadParaComisiones * (porcentajeComision / 100);
    
    document.getElementById('fondo_comisiones').textContent = '$' + formatoMoneda(fondoComisiones);
    
    // Recalcular comisiones individuales
    calcularComisionesIndividuales();
}

// Calcular KPIs de Supervisor de Ventas
function calcularKpiVentas() {
    // Crecimiento en ventas
    const metaCrec = parseFloat(document.getElementById('meta_crec_ventas').value) || 0;
    const resultadoCrec = parseFloat(document.getElementById('resultado_crec_ventas').value) || 0;
    const cumplimientoCrec = metaCrec > 0 ? Math.min((resultadoCrec / metaCrec * 100), 200) : 0;
    document.getElementById('cumplimiento_crec_ventas').textContent = cumplimientoCrec.toFixed(2) + '%';
    document.getElementById('puntos_crec_ventas').textContent = (cumplimientoCrec * 0.3).toFixed(2);
    
    // Cumplimiento de metas del equipo
    const metaCumpl = parseFloat(document.getElementById('meta_cumpl_equipo').value) || 0;
    const resultadoCumpl = parseFloat(document.getElementById('resultado_cumpl_equipo').value) || 0;
    const cumplimientoCumpl = metaCumpl > 0 ? Math.min((resultadoCumpl / metaCumpl * 100), 200) : 0;
    document.getElementById('cumplimiento_cumpl_equipo').textContent = cumplimientoCumpl.toFixed(2) + '%';
    document.getElementById('puntos_cumpl_equipo').textContent = (cumplimientoCumpl * 0.2).toFixed(2);
    
    // Crecimiento valor ticket promedio
    const metaTicket = parseFloat(document.getElementById('meta_ticket_prom').value) || 0;
    const resultadoTicket = parseFloat(document.getElementById('resultado_ticket_prom').value) || 0;
    const cumplimientoTicket = metaTicket > 0 ? Math.min((resultadoTicket / metaTicket * 100), 200) : 0;
    document.getElementById('cumplimiento_ticket_prom').textContent = cumplimientoTicket.toFixed(2) + '%';
    document.getElementById('puntos_ticket_prom').textContent = (cumplimientoTicket * 0.2).toFixed(2);
    
    // Generación de contenido
    const metaContenido = parseFloat(document.getElementById('meta_contenido').value) || 0;
    const resultadoContenido = parseFloat(document.getElementById('resultado_contenido').value) || 0;
    const cumplimientoContenido = metaContenido > 0 ? Math.min((resultadoContenido / metaContenido * 100), 200) : 0;
    document.getElementById('cumplimiento_contenido').textContent = cumplimientoContenido.toFixed(2) + '%';
    document.getElementById('puntos_contenido').textContent = (cumplimientoContenido * 0.3).toFixed(2);
    
    // Calcular cumplimiento total
    const puntosTotal = 
        (cumplimientoCrec * 0.3) + 
        (cumplimientoCumpl * 0.2) + 
        (cumplimientoTicket * 0.2) + 
        (cumplimientoContenido * 0.3);
    
    document.getElementById('cumplimiento_total_ventas').textContent = puntosTotal.toFixed(2) + '%';
    document.getElementById('cumplimiento_total_ventas_resumen').textContent = puntosTotal.toFixed(2) + '%';
    
    // Actualizar barra de progreso
    const barraVentas = document.getElementById('barra_ventas');
    barraVentas.style.width = Math.min(puntosTotal, 200) + '%';
    barraVentas.textContent = puntosTotal.toFixed(2) + '%';
    
    if (puntosTotal >= 100) {
        barraVentas.style.backgroundColor = '#28a745';
    } else if (puntosTotal >= 80) {
        barraVentas.style.backgroundColor = '#ffc107';
    } else {
        barraVentas.style.backgroundColor = '#dc3545';
    }
    
    // Recalcular comisiones individuales
    calcularComisionesIndividuales();
}

// Calcular KPIs de Supervisor de Bodega
function calcularKpiBodega() {
    // Rotación de inventario (días) - KPI minimizador
    const metaRotacion = parseFloat(document.getElementById('meta_rotacion').value) || 0;
    const resultadoRotacion = parseFloat(document.getElementById('resultado_rotacion').value) || 0;
    
    let cumplimientoRotacion = 0;
    if (metaRotacion > 0) {
        if (resultadoRotacion <= metaRotacion) {
            // Si cumple o supera la meta (menos días es mejor)
            cumplimientoRotacion = 100;
        } else {
            // Si no alcanza la meta, calculamos porcentaje (limitado a 0% mínimo)
            const diferencia = resultadoRotacion - metaRotacion;
            const maxDiferencia = metaRotacion; // Asumimos que el doble del target es 0%
            cumplimientoRotacion = Math.max(0, 100 - (diferencia / maxDiferencia * 100));
        }
    }
    
    document.getElementById('cumplimiento_rotacion').textContent = cumplimientoRotacion.toFixed(2) + '%';
    document.getElementById('puntos_rotacion').textContent = (cumplimientoRotacion * 0.3).toFixed(2);
    
    // Tiempo de ingreso de mercadería (similar, también minimizador)
    const metaTiempo = parseFloat(document.getElementById('meta_tiempo_ingreso').value) || 0;
    const resultadoTiempo = parseFloat(document.getElementById('resultado_tiempo_ingreso').value) || 0;
    
    let cumplimientoTiempo = 0;
    if (metaTiempo > 0) {
        if (resultadoTiempo <= metaTiempo) {
            cumplimientoTiempo = 100;
        } else {
            const diferencia = resultadoTiempo - metaTiempo;
            const maxDiferencia = metaTiempo;
            cumplimientoTiempo = Math.max(0, 100 - (diferencia / maxDiferencia * 100));
        }
    }
    
    document.getElementById('cumplimiento_tiempo_ingreso').textContent = cumplimientoTiempo.toFixed(2) + '%';
    document.getElementById('puntos_tiempo_ingreso').textContent = (cumplimientoTiempo * 0.2).toFixed(2);
    
    // Optimización de compras
    const metaOptimizacion = parseFloat(document.getElementById('meta_optimizacion').value) || 0;
    const resultadoOptimizacion = parseFloat(document.getElementById('resultado_optimizacion').value) || 0;
    const cumplimientoOptimizacion = metaOptimizacion > 0 ? Math.min((resultadoOptimizacion / metaOptimizacion * 100), 200) : 0;
    document.getElementById('cumplimiento_optimizacion').textContent = cumplimientoOptimizacion.toFixed(2) + '%';
    document.getElementById('puntos_optimizacion').textContent = (cumplimientoOptimizacion * 0.2).toFixed(2);
    
    // Nivel de stock óptimo
    const metaStock = parseFloat(document.getElementById('meta_stock_optimo').value) || 0;
    const resultadoStock = parseFloat(document.getElementById('resultado_stock_optimo').value) || 0;
    const cumplimientoStock = metaStock > 0 ? Math.min((resultadoStock / metaStock * 100), 200) : 0;
    document.getElementById('cumplimiento_stock_optimo').textContent = cumplimientoStock.toFixed(2) + '%';
    document.getElementById('puntos_stock_optimo').textContent = (cumplimientoStock * 0.3).toFixed(2);
    
    // Calcular cumplimiento total
    const puntosTotal = 
        (cumplimientoRotacion * 0.3) + 
        (cumplimientoTiempo * 0.2) + 
        (cumplimientoOptimizacion * 0.2) + 
        (cumplimientoStock * 0.3);
    
    document.getElementById('cumplimiento_total_bodega').textContent = puntosTotal.toFixed(2) + '%';
    document.getElementById('cumplimiento_total_bodega_resumen').textContent = puntosTotal.toFixed(2) + '%';
    
    // Actualizar barra de progreso
    const barraBodega = document.getElementById('barra_bodega');
    barraBodega.style.width = Math.min(puntosTotal, 200) + '%';
    barraBodega.textContent = puntosTotal.toFixed(2) + '%';
    
    if (puntosTotal >= 100) {
        barraBodega.style.backgroundColor = '#28a745';
    } else if (puntosTotal >= 80) {
        barraBodega.style.backgroundColor = '#ffc107';
    } else {
        barraBodega.style.backgroundColor = '#dc3545';
    }
    
    // Recalcular comisiones individuales
    calcularComisionesIndividuales();
}

// Calcular KPIs de Auxiliar Contable
function calcularKpiContable() {
    // Precisión en registros contables
    const metaPrecision = parseFloat(document.getElementById('meta_precision').value) || 0;
    const resultadoPrecision = parseFloat(document.getElementById('resultado_precision').value) || 0;
    const cumplimientoPrecision = metaPrecision > 0 ? Math.min((resultadoPrecision / metaPrecision * 100), 200) : 0;
    document.getElementById('cumplimiento_precision').textContent = cumplimientoPrecision.toFixed(2) + '%';
    document.getElementById('puntos_precision').textContent = (cumplimientoPrecision * 0.3).toFixed(2);
    
    // Tiempo de procesamiento de pagos (minimizador)
    const metaProcPagos = parseFloat(document.getElementById('meta_proc_pagos').value) || 0;
    const resultadoProcPagos = parseFloat(document.getElementById('resultado_proc_pagos').value) || 0;
    
    let cumplimientoProcPagos = 0;
    if (metaProcPagos > 0) {
        if (resultadoProcPagos <= metaProcPagos) {
            cumplimientoProcPagos = 100;
        } else {
            const diferencia = resultadoProcPagos - metaProcPagos;
            const maxDiferencia = metaProcPagos;
            cumplimientoProcPagos = Math.max(0, 100 - (diferencia / maxDiferencia * 100));
        }
    }
    
    document.getElementById('cumplimiento_proc_pagos').textContent = cumplimientoProcPagos.toFixed(2) + '%';
    document.getElementById('puntos_proc_pagos').textContent = (cumplimientoProcPagos * 0.1).toFixed(2);
    
    // Gestión de anticipos y caja chica
    const metaCajaChica = parseFloat(document.getElementById('meta_caja_chica').value) || 0;
    const resultadoCajaChica = parseFloat(document.getElementById('resultado_caja_chica').value) || 0;
    const cumplimientoCajaChica = metaCajaChica > 0 ? Math.min((resultadoCajaChica / metaCajaChica * 100), 200) : 0;
    document.getElementById('cumplimiento_caja_chica').textContent = cumplimientoCajaChica.toFixed(2) + '%';
    document.getElementById('puntos_caja_chica').textContent = (cumplimientoCajaChica * 0.2).toFixed(2);
    
    // Detección de errores
    const metaDeteccion = parseFloat(document.getElementById('meta_deteccion').value) || 0;
    const resultadoDeteccion = parseFloat(document.getElementById('resultado_deteccion').value) || 0;
    const cumplimientoDeteccion = metaDeteccion > 0 ? Math.min((resultadoDeteccion / metaDeteccion * 100), 200) : 0;
    document.getElementById('cumplimiento_deteccion').textContent = cumplimientoDeteccion.toFixed(2) + '%';
    document.getElementById('puntos_deteccion').textContent = (cumplimientoDeteccion * 0.3).toFixed(2);
    
    // Informe de gastos mensual
    const metaInforme = parseFloat(document.getElementById('meta_informe').value) || 0;
    const resultadoInforme = parseFloat(document.getElementById('resultado_informe').value) || 0;
    const cumplimientoInforme = metaInforme > 0 ? Math.min((resultadoInforme / metaInforme * 100), 200) : 0;
    document.getElementById('cumplimiento_informe').textContent = cumplimientoInforme.toFixed(2) + '%';
    document.getElementById('puntos_informe').textContent = (cumplimientoInforme * 0.1).toFixed(2);
    
    // Calcular cumplimiento total
    const puntosTotal = 
        (cumplimientoPrecision * 0.3) + 
        (cumplimientoProcPagos * 0.1) + 
        (cumplimientoCajaChica * 0.2) + 
        (cumplimientoDeteccion * 0.3) + 
        (cumplimientoInforme * 0.1);
    
    document.getElementById('cumplimiento_total_contable').textContent = puntosTotal.toFixed(2) + '%';
    document.getElementById('cumplimiento_total_contable_resumen').textContent = puntosTotal.toFixed(2) + '%';
    
    // Actualizar barra de progreso
    const barraContable = document.getElementById('barra_contable');
    barraContable.style.width = Math.min(puntosTotal, 200) + '%';
    barraContable.textContent = puntosTotal.toFixed(2) + '%';
    
    if (puntosTotal >= 100) {
        barraContable.style.backgroundColor = '#28a745';
    } else if (puntosTotal >= 80) {
        barraContable.style.backgroundColor = '#ffc107';
    } else {
        barraContable.style.backgroundColor = '#dc3545';
    }
    
    // Recalcular comisiones individuales
    calcularComisionesIndividuales();
}

// Calcular KPIs de Asistente de Marketing
function calcularKpiMarketing() {
    // Cantidad de piezas de contenido
    const metaCantidad = parseFloat(document.getElementById('meta_cantidad_piezas').value) || 0;
    const resultadoCantidad = parseFloat(document.getElementById('resultado_cantidad_piezas').value) || 0;
    const cumplimientoCantidad = metaCantidad > 0 ? Math.min((resultadoCantidad / metaCantidad * 100), 200) : 0;
    document.getElementById('cumplimiento_cantidad_piezas').textContent = cumplimientoCantidad.toFixed(2) + '%';
    document.getElementById('puntos_cantidad_piezas').textContent = (cumplimientoCantidad * 0.2).toFixed(2);
    
    // Desarrollo de calendario de contenidos
    const metaCalendario = parseFloat(document.getElementById('meta_calendario').value) || 0;
    const resultadoCalendario = parseFloat(document.getElementById('resultado_calendario').value) || 0;
    const cumplimientoCalendario = metaCalendario > 0 ? Math.min((resultadoCalendario / metaCalendario * 100), 200) : 0;
    document.getElementById('cumplimiento_calendario').textContent = cumplimientoCalendario.toFixed(2) + '%';
    document.getElementById('puntos_calendario').textContent = (cumplimientoCalendario * 0.3).toFixed(2);
    
    // Crecimiento en redes
    const metaEngagement = parseFloat(document.getElementById('meta_engagement').value) || 0;
    const resultadoEngagement = parseFloat(document.getElementById('resultado_engagement').value) || 0;
    const cumplimientoEngagement = metaEngagement > 0 ? Math.min((resultadoEngagement / metaEngagement * 100), 200) : 0;
    document.getElementById('cumplimiento_engagement').textContent = cumplimientoEngagement.toFixed(2) + '%';
    document.getElementById('puntos_engagement').textContent = (cumplimientoEngagement * 0.2).toFixed(2);
    
    // Creatividad e innovación
    const metaCreatividad = parseFloat(document.getElementById('meta_creatividad').value) || 0;
    const resultadoCreatividad = parseFloat(document.getElementById('resultado_creatividad').value) || 0;
    const cumplimientoCreatividad = metaCreatividad > 0 ? Math.min((resultadoCreatividad / metaCreatividad * 100), 200) : 0;
    document.getElementById('cumplimiento_creatividad').textContent = cumplimientoCreatividad.toFixed(2) + '%';
    document.getElementById('puntos_creatividad').textContent = (cumplimientoCreatividad * 0.3).toFixed(2);
    
    // Calcular cumplimiento total
    const puntosTotal = 
        (cumplimientoCantidad * 0.2) + 
        (cumplimientoCalendario * 0.3) + 
        (cumplimientoEngagement * 0.2) + 
        (cumplimientoCreatividad * 0.3);
    
    document.getElementById('cumplimiento_total_marketing').textContent = puntosTotal.toFixed(2) + '%';
    document.getElementById('cumplimiento_total_marketing_resumen').textContent = puntosTotal.toFixed(2) + '%';
    
    // Actualizar barra de progreso
    const barraMarketing = document.getElementById('barra_marketing');
    barraMarketing.style.width = Math.min(puntosTotal, 200) + '%';
    barraMarketing.textContent = puntosTotal.toFixed(2) + '%';
    
    if (puntosTotal >= 100) {
        barraMarketing.style.backgroundColor = '#28a745';
    } else if (puntosTotal >= 80) {
        barraMarketing.style.backgroundColor = '#ffc107';
    } else {
        barraMarketing.style.backgroundColor = '#dc3545';
    }
    
    // Recalcular comisiones individuales
    calcularComisionesIndividuales();
}

// Calcular comisiones individuales
function calcularComisionesIndividuales() {
    const fondoComisiones = parseFloat(document.getElementById('fondo_comisiones').textContent.replace('$', '').replace(/,/g, '')) || 0;
    
    // Obtener cumplimientos
    const cumplimientoVentas = parseFloat(document.getElementById('cumplimiento_total_ventas').textContent) || 0;
    const cumplimientoBodega = parseFloat(document.getElementById('cumplimiento_total_bodega').textContent) || 0;
    const cumplimientoContable = parseFloat(document.getElementById('cumplimiento_total_contable').textContent) || 0;
    const cumplimientoMarketing = parseFloat(document.getElementById('cumplimiento_total_marketing').textContent) || 0;
    
    const totalCumplimiento = cumplimientoVentas + cumplimientoBodega + cumplimientoContable + cumplimientoMarketing;
    
    if (totalCumplimiento > 0) {
        // Calcular comisiones proporcionales
        const comisionVentas = fondoComisiones * (cumplimientoVentas / totalCumplimiento);
        const comisionBodega = fondoComisiones * (cumplimientoBodega / totalCumplimiento);
        const comisionContable = fondoComisiones * (cumplimientoContable / totalCumplimiento);
        const comisionMarketing = fondoComisiones * (cumplimientoMarketing / totalCumplimiento);
        
        // Actualizar los valores en el documento
        document.getElementById('comision_supervisor_ventas').textContent = '$' + formatoMoneda(comisionVentas);
        document.getElementById('comision_supervisor_bodega').textContent = '$' + formatoMoneda(comisionBodega);
        document.getElementById('comision_auxiliar_contable').textContent = '$' + formatoMoneda(comisionContable);
        document.getElementById('comision_asistente_marketing').textContent = '$' + formatoMoneda(comisionMarketing);
        
        // Actualizar resumen final
        document.getElementById('comision_total_ventas').textContent = '$' + formatoMoneda(comisionVentas);
        document.getElementById('comision_total_bodega').textContent = '$' + formatoMoneda(comisionBodega);
        document.getElementById('comision_total_contable').textContent = '$' + formatoMoneda(comisionContable);
        document.getElementById('comision_total_marketing').textContent = '$' + formatoMoneda(comisionMarketing);
        document.getElementById('total_comisiones').textContent = '$' + formatoMoneda(comisionVentas + comisionBodega + comisionContable + comisionMarketing);
    }
}

// Función para guardar datos en localStorage
function guardarLocalStorage() {
    // Crear un objeto para almacenar todos los datos
    let datos = {};
    
    // Recopilar todos los inputs y sus valores
    document.querySelectorAll('input').forEach(input => {
        datos[input.id] = input.value;
    });
    
    // Guardar en localStorage
    localStorage.setItem('datosComisiones', JSON.stringify(datos));
    
    alert('Datos guardados correctamente');
}

// Función para cargar datos desde localStorage
function cargarLocalStorage() {
    // Recuperar datos
    const datos = JSON.parse(localStorage.getItem('datosComisiones'));
    
    if (datos) {
        // Aplicar valores a los inputs
        Object.keys(datos).forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.value = datos[id];
            }
        });
        
        // Recalcular todo
        calcularTodo();
        
        alert('Datos cargados correctamente');
    } else {
        alert('No hay datos guardados');
    }
}

// Función para calcular todo
function calcularTodo() {
    calcularVentasPorPunto();
    calcularKpiVentas();
    calcularKpiBodega();
    calcularKpiContable();
    calcularKpiMarketing();
}

// Inicializar al cargar la página
window.onload = function() {
    // Intentar cargar datos guardados
    if (localStorage.getItem('datosComisiones')) {
        cargarLocalStorage();
    }
};