import axios from 'axios'
import info from "../../info.json";

export default {
  data() {
    return {
      //isConnWebSocket: false,
      isConnPOS: null, //<- Estado de la conexión
      messagePOS: '', //<- Mensaje del POS
      paymentPOS: '', //<- Monto de la venta
      isErrorPOS: false,
      // endTransactionPOS: false, //<- Fin de la transacción del POS
      messagePrinter: '',
      messageType: '',
      //isConnPOSX: false,
      isConnPrinter: false,
      //
      messageWebSocket: '', //<- Mensajes del websocket
      errorConnWebSocket: false, //<- Errores de impresora, conexión POS, internet
      isOutService: false, //<- Estado fuera de servicio
      info
    }
  },

  methods: {
    //imprimir voucher
    async imprimirVoucher(ballotValue, ticketsValue, codigoUnico) {
      console.log(
        '- methods:imprimirVoucher',
        'ballotValue {}' + ballotValue,
        'ticketsValue {}' + ticketsValue,
        'codigoUnico {}' + codigoUnico
      )
      console.log('ballotValue:', ballotValue)
      console.log('ticketsValue', ticketsValue)
      console.log('codigoUnico', codigoUnico)

      const realDate = ballotValue.realDate
      const formattedDate = `${realDate.slice(0, 2)}/${realDate.slice(2, 4)}/${realDate.slice(4)}`
      const realTime = ballotValue.realTime
      const formattedTime = `${realTime.slice(0, 2)}:${realTime.slice(2, 4)}:${realTime.slice(4)}`

      //voucher de compra en el POS
      const transaction_date = formattedDate
      const transaction_hour = formattedTime
      const amount = ballotValue.amount
      const commerce_code = ballotValue.commerceCode
      const terminal_id = ballotValue.terminalId
      const card_number = ballotValue.last4Digits
      const card_type = ballotValue.cardType
      const operation_number = ballotValue.operationNumber
      const auth_code = ballotValue.authorizationCode
      const account_number = ballotValue.accountNumber || '---'
      const codigo_unico = codigoUnico.toString()
      const tipo_cuota = ballotValue.shareType || 'SIN CUOTA'
      const numero_cuota = ballotValue.sharesNumber || '0'
      const monto_cuota = ballotValue.sharesAmount || '0'
      const comentario_cuota = ballotValue.sharesTypeComment || '---'

      const voucher =
        '           COMPROBANTE DE VENTA           \n' +
        '              PAGO EN CUOTAS              \n' +
        '            TARJETA DE CREDITO            \n' +
        '         INTEGRACIONES TRANSBANK          \n' +
        '              PULLMAN S.A.                \n' +
        `              ${commerce_code}            \n` +
        '                Santiago                  \n' +
        `              ${codigo_unico}             \n` +
        '     FECHA       HORA        TERMINAL     \n' +
        `   ${transaction_date}  ${transaction_hour}      ${terminal_id}\n` +
        '                                             \n' +
        `    NUMERO DE TARJETA                     \n` +
        `    ******${card_number}                   \n` +
        `    TIPO DE TARJETA               ${card_type}\n` +
        `    TOTAL:                        $${amount}\n` +
        `    NUMERO DE CUOTAS:             ${numero_cuota}\n` +
        `    TIPO DE CUOTAS:               ${tipo_cuota}\n` +
        `    MONTO CUOTA:                  $${monto_cuota}\n` +
        `    TASA DE INTERES:  ${comentario_cuota}\n` +
        `    NUMERO DE BOLETA:             ${account_number}\n` +
        `    NUMERO DE OPERACION:          ${operation_number}\n` +
        `    CODIGO DE AUTORIZACION:       ${auth_code}\n` +
        '                                             \n' +
        '          GRACIAS POR SU COMPRA           \n' +
        '  ACEPTO PAGAR SEGUN CONTRATO CON EMISOR  \n' +
        '                                             \n'

      let tickets = []
      console.log('+ methods:imprimirVoucher', '! Número de boletos ' + ticketsValue.length)

      // let today = this.today()
      for (let boleto of ticketsValue) {
        // boleto = JSON.parse(boleto)
        tickets.push({
          boleto: boleto.boleto,
          codigo: boleto.codigo,
          rut: '', //<- No se indica Rut en los boletos
          servicio: boleto.servicio,
          // ruta: this.buscarRuta(boleto.codigoTerminalOrigen, boleto.codigoTerminalDestino),
          ruta: `${boleto.origen} ${boleto.hora} - ${boleto.destino} ${boleto.fecha}`,
          piso: boleto.piso,
          asiento: boleto.asiento,
          fecha: boleto.fecha,
          // hora: boleto.hora.slice(0, 5),
          hora: boleto.hora,
          origen: boleto.origen,
          destino: boleto.destino,
          tipo_cliente: 'PULLMAN PASS',
          fecha_compra: boleto.fecha_compra,
          total: boleto.total
        })
      }

      // const url = 'https://192.168.88.246:3000'
      // const api = '/imprimir'

      const url = this.info.urlPrint
      const api = '/imprimir'

      // voucher transbank
      try {
        const response = await axios.post(url + api, {
          texto: voucher
        })
        console.log('Impresión enviada con éxito - transbank', response.data)
      } catch (error) {
        console.error('Error al enviar los datos de impresión', error)
      }

      // Todos los boletos
      let boletosTexto = ''
      for (const t of tickets) {
        let boletoTexto =
        '--------------- BOLETO PULLMAN --------------\n' +
        ` BOLETO:            ${t.boleto}\n` +
        ` SERVICIO:          ${t.servicio}\n` +
        ` RUTA: ${t.ruta}                 \n` +
        ` PISO:              ${t.piso}\n` +
        ` ASIENTO:           ${t.asiento}\n` +
        ` ORIGEN:            ${t.origen}\n` +
        ` DESTINO:           ${t.destino}\n` +
        ` TIPO CLIENTE:      ${t.tipo_cliente}\n` +
        ` FECHA COMPRA:      ${t.fecha_compra}\n` +
        ` HORA DE VIAJE:     ${t.hora}\n` +
        ` TOTAL:             $${t.total}\n` +
        '                              \n' +
        '                              \n' +
        '------------ TERMINOS Y CONDICIONES ---------\n' +
        'Este comprobante no es un pasaje\n' +
        'valido. Por favor acerquese a una de\n' +
        'nuestras sucursales con su Cedula de\n' +
        'Identidad o Pasaporte para imprimir el\n' +
        'pasaje para el Servicio proporcionado.\n' +
        '---------------------------------------------\n'

        boletosTexto += boletoTexto

        try {
          const response = await axios.post(url + api, {
            texto: boletoTexto
          })
          console.log(`Boleto ${t.boleto} enviado con éxito`, response.data)
        } catch (error) {
          console.error(`Error al imprimir boleto ${t.boleto}`, error)
        }
      }

      // ver boleta en browser
      // const previewWindow = window.open('', '_blank')
      // previewWindow.document.write(`
      //      <pre style="font-size:14px; white-space:pre-wrap;">
      //     ${voucher}${boletosTexto}</pre>
      // `)
      // previewWindow.document.close()

      console.log('+ methods:imprimirVoucher', 'voucher', voucher, 'tickets {}', boletosTexto, '-> /imprimir')
    },

    //imprimir voucher de error API Pullmam
    async imprimirVoucherError(ballotValue, codigoUnico) {
      console.log(
        '- methods:imprimirVoucher',
        '-> imprimirConectar',
        'ballotValue {}',
        ballotValue,
        'codigoUnico {}',
        codigoUnico
      )

      const realDate = ballotValue.realDate
      const formattedDate = `${realDate.slice(0, 2)}/${realDate.slice(2, 4)}/${realDate.slice(4)}`
      const realTime = ballotValue.realTime
      const formattedTime = `${realTime.slice(0, 2)}:${realTime.slice(2, 4)}:${realTime.slice(4)}`

      //voucher de compra en el POS
      const transaction_date = formattedDate
      const transaction_hour = formattedTime
      const amount = ballotValue.amount
      const commerce_code = ballotValue.commerceCode
      const terminal_id = ballotValue.terminalId
      const card_number = ballotValue.last4Digits
      const card_type = ballotValue.cardType
      const operation_number = ballotValue.operationNumber
      const auth_code = ballotValue.authorizationCode
      const account_number = ballotValue.accountNumber || '---'
      const codigo_unico = codigoUnico.toString()
      const tipo_cuota = ballotValue.shareType || 'SIN CUOTA'
      const numero_cuota = ballotValue.sharesNumber || '0'
      const monto_cuota = ballotValue.sharesAmount || '0'
      const comentario_cuota = ballotValue.sharesTypeComment || '---'

      // let tickets = [{ codigo: codigoUnico }]

      const voucher =
        '           COMPROBANTE DE VENTA           \n' +
        '              PAGO EN CUOTAS              \n' +
        '            TARJETA DE CREDITO            \n' +
        '         INTEGRACIONES TRANSBANK          \n' +
        '              PULLMAN S.A.                \n' +
        `              ${commerce_code}            \n` +
        '                Santiago                  \n' +
        `             ${codigo_unico}              \n` +
        '     FECHA       HORA        TERMINAL     \n' +
        `   ${transaction_date}  ${transaction_hour}      ${terminal_id}\n` +
        '                                             \n' +
        `    NUMERO DE TARJETA                     \n` +
        `    ******${card_number}                   \n` +
        `    TIPO DE TARJETA               ${card_type}\n` +
        `    TOTAL:                        $${amount}\n` +
        `    NUMERO DE CUOTAS:             ${numero_cuota}\n` +
        `    TIPO DE CUOTAS:               ${tipo_cuota}\n` +
        `    MONTO CUOTA:                  $${monto_cuota}\n` +
        `    TASA DE INTERES:  ${comentario_cuota}\n` +
        `    NUMERO DE BOLETA:             ${account_number}\n` +
        `    NUMERO DE OPERACION:          ${operation_number}\n` +
        `    CODIGO DE AUTORIZACION:       ${auth_code}\n` +
        '                                             \n' +
        '          GRACIAS POR SU COMPRA           \n' +
        '  ACEPTO PAGAR SEGUN CONTRATO CON EMISOR  \n' +
        '                                             \n'

      console.log(
        '+ methods:imprimirVoucher',
        '-> cable:perform:channel:action:print_error',
        'ballot {}',
        ballot,
        'tickets {}',
        tickets
      )

      // const url = 'https://192.168.88.246:3000'
      // const api = '/imprimir'

      const url = this.info.urlPrint
      const api = '/imprimir'

      try {
        const response = await axios.post(url + api, {
          texto: voucher
        })
        console.log('Error de impresión enviada con éxito', response.data)
      } catch (error) {
        console.error('Error al enviar el error de impresión', error)
      }
    }
  }
}

