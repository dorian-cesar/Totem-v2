import axios from 'axios'
import info from '../../info.json'

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
    // endpoint para imprimir
    async imprimirRawBT(texto) {
      try {
        const response = await axios.post(this.info.urlPrint, {
          content: texto
        })
        const result = response.data
        if (result.rawbt) {
          const iframe = document.createElement('iframe')
          iframe.style.display = 'none'
          iframe.src = result.rawbt
          document.body.appendChild(iframe)
          setTimeout(() => {
            document.body.removeChild(iframe)
          }, 5000)
        }
      } catch (error) {
        console.error('Error al imprimir - imprimirRawBT: ', error)
      }
    },
    // delay para imprimir
    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms))
    },
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
        '  Nicasio Retamales 71, Estacion Central  \n' +
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
        // console.log('boleto', boleto)
        // --- API booking_details ---
        const isDev = true // Cambia esto a false para usar producción

        const proxy = isDev
          ? 'https://newstg3-gdsbus.kupos.cl' // API desarrollo
          : 'https://gds.kupos.com' // API producción

        const API_KEY = isDev
          ? 'TSXFQYAPI25766888' // Dev key
          : 'TSSDFPAPI30103014' // Prod key

        const params = new URLSearchParams({
          region: 'chile',
          pnr_number: boleto.boleto,
          api_key: API_KEY
        })

        const bookingDetailsURL = `${proxy}/gds/api/booking_details.json?${params.toString()}`

        let operator_pnr = null
        try {
          const response = await axios.get(bookingDetailsURL)
          // console.log('response booking_details:', response.data)
          operator_pnr = response.data.result.ticket_details[0].operator_pnr
          console.log('response operator_pnr:', operator_pnr)
        } catch (error) {
          console.error('Error al obtener booking_details:', error)
        }

        tickets.push({
          boleto: boleto.boleto,
          codigo: boleto.codigo,
          codigo_reserva: operator_pnr,
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

      // const url = this.info.urlPrint
      // const api = '/print'

      // voucher transbank
      try {
        await this.imprimirRawBT(voucher)
        await this.delay(1000)
        console.log('Impresión enviada con éxito - transbank')
      } catch (error) {
        console.error('Error al enviar los datos de impresión', error)
      }

      // Todos los boletos
      let boletosTexto = ''
      for (const t of tickets) {
        let boletoTexto =
          '--------------- BOLETO PULLMAN --------------\n' +
          ` BOLETO:            ${t.codigo_reserva}\n` +
          ` CODIGO DE RESERVA: ${t.boleto}\n` +
          ` SERVICIO:          ${t.servicio}\n` +
          ` RUTA: ${t.ruta}                 \n` +
          ` PISO:              ${t.piso}\n` +
          ` ASIENTO:           ${t.asiento}\n` +
          ` ORIGEN:            ${t.origen}\n` +
          ` DESTINO:           ${t.destino}\n` +
          ` FECHA COMPRA:      ${t.fecha_compra}\n` +
          ` HORA DE VIAJE:     ${t.hora}\n` +
          ` TOTAL:             $${t.total}\n` +
          '                              \n' +
          '                              \n' +
          '----------- TERMINOS Y CONDICIONES ---------\n' +
          '            GRACIAS POR SU COMPRA\n' +
          '                COPIA CLIENTE\n' +
          '       BOLETO VALIDO PARA PASAJE EN BUS\n' +
          '---------------------------------------------\n'

        boletosTexto += boletoTexto

        // boleto
        try {
          await this.imprimirRawBT(boletoTexto)
          await this.delay(1000)
          console.log(`Boleto ${t.boleto} enviado con éxito`)
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
        '  Nicasio Retamales 71, Estacion Central  \n' +
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

      console.log(
        '+ methods:imprimirVoucher',
        '-> cable:perform:channel:action:print_error',
        'ballot {}',
        ballot,
        'tickets {}',
        tickets
      )

      // const url = this.info.urlPrint
      // const api = '/print'

      try {
        await this.imprimirRawBT(voucher)
        await this.delay(1000)
        console.log('Error de impresión enviada con éxito')
      } catch (error) {
        console.error('Error al enviar el error de impresión', error)
      }
    }
  }
}

