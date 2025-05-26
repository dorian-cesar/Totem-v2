<template>
    <button
      type="button"
      class="btn position-relative btn-sm p-0"
      @click="selectSeat"
      :disabled="(-1 !== ['n','X','B1','B2','%'].indexOf(num))"
    >
      <b-img
        :src="( -1 === ['n','X','B1','B2','%'].indexOf(num) ) ? imgSeat : imgBlankSeat"
        alt="Seat"
        class="seats"
        draggable="false"
      />
      <span
        v-if="(-1 === ['n','X','B1','B2','%'].indexOf(num))"
        class="center"
        :class="[('free'!== statusSeat) ? 'text-white': '']"
      >
      <span>{{num}}</span>
    </span>
    </button>
</template>

<script>
  import imgFreeSeat from '@/assets/img/seat/free_seat.png'
  import imgSelectedSeat from '@/assets/img/seat/selected_seat.png'
  import imgBusySeat from '@/assets/img/seat/busy_seat.png'
  import imgBlankSeat from '@/assets/img/seat/blank_seat.png'
  import {mapActions, mapGetters} from 'vuex'

// const SEATS_LIMIT = 4
  localStorage.setItem('SEATS_LIMIT', 4);

  export default {
    name: 'Seat',
    data() {
      return {
        SEATS_LIMIT: parseInt(localStorage.getItem('SEATS_LIMIT')) || 4,
        imgFreeSeat,
        imgSelectedSeat,
        imgBusySeat,
        imgBlankSeat,
        imgSeat: '',
        statusSeat: ''
      }
    },
    props: {
      num: {type: String, required: true, default: () => ''}, // número del asiento
      status: {type: String, default: () => 'free',}, // (selected, free o busy)
      numfloor: {type: String, default: () => '1'}
    },
    methods: {
      ...mapActions('BusSelection', [
        'addCountSeat',
        'remCountSeat',
        'addTravelBus',
        'remTravelBus',
        'removeTravelBus'

      ]),
      ...mapGetters('BusSelection', ['getCountSeat', 'getTravelBus']),

      ...mapGetters(
        'TravelSelection',
        ['getCodeDepartureCity', 'getCodeArrivalCity', 'getDepartureDate', 'getReturnDate']),

      selectSeat() {
        if ('busy' !== this.statusSeat) {
          if (this.getCountSeat() < this.SEATS_LIMIT || 'selected' === this.statusSeat) {
            const state = ('free' === this.statusSeat) ? 'add' : 'delete'
            this.$emit('check', { state, num: this.num })
          } else {
             this.$bvModal.msgBoxOk(`No puede seleccionar mas de ${this.SEATS_LIMIT} asientos`, {
              title: 'Información',
              size: 'sm',
              buttonSize: 'lg',
              okVariant: 'success',
              headerClass: 'p-2 border-bottom-0',
              footerClass: 'p-2 border-top-0',
              centered: true
            })
          }
        }
      },

      // change seats color
      changeColor() {
        if ('busy' !== this.statusSeat) {
          if ('free' === this.statusSeat) {
            this.imgSeat = imgSelectedSeat
            this.statusSeat = 'selected'
            this.addCountSeat()
            this.addBusData() // add data in store
          } else if ('selected' === this.statusSeat) {
            this.imgSeat = imgFreeSeat
            this.statusSeat = 'free'
            this.remCountSeat()
            this.removeBusData() // remove data in store
          }
        }
      },
      // initial seat color
      initialColor(status) {
        switch (status) {
          case 'busy': {
            this.imgSeat = imgBusySeat
            break
          }
          case 'free': {
            this.imgSeat = imgFreeSeat
            break
          }
          case 'selected': {
            this.imgSeat = imgSelectedSeat
            break
          }
          default: {
            this.imgSeat = imgBlankSeat
            break
          }
        }
      },
      getBusList() {
        return this.$parent.$parent.$parent.$parent.$parent.activeButton
      },

      addBusData() {
        // seat
        const seat = this.num
        const listBus = this.$parent.$parent.$parent.$parent.$parent
        // BusList
        const activeButton = listBus.activeButton

        const busList = activeButton
        // Determinar si el servicio es de ida
        const isOrigin = ('origin' === activeButton.slice(0, 6))
        // Hora
        const hour =
          listBus.$refs[['station', activeButton].join('-')][0].dataset['hourDeparture']
        // Station
        const station =
          listBus
            .$refs[['station', activeButton].join('-')][0]
            .innerText

        const price =
          listBus
            .$refs[['price', activeButton].join('-')][0]
            .dataset[['price', this.numfloor].join('-')]

        // travel
        const props =
          (isOrigin)
            ? listBus.$parent.propsListCaptionOrigin
            : listBus.$parent.propsListCaptionDestination

        // type
        const type = (isOrigin) ? 'Ida' : 'Vuelta'
        // trip
        const trip = [props.nameOrigin, props.nameDestination].join('/')

        // date
        const date = this.$parent.$parent.param.fecha // DinamicBus

        // Piso
        const piso = this.numfloor.toString()

        const origen = this.$parent.$parent.param.origen
        // const destino = this.$parent.param.destino
        const destino = this.$parent.$parent.param.destino

        // Empresa
        const empresa = this.$parent.$parent.$parent.empresa

        // Clase
        const clase = ('1' === piso)
          ? this.$parent.$parent.$parent.idClaseBusPisoUno
          : this.$parent.$parent.$parent.idClaseBusPisoDos

        // Bus
        const bus = ('1' === piso)
          ? this.$parent.$parent.$parent.busPiso1
          : this.$parent.$parent.$parent.busPiso2
        // integrador
        const integrador = this.$parent.$parent.param.integrador

        const servicio = this.$parent.$parent.param.servicio

        const codeReservation = this.$parent.$parent.codeReservation

        const operatorPnr = this.$parent.$parent.operatorPnr

        // const available_seats = this.$parent.$parent.available_seats

        // const cost = this.$parent.$parent.cost

        // const bus_type = this.$parent.$parent.bus_type

        // const route_id = this.$parent.$parent.route_id

        const rut = localStorage.getItem('rut')

        //this.setTravelBus([{
        this.addTravelBus([{
          busList: busList, // <- Nombre interno del bus
          hour: hour,
          seat: seat,
          station: station,
          price: price,
          type: type,
          trip: trip,
          date: date,
          name: '', // <- name del prepend(Boleto 1, Boleto 2,...)
          rut: rut || 'Sin RUT', // <- rut del cliente
          // nuevos
          servicio: servicio,
          fechaServicio: date,
          horaSalida: hour,
          asiento: seat,
          origen: origen,
          destino: destino,
          precio: price,
          empresa: empresa,
          clase: clase,
          convenio: '', // <- por defecto
          datosConvenio: '', // <- por defecto
          bus: bus,
          piso: piso,
          integrador: integrador,
          codeReservation,
          operatorPnr,
          // available_seats,
          // cost,
          // bus_type,
          // route_id
        }])

      },
      removeBusData() {
        const seat = this.num
        const listBus = this.$parent.$parent.$parent.$parent.$parent

        this.removeTravelBus({busList: listBus.activeButton, seat: seat})
      },
      // chequea si el asiento ha sido reservado
      checkPreviouslyReserved(status) {
        return (!!this.getTravelBus().find(
            r => (this.num === r.seat && this.getBusList() === r.busList))
        )
          ? 'selected'
          : status
      },
    },
    mounted() {
      this.statusSeat = this.checkPreviouslyReserved(this.status)
      this.initialColor(this.statusSeat)
    }
  }
</script>

<style scoped>
  .seats {
    width: 50px;
    height: 50px;
    background-color: white;
  }

  .center {
    position: absolute;
    top: 23%;
    left: 23%;
    font-size: large;
  }

  @keyframes blinker {
    50% {
      opacity: 0;
    }
  }
</style>
