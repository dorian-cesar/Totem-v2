<template>
  <div>
    <div class="transparent-main card-custom">
      <!-- Título de la pantalla-->
      <top-header-caption :caption="getTitulo" class="pt-4"/>

      <div v-show="mostrarIdas">
        <!--- List Caption Origin -->
        <list-caption v-bind="propsListCaptionOrigin"/>
        <!-- Caption headers -->
        <header-caption/>
        <div id="listado-origin" class="p-3" style="overflow-y: scroll !important;; max-height: 1200px">
          <!-- List bust -->
          <list-bus
            v-bind="propsListBusDeparture"
            :status="propsListCaptionOrigin.totalList"
          />
        </div>
      </div>

      <div v-show="!mostrarIdas">
        <!--- List Caption Destination -->
        <list-caption v-bind="propsListCaptionDestination"/>
        <!-- Caption headers -->
        <header-caption/>
        <div id="listado-destination" class="p-3" style="overflow: scroll; max-height: 1200px">
          <!-- List bust -->
          <list-bus
            v-bind="propsListBusDestination"
            :status="propsListCaptionDestination.totalList"
          />
        </div>
      </div>
    </div>
    <!-- Toolbar button-->
    <toolbar-button-new3 @nameButton="eventClick" :rbIsDisable="isDisable"/>
  </div>
</template>

<script>
import TopHeaderCaption from '@/components/TopHeaderCaption'
import ListCaption from '@/components/bus_selection/ListCaption'
import ListBus from '@/components/bus_selection/ListBus'
import HeaderCaption from '@/components/bus_selection/HeaderCaption'
import ToolbarButtonNew3 from "@/components/ToolbarButtonNew3";
import {mapGetters, mapActions} from 'vuex'
import {changeFormatDate} from '@/lib/calculateDays'
import formatDate from '@/mixins/formatDate'

export default {
  name: 'FormBusSelection',
  mixins: [formatDate],
  data: () => ({
    mostrarIdas: true, //<- Mostrar los servicios de IDA
    isRoundTrip: false, //<- Tipo IDA y VUELTA
    //
    changeFormatDate,
    show: '',
    info: [],
    // Props list bus
    propsListBusDeparture: {
      buttonType: 'origin',
      schedules: [],
    },
    propsListBusDestination: {
      buttonType: 'destination',
      schedules: [],
    },
    // Props caption of bus list groups
    propsListCaptionOrigin: {
      nameOrigin: '',
      nameDestination: '',
      travelDate: '',
      totalList: '',
    },
    propsListCaptionDestination: {
      nameOrigin: '',
      nameDestination: '',
      travelDate: '',
      totalList: '',
    },
  }),
  components: {
    TopHeaderCaption,
    HeaderCaption,
    ListCaption,
    ListBus,
    ToolbarButtonNew3
  },
  methods: {
    ...mapGetters(
      'TravelSelection', [
        'getDepartureDate',
        'getReturnDate',
        'getRoundTrip',
        'getNameDepartureCity',
        'getNameArrivalCity',
      ]
    ),
    ...mapGetters(
      'TravelSelection', [
        'getCodeDepartureCity',
        'getCodeArrivalCity',
        'getDepartureDate',
        'getReturnDate']
    ),
    ...mapActions('BusSelection', ['resetTravelBus']),
    ...mapGetters('BusSelection', ['getCountSeat']),

    eventClick(name) {
      if ('Right-Button' === name) {
        if (this.mostrarIdas === true && this.isRoundTrip) {
          this.mostrarIdas = false
        } else {
          this.$router.push({name: 'PurchaseDetail'})
        }
      } else {
        if (this.mostrarIdas === true) {
          this.$router.push({name: 'TravelSelection'})
        } else {
          this.mostrarIdas = true
        }
      }
    },

    // Get departure bus list this.getListBusOrigin()
    getListBusOrigin: async function () {
      // Reset total list
      this.propsListCaptionOrigin.totalList = ''

      // api dev
      const proxy = "https://newstg3-gdsbus.kupos.cl"
      const API_KEY = "TSXFQYAPI25766888"
      // api kupos
      // const proxy = "https://gds.kupos.com"
      // const API_KEY = "TSSDFPAPI30103014"

      const date = this.changeFormatDate2(this.getDepartureDate(), 'yyyymmdd')
      const api = `/gds/api/ui_schedules/${this.getCodeDepartureCity()}/${this.getCodeArrivalCity()}/${date}.json?api_key=${API_KEY}`
      const body = {
        origen: this.getCodeDepartureCity(),
        destino: this.getCodeArrivalCity(),
        fecha: this.changeFormatDate2(this.getDepartureDate(), 'yyyymmdd'),
        hora: "0000",
        idSistema: ID_SYSTEM,
      }

      const response = await this.axios.get([proxy, api].join("/"), {
        headers: {
          'content-type': 'application/json'
        }
      })
      // add 10 minutes from the current time
      let dayNow = new Date()
      dayNow.setHours(dayNow.getHours())
      dayNow.setMinutes(dayNow.getMinutes() + 10)

      const validTime = new Date(
        dayNow.getFullYear().toString(),
        dayNow.getMonth().toString(),
        dayNow.getDate().toString(),
        dayNow.getHours().toString(),
        dayNow.getMinutes().toString()
      )

      // filter the list of buses only to show those with a departure time of more than 30 minutes from the current time

      let results = response.data.result;
      // console.log(results)

      // console.log(results[0])
      // console.log(results[1])
      results.shift();

      this.propsListBusDeparture.schedules = []
      for (let result of results) {
        // cambiar a 'Turbo-kupos-stg1' para api dev
        if (result[3] === 'Turbo-kupos-stg1') {
          let boarding = result[22].split(',')
          let boarding_terminalsText = []
          let boarding_terminalsHTML = []
          for (let t = 0; t < boarding.length; t++) {
            let stage = boarding[t].split('||')
            let stage_terminal_hour = stage[0].split('|')[1]
            let stage_terminal_name = stage[1]
            boarding_terminalsText.push(`${stage_terminal_name} (${stage_terminal_hour})`)
            boarding_terminalsHTML.push(`<strong>${stage_terminal_name}</strong><p>(${stage_terminal_hour})</p>`)
          }
          boarding_terminalsText = boarding_terminalsText.join(' / ')
          boarding_terminalsHTML = boarding_terminalsHTML.join('')
          // console.log("result", result)
          const r = {
            idServicio: result[0],
            operador: result[3],
            idTerminalOrigen: result[4],
            idTerminalDestino: result[5],
            terminalOrigen: boarding_terminalsText,
            terminalOrigenHTML: boarding_terminalsHTML,
            terminaLlegada: result[23].split('||')[1],
            fechaServicio: result[35],
            boarding_at: result[22].split('|')[0],
            horaSalida: result[9],
            horaLlegada: result[10],
            asientosDisponibles: result[12],
            asientosTotales: result[13],
            asientosReservados: result[13] - result[12],
            servicioPrimerPiso: result[15].split(':')[0],
            servicioSegundoPiso: result[8].includes('2+1') ? result[15].split(':')[0] : 0,
            tarifaPrimerPisoInternet: result[15].split(':')[1].split('.')[0],
            tarifaSegundoPisoInternet: result[15].split(':')[1].split('.')[0],
            busPiso1: result[15].split(':')[1].split('.')[0],
            busPiso2: result[8].includes('2+1') ? result[15].split(':')[1] : 0,
            integrador: 1,
            empresa: result[3],
            idClaseBusPisoUno: result[15].split(':')[0],
            idClaseBusPisoDos: result[8].includes('2+1') ? result[15].split(':')[0] : 0,
            ruta: result[2],
            tipoBus: result[8],
            costo: result[15].split(',')[0],
            rutaId: result[7]
          }
          this.propsListBusDeparture.schedules.push(r)
          // console.log("r", r)
        }
      }
      // console.log("propsListBusDeparture.schedules", this.propsListBusDeparture.schedules)
      this.propsListCaptionOrigin.totalList = this.propsListBusDeparture.schedules.length.toString()
    },

    // Get return bus list
    getListBusReturn: async function () {
      this.propsListCaptionDestination.totalList = ''

      // api dev
      const proxy = "https://newstg3-gdsbus.kupos.cl"
      const API_KEY = "TSXFQYAPI25766888"
      // api kupos
      // const proxy = "https://gds.kupos.com"
      // const API_KEY = "TSSDFPAPI30103014"
      const date = this.changeFormatDate2(this.getReturnDate(), 'yyyymmdd')
      const api = `/gds/api/ui_schedules/${this.getCodeArrivalCity()}/${this.getCodeDepartureCity()}/${date}.json?api_key=${API_KEY}`
      const body = {
        origen: this.getCodeDepartureCity(),
        destino: this.getCodeArrivalCity(),
        fecha: this.changeFormatDate2(this.getReturnDate(), 'yyyymmdd'),
        hora: "0000",
        idSistema: ID_SYSTEM,
      }

      const response = await this.axios.get([proxy, api].join("/"), {
        headers: {
          'content-type': 'application/json'
        }
      })

      let results = response.data.result;
      results.shift();

      this.propsListBusDestination.schedules = [];
      for (let result of results) {
        // cambiar a 'Turbo-kupos-stg1' para api dev
        if (result[3] === 'Turbo-kupos-stg1') {
          let boarding = result[22].split(',')
          let boarding_terminalsText = []
          let boarding_terminalsHTML = []
          for (let t = 0; t < boarding.length; t++) {
            let stage = boarding[t].split('||')
            let stage_terminal_hour = stage[0].split('|')[1]
            let stage_terminal_name = stage[1]
            boarding_terminalsText.push(`${stage_terminal_name} (${stage_terminal_hour})`)
            boarding_terminalsHTML.push(`<strong>${stage_terminal_name}</strong><p>(${stage_terminal_hour})</p>`)
          }

          const r = {
            idServicio: result[0],
            operador: result[3],
            idTerminalOrigen: result[4],
            idTerminalDestino: result[5],
            terminalOrigen: boarding_terminalsText.join(' / '),
            terminalOrigenHTML: boarding_terminalsHTML.join(''),
            terminaLlegada: result[23].split('||')[1],
            fechaServicio: result[35],
            boarding_at: result[22].split('|')[0],
            horaSalida: result[9],
            horaLlegada: result[10],
            asientosDisponibles: result[12],
            asientosTotales: result[13],
            asientosReservados: result[13] - result[12],
            servicioPrimerPiso: result[15].split(':')[0],
            servicioSegundoPiso: result[8].includes('2+1') ? result[15].split(':')[0] : 0,
            tarifaPrimerPisoInternet: result[15].split(':')[1].split('.')[0],
            tarifaSegundoPisoInternet: result[15].split(':')[1].split('.')[0],
            busPiso1: result[15].split(':')[1].split('.')[0],
            busPiso2: result[8].includes('2+1') ? result[15].split(':')[1] : 0,
            integrador: 1,
            empresa: result[3],
            idClaseBusPisoUno: result[15].split(':')[0],
            idClaseBusPisoDos: result[8].includes('2+1') ? result[15].split(':')[0] : 0,
            ruta: result[2],
            tipoBus: result[8],
            costo: result[15].split(',')[0],
            rutaId: result[7]
          }

          this.propsListBusDestination.schedules.push(r)
        }
      }

      this.propsListCaptionDestination.totalList = this.propsListBusDestination.schedules.length.toString()
    }
  },

  mounted() {
    this.resetTravelBus();

    this.propsListCaptionOrigin.nameOrigin = this.getNameDepartureCity()
    this.propsListCaptionOrigin.nameDestination = this.getNameArrivalCity()
    this.propsListCaptionOrigin.travelDate = this.changeFormatDate(this.getDepartureDate(), 'dayMonth', false)

    this.propsListCaptionDestination.nameOrigin = this.getNameArrivalCity()
    this.propsListCaptionDestination.nameDestination = this.getNameDepartureCity()
    this.propsListCaptionDestination.travelDate = this.changeFormatDate(this.getReturnDate(), 'dayMonth', false)

    this.isRoundTrip = this.getRoundTrip();

    this.getListBusOrigin();

    if (this.isRoundTrip) {
      this.getListBusReturn();
    }
  },
  computed: {
    isDisable() {
      return !(this.getCountSeat() > 0)
    },

    getTitulo() {
      return [
        'SERVICIOS DE',
        (this.mostrarIdas) ? 'IDA' : 'VUELTA'
      ].join(' ')
    },
  },
}

</script>

<style scoped>
::-webkit-scrollbar {
  -webkit-appearance: none;
  width: 20px;
}

::-webkit-scrollbar-thumb {
  border-radius: 5px;
  background-color: rgba(0, 0, 0, .5);
  -webkit-box-shadow: 0 0 1px rgba(255, 255, 255, .5);
}
</style>
