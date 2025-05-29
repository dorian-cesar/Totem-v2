<template>
  <div class="pt-5">
    <b-container>
      <b-row align-v="center" class="s-custom-height">
        <b-col cols="12">
          <b-card border-variant="primary" style="background-color: azure">
            <b-card-text>
              <b-row>
                <b-col class="">
                  <p class="text-primary pb-2 font-weight-bolder s-custom-font">
                    Ingrese su boleto (ej: 1234567 - Puede contener letras)
                  </p>
                  <input
                    type="text"
                    placeholder="Ingrese su número de boleto"
                    data-layout="normal"
                    class="w-100 input-codigo"
                    style="background-color: azure"
                    v-model="codeReprint"
                  />
                  <!-- disabled="disabled" -->
                  <p
                    class="text-center text-primary pb-2 font-weight-bolder s-custom-font"
                    style="white-space: pre-line"
                  >
                    {{ texto }}
                  </p>
                </b-col>
              </b-row>
            </b-card-text>
          </b-card>
          <p class="text-center p-2 mb-0" style="color: azure; font-size: 22px">
            Si no tiene el número de su boleto, pregunte al operador(a) con su rut.
          </p>
          <div :class="keyboardClass"></div>
        </b-col>
      </b-row>

      <b-row>
        <!-- Left Button -->
        <b-col cols="6" class="container-fluid">
          <b-button variant="primary" class="custom-button btn-lg button-radius" @click="goHome">
            <h2>REGRESAR</h2>
          </b-button>
        </b-col>
        <!-- Right Button -->
        <b-col cols="6" class="container-fluid text-right">
          <b-button class="custom-button btn-lg btn-info button-radius" @click="getOperatorPnr">
            <h2>IMPRIMIR</h2>
          </b-button>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>
<script>
import WebSocket from '@/mixins/websocket.js'
import SimpleKeyboard from 'simple-keyboard'
import '@/assets/style/keyboard.css'
import info from '../../../info.json'
import axios from 'axios'

export default {
  name: 'FormPrinTicket',
  mixins: [WebSocket],
  props: {
    keyboardClass: {
      default: 'simple-keyboard',
      type: String
    }
  },
  data() {
    return {
      keyboard: null,
      isShowKeyBoard: true,
      codeReprint: '',
      tickets_reprint: null,

      texto: '',
      text1: 'EQUIPO TEMPORALMENTE',
      text2: 'FUERA DE SERVICIO',
      text3:
        'Estimado usuario pedimos disculpas por las molestias ocasionadas.' +
        'Nos encontramos trabajando para mejorar el servicio.',
      interval: null,
      info
    }
  },
  methods: {
    onKeyPress(key) {
      this.statusKeyPress = true
      switch (key) {
        case '{bksp}': {
          this.codeReprint = this.codeReprint.slice(0, -1)
          break
        }
        case '{sp}': {
          this.codeReprint += ' '
          break
        }
        default: {
          this.codeReprint += key
        }
      }
    },

    async getOperatorPnr() {
      const numeroBoleto = this.codeReprint
      try {
        const response = await axios.get(
          'https://log-totem.dev-wit.com/api_boletos/api_boletos.php?numero_boleto=' + numeroBoleto
        )
        const data = response.data
        if (!data || !data.codigo_reserva) {
          this.texto =
            'Código de reserva inválido.\nVerifique si el boleto fue escrito correctamente o si su reserva se encuentra confirmada.'
          setTimeout(() => {
            this.texto = ''
          }, 10000)
          return
        }
        this.datosBoleto = data.codigo_reserva
        console.log('Datos del boleto:', data)
        await this.getBookingDetails(this.datosBoleto)
      } catch (error) {
        console.error('Error en GET código de reserva:', error)
        this.texto = 'No se ha podido obtener el código de reserva. Intente nuevamente más tarde.'
        let bookingData = {
          sitio: this.info.sitio,
          numTotem: localStorage.getItem('ipServer'),
          rut: 'Reimpreso',
          origen: 'N/A',
          destino: 'N/A',
          fecha_viaje: 'N/A',
          hora_viaje: 'N/A',
          asiento: 'N/A',
          codigo_reserva: 'N/A',
          numero_boleto: this.codeReprint,
          estado_boleto: 'Reimpresión fallida',
          codigo_transaccion: '',
          estado_transaccion: 'Intento de reimpresión',
          numero_transaccion: '',
          fecha_transaccion: '',
          hora_transaccion: '',
          total_transaccion: ''
        }
        this.axios
          .post(this.info.urlLogs, {
            bookingData: bookingData
          })
          .then(function () {
            console.log('Error guardado en DB (rePrint)')
          })
          .catch(function (error) {
            console.error('Error al guardar en DB, rePrint: ', error)
          })
        setTimeout(() => {
          this.texto = ''
        }, 10000)
      }
    },

    getBookingDetails: async function (numeroBoleto) {
      // api dev
      const proxy = 'https://newstg3-gdsbus.kupos.cl'
      const API_KEY = 'TSXFQYAPI25766888'
      // api kupos
      // const proxy = "https://gds.kupos.com"
      // const API_KEY = 'TSSDFPAPI30103014'
      let api = 'gds/api/booking_details.json?region=chile&pnr_number=' + numeroBoleto + '&api_key=' + API_KEY

      this.texto = 'Imprimiendo boleto, por favor espere...'

      await this.axios
        .get(proxy + '/' + api, {
          validateStatus: function (status) {
            return status >= 200 && status < 500
          }
        })
        .then(({ data }) => {
          if (data && data.result && data.result.ticket_details && data.result.ticket_details !== null) {
            let ticketsGeneradosFormatted = {
              boletos: [],
              estado: true
            }

            let ticket_info = data.result.ticket_details[0]

            let response_boleto = ticket_info.pnr_number
            let response_codigo_reserva = ticket_info.operator_pnr
            let response_codigo = ticket_info.operator_reservation_id
            let response_servicio = ticket_info.bus_type
            let response_ruta = ticket_info.origin + ' / ' + ticket_info.destination

            let pisoInfo = '1'
            if (
              ticket_info.seat_fare_details &&
              ticket_info.seat_fare_details.length > 0 &&
              ticket_info.seat_fare_details[0].seat_detail &&
              ticket_info.seat_fare_details[0].seat_detail.floor_no !== ''
            ) {
              pisoInfo = ticket_info.seat_fare_details[0].seat_detail.floor_no
            }

            let response_asiento = ticket_info.seat_fare_details[0].seat_detail.seat_number
            let response_fecha = ticket_info.travel_date
            let response_hora = new Date('1970-01-01 ' + ticket_info.boarding_point_details.dep_time)
              .toTimeString()
              .substring(0, 5)
            let response_origen = ticket_info.boarding_point_details.landmark
            let response_destino = ticket_info.destination
            let issued_on = new Date().toLocaleString('es-CL', { hour12: false })
            let response_fecha_compra = issued_on
            let response_total = ticket_info.seat_fare_details[0].seat_detail.fare

            let response_ticket = {
              boleto: response_boleto,
              codigo: response_codigo.toString(),
              codigo_reserva: response_codigo_reserva.toString(),
              rut: '',
              servicio: response_servicio,
              ruta: response_ruta,
              piso: pisoInfo,
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
            this.tickets_reprint = ticketsGeneradosFormatted
            this.rePrint()

            let bookingData = {
              sitio: this.info.sitio,
              numTotem: localStorage.getItem('ipServer'),
              rut: 'Reimpreso',
              origen: response_origen,
              destino: response_destino,
              fecha_viaje: response_fecha,
              hora_viaje: response_hora,
              asiento: response_asiento,
              codigo_reserva: response_boleto,
              numero_boleto: response_codigo_reserva,
              estado_boleto: 'Reimpreso',
              codigo_transaccion: '',
              estado_transaccion: 'Pago realizado',
              numero_transaccion: '',
              fecha_transaccion: '',
              hora_transaccion: '',
              total_transaccion: ''
            }

            this.axios
              .post(this.info.urlLogs, {
                bookingData: bookingData
              })
              .then(function () {
                console.log('Guardado exitoso en DB (rePrint)')
              })
              .catch(function (error) {
                console.error('Error al guardar en DB, rePrint: ', error)
              })
          } else {
            this.texto =
              'Código de reserva inválido.\nVerifique si el boleto fue escrito correctamente o si su reserva se encuentra confirmada.'

            let bookingData = {
              sitio: this.info.sitio,
              numTotem: localStorage.getItem('ipServer'),
              rut: 'Reimpreso',
              origen: 'N/A',
              destino: 'N/A',
              fecha_viaje: 'N/A',
              hora_viaje: 'N/A',
              asiento: 'N/A',
              codigo_reserva: 'N/A',
              numero_boleto: this.codeReprint,
              estado_boleto: 'Reimpresión fallida',
              codigo_transaccion: '',
              estado_transaccion: 'Intento de reimpresión',
              numero_transaccion: '',
              fecha_transaccion: '',
              hora_transaccion: '',
              total_transaccion: ''
            }

            this.axios
              .post(this.info.urlLogs, {
                bookingData: bookingData
              })
              .then(function () {
                console.log('Error guardado en DB (rePrint)')
              })
              .catch(function (error) {
                console.error('Error al guardar en DB, rePrint: ', error)
              })

            let self = this
            setTimeout(function () {
              self.texto = ''
            }, 10000)
          }
        })
        .catch((error) => {
          console.error(error)
          this.texto = 'Hubo un error al obtener los detalles de la reserva. Intente nuevamente más tarde.'

          let bookingData = {
            sitio: this.info.sitio,
            numTotem: localStorage.getItem('ipServer'),
            rut: 'Reimpreso',
            origen: 'N/A',
            destino: 'N/A',
            fecha_viaje: 'N/A',
            hora_viaje: 'N/A',
            asiento: 'N/A',
            codigo_reserva: 'N/A',
            numero_boleto: 'N/A',
            estado_boleto: 'Error al obtener los datos de la reserva',
            codigo_transaccion: '',
            estado_transaccion: 'Intento de reimpresión',
            numero_transaccion: '',
            fecha_transaccion: '',
            hora_transaccion: '',
            total_transaccion: ''
          }

          this.axios
            .post(this.info.urlLogs, {
              bookingData: bookingData
            })
            .then(function () {
              console.log('Error guardado en DB (rePrint)')
            })
            .catch(function (error) {
              console.error('Error al guardar en DB, rePrint: ', error)
            })

          let self = this
          setTimeout(function () {
            self.texto = ''
          }, 10000)
        })
    },

    // endpoint para imprimir
    // async imprimirRawBT(texto) {
    //   try {
    //     const response = await axios.post(this.info.urlPrint, {
    //       content: texto
    //     })
    //     const result = response.data
    //     if (result.rawbt) {
    //       window.location.href = result.rawbt
    //     }
    //   } catch (error) {
    //     console.error('Error al imprimir - imprimirRawBT: ', error)
    //   }
    // },

    // imprime el boleto
    async rePrint() {
      this.codeReprint = ''
      let tickets = []
      console.log('+ methods:imprimirVoucher', '! Número de boletos ' + this.tickets_reprint.boletos.length)

      for (let boleto of this.tickets_reprint.boletos) {
        tickets.push({
          boleto: boleto.boleto,
          codigo: boleto.codigo,
          codigo_reserva: boleto.codigo_reserva,
          rut: '',
          servicio: boleto.servicio,
          ruta: `${boleto.origen} ${boleto.hora} - ${boleto.destino} ${boleto.fecha}`,
          piso: boleto.piso,
          asiento: boleto.asiento,
          fecha: boleto.fecha,
          hora: boleto.hora,
          origen: boleto.origen,
          destino: boleto.destino,
          tipo_cliente: 'PULLMAN PASS',
          fecha_compra: boleto.fecha_compra,
          total: boleto.total
        })
      }

      try {
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
            ` FECHA DE VIAJE:    ${t.fecha}\n` +
            ` HORA DE VIAJE:     ${t.hora}\n` +
            ` TOTAL:             $${t.total}\n` +
            '                              \n' +
            '                              \n' +
            '---------- TERMINOS Y CONDICIONES ----------\n' +
            '            GRACIAS POR SU COMPRA\n' +
            '                COPIA CLIENTE\n' +
            '       BOLETO VALIDO PARA PASAJE EN BUS\n' +
            '---------------------------------------------\n'

          try {
            await this.imprimirRawBT(boletoTexto)
            console.log('Impresión enviada con éxito - transbank')
          } catch (error) {
            console.error('Error al enviar los datos de impresión', error)
          }

          // ver boleto en browser
          // const previewWindow = window.open('', '_blank')
          // previewWindow.document.write(`
          //  <pre style="font-size:14px; white-space:pre-wrap;">
          // ${boletoTexto}</pre>
          // `)
          // previewWindow.document.close()

          console.log('+ methods:reimprimir', 'tickets {}', boletoTexto, '-> /imprimir')
          // console.log(`Boleto ${t.boleto} enviado con éxito`, response.data)
        }
        this.texto = 'Boleto impreso correctamente.\nPorfavor retire su boleto.'
        setTimeout(() => {
          this.texto = ''
        }, 5000)
      } catch (error) {
        console.error('Error al imprimir boletos', error)
        this.texto = 'Hubo un error al intentar imprimir el boleto. Intente nuevamente más tarde.'
        setTimeout(() => {
          this.texto = ''
        }, 10000)
      }
    },

    goHome() {
      //this.$router.push('/')
      this.$router.push({ name: 'Home' })
    },
    // Click Toolbar button
    eventClick: function (name) {
      console.log('- methods:eventClick', 'Right-Button = ' + name)
      // Opción PAGAR o ANULAR
      if ('Right-Button' === name) {
        //<- PAGAR
        console.log('+ methods:eventClick', '-> methods:pagar')
        this.pagar() // <- Inicio el proceso de pago (2)
      } else {
        //<- ANULAR
        console.log('+ methods:eventClick', '-> goHome')
        this.goHome()
      }
    }
  },
  watch: {},
  mounted() {
    this.keyboard = new SimpleKeyboard({
      // onChange: this.onChange,
      onKeyPress: this.onKeyPress,
      //layout: layout,
      layoutName: 'default',
      layout: {
        default: ['1 2 3 4 5 6 7 8 9 0', 'Q W E R T Y U I O P', 'A S D F G H J K L Ñ', 'Z X C V B N M {bksp}']
      },
      display: {
        '{bksp}': 'Borrar',
        '{sp}': ' '
      }
    })
  }
}
</script>

<style scoped>
.s-custom-height {
  height: 1300px;
}

.s-custom-font {
  font-size: 28px;
}

input {
  font-size: 50px;
  padding: 5px;
  border: none;
  border-bottom: 1px solid #001689;
}

.card {
  border-radius: 10px;
}

.simple-keyboard {
  margin-top: 20px;
}
.hg-theme-default {
  bottom: 420px;
}

.button-radius {
  border-radius: 60px;
}

.input-codigo {
  text-transform: uppercase;
}

.input-codigo::placeholder {
  text-transform: none;
}
</style>

