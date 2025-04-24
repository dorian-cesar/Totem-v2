export default {

  data() {
    return {
      //isConnWebSocket: false,
      isConnPOS: null, //<- Estado de la conexión
      messagePOS: '',//<- Mensaje del POS
      paymentPOS: '',//<- Monto de la venta
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
    }
  },

  methods: {
    //Fecha de hoy
    today() {
      let date = new Date()
      let day = (date.getDate().toString().length === 1) ? '0' + date.getDate() : date.getDate()
      let month = ((date.getMonth() + 1).toString().length === 1) ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)
      let year = date.getFullYear()

      return [day, month, year].join('/')
    },
    //inicialización de variables
    initVar() {
      this.isConn = false
      this.messagePOS = ''
      this.paymentPOS = ''
      this.isErrorPOS = false
      this.endTransactionPOS = false
      console.log('- methods:initVar', 'isConn = '+ this.isConn, 'messagePOS = ' + this.messagePOS, 'paymentPOS = ' + this.paymentPOS, 'isErrorPOS = ' + this.isErrorPOS, 'endTransactionPOS = ' + this.endTransactionPOS)
      //this.isconnPOSX = false
      //this.isConnPrinter = false
    },
    // //Suscribirse al channel Printer
    // imprimirConectar() {
    //   console.log('- methods:imprimirConectar', 'isConnPrinter = ' + this.isConnPrinter)
    //   if (this.isConnPrinter != true) {
    //     console.log('+ methods:imprimirConectar', '-> cable:subscribe:channel:Printer')
    //     this.$cable.subscribe({channel: 'Printer', room: 'printer'}, 'Printer')
    //   }
    // },
    //comprobar el estatus de la impresora
    // estatusImpresora() {
    //   console.log('- methods:estatusImpresora', '-> methods:imprimirConecta', '-> cable:perform:channel:Printer:action:status_print')
    //   //verificar si esta Conectado al websocket la impresora
    //   this.imprimirConectar()
    //   // Enviar comando al websocket
    //   this.$cable.perform({channel: 'Printer', action: 'status_print'}, 'Printer')
    // },
    //inicializar los errores y mensajes
    // initErrorAndMsg() {
    //   this.isOutService = false
    //   this.errorConnWebSocket = false
    //   this.messageWebSocket = ''
    //   console.log('- methods:initErrorAndMsg', 'isOutService = ' + this.isOutService, 'errorConnWebSocket = ' + this.errorConnWebSocket, 'messageWebSocket = ' + this.messageWebSocket)
    // },
    //verificar estado de la impresora, el POS, e internet
    // checkStatusConn() {
    //   this.initErrorAndMsg()
    //   this.estatusImpresora()
    // },
    //suscribirse al channel Transbank
    // websocketConectar() {
    //   console.log('- methods:websocketConectar', 'isConnPrinter = ' + this.isConnPrinter)
    //   if (this.isConnPOS != true) {
    //     console.log('+ methods:websocketConectar', '-> cable:subscribe:channel:Transbank')
    //     this.$cable.subscribe({channel: 'Transbank', room: 'transbank'}, 'Transbank')
    //   }
    // },
    //comprobar si el cable del POS está conectado
    // estatusCablePOS() {
    //   console.log('- methods:estatusCablePOS', '-> websocketConectar', '-> cable:perform:channel:Transbank:action:status_cable_pos')
    //   this.websocketConectar()
    //   this.$cable.perform({channel: 'Transbank', action: 'status_cable_pos'}, 'Transbank')
    // },
    // //comprobar si el POS está conectado
    // estatusConnPOS() {
    //   console.log('- methods:estatusConnPOS', '-> websocketConectar', '-> cable:perform:channel:Transbank:action:status_conn_pos')
    //   this.websocketConectar()
    //   this.$cable.perform({channel: 'Transbank', action: 'status_conn_pos'}, 'Transbank')
    // },
    // //verificar estatus de la impresora
    // estatusInternet() {
    //   console.log('- methods:estatusInternet', '-> websocketConectar', '-> cable:perform:channel:Transbank:action:status_conn_pos')
    //   this.websocketConectar()
    //   this.$cable.perform({channel: 'Transbank', action: 'status_internet'}, 'Transbank')
    // },
    // //cancelar suscripción a channel Printer
    // imprimirDesconectar() {
    //   console.log('- methods:imprimirDesconectar', '-> cable:unsubscribe:channel:Printer')
    //   this.$cable.unsubscribe({channel: 'Printer'}, 'Printer')
    // },
    //cancelar suscripción a channel Transbank
    // websocketDesconectar() {
    //   console.log('- methods:websocketDesconectar', '-> cable:unsubscribe:channel:Transbank')
    //   this.$cable.unsubscribe({channel: 'Transbank'}, 'Transbank')
    // },
    //Realizar el pago en el POS
    // sendNewSale(value, ballotNumber) {
    //   console.log('- methods:sendNewSale', '-> methods:initVar', '->  cable:perform:channel:Transbank:action:send_new_sale')
    //   this.initVar()
    //   this.$cable.perform({
    //     channel: 'Transbank',
    //     action: 'send_new_sale',
    //     data: {
    //       message: {
    //         value: value,
    //         ballot_number: ballotNumber
    //       }
    //     }
    //   }, 'Transbank')
    // },
    //imprimir voucher
    imprimirVoucher(ballotValue, ticketsValue, codigoUnico) {
      // this.imprimirConectar()
      console.log('- methods:imprimirVoucher', 'ballotValue {}' + ballotValue, 'ticketsValue {}' + ticketsValue, 'codigoUnico {}' + codigoUnico)

      //voucher de compra en el POS
      const ballot = {
        transaction_date: ballotValue.transaction_date,
        transaction_hour: ballotValue.transaction_hour,
        amount: ballotValue.amount,
        date_count: ballotValue.date_count,
        payment_type: ballotValue.payment_type,
        card_type: ballotValue.card_type,
        ballot_number: 'U18.1L3',
        commerce_code: ballotValue.commerce_code,
        terminal_id: ballotValue.terminal_id,
        card_number: ballotValue.card_number,
        account_number: ballotValue.account_number,
        operation_number: ballotValue.operation_number,
        auth_code: ballotValue.auth_code,
        codigo_unico: codigoUnico.toString(),
        tipo_cuota: ('' === ballotValue.tipo_cuota) ? 'SIN CUOTA' : ballotValue.tipo_cuota,
        numero_cuota: ('00' === ballotValue.numero_cuota) ? '0' : ballotValue.numero_cuota,
        monto_cuota: ('' === ballotValue.monto_cuota) ? '0' : ballotValue.monto_cuota
      }

      let tickets = [];
      console.log('+ methods:imprimirVoucher','! Número de boletos ' + ticketsValue.length)

      let today = this.today()
      for (let boleto of ticketsValue) {
        boleto = JSON.parse(boleto)
        tickets.push({
          boleto: boleto.boleto,
          codigo: boleto.codigoTransaccion,
          rut: '',//<- No se indica Rut en los boletos
          servicio: boleto.nombreClase,
          ruta: this.buscarRuta(boleto.codigoTerminalOrigen, boleto.codigoTerminalDestino),
          piso: boleto.piso,
          asiento: boleto.asiento,
          fecha: boleto.fechaSalida,
          hora: boleto.horaSalida.slice(0, 5),
          origen: boleto.nombreTerminalOrigen,
          destino: boleto.nombreTerminalDestino,
          tipo_cliente: 'PULLMAN PASS',
          fecha_compra: today,
          total: boleto.total
        })
      }

      console.log('+ methods:imprimirVoucher', 'ballot {}', ballot, 'tickets {}', tickets, '-> cable:.perform:channel:Printer')

      // implementar logica de impresion

      // this.$cable.perform({
      //   channel: 'Printer',
      //   action: 'print',
      //   data: {
      //     sheet: {
      //       ballot: ballot,
      //       tickets: tickets
      //     }
      //   }
      // }, 'Printer')
    },
    //imprimir voucher de error API Pullmam
    imprimirVoucherError(ballotValue, codigoUnico) {
      console.log('- methods:imprimirVoucher','-> imprimirConectar', 'ballotValue {}', ballotValue, 'codigoUnico {}', codigoUnico)

      // this.imprimirConectar()

      //voucher de compra en el POS
      const ballot = {
        transaction_date: ballotValue.transaction_date,
        transaction_hour: ballotValue.transaction_hour,
        amount: ballotValue.amount,
        date_count: ballotValue.date_count,
        payment_type: ballotValue.payment_type,
        card_type: ballotValue.card_type,
        ballot_number: 'U18.1L3',
        commerce_code: ballotValue.commerce_code,
        terminal_id: ballotValue.terminal_id,
        card_number: ballotValue.card_number,
        account_number: ballotValue.account_number,
        operation_number: ballotValue.operation_number,
        auth_code: ballotValue.auth_code,
        codigo_unico: codigoUnico,
        tipo_cuota: ('' === ballotValue.tipo_cuota) ? 'SIN CUOTA' : ballotValue.tipo_cuota,
        numero_cuota: ('00' === ballotValue.numero_cuota) ? '0' : ballotValue.numero_cuota,
        monto_cuota: ('' === ballotValue.monto_cuota) ? '0' : ballotValue.monto_cuota
      }

      let tickets = [{codigo: codigoUnico}]

      console.log('+ methods:imprimirVoucher','-> cable:perform:channel:action:print_error','ballot {}', ballot, 'tickets {}', tickets)

      this.$cable.perform({
        channel: 'Printer',
        action: 'print_error',
        data: {
          sheet: {
            ballot: ballot,
            tickets: tickets
          }
        }
      }, 'Printer')
    },
  },

  // channels: {
  //   //channel Transbank
  //   Transbank: {
  //     connected() {
  //       this.isConnPOS = true
  //       console.log('- channels:Transbank:connected', 'isConnPOS=' + this.isConnPOS)
  //     },
  //     rejected() {
  //       console.log('- channels:rejected')
  //     },
  //     received(dataTransbank) {
  //       this.messageWebSocket = dataTransbank //<- Mensaje del channel Transbank
  //       console.log('- channels:Transbank:received', 'messageWebSocket.type=' + this.messageWebSocket.type, 'messageWebSocket.msg=' + this.messageWebSocket.msg)
  //     },
  //     disconnected() {
  //       this.isConnPOS = false
  //       //this.isConnPOSX = false
  //       console.log('- channels:Transbank:disconnected', 'this.isConnPOS=' + this.isConnPOS)
  //     },
  //     stopped() {
  //       this.isConnPOS = false
  //       console.log('- channels:Transbank:stopped', 'this.isConnPOS=' + this.isConnPOS)
  //     }
  //   },

    // //channel Printer
    // Printer: {
    //   connected() {
    //     this.isConnPrinter = true
    //     console.log('- channel:Printer:connected', 'isConnPrinter=' + this.isConnPrinter)
    //   },
    //   rejected() {
    //     console.log('- channel:Printer:rejected')
    //   },
    //   received(dataPrinter) {
    //     this.messageWebSocket = dataPrinter //<- Mensaje del channel Printer
    //     console.log('- channel:Printer:received', 'messageWebSocket.type=' + this.messageWebSocket.type, 'messageWebSocket.msg=' + this.messageWebSocket.msg)
    //   },
    //   disconnected() {
    //     this.isConnPrinter = false
    //     console.log('- channel:Printer:disconnected', 'isConnPrinter=' + this.isConnPrinter)
    //   },
    //   stopped() {
    //     console.log('- channel:Printer:stopped')
    //   }
    // }
  // },

  // mounted() {
  //   console.log('- mounted', '-> methods:websocketConectar','-> methods:imprimirConectar')
  //   this.websocketConectar()
  //   this.imprimirConectar()
  //   this.isConnWebSocket = !this.$cable._cable.connection.disconnected //<- Verifica si está conectado
  // },

  // watch: {
    //Estado de la conexión channel Transbank
    // isConn: function (val) {
    // isConnPOS: function (val) {
    //   console.log('- watch:isConnPOS', 'isConnPOS=' + val)
    //   if (!val) {
    //     console.log('+ watch:isConnPOS', '! POS No Conectado')
    //     this.websocketConectar()//<- Conectar el POS al Socket
    //     console.log('+ watch:isConnPOS', '! Intentando Conectar POS')
    //   } else {
    //     console.log('+ watch:isConnPOS', '! POS Conectado')
    //   }
    // },
    // Estado de la conexión channel impresora
    // isConnPrinter: function (val) {
    //   console.log('- watch:isConnPrinter', 'isConnPrinter=' + val)
    //   if (!val) {
    //     console.log('+ watch:isConnPrinter', '! Impresora No Conectada')
    //     this.websocketConectar()
    //     console.log('+ watch:isConnPrinter', '-> websocketConectar')
    //   } else {
    //     console.log('+ watch:isConnPrinter', '! Impresora Conectada')
    //   }
    // },
    // Monitoreo de los mensajes del websocket
    // messageWebSocket: function () {
    //   console.log('- watch:messageWebSocket', 'messageWebSocket.type=' + this.messageWebSocket.type, 'messageWebSocket.msg=' + this.messageWebSocket.msg)
    //   if (this.messageWebSocket.type !== undefined) {
    //     // Verificar el tipo de error
    //     if (['status_conn_POS', 'status_cable_POS', 'status_internet', 'status_printer'].indexOf(this.messageWebSocket.type) > -1) {
    //       // verificar si hay error
    //       this.errorConnWebSocket = ('OK' !== this.messageWebSocket.msg)
    //       if (!this.errorConnWebSocket) {//<-Pasa si no hay error
    //         // verificar el tipo de error
    //         switch (this.messageWebSocket.type) {
    //           case 'status_printer': {
    //             console.log('+ watch:messageWebSocket status_printer', '-> estatusCablePOS')
    //             // Verificar si el cable del POS está conectado
    //             this.estatusCablePOS()
    //             break
    //           }
    //           case 'status_cable_POS': {
    //             console.log('+ watch:messageWebSocket status_cable_POS ', '-> estatusConnPOS')
    //             // Verificar si está conectado el POS
    //             this.estatusConnPOS()
    //             break
    //           }
    //           case 'status_conn_POS': {
    //             console.log('+ watch:messageWebSocket status_conn_POS ', '-> estatusInternet')
    //             // Verificar si hay internet
    //             this.estatusInternet()
    //             break
    //           }
    //           case 'status_internet': {
    //             // Comprobamos que no esté en la pantalla de outService
    //             (this.isOutService) ? this.isOutService = false : this.isCheckOutService = true
    //             console.log('+ watch:messageWebSocket status_internet ', 'isOutService=' + this.isOutService)
    //             break
    //           }
    //         }
    //       } else {
    //         console.log('+ watch:messageWebSocket', 'isOutService=' + this.isOutService)
    //         this.isOutService = true //<- Sacar de servicio el totem
    //       }
    //     } else { //<- no hay errores de isOutService
    //       switch (this.messageWebSocket.type) {
    //         case 'sale_status': {
    //           console.log('+ watch:messageWebSocket', '? sale_status', 'messageWebSocket',this.messageWebSocket.type)
    //           break
    //         }
    //         case 'sale': {
    //           if ('APROBADA' === this.messageWebSocket.content.msg) {// <- Verificar si paso el pago
    //             // Guardando los datos del pago
    //             this.paymentPOS = this.messageWebSocket.content.payment
    //             console.log('+ watch:messageWebSocket','? sale ? APROBADA', 'paymentPOS = '+this.paymentPOS)
    //           } else {
    //             // Error al procesar el pago
    //             this.isErrorPOS = true
    //             console.log('+ watch:messageWebSocket', 'isErrorPOS = '+this.isErrorPOS)
    //           }
    //           this.endTransactionPOS = true
    //           console.log('+ watch:messageWebSocket', 'endTransactionPOS= '+this.isErrorPOS)
    //           break
    //         }
    //       }
    //     }
    //   }
    // }
  // },

}
