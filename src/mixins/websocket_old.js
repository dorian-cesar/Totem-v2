import ActionCableVue from 'actioncable-vue'

export default {
  data() {
    return {
      isConnWebSocket: false,
      isConnPOS: null, //<- Estado de la conexión
      messagePOS: '', //<- Mensaje del POS
      paymentPOS: '', //<- Monto de la venta
      isErrorPOS: false,
      endTransactionPOS: false, //<- Fin de la transacción del POS
      messagePrinter: '',
      messageType: '',
      //isConnPOSX: false,
      isConnPrinter: false,
      //
      //
      messageWebSocket: '', //<- Mensajes del websocket
      errorConnWebSocket: false, //<- Errores de impresora, conexión POS, internet
      isOutService: false //<- Estado fuera de servicio
    }
  },
  methods: {
    /*
     * Fecha de hoy
     * */
    today() {
      let date = new Date()
      let day = date.getDate().toString().length === 1 ? '0' + date.getDate() : date.getDate()
      let month = (date.getMonth() + 1).toString().length === 1 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
      let year = date.getFullYear()

      return [day, month, year].join('/')
    },
    /*
     *  Inicialización de variables
     * */
    initVar() {
      this.isConn = false
      this.messagePOS = ''
      this.paymentPOS = ''
      this.isErrorPOS = false
      this.endTransactionPOS = false
      //this.isconnPOSX = false
      //this.isConnPrinter = false
    },

    /*
     * Suscribirse al chanel Printer
     * */
    imprimirConectar() {
      this.$cable.subscribe({ channel: 'Printer', room: 'printer' }, 'Printer')
    },

    /*
     * Comprobar el estatus de la impresora
     * */
    estatusImpresora() {
      // Conectar al websocket
      this.imprimirConectar()
      // Enviar comando al websocket
      this.$cable.perform({ channel: 'Printer', action: 'status_print' }, 'Printer')
    },

    /*
     * inicializar los errores y mensajes
     * */
    initErrorAndMsg() {
      this.isOutService = false
      this.errorConnWebSocket = false
      this.messageWebSocket = ''
    },

    /*
     * Verificar estado de la impresora, el POS, e internet
     * */
    checkStatusConn() {
      this.initErrorAndMsg()
      this.estatusImpresora()
    },

    /*
     * Suscribirse al chanel Transbank
     * */
    websocketConectar() {
      this.$cable.subscribe({ channel: 'Transbank', room: 'transbank' }, 'Transbank')
    },

    /*
     * Comprobar si el cable del POS está conectado
     * */
    estatusCablePOS() {
      this.websocketConectar()
      this.$cable.perform({ channel: 'Transbank', action: 'status_cable_pos' }, 'Transbank')
    },

    /*
     * Comprobar si el POS está conectado
     * */
    estatusConnPOS() {
      this.websocketConectar()
      this.$cable.perform({ channel: 'Transbank', action: 'status_conn_pos' }, 'Transbank')
    },

    /*
     * Verificar estatus de la impresora
     * */
    estatusInternet() {
      this.websocketConectar()
      this.$cable.perform({ channel: 'Transbank', action: 'status_internet' }, 'Transbank')
    },

    /*
     * Cancelar suscripción
     * */
    imprimirDesconectar() {
      this.$cable.unsubscribe({ channel: 'Printer' }, 'Printer')
    },

    /*
     * Cancelar suscripción a chanel Transbank
     * */
    websocketDesconectar() {
      this.$cable.unsubscribe({ channel: 'Transbank' }, 'Transbank')
    },

    sendNewSale2() {
      //this.initVar()
      console.log('sendNewSale2')
      this.paymentPOS = this.ventaFicticia()
      this.endTransactionPOS = true
    },

    /*
     * Realizar el pago en el POS
     * */
    sendNewSale(value, ballotNumber) {
      console.log('sendNewSale')
      this.initVar()

      this.$cable.perform(
        {
          channel: 'Transbank',
          action: 'send_new_sale',
          data: {
            message: {
              value: value,
              ballot_number: ballotNumber
            }
          }
        },
        'Transbank'
      )
    },

    ventaFicticia() {
      return {
        transaction_hour: '154713',
        transaction_date: '12042020', //<-Día de la compratransaction_hour: "171613",//<- Hora de la compra
        amount: '000008000', //<- Monto de la compra
        date_count: '081204', //<- Fecha contable
        payment_type: 'MC', //<- Tipo de tarjeta
        card_type: 'MC', //<- Tipo de tarjeta
        ballot_number: 'U18.1L3', //<- Versión del software del POS
        commerce_code: '597001600141', //<- Número de comercio
        terminal_id: '70000158', //<- Número del terminal
        card_number: '*******9480', //<-
        account_number: '        ********100', //<- no hace falta
        operation_number: '000362', //<- Número de la operación
        auth_code: '240312',
        codigo_unico: 'XNQ69646043',
        tipo_cuota: 'CUOTAS SIN INTERES',
        numero_cuota: '02',
        monto_cuota: '4000'
      }
    },

    imprimirVoucherPrueba() {
      const ballot = {
        transaction_date: '30032020', //<-Día de la compra
        transaction_hour: '171613', //<- Hora de la compra
        amount: '000008000', //<- Monto de la compra
        date_count: '081204', //<- Fecha contable
        payment_type: 'MC', //<- Tipo de tarjeta
        card_type: 'MC', //<- Tipo de tarjeta
        ballot_number: 'U18.1L3', //<- Versión del software del POS
        commerce_code: '597001600141', //<- Número de comercio
        terminal_id: '70000158', //<- Número del terminal
        card_number: '*******9480', //<-
        account_number: '        ********100', //<- no hace falta
        operation_number: '000362', //<- Número de la operación
        auth_code: '240312',
        codigo_unico: 'XNQ69646043',
        tipo_cuota: 'CUOTAS SIN INTERES',
        numero_cuota: '02',
        monto_cuota: '4000'
      }

      this.$cable.perform(
        {
          channel: 'Printer',
          action: 'print',
          data: {
            sheet: {
              ballot: ballot,
              tickets: ''
            }
          }
        },
        'Printer'
      )
    },

    imprimirVoucher(ballotValue, ticketsValue, codigoUnico) {
      this.imprimirConectar()
      //console.log('imprimirVoucher',ticketsValue)

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
        tipo_cuota: '' === ballotValue.tipo_cuota ? 'SIN CUOTA' : ballotValue.tipo_cuota,
        numero_cuota: '00' === ballotValue.numero_cuota ? '0' : ballotValue.numero_cuota,
        monto_cuota: '' === ballotValue.monto_cuota ? '0' : ballotValue.monto_cuota
      }

      let tickets = []
      //
      //console.log(ticketsValue.length)

      let today = this.today()
      for (let boleto of ticketsValue) {
        boleto = JSON.parse(boleto)
        tickets.push({
          boleto: boleto.boleto,
          codigo: boleto.codigoTransaccion,
          rut: '', //<- No se indica Rut en los boletos
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

      this.$cable.perform(
        {
          channel: 'Printer',
          action: 'print',
          data: {
            sheet: {
              ballot: ballot,
              tickets: tickets
            }
          }
        },
        'Printer'
      )
    },

    /*
     *
     *
     * */
    imprimirVoucherError(ballotValue, codigoUnico) {
      this.imprimirConectar()
      //console.log('imprimirVoucher',ticketsValue)

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
        tipo_cuota: '' === ballotValue.tipo_cuota ? 'SIN CUOTA' : ballotValue.tipo_cuota,
        numero_cuota: '00' === ballotValue.numero_cuota ? '0' : ballotValue.numero_cuota,
        monto_cuota: '' === ballotValue.monto_cuota ? '0' : ballotValue.monto_cuota
      }

      let tickets = [{ codigo: codigoUnico }]

      this.$cable.perform(
        {
          channel: 'Printer',
          action: 'print_error',
          data: {
            sheet: {
              ballot: ballot,
              tickets: tickets
            }
          }
        },
        'Printer'
      )
    }
  },
  channels: {
    // POS
    Transbank: {
      connected() {
        this.isConnPOS = true
        //this.isConnPOSX = true
        console.log('Transbank conectado')
      },
      rejected() {
        console.log('Transbank rejected')
      },
      received(dataTransbank) {
        this.messageWebSocket = dataTransbank //<- Mensaje del chanel Transbank
        console.log('Transbank received')
      },
      disconnected() {
        this.isConnPOS = false
        //this.isConnPOSX = false
        console.log('Transbank desconectado')
      },
      stopped() {
        this.isConnPOS = false
        console.log('Transbank stopped')
      }
    },
    // Voucher
    Printer: {
      connected() {
        this.isConnPrinter = true
        console.log('Printer connected')
      },
      rejected() {
        console.log('Printer rejected')
      },
      received(dataPrinter) {
        this.messageWebSocket = dataPrinter //<- Mensaje del chanel Printer
        console.log('Printer received')
      },
      disconnected() {
        this.isConnPrinter = false
        console.log('Printer disconnected')
      },
      stopped() {
        console.log('Printer Detenida')
      }
    }
  },
  mounted() {
    this.websocketConectar()

    this.imprimirConectar()

    //this.isConnWebSocket = !this.$cable._cable.connection.disconnected//<- Verifica si está conectado
  },
  watch: {
    /*
     * Estado de la conexión channel transbank
     * */
    isConn: function (val) {
      if (!val) {
        this.websocketConectar()
        console.log('sin Conexion')
      }
    },

    /*
     * Estado de la conexión channel impresora
     * */
    isConnPrinter: function (val) {
      console.log('isConnPrinter')
      if (!val) this.websocketConectar()
    },

    /*
     * Monitoreo de los mensajes del websocket
     * */
    messageWebSocket: function () {
      console.log('messageWebSocket')
      if (this.messageWebSocket.type !== undefined) {
        // Verificar el tipo de error
        if (
          ['status_conn_POS', 'status_cable_POS', 'status_internet', 'status_printer'].indexOf(
            this.messageWebSocket.type
          ) > -1
        ) {
          // verificar si hay error
          this.errorConnWebSocket = 'OK' !== this.messageWebSocket.msg
          if (!this.errorConnWebSocket) {
            //<-Pasa si no hay error
            // verificar el tipo de error
            switch (this.messageWebSocket.type) {
              case 'status_printer': {
                console.log('printer', this.messageWebSocket.msg)
                // Verificar si el cable del POS está conectado
                this.estatusCablePOS()
                break
              }
              case 'status_cable_POS': {
                console.log('cable', this.messageWebSocket.msg)
                // Verificar si está conectado el POS
                this.estatusConnPOS()
                break
              }
              case 'status_conn_POS': {
                console.log('con', this.messageWebSocket.msg)
                // Verificar si hay internet
                this.estatusInternet()
                break
              }
              case 'status_internet': {
                // Comprobamos que no esté en la pantalla de outService
                this.isOutService ? (this.isOutService = false) : (this.isCheckOutService = true)
                console.log('internet', this.messageWebSocket.msg)
                console.log(this.isOutService)
                break
              }
            }
          } else {
            this.isOutService = true //<- Sacar de servicio el totem
          }
        } else {
          //<- no hay errores de isOutService
          switch (this.messageWebSocket.type) {
            case 'sale_status': {
              //console.log('sale_status', this.messageWebSocket)
              break
            }
            case 'sale': {
              if ('APROBADA' === this.messageWebSocket.content.msg) {
                // <- Verificar si paso el pago
                // Guardando los datos del pago
                this.paymentPOS = this.messageWebSocket.content.payment
                //console.log(this.paymentPOS)
              } else {
                // Error al procesar el pago
                this.isErrorPOS = true
              }
              this.endTransactionPOS = true
              break
            }
          }
        }
      }
    }
  }
}
