<template>
  <div role="tablist">

    <!-- Show the spinner, when searching list bus -->
    <div v-if="(showList === '')" class="text-white text-center">
      <b-spinner type="grow"/>
      <span class="text-white pl-2 h3">Espere cargando listado de Buses</span>
    </div>

    <!-- Message with not found result -->
    <div v-else-if="(showList === '0')" class="text-center pt-2">
      <font-awesome-icon
        :icon="['fas', 'exclamation-triangle']"
        :style="{ color: 'white' }"
        size="2x"
      />
      <span class="text-white pl-2 h3">No se encontraron resultados para la ruta seleccionada</span>
    </div>

    <!-- List bus when other -->
    <b-card
      v-else no-body
      class="mb-1"
      v-for="bus in schedules"
      :key="[bus.idServicio, bus.idTerminalOrigen, bus.idTerminalDestino].join('-')">
      <b-card-header header-tag="header" class="p-1" role="tab">
        <b-button
          block href="#"
          v-b-toggle="['accordion', buttonType, bus.idServicio, bus.idTerminalOrigen, bus.idTerminalDestino].join('-')"
          class="bg-light text-dark pt-3"
          @click="changeColorT([buttonType, bus.idServicio, bus.idTerminalOrigen, bus.idTerminalDestino].join('-'))"
          :id="['list', buttonType, bus.idServicio, bus.idTerminalOrigen, bus.idTerminalDestino].join('-')"
          :name="['list', buttonType, bus.idServicio, bus.idTerminalOrigen, bus.idTerminalDestino].join('-')"
          :ref="['list', buttonType, bus.idServicio, bus.idTerminalOrigen, bus.idTerminalDestino].join('-')"
          style="height: 130px"
        >
          <b-row class="font-weight-lighter textHeaders">
            <b-col cols="2" class="text-left">
              <b-img
                thumbnail
                :src="imgLogo"
                style="width: 200px; height: 50px; object-fit: contain;"
              />
            </b-col>

            <b-col
              cols="2"
              :ref="['station',buttonType,bus.idServicio, bus.idTerminalOrigen, bus.idTerminalDestino].join('-')"
              :data-hour-departure="bus.horaSalida"
            >
              <!-- <h6>{{ bus.terminalSalida }}</h6> -->
              <h6>{{ bus.terminalOrigen }}</h6>
            </b-col>

            <b-col cols="2">
              <h6>{{ bus.terminaLlegada }}</h6>
            </b-col>

            <b-col cols="2">
              <h4><b>{{ bus.horaSalida }}</b></h4>
            </b-col>

            <b-col cols="2" class="text-left">
              <h6>{{ bus.servicioPrimerPiso }}</h6>
              <h6>{{ (bus.servicioSegundoPiso) ? bus.servicioSegundoPiso : '' }}</h6>
            </b-col>

            <b-col
              cols="2"
              class="text-right"
            >
              <span
                class="text-info font-weight-bold"
                :id="['price',buttonType,bus.idServicio, bus.idTerminalOrigen, bus.idTerminalDestino].join('-')"
                :ref="['price',buttonType,bus.idServicio, bus.idTerminalOrigen, bus.idTerminalDestino].join('-')"
                :data-price-1="bus.tarifaPrimerPisoInternet"
                :data-price-2="(bus.tarifaSegundoPisoInternet)?bus.tarifaSegundoPisoInternet:''"
              >
                <h5 class="font-weight-bold">${{ bus.tarifaPrimerPisoInternet }}</h5>
                <h5 class="font-weight-bold">{{ (bus.tarifaSegundoPisoInternet) ? ['$', bus.tarifaSegundoPisoInternet].join('') : '' }}</h5>
              </span>
            </b-col>

          </b-row>
          <b-row class="font-weight-lighter textHeaders">
            <b-col cols="8" class="text-left">

            </b-col>
            <b-col cols="4" class="text-right">
              <h4>
                <b-badge
                  v-show="false"
                  variant="success"
                  :ref="['badge-selected',buttonType,bus.idServicio, bus.idTerminalOrigen, bus.idTerminalDestino].join('-')"
                >
                  <!-- Seleccionados: 0 aquí aparece los seleccionados-->
                </b-badge>
              </h4>
            </b-col>
          </b-row>
        </b-button>
      </b-card-header>
      <b-collapse
        :id="['accordion',buttonType,bus.idServicio, bus.idTerminalOrigen, bus.idTerminalDestino].join('-')"
        :visible="false"
        accordion="my-accordion"
        role="tabpanel"
        :ref="['accordion',buttonType,bus.idServicio, bus.idTerminalOrigen, bus.idTerminalDestino].join('-')"
      >
        <b-card-body>

          <b-row>
            <b-col cols="12">

              <!-- Bus Seat -->
              <bus-seat
                v-if="(activeButton === [buttonType,bus.idServicio, bus.idTerminalOrigen, bus.idTerminalDestino].join('-'))"
                v-bind="{
                  type: buttonType,
                  name: [buttonType,bus.idServicio, bus.idTerminalOrigen, bus.idTerminalDestino].join('-'),
                  active: activeButton,
                  boarding_at: bus.boarding_at,
                  nameBus: nameBus([bus.idClaseBusPisoUno, bus.idClaseBusPisoDos]),
                  idServicio: bus.idServicio,
                  idOrigen: bus.idTerminalOrigen,
                  idDestino: (bus.idTerminalDestino)?bus.idTerminalDestino:'',
                  tipoBusPiso1: bus.busPiso1,
                  tipoBusPiso2: (bus.busPiso2)? bus.busPiso2: '',
                  fechaServicio: bus.fechaServicio,
                  horaSalida: bus.horaSalida,
                  horaLlegada: bus.horaLlegada,
                  asientosDisponibles: bus.asientosDisponibles,
                  asientosReservados:  bus.asientosReservados,
                  asientosTotales: bus.asientosTotales,
                  integrador: bus.integrador,
                  empresa: bus.empresa,
                  idClaseBusPisoUno: bus.idClaseBusPisoUno,
                  idClaseBusPisoDos: (bus.idClaseBusPisoDos)? bus.idClaseBusPisoDos : '',
                  busPiso1: bus.busPiso1,
                  busPiso2: (bus.busPiso2)? bus.busPiso2 : '',
                  tarifaPrimerPisoInternet: bus.tarifaPrimerPisoInternet || '',
                  tarifaSegundoPisoInternet: bus.tarifaSegundoPisoInternet || '',
                  servicioPrimerPiso: bus.servicioPrimerPiso || '',
                  servicioSegundoPiso: bus.servicioSegundoPiso || ''
                }"
              />
            </b-col>
          </b-row>
        </b-card-body>
      </b-collapse>
    </b-card>
  </div>
</template>

<script>
import BusSeat from '@/components/bus_selection/BusSeat'
import {mapActions} from 'vuex'
import {changeFormatDate} from "../../lib/calculateDays";
import imgLogo from '@/assets/img/logo_pullman.png'

export default {
  name: 'ListBus',
  data: () => ({
    activeButton: '',
    imgLogo: imgLogo
  }),
  components: {BusSeat,},
  props: {
    buttonType: {type: String, required: true, default: () => ''},
    schedules: {type: Array, required: true, default: () => ''},
    status: {type: String, required: true, default: () => ''},
  },
  methods: {
    ...mapActions('BusSelection', ['resetCountSeat']),

    getDate(value) {
      return (changeFormatDate(value, 'onlyDay'))
    },

    changeColorT: function (name) {
      // chequear si otro bus está seleccionado
      if ('' !== this.activeButton && this.activeButton !== name)
        this.changeColor(this.activeButton)

      this.changeColor(name)

    },

    changeColor: function (name) {
      let elementList = document.getElementById(['list', name].join('-')) //  List
      let elementPrice = document.getElementById(['price', name].join('-')) // Price

      // Activate
      if (elementList.classList.contains('bg-light')) {
        // check if there is an active button
        if (this.activeButton) {
          // check if it is the same type (origin or destinity)
          const val = this.activeButton.slice(0, 6)
          if (-1 !== name.indexOf(val)) {
            // Deactivate the previous button
            let elementList = document.getElementById(['list', this.activeButton].join('-')) //  List
            let elementPrice = document.getElementById(['price', this.activeButton].join('-')) // Price
            elementPrice.classList.add('text-info')
            elementList.classList.replace('bg-info', 'bg-light')
            elementList.classList.replace('text-white', 'text-dark')
          }
        }

        // Active button
        elementPrice.classList.remove('text-info')
        elementList.classList.replace('bg-light', 'bg-info')
        elementList.classList.replace('text-dark', 'text-white')
        this.activeButton = name
 
      } else if (this.$refs['accordion-' + name][0].show) { // deactivate
        elementPrice.classList.add('text-info')
        elementList.classList.replace('bg-info', 'bg-light')
        elementList.classList.replace('text-white', 'text-dark')
        this.activeButton = ''
      }
    },

    // return val1-val2 or val
    nameBus: value => {
      return value.filter(a => a != null).join('')
    },

  },
  mounted() {
    // Reset seat counter
    this.resetCountSeat()

  },
  computed: {
    showList: function () {
      return this.status
    }
  },
}

</script>

<style scoped>
/* size text Headers */
.textHeaders {
  /*font-size: medium;*/
  font-size: 14px;
  font-weight: bold !important;
}
</style>
