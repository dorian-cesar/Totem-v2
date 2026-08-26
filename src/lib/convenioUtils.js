/**
 * convenioUtils.js
 * Funciones auxiliares para aplicar descuentos de convenios.
 *
 * Tipos de descuento soportados:
 *   - "Porcentaje"  : precio_final = precio_base * (1 - valor/100)
 *   - "Tarifa Plana": precio_final = precio fijo de la configuración de ruta
 *   - "Monto Fijo"  : precio_final = max(0, precio_base - valor)
 */

/**
 * Aplica el descuento de un convenio a un precio base.
 *
 * @param {number} precioBase - Precio base en pesos (número entero)
 * @param {object|null} convenio - Objeto convenio guardado en Vuex (convenioSeleccionado)
 * @param {string|number} origenCodigo - Código GDS de la ciudad de origen
 * @param {string|number} destinoCodigo - Código GDS de la ciudad de destino
 * @returns {{
 *   precioFinal: number,
 *   precioOriginal: number,
 *   tieneDescuento: boolean,
 *   textoDescuento: string,
 *   seatLimit: number|null
 * }}
 */
export function aplicarDescuentoConvenio(precioBase, convenio, origenCodigo = '', destinoCodigo = '') {
  const resultado = {
    precioFinal: precioBase,
    precioOriginal: precioBase,
    tieneDescuento: false,
    textoDescuento: '',
    seatLimit: null // null = sin límite especial
  }

  if (!convenio || !convenio.tipo_descuento) return resultado

  const valorDescuento = Number(convenio.valor_descuento) || 0
  const tipo = String(convenio.tipo_descuento)

  switch (tipo) {
    case 'Porcentaje': {
      const descuento = Math.round(precioBase * (valorDescuento / 100))
      resultado.precioFinal = Math.max(0, precioBase - descuento)
      resultado.tieneDescuento = resultado.precioFinal !== precioBase
      resultado.textoDescuento = `${valorDescuento}% de descuento`
      break
    }

    case 'Tarifa Plana': {
      const rutas = Array.isArray(convenio.rutas) ? convenio.rutas : []
      const rutaCoincide = rutas.find(
        (r) =>
          String(r.origen_codigo) === String(origenCodigo) &&
          String(r.destino_codigo) === String(destinoCodigo)
      )

      let precioTarifa = valorDescuento
      let limitePasajes = 1

      if (rutaCoincide && Array.isArray(rutaCoincide.configuraciones) && rutaCoincide.configuraciones.length > 0) {
        const config = rutaCoincide.configuraciones[0]
        precioTarifa = config.precio_solo_ida != null ? Number(config.precio_solo_ida) : valorDescuento
        limitePasajes = config.max_pasajes != null ? Number(config.max_pasajes) : 1
      }

      resultado.precioFinal = precioTarifa
      resultado.tieneDescuento = resultado.precioFinal !== precioBase
      resultado.textoDescuento = `Tarifa convenio: $${precioTarifa.toLocaleString('es-CL')}`
      resultado.seatLimit = limitePasajes
      break
    }

    case 'Monto Fijo': {
      resultado.precioFinal = Math.max(0, precioBase - valorDescuento)
      resultado.tieneDescuento = resultado.precioFinal !== precioBase
      resultado.textoDescuento = `Descuento fijo: $${valorDescuento.toLocaleString('es-CL')}`
      break
    }

    default:
      break
  }

  return resultado
}

/**
 * Retorna el conjunto de códigos de ciudad válidos para un convenio con rutas específicas.
 * Si el convenio no tiene rutas, devuelve un array vacío (sin restricción).
 *
 * @param {object|null} convenio
 * @returns {string[]} Códigos de ciudad válidos (union de origenes y destinos)
 */
export function getCiudadesConvenio(convenio) {
  if (!convenio || !Array.isArray(convenio.rutas) || convenio.rutas.length === 0) {
    return []
  }

  const codigos = new Set()
  for (const ruta of convenio.rutas) {
    if (ruta.origen_codigo) codigos.add(String(ruta.origen_codigo))
    if (ruta.destino_codigo) codigos.add(String(ruta.destino_codigo))
  }
  return [...codigos]
}
