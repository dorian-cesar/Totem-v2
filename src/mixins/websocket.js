import axios from 'axios'
import info from '../../info.json'
import { logoData } from '../lib/logo.js'

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
    formatBoleto(t) {
      return (
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
      )
    },

    generatePrintCommand(content, boletos, withLogo = true) {
      function appendBytes(arr1, arr2) {
        const merged = new Uint8Array(arr1.length + arr2.length)
        merged.set(arr1)
        merged.set(arr2, arr1.length)
        return merged
      }

      const encoder = new TextEncoder()
      let escPos = new Uint8Array(0)

      function feedAndCut() {
        let seq = new Uint8Array(0)
        seq = appendBytes(seq, encoder.encode('\n\n\n\n'))
        seq = appendBytes(seq, new Uint8Array([0x1D, 0x56, 0x00]))
        return seq
      }

      function addLogo() {
        let seq = new Uint8Array(0)
        seq = appendBytes(seq, new Uint8Array([0x1B, 0x61, 0x00])) // Clean alignment state
        seq = appendBytes(seq, new Uint8Array([0x1B, 0x61, 0x01])) // Center
        if (logoData && logoData.length > 0) {
          seq = appendBytes(seq, logoData)
        }
        seq = appendBytes(seq, new Uint8Array([0x00, 0x00, 0x00, 0x00])) // Buffer null bytes
        seq = appendBytes(seq, encoder.encode('\n'))
        seq = appendBytes(seq, new Uint8Array([0x1B, 0x61, 0x00])) // Reset to Left
        return seq
      }

      // Initialize printer
      escPos = appendBytes(escPos, new Uint8Array([0x1B, 0x40]))
      // Send some null bytes and multiple newlines for stability
      escPos = appendBytes(escPos, new Uint8Array([0x00, 0x00, 0x00, 0x00]))
      escPos = appendBytes(escPos, encoder.encode('\n\n\n\n'))
      // Explicitly set alignment to Left
      escPos = appendBytes(escPos, new Uint8Array([0x1B, 0x61, 0x00]))

      // Print Voucher
      if (content) {
        escPos = appendBytes(escPos, encoder.encode(content))
        escPos = appendBytes(escPos, feedAndCut())
      }

      // Print Boletos
      if (boletos && boletos.length > 0) {
        for (const boleto of boletos) {
          if (withLogo) {
            escPos = appendBytes(escPos, addLogo())
          }
          escPos = appendBytes(escPos, encoder.encode(boleto))
          escPos = appendBytes(escPos, feedAndCut())
        }
      }

      return escPos
    },

    uint8ToBase64(uint8arr) {
      let binary = ''
      for (let i = 0; i < uint8arr.length; i++) {
        binary += String.fromCharCode(uint8arr[i])
      }
      return btoa(binary)
    },

    async imprimirRawBT(voucher, boletos, withLogo = true) {
      try {
        const escPosData = this.generatePrintCommand(voucher, boletos, withLogo)
        const base64Content = this.uint8ToBase64(escPosData)
        const rawbtUrl = `rawbt:base64,${base64Content}`
        
        console.log('Enviando a RawBT...')
        window.location.href = rawbtUrl
      } catch (error) {
        console.error('Error al imprimir - imprimirRawBT: ', error)
      }
    },

    async imprimirErrorRawBT(voucher) {
      try {
        const escPosData = this.generatePrintCommand(voucher, null, false)
        const base64Content = this.uint8ToBase64(escPosData)
        const rawbtUrl = `rawbt:base64,${base64Content}`
        
        window.location.href = rawbtUrl
      } catch (error) {
        console.error('Error al imprimir - imprimirErrorRawBT: ', error)
      }
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
        '                                             \n' +
        '                                             \n' +
        '              COMPROBANTE DE VENTA           \n' +
        '                 PAGO EN CUOTAS              \n' +
        '               TARJETA DE CREDITO            \n' +
        '            INTEGRACIONES TRANSBANK          \n' +
        '                 PULLMAN S.A.                \n' +
        '     Nicasio Retamales 71, Estacion Central  \n' +
        `                 ${commerce_code}            \n` +
        '                   Santiago                  \n' +
        `                    ${codigo_unico}          \n` +
        '        FECHA       HORA        TERMINAL     \n' +
        `        ${transaction_date}    ${transaction_hour}       ${terminal_id}\n` +
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
        const isDev = false // Cambiado a false para usar producción

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

      // voucher transbank
      // try {
      //   await this.imprimirRawBT(voucher)
      //   // await this.delay(5000)
      //   console.log('Impresión enviada con éxito - transbank')
      // } catch (error) {
      //   console.error('Error al enviar los datos de impresión', error)
      // }

      // Todos los boletos
      let boletosArray = []
      for (const t of tickets) {
        boletosArray.push(this.formatBoleto(t))
      }

      // Enviar todo en una sola impresión
      try {
        await this.imprimirRawBT(voucher, boletosArray)
        console.log('Comprobante y boletos enviados con éxito a RawBT')
      } catch (error) {
        console.error('Error al imprimir con RawBT', error)
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
        '                                             \n' +
        '                                             \n' +
        '              COMPROBANTE DE VENTA           \n' +
        '                 PAGO EN CUOTAS              \n' +
        '               TARJETA DE CREDITO            \n' +
        '            INTEGRACIONES TRANSBANK          \n' +
        '                 PULLMAN S.A.                \n' +
        '     Nicasio Retamales 71, Estacion Central  \n' +
        `                 ${commerce_code}            \n` +
        '                   Santiago                  \n' +
        `                    ${codigo_unico}          \n` +
        '        FECHA       HORA        TERMINAL     \n' +
        `        ${transaction_date}    ${transaction_hour}       ${terminal_id}\n` +
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

      try {
        await this.imprimirErrorRawBT(voucher)
        console.log('Error de impresión enviada con éxito')
      } catch (error) {
        console.error('Error al enviar el error de impresión', error)
      }
    }
  }
}
