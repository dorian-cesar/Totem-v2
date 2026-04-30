<template>
  <div class="pt-3">
    <div class="transparent-main card-custom">
      <top-header-caption caption="DETALLE DE COMPRA" class="pt-4" />
      <h3 class="text-center mb-4" style="color: white">Revise sus pasajes</h3>
      <personal-information v-bind="propsPersonalInformation" />
      <!-- pantalla modal -->
      <payment-control v-bind="propsPaymentControl" @nameAction="nameActionModal = $event" />
      <payment-atendedor-control v-bind="propsPaymentAtendedorControl" @nameAction="nameActionModal = $event" />
    </div>
    <!-- toolbar button-->
    <tool-bar-button-new4 v-bind="propsToolbarButton" @nameButton="eventClick" />
  </div>
</template>

<script>
import TopHeaderCaption from '@/components/TopHeaderCaption'
import PersonalInformation from '@/components/purchase_detail/PersonalInformation'
import ToolBarButtonNew3 from '@/components/ToolbarButtonNew3'
import ToolBarButtonNew4 from '@/components/ToolbarButtonNew4'
import { mapGetters } from 'vuex'
import webSocket from '@/mixins/websocket.js'
import PaymentControl from '@/components/purchase_detail/PaymentControl'
import reserveOrReleaseSeat from '@/mixins/reserveOrReleaseSeat'
import PaymentAtendedorControl from './PaymentAtendedorControl.vue'
import info from '../../../info.json'

export default {
  name: 'FormEnterRut',

  mixins: [webSocket, reserveOrReleaseSeat],

  data() {
    return {
      countModal: 1,
      //
      isErrorGuardarTransaccion: false,
      //isErrorPagarPOS:false,
      // isErrorTerminarTransaccionPOS: false,
      //
      timeChangeEstatus: false, // <- Prueba
      timeClose: null, // <- tiempo de espera para cerrar la pantalla de pago e ir a HOME
      //
      valuePOS: 0,
      ballotNumberPOS: '',
      paymentPOS: '',
      //
      loadingGuardarTransaccion: false,
      loadingTerminarTransaccionPOS: false,
      //
      nameActionModal: '',
      status: false,
      link: './payamount',
      total: '0',
      //
      propsToolbarButton: {
        lbLabel: 'ANULAR',
        rbLabel: 'PAGAR',
        rbIsDisable: false
      },
      propsPersonalInformation: {
        tickets: [],
        total: ''
      },
      propsPaymentControl: {
        total: '',
        isChangeStatus: false,
        msg: 'Realice el pago en el equipo',
        msgError: 'No se puede realizar el pago'
      },
      propsPaymentAtendedorControl: {
        total: '',
        isChangeStatus: false,
        msg: 'No se puede realizar el pago'
      },
      nameButton: '',
      transaccionPOS: '',
      ticketsGenerados: {
        estado: false,
        boletos: []
      },
      ticketsProcessed: [],
      reservationCode: '',
      reservationCodes: [],
      //
      isCheckOutService: false, //<- Chequeo de isOutService completado
      dataPOS: '',
      info,
      token: localStorage.getItem('authToken')
    }
  },

  components: {
    PersonalInformation,
    TopHeaderCaption,
    ToolBarButtonNew3,
    ToolBarButtonNew4,
    PaymentControl,
    PaymentAtendedorControl
  },

  methods: {
    ...mapGetters('BusSelection', ['getTravelBus']),
    //calcular el total del monto
    calculateTotal() {
      let total = 0

      for (let ticket of this.propsPersonalInformation.tickets) {
        // total += parseFloat(ticket.price) * 1000;
        total += parseFloat(ticket.price)
      }

      total = Intl.NumberFormat('es-ES').format(total)
      this.propsPersonalInformation.total = total
      this.propsPaymentControl.total = total
      this.propsPaymentAtendedorControl.total = total
      this.setTotalAmount = total
    },

    //simulacion POS
    // pagarPOS() {
    //   console.log('- methods:pagar', this.propsPersonalInformation.tickets)
    //   console.log('- methods:pagar', '! Fijar el tiempo de espera con setTimeout 150*1000', '-> checkStatusConn')
    //   this.$bvModal.show('modal-payment-control')
    //   clearTimeout(this.timeClose)
    //   this.timeChangeEstatus = false
    //   const simulatePOSResponse = true // true = éxito, false = fallo
    //   if (simulatePOSResponse !== undefined) {
    //     console.log(`[SIMULACIÓN] Respuesta del POS: ${simulatePOSResponse ? 'ÉXITO' : 'FALLO'}`)
    //     const simulatedPOSResponse = {
    //       data: {
    //         data: {
    //           successful: simulatePOSResponse,
    //           responseMessage: simulatePOSResponse ? 'Pago aprobado' : 'Transacción rechazada (simulado)',
    //           commerceCode: '597055555532',
    //           terminalId: '12345678',
    //           last4Digits: Math.floor(1000 + Math.random() * 9000).toString(),
    //           cardType: 'CR',
    //           cardBrand: 'VISA',
    //           accountNumber: '---',
    //           shareType: 'SIN CUOTA',
    //           sharesNumber: '0',
    //           sharesAmount: '0',
    //           sharesTypeComment: '---',
    //           ...(simulatePOSResponse && {
    //             ticket: 'SIM' + Math.floor(Math.random() * 1000000),
    //             operationNumber: Math.floor(Math.random() * 100000).toString(),
    //             realDate:
    //               new Date().getDate().toString().padStart(2, '0') +
    //               (new Date().getMonth() + 1).toString().padStart(2, '0') +
    //               new Date().getFullYear().toString().slice(-2),
    //             realTime:
    //               new Date().getHours().toString().padStart(2, '0') +
    //               new Date().getMinutes().toString().padStart(2, '0') +
    //               new Date().getSeconds().toString().padStart(2, '0'),
    //             amount: this.propsPersonalInformation.total.replace('.', ''),
    //             authorizationCode: Math.floor(100000 + Math.random() * 900000).toString()
    //           })
    //         }
    //       }
    //     }
    //     console.log('Pago procesado (simulado):', simulatedPOSResponse.data)
    //     // console.log("personalinfo: ", this.propsPersonalInformation)
    //     this.dataPOS = simulatedPOSResponse.data.data
    //     // formatear fecha y hora para DB
    //     let formattedDate = ''
    //     let formattedTime = ''
    //     if (this.dataPOS.realDate) {
    //       const rawDate = this.dataPOS.realDate
    //       formattedDate = `${rawDate.slice(4, 8)}-${rawDate.slice(2, 4)}-${rawDate.slice(0, 2)}`
    //     }
    //     if (this.dataPOS.realTime) {
    //       const rawTime = this.dataPOS.realTime
    //       formattedTime = `${rawTime.slice(0, 2)}:${rawTime.slice(2, 4)}:${rawTime.slice(4, 6)}`
    //     }
    //     this.propsPaymentControl.msg = simulatedPOSResponse.data.data.responseMessage
    //     const bookingData = {
    //       sitio: this.info.sitio,
    //       numTotem: localStorage.getItem('ipServer'),
    //       rut: localStorage.getItem('rut') || 'Sin RUT',
    //       origen: this.$store.state.TravelSelection.nameDepartureCity,
    //       destino: this.$store.state.TravelSelection.nameArrivalCity,
    //       fecha_viaje: this.propsPersonalInformation.tickets[0].fechaServicio,
    //       hora_viaje: this.propsPersonalInformation.tickets[0].horaSalida,
    //       asiento: this.propsPersonalInformation.tickets[0].seat,
    //       codigo_reserva: this.propsPersonalInformation.tickets[0].codeReservation,
    //       // numero_boleto: this.propsPersonalInformation.tickets[0].operatorPnr,
    //       estado_boleto: 'Reservado',
    //       codigo_transaccion: simulatePOSResponse ? this.dataPOS.ticket : '',
    //       codigo_autorizacion: simulatePOSResponse ? this.dataPOS.authorizationCode : '',
    //       id_pos: simulatePOSResponse ? this.dataPOS.terminalId : '',
    //       id_bus: this.propsPersonalInformation.tickets[0].servicio,
    //       tipo_tarjeta: simulatePOSResponse ? this.dataPOS.cardType : '',
    //       tarjeta_marca: simulatePOSResponse ? this.dataPOS.cardBrand : '',
    //       estado_transaccion: simulatePOSResponse ? 'Pago realizado' : 'Pago fallido',
    //       numero_transaccion: simulatePOSResponse ? this.dataPOS.operationNumber : '',
    //       fecha_transaccion: simulatePOSResponse ? formattedDate : '',
    //       hora_transaccion: simulatePOSResponse ? formattedTime : '',
    //       total_transaccion: simulatePOSResponse
    //         ? this.dataPOS.amount
    //         : this.propsPersonalInformation.total.replace('.', '')
    //     }
    //     this.axios
    //       .post(
    //         this.info.urlLogs,
    //         { bookingData },
    //         {
    //           headers: {
    //             'Content-Type': 'application/json',
    //             Authorization: `Bearer ${this.token}`
    //           }
    //         }
    //       )
    //       .then(() => {
    //         console.log('Guardado exitoso en DB pagarPOS simulado')
    //         console.log('Datos para DB pagarPOS: ', bookingData)
    //       })
    //       .catch((error) => {
    //         console.error('Error al guardar en DB, pagarPOS: ', error)
    //       })
    //     if (simulatePOSResponse) {
    //       setTimeout(() => {
    //         this.propsPaymentControl.msg += '\nEspere mientras confirmamos sus pasajes'
    //       }, 2000)
    //       this.isErrorPOS = false
    //       this.ballotNumberPOS = Number(this.dataPOS.authorizationCode)
    //       this.paymentPOS = this.dataPOS
    //       this.amountPOS = this.dataPOS.amount
    //       this.endTransactionPOS(true)
    //     } else {
    //       this.propsPaymentControl.msgError = simulatedPOSResponse.data.data.responseMessage
    //       const bookingData = {
    //         sitio: this.info.sitio,
    //         numTotem: localStorage.getItem('ipServer'),
    //         rut: localStorage.getItem('rut') || 'Sin RUT',
    //         origen: this.$store.state.TravelSelection.nameDepartureCity,
    //         destino: this.$store.state.TravelSelection.nameArrivalCity,
    //         fecha_viaje: this.propsPersonalInformation.tickets[0].fechaServicio,
    //         hora_viaje: this.propsPersonalInformation.tickets[0].horaSalida,
    //         asiento: this.propsPersonalInformation.tickets[0].seat,
    //         codigo_reserva: this.propsPersonalInformation.tickets[0].codeReservation,
    //         // numero_boleto: this.propsPersonalInformation.tickets[0].operatorPnr,
    //         estado_boleto: 'Reservado',
    //         id_pos: '',
    //         id_bus: this.propsPersonalInformation.tickets[0].servicio,
    //         codigo_transaccion: '',
    //         tipo_tarjeta: '',
    //         tarjeta_marca: '',
    //         codigo_autorizacion: '',
    //         estado_transaccion: 'Error de conexión POS',
    //         numero_transaccion: '',
    //         fecha_transaccion: '',
    //         hora_transaccion: '',
    //         total_transaccion: ''
    //       }
    //       this.axios
    //         .post(
    //           this.info.urlLogs,
    //           { bookingData },
    //           {
    //             headers: {
    //               'Content-Type': 'application/json',
    //               Authorization: `Bearer ${this.token}`
    //             }
    //           }
    //         )
    //         .then(() => {
    //           console.log('Error guardado en DB (pagarPos)')
    //           console.log('Datos para DB pagarPOS: ', bookingData)
    //         })
    //         .catch((error) => {
    //           console.error('Error al guardar en DB, pagarPOS: ', error)
    //         })
    //       this.isErrorPOS = true
    //       this.isErrorTerminarTransaccionPOS(true)
    //     }
    //     this.timeClose = setTimeout(() => {
    //       this.timeChangeEstatus = true
    //     }, 150 * 1000)
    //     return
    //   }
    // },

    //inicio del proceso de pago
    pagarPOS() {
      console.log('- methods:pagar', this.propsPersonalInformation.tickets)
      console.log('- methods:pagar', '! Fijar el tiempo de espera con setTimeout 150*1000', '-> checkStatusConn')
      this.$bvModal.show('modal-payment-control') //<- Pantalla modal de espera
      clearTimeout(this.timeClose) //<- Borrar variable de tiempo de espera
      this.timeChangeEstatus = false //<- Variable de estado del vencimiento del tiempo de espera

      const ipServer = localStorage.getItem('ipServer')
      const url = `https://${ipServer}:3000`
      const api = '/api/payment'

      this.isErrorTerminarTransaccionPOS(false)

      this.axios
        .post(url + api, {
          amount: this.propsPersonalInformation.total.replace('.', ''),
          ticketNumber: this.propsPersonalInformation.tickets[0].codeReservation.slice(-10)
        })
        .then((response) => {
          console.log('Pago procesado:', response.data)
          
          const apiResponse = response.data
          const apiData = apiResponse.data || {}
          const rawData = apiData.rawData || {}
          
          // Determinamos si el pago fue exitoso (soportando ambas estructuras)
          const isSuccessful = apiResponse.success && (apiData.approved || rawData.successful || apiData.successful)
          
          console.log('successful: ', isSuccessful)

          // inicializar variables
          const bookingData = {
            sitio: this.info.sitio,
            numTotem: localStorage.getItem('ipServer'),
            rut: localStorage.getItem('rut') || 'Sin RUT',
            origen: this.$store.state.TravelSelection.nameDepartureCity,
            destino: this.$store.state.TravelSelection.nameArrivalCity,
            fecha_viaje: this.propsPersonalInformation.tickets[0].fechaServicio,
            hora_viaje: this.propsPersonalInformation.tickets[0].horaSalida,
            asiento: this.propsPersonalInformation.tickets[0].seat,
            codigo_reserva: this.propsPersonalInformation.tickets[0].codeReservation,
            numero_boleto: this.propsPersonalInformation.tickets[0].operatorPnr,
            estado_boleto: 'Reservado',
            id_pos: rawData.terminalId || '',
            id_bus: this.propsPersonalInformation.tickets[0].servicio,
            codigo_transaccion: rawData.ticket || '',
            tipo_tarjeta: rawData.cardType || apiData.cardType || '',
            tarjeta_marca: rawData.cardBrand || apiData.cardBrand || '',
            codigo_autorizacion: apiData.authorizationCode || rawData.authorizationCode || '',
            estado_transaccion: '',
            numero_transaccion: apiData.operationNumber || rawData.operationNumber || '',
            fecha_transaccion: '',
            hora_transaccion: '',
            total_transaccion: apiData.amount || rawData.amount || ''
          }

          if (isSuccessful === true) {
            console.log('transbank successful response: ', response.data)
            
            // Usamos rawData si está disponible, sino el objeto data (compatibilidad)
            this.dataPOS = Object.keys(rawData).length > 0 ? rawData : apiData
            
            // formatear fecha y hora para DB
            let formattedDate = ''
            let formattedTime = ''
            
            if (this.dataPOS.realDate && this.dataPOS.realDate.length === 8) {
              const rawDate = this.dataPOS.realDate
              formattedDate = `${rawDate.slice(4, 8)}-${rawDate.slice(2, 4)}-${rawDate.slice(0, 2)}`
            } else if (apiData.timestamp) {
              const [d] = apiData.timestamp.split(' ')
              formattedDate = `${d.slice(4, 8)}-${d.slice(2, 4)}-${d.slice(0, 2)}`
            }

            if (this.dataPOS.realTime && this.dataPOS.realTime.length === 6) {
              const rawTime = this.dataPOS.realTime
              formattedTime = `${rawTime.slice(0, 2)}:${rawTime.slice(2, 4)}:${rawTime.slice(4, 6)}`
            } else if (apiData.timestamp) {
              const [, t] = apiData.timestamp.split(' ')
              formattedTime = `${t.slice(0, 2)}:${t.slice(2, 4)}:${t.slice(4, 6)}`
            }

            // Mensaje para el modal (Priorizamos el mensaje específico de Transbank)
            this.propsPaymentControl.msg = rawData.responseMessage || apiResponse.message || 'Pago Aprobado'
            
            bookingData.estado_transaccion = 'Pago realizado'
            bookingData.fecha_transaccion = formattedDate
            bookingData.hora_transaccion = formattedTime
            
            this.axios
              .post(
                this.info.urlLogs,
                { bookingData },
                {
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.token}`
                  }
                }
              )
              .then(() => {
                console.log('Guardado exitoso en DB (pagarPos)')
                console.log('Datos para DB pagarPOS: ', bookingData)
              })
              .catch((error) => {
                console.error('Error al guardar en DB, pagarPOS: ', error)
              })
            setTimeout(() => {
              this.propsPaymentControl.msg += '\nEspere mientras confirmamos sus pasajes'
            }, 2000)
            this.isErrorPOS = false
            this.ballotNumberPOS = Number(bookingData.codigo_autorizacion)
            this.paymentPOS = this.dataPOS
            this.amountPOS = bookingData.total_transaccion
            this.endTransactionPOS(true)
          } else {
            // Caso de fallo o cancelación
            bookingData.estado_transaccion = rawData.responseMessage || 'Pago fallido'
            bookingData.total_transaccion = bookingData.total_transaccion || this.propsPersonalInformation.total.replace('.', '')
            
            this.axios
              .post(
                this.info.urlLogs,
                { bookingData },
                {
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.token}`
                  }
                }
              )
              .then(() => {
                console.log('Error guardado en DB (pagarPos)')
                console.log('Datos del error para DB pagarPOS: ', bookingData)
              })
              .catch((error) => {
                console.error('Error al guardar en DB, pagarPOS : ', error)
              })
            
            // Mensaje de error para el modal (Priorizamos el mensaje de Transbank como "Transacción Cancelada")
            this.propsPaymentControl.msgError = rawData.responseMessage || apiResponse.message || 'Transacción rechazada'
            this.isErrorPOS = true
            this.isErrorTerminarTransaccionPOS(true)
          }
        })
        .catch((error) => {
          console.error('Error en la conexión con POS:', error.message)
          if (
            (error.response && error.response.status === 500) ||
            error.message === 'Network Error' ||
            error.code === 'ECONNABORTED' ||
            error.message.includes('timeout') ||
            error.message.includes('ERR_CONNECTION_TIMED_OUT') ||
            error.message.includes('ERR_CONNECTION_REFUSED')
          ) {
            const bookingData = {
              sitio: this.info.sitio,
              numTotem: localStorage.getItem('ipServer'),
              rut: localStorage.getItem('rut') || 'Sin RUT',
              origen: this.$store.state.TravelSelection.nameDepartureCity,
              destino: this.$store.state.TravelSelection.nameArrivalCity,
              fecha_viaje: this.propsPersonalInformation.tickets[0].fechaServicio,
              hora_viaje: this.propsPersonalInformation.tickets[0].horaSalida,
              asiento: this.propsPersonalInformation.tickets[0].seat,
              codigo_reserva: this.propsPersonalInformation.tickets[0].codeReservation,
              numero_boleto: this.propsPersonalInformation.tickets[0].operatorPnr,
              estado_boleto: 'Reservado',
              id_pos: '',
              id_bus: this.propsPersonalInformation.tickets[0].servicio,
              codigo_transaccion: '',
              tipo_tarjeta: '',
              tarjeta_marca: '',
              codigo_autorizacion: '',
              estado_transaccion: 'Error de conexión POS',
              numero_transaccion: '',
              fecha_transaccion: '',
              hora_transaccion: '',
              total_transaccion: ''
            }
            this.axios
              .post(
                this.info.urlLogs,
                { bookingData },
                {
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.token}`
                  }
                }
              )
              .then(() => {
                console.log('Error guardado en DB (pagarPos)')
                console.log('Datos para DB pagarPOS: ', bookingData)
              })
              .catch((error) => {
                console.error('Error al guardar en DB, pagarPOS: ', error)
              })
            this.propsPaymentControl.msgError = 'No existe conexión con el POS\nPOS desconectado'
          } else {
            this.propsPaymentControl.msgError = 'Ocurrió un error al intentar pagar con POS'
          }
          this.isErrorPOS = true
          this.isErrorTerminarTransaccionPOS(true)
        })
      this.timeClose = setTimeout(() => {
        this.timeChangeEstatus = true // Tiempo agotado para el cambio de estado
      }, 150 * 1000) // <- 150 segundos Tiempo máximo de espera para cambiar el estado del modal
    },

    //fin de transacción del POS
    endTransactionPOS: function (val) {
      console.log('- watch:endTransactionPOS', 'endTransactionPOS = ' + val)
      if (val) {
        // Verifico si hay error en la transacción de pago
        if (this.isErrorPOS) {
          //<- hay error
          this.propsPaymentControl.isChangeStatus = true
          this.propsPaymentAtendedorControl.isChangeStatus = true
          console.log(
            '+ watch:endTransactionPOS',
            'isErrorPOS =' + this.isErrorPOS,
            'propsPaymentControl.isChangeStatus = ' + this.propsPaymentControl.isChangeStatus
          )
        } else {
          //<- No hay error
          console.log('+ watch:endTransactionPOS', 'isErrorPOS =' + this.isErrorPOS, '-> saveTransaction')
          this.saveTransaction()
        }
      }
    },
    //error en TerminarTransaccionPOS API Pullman (2)
    isErrorTerminarTransaccionPOS: function (val) {
      console.log('- watch:isErrorTerminarTransaccionPOS', 'isErrorTerminarTransaccionPOS = ' + val)
      if (val) {
        // Mostrar mensajes de error en la pantalla modal
        this.propsPaymentControl.isChangeStatus = true
        this.propsPaymentAtendedorControl.isChangeStatus = true
        console.log(
          '+ watch:isErrorGuardarTransaccion',
          '! mostrar mensaje error',
          'propsPaymentControl.isChangeStatus = ' + this.propsPaymentControl.isChangeStatus
        )
      }
    },

    //inicio del proceso de pago
    // pagarAtendedor() {
    //   console.log("- methods:pagar", this.propsPersonalInformation.tickets)
    //   console.log(
    //     "- methods:pagar",
    //     "! Fijar el tiempo de espera con setTimeout 150*1000",
    //     "-> checkStatusConn"
    //   );
    //   this.$bvModal.show("modal-payment-atendedor-control"); //<- Pantalla modal de espera
    //   clearTimeout(this.timeClose); //<- Borrar variable de tiempo de espera
    //   this.timeChangeEstatus = false; //<- Variable de estado del vencimiento del tiempo de espera

    //   this.axios.post(
    //     'https://s1.ntic.cl/totem-costa-handler/index.php',
    //     {
    //       type: 'pagar-atendedor',
    //       data: {
    //         tickets: this.propsPersonalInformation.tickets,
    //       },
    //       name: this.info.totemName
    //     }
    //   )
    //   this.timeClose = setTimeout(
    //     function () {
    //       this.timeChangeEstatus = true; //<- Se acabó el tiempo
    //     }.bind(this),
    //     15 * 1000
    //   ); // <- 100 segundos Tiempo máximo de espera para cambiar el estado del modal

    //   // Comprobar los errores de POS, impresora e internet (3)
    //   // this.checkStatusConn(); // -> watch errorWebSocket (4)
    // },
    //guardar transacción en la API de Pullman (1)
    saveTransaction: async function () {
      this.loadingGuardarTransaccion = true
      console.log('- methods:saveTransaction', 'loadingGuardarTransaccion = ' + this.loadingGuardarTransaccion)

      const listaCarrito = []
      let valuePOST = 0
      // let ballotNumberPOST = ''
      // Asignar los tickets para ser enviados en los parámetros de la API
      console.log('ticket', this.propsPersonalInformation.tickets)
      console.log('ballotNumberPOS', this.ballotNumberPOS)
      for (let ticket of this.propsPersonalInformation.tickets) {
        valuePOST += parseInt(ticket.precio.replace('.', ''))
        // ballotNumberPOST = parseInt(ticket.operatorPnr)
        // console.log('operatorPnr', ticket.operatorPnr)
        // this.transaccionPOS = {
        //   codigo: ballotNumberPOST
        // }
        const itemCarrito = {
          codigoTransaccion: this.ballotNumberPOS,
          fechaPasada: ticket.fechaServicio,
          asiento: ticket.asiento,
          clase: ticket.clase,
          servicio: ticket.servicio,
          nombreClase: ticket.clase,
          fechaServicio: ticket.fechaServicio,
          fechaSalida: ticket.fechaServicio,
          horaSalida: ticket.horaSalida,
          ruta: ticket.station.split(',')[0] + ' - ' + ticket.trip.split('/')[1] + ` (${ticket.horaLlegada})`,
          origen: ticket.trip.split('/')[0],
          destino: ticket.trip.split('/')[1],
          nombreTerminalOrigen: ticket.station.split(',')[0],
          nombreTerminalDestino: ticket.trip.split('/')[1],
          monto: parseFloat(ticket.precio.replace('.', '')), // <- arreglar el número
          precio: parseFloat(ticket.precio.replace('.', '')), // <- arreglar el número
          empresa: ticket.empresa,
          bus: ticket.bus,
          piso: ticket.piso,
          integrador: ticket.integrador,
          total: ticket.precio
        }
        if (ticket.codeReservation != null) {
          itemCarrito.codigoReserva = ticket.codeReservation
          itemCarrito.boleto = ticket.codeReservation
        }
        this.reservationCode = ticket.codeReservation
        this.reservationCodes.push(ticket.codeReservation)
        listaCarrito.push(itemCarrito)
      }
      this.ticketsProcessed = listaCarrito
      this.valuePOS = valuePOST
      // this.ballotNumberPOS = this.transaccionPOS.codigo
      console.log('ticketsProcessed', this.ticketsProcessed)
      // setTimeout(() => {
      //   this.loadingGuardarTransaccion = false
      // }, 1000)

      console.log('Transacción guardada exitosamente')
      console.log('ejecutando guardarTransaccionPOS')
      this.guardarTransaccionPOS()

      console.log(
        '+ methods:saveTransaction',
        'valuePOS = ' + this.valuePOS,
        'ballotNumberPOS = ' + this.ballotNumberPOS,
        'loadingGuardarTransaccion = ' + this.loadingGuardarTransaccion,
        'isErrorGuardarTransaccion = ' + this.isErrorGuardarTransaccion
      )
    },

    //realizar el pago en el POS
    // pagarPOS() {
    //   this.axios.post(
    //     'https://s1.ntic.cl/totem-costa-handler/index.php',
    //     {
    //       type: 'pagarPOS',
    //       data: {
    //         valuePOS: this.valuePOS,
    //         ballotNumberPOS: this.ballotNumberPOS
    //       },
    //       name: this.info.totemName
    //     }
    //   )
    //   console.log("- methods:pagarPOS", "valuePOS = " + this.valuePOS, "ballotNumberPOS = " + this.ballotNumberPOS, "-> methods:sendNewSale")
    // Método en mixins
    // this.valuePOS = 50
    // this.axios.post(
    //   'http://192.168.88.254/api/payment',
    //   {
    //     "amount": this.valuePOS,  // Monto en pesos (ej. $10.000)
    //     "ticketNumber": this.ballotNumberPOS,  // Número de boleta/ticket
    //     // "printVoucher": true,  // Si deseas imprimir voucher
    //     // "sendMessages": true  // Si deseas recibir mensajes intermedios
    //   }
    // )
    // this.sendNewSale(this.valuePOS, this.ballotNumberPOS)

    // TODO: Eliminar en producción
    // console.log("- methods:guardarTransaccionPOS", "valuePOS = " + this.valuePOS, "ballotNumberPOS = " + this.ballotNumberPOS, "-> methods:sendNewSale")
    // this.guardarTransaccionPOS()
    // },
    // Imprimir voucher + boletos
    imprimir() {
      // Imprimir Voucher
      console.log('imprimir voucher')
      this.imprimirVoucher(this.paymentPOS, this.ticketsGenerados.boletos, this.ballotNumberPOS)
    },
    //imprimir comprobante de error
    imprimirComprobanteError() {
      console.log('imprimirComprobanteError')
      console.log('transaccionPOS', this.transaccionPOS.codigo)
      this.imprimirVoucherError(this.paymentPOS, this.transaccionPOS.codigo)
      this.imprimirVoucherError(this.paymentPOS, this.transaccionPOS.codigo ? this.transaccionPOS.codigo : 'SIN CODIGO')
    },
    //buscar la ruta de cada boleto
    buscarRuta(origen, destino) {
      let ruta = this.propsPersonalInformation.tickets.find((e) => e.origen === origen && e.destino === destino)
      return ruta.trip
    },

    async retryAxiosPost(url, data, maxRetries = 3, validateResponse, axiosConfig = {}) {
      let lastError

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`Intento ${attempt} de ${maxRetries} - realizando confirmación...`)
          const response = await this.axios.post(url, data, axiosConfig)
          if (validateResponse) {
            validateResponse(response.data)
          }
          console.log(`Confirmación exitosa en intento ${attempt}`)
          return response
        } catch (error) {
          lastError = error
          const isServerDown = !error.response

          for (const ticket of this.propsPersonalInformation.tickets) {
            const bookingBase = {
              sitio: this.info.sitio,
              numTotem: localStorage.getItem('ipServer'),
              rut: localStorage.getItem('rut') || 'Sin RUT',
              origen: this.$store.state.TravelSelection.nameDepartureCity,
              destino: this.$store.state.TravelSelection.nameArrivalCity,
              fecha_viaje: ticket.fechaServicio,
              hora_viaje: ticket.horaSalida,
              asiento: ticket.seat,
              codigo_reserva: ticket.codeReservation,
              codigo_transaccion: this.dataPOS.ticket,
              codigo_autorizacion: this.dataPOS.authorizationCode,
              id_pos: this.dataPOS.terminalId,
              id_bus: ticket.servicio,
              tipo_tarjeta: this.dataPOS.cardType,
              tarjeta_marca: this.dataPOS.cardBrand,
              estado_transaccion: 'Pago realizado',
              numero_transaccion: this.dataPOS.operationNumber,
              fecha_transaccion: this.dataPOS.realDate,
              hora_transaccion: this.dataPOS.realTime,
              total_transaccion: this.dataPOS.amount / this.reservationCodes.length
            }

            const bookingData = {
              ...bookingBase,
              estado_boleto: `Confirmación fallida - Intento: ${attempt}`,
              error: {
                message: error.message,
                code: error.code,
                isAxiosError: error.isAxiosError,
                response: {
                  status: (error.response && error.response.status) || null,
                  data: (error.response && error.response.data) || null
                }
              }
            }

            console.log('bookingData:', bookingData)

            try {
              await this.axios.post(
                this.info.urlLogs,
                { bookingData },
                {
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.token}`
                  }
                }
              )
              console.log(`Intento ${attempt} guardado en DB (confirm booking)`)
            } catch (logError) {
              console.error(`Error al guardar intento ${attempt} en DB:`, logError)
            }
          }

          if (isServerDown) {
            console.warn(`El servidor no respondió o está caído (sin response)`)
          } else {
            console.warn(`Código HTTP recibido: ${error.response && error.response.status}`)
          }

          if (attempt < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, 3000))
          }
        }
      }

      throw lastError
    },

    //guardar transacción POS - confirm_booking
    guardarTransaccionPOS: async function () {
      this.loadingTerminarTransaccionPOS = false
      let total_processed = 0

      let ticketsGeneradosFormatted = {
        boletos: [],
        estado: true
      }
      console.log('reservation codes: ', this.reservationCodes)
      for await (const rc of this.reservationCodes) {
        // api dev
        const proxy = 'https://newstg3-gdsbus.kupos.cl'
        const API_KEY = 'TSXFQYAPI25766888'
        // api kupos
        // const proxy = "https://gds.kupos.com"
        // const API_KEY = 'TSSDFPAPI30103014'
        let api = ''

        api = `gds/api/confirm_booking/${rc}.json?api_key=${API_KEY}&region=chile` // confirmar reservar asiento

        const ticket = this.propsPersonalInformation.tickets.find((t) => t.codeReservation === rc)
        if (!ticket) {
          console.error(`No se encontró ticket con código de reserva ${rc}`)
          continue
        }

        let data_from_api = []
        await this.retryAxiosPost(
          [proxy, api].join('/'),
          null,
          3,
          (data) => {
            const isValidDataStructure =
              typeof data === 'object' &&
              data.result &&
              data.result.ticket_details &&
              data.result.ticket_details.seat_fare_details &&
              data.result.ticket_details.seat_fare_details[0] &&
              data.result.ticket_details.seat_fare_details[0].seat_detail
            if (!isValidDataStructure) {
              throw new Error('Estructura de datos del ticket incompleta o inválida, ir a retry')
            }
          },
          { timeout: 10000 }
        )
          .then(({ data }) => {
            console.log('confirm_booking', data)
            let ticket_info = data.result.ticket_details
            let response_boleto = ticket_info.ticket_number
            let response_codigo = ticket_info.operator_pnr
            let response_servicio = ticket_info.seat_fare_details[0].seat_detail.seat_type
            let response_ruta = ticket_info.service_number
            let response_piso =
              ticket_info.seat_fare_details[0].seat_detail.floor_no !== ''
                ? ticket_info.seat_fare_details[0].seat_detail.floor_no
                : '1'
            let response_asiento = ticket_info.seat_fare_details[0].seat_detail.seat_number
            let response_fecha = ticket_info.travel_date
            let response_hora = ticket_info.boarding_point_details.dep_time
            let response_origen = ticket_info.boarding_point_details.landmark // verificar nombre de terminal
            let response_destino = ticket_info.destination
            let issued_on = new Date(ticket_info.issued_on * 1000) // verificar resultado de fecha
            issued_on = issued_on.toLocaleString('es-CL', { hour12: false })
            let response_fecha_compra = issued_on
            let response_total = ticket_info.seat_fare_details[0].seat_detail.fare
            let response_ticket = {
              boleto: response_boleto.toString(),
              codigo: response_codigo.toString(),
              rut: localStorage.getItem('rut') || 'Sin RUT',
              servicio: response_servicio,
              ruta: response_ruta,
              piso: response_piso,
              asiento: response_asiento,
              fecha: response_fecha,
              hora: response_hora,
              origen: response_origen,
              destino: response_destino,
              fecha_compra: response_fecha_compra,
              total: response_total.toString(),
              tipo_cliente: 'PULLMAN PASS'
            }

            ticketsGeneradosFormatted.boletos.push(response_ticket)
            console.log('ticketsGeneradosFormatted: ', ticketsGeneradosFormatted)

            // formatear fecha y hora para DB
            const rawDate = this.dataPOS.realDate
            const formattedDate = `${rawDate.slice(4, 8)}-${rawDate.slice(2, 4)}-${rawDate.slice(0, 2)}`
            const rawTime = this.dataPOS.realTime
            const formattedTime = `${rawTime.slice(0, 2)}:${rawTime.slice(2, 4)}:${rawTime.slice(4, 6)}`

            const bookingData = {
              sitio: this.info.sitio,
              numTotem: localStorage.getItem('ipServer'),
              rut: localStorage.getItem('rut') || 'Sin RUT',
              origen: this.$store.state.TravelSelection.nameDepartureCity,
              destino: response_ticket.destino,
              fecha_viaje: ticket.fechaServicio,
              hora_viaje: ticket.horaSalida,
              asiento: response_ticket.asiento,
              codigo_reserva: response_ticket.boleto,
              numero_boleto: response_ticket.codigo,
              estado_boleto: 'Confirmado',
              codigo_transaccion: this.dataPOS.ticket,
              codigo_autorizacion: this.dataPOS.authorizationCode,
              id_pos: this.dataPOS.terminalId,
              id_bus: ticket.servicio,
              tipo_tarjeta: this.dataPOS.cardType,
              tarjeta_marca: this.dataPOS.cardBrand,
              estado_transaccion: 'Pago realizado',
              numero_transaccion: this.dataPOS.operationNumber,
              fecha_transaccion: formattedDate,
              hora_transaccion: formattedTime,
              total_transaccion: this.dataPOS.amount / this.reservationCodes.length
            }

            this.axios
              .post(
                this.info.urlLogs,
                { bookingData },
                {
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.token}`
                  }
                }
              )
              .then(() => {
                console.log('Datos para DB confirm_booking: ', bookingData)
                console.log('Guardado exitoso en DB (confirm booking)')
              })
              .catch((error) => {
                console.error('Error al guardar en DB, confirm_booking: ', error)
              })
          })
          .catch((error) => {
            console.error(error)
            // total_processed += 1

            const bookingData = {
              sitio: this.info.sitio,
              numTotem: localStorage.getItem('ipServer'),
              rut: localStorage.getItem('rut') || 'Sin RUT',
              origen: this.$store.state.TravelSelection.nameDepartureCity,
              destino: this.$store.state.TravelSelection.nameArrivalCity,
              fecha_viaje: ticket.fechaServicio,
              hora_viaje: ticket.horaSalida,
              asiento: ticket.seat,
              codigo_reserva: ticket.codeReservation,
              // numero_boleto: this.propsPersonalInformation.tickets[0].operatorPnr,
              estado_boleto: 'Confirmación fallida',
              codigo_transaccion: this.dataPOS.ticket,
              codigo_autorizacion: this.dataPOS.authorizationCode,
              id_pos: this.dataPOS.terminalId,
              id_bus: ticket.servicio,
              tipo_tarjeta: this.dataPOS.cardType,
              tarjeta_marca: this.dataPOS.cardBrand,
              estado_transaccion: 'Pago realizado',
              numero_transaccion: this.dataPOS.operationNumber,
              fecha_transaccion: this.dataPOS.realDate,
              hora_transaccion: this.dataPOS.realTime,
              total_transaccion: this.dataPOS.amount / this.reservationCodes.length,
              error: {
                message: error.message,
                code: error.code,
                isAxiosError: error.isAxiosError,
                response: {
                  status: (error.response && error.response.status) || null,
                  data: (error.response && error.response.data) || null
                }
              }
            }

            this.axios
              .post(
                this.info.urlLogs,
                { bookingData },
                {
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.token}`
                  }
                }
              )
              .then(() => {
                console.log('Error guardado en DB (confirm booking)')
              })
              .catch((error) => {
                console.error('Error al guardar en DB, confirm_booking: ', error)
              })
          })
          .finally(() => {
            total_processed += 1
            if (total_processed >= this.reservationCodes.length) {
              this.ticketsGenerados = ticketsGeneradosFormatted
              console.log('ticketsGenerados', this.ticketsGenerados)
              this.loadingTerminarTransaccionPOS = true
            }
          })
      }
    },

    //liberar asientos reservados
    liberarAsientos() {
      for (let ticket of this.propsPersonalInformation.tickets) {
        this.seatReservation('delete', {
          servicio: ticket.servicio,
          fecha: ticket.fechaServicio,
          origen: ticket.origen,
          destino: ticket.destino,
          integrador: ticket.integrador,
          asiento: ticket.asiento,
          codigoReserva: ticket.codeReservation
        })
      }
    },
    //salir a Home
    goHome() {
      this.liberarAsientos()
      sessionStorage.setItem('autoReload', 'true')
      this.$router.push({ name: 'Home' }).then(() => {
        window.location.reload()
      })
    },
    // Click Toolbar button
    eventClick: function (name) {
      console.log('- methods:eventClick', 'Right-Button = ' + name)
      // Opción PAGAR o ANULAR
      if ('Right-Button' === name) {
        //<- PAGAR
        console.log('+ methods:eventClick', '-> methods:pagar')
        this.pagarPOS() // <- Inicio el proceso de pago (2)
      } else if ('Center-Button' === name) {
        //<- PAGAR
        console.log('+ methods:eventClick', '-> methods:pagar')
        this.pagarAtendedor() // <- Inicio el proceso de pago (2)
      } else {
        //<- ANULAR
        console.log('+ methods:eventClick', '-> goHome')
        this.goHome()
      }
    }
  },

  mounted() {
    this.propsPersonalInformation.tickets = this.getTravelBus()
    console.log('- mounted', 'propsPersonalInformation.tickets {}', this.propsPersonalInformation.tickets)
    this.calculateTotal()
  },

  watch: {
    //variable que saca fuera de servicio al totem
    isOutService: function (val) {
      console.log('- watch:isOutService', 'isOutService = ' + val)
      if (val) {
        //<- la variable isOutService está en el mixins
        console.log(
          '+ watch:isOutService',
          '! terminar temporizador pantalla modal',
          '-> clearTimeout',
          '! ir pantalla outservice',
          '-> router:push:outofservice',
          'isOutService = ' + val
        )
        // Terminar el temporizador de la pantalla modal
        clearTimeout(this.timeClose)
        // Ir a pantalla OutService
        this.$router.push('/outofservice')
      }
    },
    //verificar error en GuardarTransaccion API Pullman (1)
    isErrorGuardarTransaccion: function (val) {
      console.log('- watch:isErrorGuardarTransaccion', 'isErrorGuardarTransaccion = ' + val)
      if (val) {
        // Mostrar mensajes de error en la pantalla modal
        this.propsPaymentControl.isChangeStatus = true
        this.propsPaymentAtendedorControl.isChangeStatus = true
        console.log(
          ' + watch:isErrorGuardarTransaccion',
          '! mostrar mensaje error',
          'propsPaymentControl.isChangeStatus = ' + this.propsPaymentControl.isChangeStatus
        )
      }
    },
    // //error en TerminarTransaccionPOS API Pullman (2)
    // isErrorTerminarTransaccionPOS: function (val) {
    //   console.log(
    //     "- watch:isErrorTerminarTransaccionPOS",
    //     "isErrorTerminarTransaccionPOS = " + val
    //   );
    //   if (val) {
    //     // Mostrar mensajes de error en la pantalla modal
    //     this.propsPaymentControl.isChangeStatus = true;
    //     this.propsPaymentAtendedorControl.isChangeStatus = true;
    //     console.log(
    //       "+ watch:isErrorGuardarTransaccion",
    //       "! mostrar mensaje error",
    //       "propsPaymentControl.isChangeStatus = " +
    //       this.propsPaymentControl.isChangeStatus
    //     );
    //   }
    // },
    //ocurre cuando se presiona un botón el la pantalla modal
    nameActionModal: function () {
      console.log('- watch:nameActionModal', '-> clearTimeout')
      // Borrar los tiempos
      clearTimeout(this.timeClose)
      if ('salir' === this.nameActionModal) {
        console.log('+ watch:nameActionModal', 'nameActionModal = ' + this.nameActionModal, '-> goHome')
        this.goHome()
      } else if ('cerrar' === this.nameActionModal) {
        //Valores pantalla Modal
        this.$bvModal.hide('modal-payment-control')
        this.propsPaymentControl.isChangeStatus = false
        this.propsPaymentAtendedorControl.isChangeStatus = false
        //Valores guardarTransaccion
        this.isErrorGuardarTransaccion = false
        // this.loadingGuardarTransaccion = true
        //Contador de intentos de pago
        this.countModal++
        this.pagarPOS()
        console.log('+ watch:nameActionModal', 'nameActionModal = ' + this.nameActionModal, '-> goHome')
      }
      this.nameActionModal = ''
      this.nameButton = ''
      this.isCheckOutService = false
      console.log(
        '+ watch:nameActionModal',
        'nameActionModal = ' + this.nameActionModal,
        'nameButton = ' + this.nameButton,
        'isCheckOutService = ' + this.isCheckOutService
      )
    },
    //ocurre cuando se acaba el tiempo de espera en la pantalla modal
    timeChangeEstatus: function (val) {
      console.log('- methods:timeChangeEstatus', '! Número de intentos ' + val)
      // Verifica que el estado este en true que define el vencimiento
      if (val) {
        // Verificar que el número de intentos no exceda a 3
        if (3 > this.countModal) {
          // Mensaje de la pantalla modal
          this.propsPaymentControl.msg = 'Se excedió el tiempo de espera'
          this.propsPaymentAtendedorControl.msg = 'Se redirigirá al Inicio'
        } else {
          //<- Vuelva a intentar
          // Mensaje de la pantalla modal
          this.propsPaymentControl.msg = 'Superó el número máximo de intentos'
          // Estado del botón "Intente de Nuevo"
          this.propsPaymentControl.isTryAgain = false
          this.propsPaymentAtendedorControl.isTryAgain = false
        }

        // Props para que cambie el mensaje de la pantalla modals
        this.propsPaymentControl.isChangeStatus = true
        this.propsPaymentAtendedorControl.isChangeStatus = true

        // Borrar variable de tiempo de espera
        clearTimeout(this.timeClose)
        // Tiempo de espera
        this.timeClose = setTimeout(
          function () {
            this.goHome()
          }.bind(this),
          10 * 1000
        )
      }
    },
    //se terminó el chequeo de las variables de isOutService
    isCheckOutService: function (val) {
      if (val) this.saveTransaction()
    },
    //cambio de estado en loadingGuardarTransaccion (1)
    loadingGuardarTransaccion: function (val) {
      console.log(
        '- watch:loadingGuardarTransaccion',
        'loadingGuardarTransaccion=' + val,
        'isErrorGuardarTransaccion=' + this.isErrorGuardarTransaccion
      )
      // terminó de ejecutarse guardarTransaccion y está sin error
      // TODO: Volver a activar
      if (!val && !this.isErrorGuardarTransaccion) {
        console.log('+ watch:loadingGuardarTransaccion', '-> methods:guardarTransaccionPOS')
        // this.pagarPOS(); //<- Realizar el pago en el POS
      }
    },
    // //fin de transacción del POS
    // endTransactionPOS: function (val) {
    //   console.log("- watch:endTransactionPOS", "endTransactionPOS = " + val);
    //   if (val) {
    //     // Verifico si hay error en la transacción de pago
    //     if (this.isErrorPOS) {
    //       //<- hay error
    //       this.propsPaymentControl.isChangeStatus = true;
    //       this.propsPaymentAtendedorControl.isChangeStatus = true;
    //       console.log(
    //         "+ watch:endTransactionPOS",
    //         "isErrorPOS =" + this.isErrorPOS,
    //         "propsPaymentControl.isChangeStatus = " +
    //         this.propsPaymentControl.isChangeStatus
    //       );
    //     } else {
    //       //<- No hay error
    //       console.log(
    //         "+ watch:endTransactionPOS",
    //         "isErrorPOS =" + this.isErrorPOS,
    //         "-> guardarTransaccionPOS"
    //       );
    //       this.guardarTransaccionPOS();
    //     }
    //   }
    // },
    //terminó la generación de boletos
    loadingTerminarTransaccionPOS: function (val) {
      console.log(
        '- watch:loadingTerminarTransaccionPOS',
        'loadingTerminarTransaccionPOS = ' + val,
        'ticketsGenerados =' + this.ticketsGenerados.toString()
      )
      // Verificar que se generaron los boletos
      if (val && this.ticketsGenerados.boletos) {
        console.log(
          '+ watch:loadingTerminarTransaccionPOS',
          '-> clearTimeout',
          '-> imprimir',
          '-> router:push:payamount'
        )
        // Imprimir voucher + boletos
        clearTimeout(this.timeClose)
        this.imprimir()
        this.$router.push('/payamount')
      } else if (val && this.ticketsGenerados.estado === false) {
        console.log(
          '+ watch:loadingTerminarTransaccionPOS',
          'ticketsGenerados.estado = ' + this.ticketsGenerados.estado,
          '-> clearTimeout',
          '-> imprimirComprobanteError',
          '-> router:push:payamount'
        )
        clearTimeout(this.timeClose)
        this.imprimirComprobanteError()
        this.$router.push('/payamount')
      }
    }
  }
}
</script>
