<template>
  <div class="pt-5">
    <b-container>
      <b-row align-v="center" class="s-custom-height">
        <b-col cols="12">
          <b-card border-variant="primary" style="background-color: azure;">
            <b-card-text>
              <b-row>
                <b-col class="">
                  <p class=" text-primary pb-2 font-weight-bolder s-custom-font">
                    Ingrese su código de reserva (ej: TS2301150405100000000)
                  </p>
                  <input type="text" placeholder="Ingrese su código de reserva" data-layout="normal" class="w-100" style="background-color: azure;"
                    v-model="codeReprint" />
                  <!-- disabled="disabled" -->
                  <p class="text-center text-primary pb-2 font-weight-bolder s-custom-font" style="white-space: pre-line;">
                    {{ texto }}
                  </p>
                </b-col>
              </b-row>
            </b-card-text>
          </b-card>
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
          <b-button class="custom-button btn-lg btn-info button-radius" @click="getBookingDetails">
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
      default: "simple-keyboard",
      type: String,
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
      text3: 'Estimado usuario pedimos disculpas por las molestias ocasionadas.' +
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
          this.codeReprint = ''
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
    getBookingDetails: async function () {
      // api dev
      const proxy = "https://newstg3-gdsbus.kupos.cl"
      const API_KEY = "TSXFQYAPI25766888"
      // api kupos
      // const proxy = "https://gds.kupos.com"
      // const API_KEY = "TSSDFPAPI30103014"
      let api = ''
      api = `/gds/api/booking_details.json?region=chile&pnr_number=${this.codeReprint}&api_key=${API_KEY}`

      this.texto = 'Imprimiendo boleto, por favor espere...';

      await this.axios
        .get([proxy, api].join('/'))
        .then(({ data }) => {
          if (typeof data === 'object') {
            if (typeof data.result !== 'undefined' && typeof data.result.ticket_details !== 'undefined' && data.result.ticket_details !== null) {
              let ticketsGeneradosFormatted = {
                boletos: [],
                estado: true
              }

              let ticket_info = data.result.ticket_details[0]
              let response_boleto = `${ticket_info.pnr_number}  -  ${ticket_info.operator_pnr}`
              let response_codigo = ticket_info.operator_reservation_id
              let response_servicio = ticket_info.bus_type
              let response_ruta = ticket_info.origin + ' / ' + ticket_info.destination
              let response_piso = ticket_info.seat_fare_details[0].seat_detail.floor_no !== '' ? ticket_info.seat_fare_details[0].seat_detail.floor_no : '1'
              let response_asiento = ticket_info.seat_fare_details[0].seat_detail.seat_number
              let response_fecha = ticket_info.travel_date
              let response_hora = ticket_info.boarding_point_details.dep_time
              let response_origen = ticket_info.boarding_point_details.landmark
              let response_destino = ticket_info.destination
              let issued_on = new Date();
              issued_on = issued_on.toLocaleString('es-CL', { hour12: false });
              let response_fecha_compra = issued_on
              let response_total = ticket_info.seat_fare_details[0].seat_detail.fare
              let response_ticket = {
                boleto: response_boleto,
                codigo: response_codigo.toString(),
                rut: '',//<- No se indica Rut en los boletos
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
                tipo_cliente: 'PULLMAN PASS',
              }
              ticketsGeneradosFormatted.boletos.push(response_ticket)
              this.tickets_reprint = ticketsGeneradosFormatted
              this.rePrint()

              this.axios.post(
                'https://s1.ntic.cl/totem-costa-handler/index.php',
                {
                  type: 'print_request',
                  call_url: api,
                  data: this.ticketsGenerados,
                  name: this.info.totemName
                }
              )
            } else {
              this.texto = 'Código de reserva inválido.\nVerifique si el boleto fue escrito correctamente o si su reserva se encuentra confirmada.'
              setTimeout(() => {
                this.texto = ''
              }, 10000)
            }
          }
        })
        .catch(error => {
          console.error(error);
          this.texto = 'Hubo un error al obtener los detalles de la reserva. Intente nuevamente más tarde.';
          setTimeout(() => { this.texto = ''; }, 10000);

          //   this.axios.post(
          //     'https://s1.ntic.cl/totem-costa-handler/index.php',
          //     {
          //       type: 'print_error',
          //       call_url: api,
          //       data: this.ticketsGenerados,
          //       name: this.info.totemName
          //     }
          //   )
        }
        )
        .finally(() => {

        }
        )
    },

    // imprime el boleto
    async rePrint() {
      this.codeReprint = '';
      let tickets = [];
      console.log('+ methods:imprimirVoucher', '! Número de boletos ' + this.tickets_reprint.boletos.length);

      for (let boleto of this.tickets_reprint.boletos) {
        tickets.push({
          boleto: boleto.boleto,
          codigo: boleto.codigo,
          rut: '', // No se indica Rut en los boletos
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
        });
      }

      const url = 'https://192.168.88.246:3000';
      const api = '/imprimir';

      try {
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
            '                              \n';

          const response = await axios.post(url + api, {
            texto: boletoTexto
          });
          console.log(`Boleto ${t.boleto} enviado con éxito`, response.data);
        }
        this.texto = 'Boleto impreso correctamente.\nPorfavor retire su boleto.';
        setTimeout(() => {
          this.texto = '';
        }, 5000);
      } catch (error) {
        console.error('Error al imprimir boletos', error);
        this.texto = 'Hubo un error al intentar imprimir el boleto. Intente nuevamente más tarde.';
        setTimeout(() => {
          this.texto = '';
        }, 10000);
      }
    },

    goHome() {
      //this.$router.push('/')
      this.$router.push({ name: "Home" });
    },
    // Click Toolbar button
    eventClick: function (name) {
      console.log("- methods:eventClick", "Right-Button = " + name);
      // Opción PAGAR o ANULAR
      if ("Right-Button" === name) {
        //<- PAGAR
        console.log("+ methods:eventClick", "-> methods:pagar");
        this.pagar(); // <- Inicio el proceso de pago (2)
      } else {
        //<- ANULAR
        console.log("+ methods:eventClick", "-> goHome");
        this.goHome();
      }
    }
  },
  watch: {},
  // mounted() {
  //   this.keyboard = new SimpleKeyboard({
  //     // onChange: this.onChange,
  //     onKeyPress: this.onKeyPress,
  //     //layout: layout,
  //     layoutName: "default",
  //     layout: {
  //       default: [
  //         "1 2 3 4 5 6 7 8 9 0",
  //         "Q W E R T Y U I O P",
  //         "A S D F G H J K L Ñ",
  //         "Z X C V B N M {bksp}"
  //       ]
  //     },
  //     display: {
  //       '{bksp}': 'Borrar',
  //       '{sp}': ' '
  //     }
  //   });
  // }
}
</script>

<style scoped>
.s-custom-height {
  height: 1300px
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

.button-radius {
  border-radius: 60px;
}
</style>
