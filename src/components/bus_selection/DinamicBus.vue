<template>
  <div>
    <b-row>
      <!-- Distribution of seats -->
      <b-col cols="12" class="pb-1">
        <b-overlay :show="isLoadingReservation" rounded="sm">
          <b-row class="text-center">
            <div class="pb-2">
              <b-card no-body border-variant="info" style="width: 900px">
                <b-row class="p-2">
                  <b-col>
                    <b-img :src="imgFreeSeat" alt="Seat" class="seat-img" draggable="false" width="40" />
                    <span class="font">Asiento disponible</span>
                  </b-col>
                  <b-col>
                    <b-img :src="imgSelectedSeat" alt="Seat" class="seat-img" draggable="false" width="40" />
                    <span class="font">Asiento seleccionado</span>
                  </b-col>
                  <b-col>
                    <b-img :src="imgBusySeat" alt="Seat" class="seat-img" draggable="false" width="40" />
                    <span class="font">Asiento reservado</span>
                  </b-col>
                </b-row>
              </b-card>
            </div>
            <div v-for="(drawFloor, indexDrawFloor) in drawSeats" :key="indexDrawFloor" class="pb-2">
              <b-card
                border-variant="info"
                :header="`PISO ${indexDrawFloor + 1} - ${getTypeByFloor(indexDrawFloor)}`"
                header-bg-variant="dark"
                header-text-variant="white"
                header-class="h5"
              >
                <b-card-text>
                  <b-col
                    v-for="(drawRow, indexDrawRow) in drawFloor"
                    cols="12"
                    class="text-right"
                    :key="indexDrawRow"
                    style="width: 860px"
                  >
                    <!-- <seat
                      v-for="(drawSeat, indexSeat) of drawRow"
                      :key="['seat', indexDrawFloor, indexDrawRow, indexSeat, drawSeat].join('-')"
                      :ref="setRef(drawSeat)"
                      @check="changeStatusSeat($event)"
                      v-bind="getValues({num: drawSeat, floor:indexDrawFloor})"
                    /> -->
                    <seat
                      v-for="(drawSeat, indexSeat) of drawRow"
                      :key="['seat', indexDrawFloor, indexDrawRow, indexSeat, drawSeat.num].join('-')"
                      :ref="
                        -1 === [null, 'X', 'B1', 'B2', '%', 'blank'].indexOf(drawSeat.num)
                          ? ['seat', 0 === indexDrawFloor ? drawSeat.num : parseInt(drawSeat.num).toString()].join('-')
                          : ''
                      "
                      @check="changeStatusSeat($event)"
                      v-bind="getValues({ num: drawSeat.num, floor: indexDrawFloor })"
                    />
                  </b-col>
                </b-card-text>
              </b-card>
            </div>
          </b-row>
          <!-- overlay reservar o liberar asiento-->
          <template v-slot:overlay>
            <div class="text-center">
              <b-spinner variant="primary" class="m-2" style="width: 3rem; height: 3rem" />
              <p id="cancel-label" class="h3">Espere {{ isReservation ? 'Reservando' : 'Liberando' }} Asiento</p>
            </div>
          </template>
        </b-overlay>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import Seat from '@/components/bus_selection/Seat'
import ReserveOrReleaseSeat from '@/mixins/reserveOrReleaseSeat'
import { mapGetters, mapActions } from 'vuex'

import imgFreeSeat from '@/assets/img/seat/free_seat.png'
import imgSelectedSeat from '@/assets/img/seat/selected_seat.png'
import imgBusySeat from '@/assets/img/seat/busy_seat.png'

export default {
  name: 'DinamicBus',
  mixins: [ReserveOrReleaseSeat],
  components: { Seat },
  data: () => ({
    imgFreeSeat,
    imgSelectedSeat,
    imgBusySeat,
    seatNum: '',
    tmpNumSelected: 0, // valor temporal
    tmpNumFree: 0, // valor temporal
    boxMsg: false,
    loading: false,
    isReservation: true,
    status: 0,
    check: '',
    isFloor1: true,
    propsPassengerCounter: {
      numFree: 0,
      numBusy: 0,
      numSelected: 0
    }
  }),

  props: {
    drawSeats: { type: Array, required: true, default: () => [] },
    availableSeats: { type: Array, required: true, default: () => [] },
    param: { type: Object, required: true, default: () => null },
    service: { type: Object, required: true }
  },

  computed: {
    seatComponent() {
      return this.$refs[`seat-${this.seatNum}`][0]
    }
  },

  methods: {
    ...mapGetters('BusSelection', ['getTravelBus']),
    ...mapActions('BusSelection', ['SetInterval']),

    // nombre del servicio
    getBusList() {
      return this.$parent.name
    },

    getTypeByFloor(floor) {
      return floor === 0 ? this.service.servicioPrimerPiso : this.service.servicioSegundoPiso
    },

    getStatusToSeat(num, floor) {
      let status = ''
      if (isNaN(num)) status = 'busy'
      else {
        const seat = this.availableSeats.find((o) => o.floor === floor && o.num === num)
        status = seat ? seat.status : 'busy'
      }
      return status
    },
    // cambiar los valores de num y estatus para dibujar los asientos del bus
    getValues(item) {
      //arreglo de valores que trae la API
      //const num = this.fixNumOfSeatForFloor(item.num, item.floor)
      const status = this.getStatusToSeat(item.num, item.floor)
      return {
        num: item.num,
        status: status,
        numfloor: item.floor === 0 ? '1' : '2'
      }
    },

    // Mensaje de error
    async showMsgBoxError(num) {
      await this.$bvModal.msgBoxOk('Se presentó un error al reservar el asiento, debe elegir otro.', {
        title: 'Información',
        size: 'sm',
        buttonSize: 'lg',
        okVariant: 'success',
        headerClass: 'p-2 ml-2 mr-2 border-bottom-0',
        footerClass: 'p-2 ml-2 mr-2 border-top-0',
        centered: true
      })
      await this.reservaHandler(num) 
    },

    //cuando se selecciona un asiento
    async changeStatusSeat({ state, num }) {
      // console.log('params changeStatusSeat', this.param)
      this.seatNum = num
      this.param.asiento = num

      if (state === 'add') {
        this.tmpNumSelected = this.propsPassengerCounter.numSelected + 1
        this.tmpNumFree = this.propsPassengerCounter.numFree - 1

        // this.setupParam()
        this.isReservation = true // reservar asiento
        this.param.book_ticket = {
          seat_details: {
            seat_detail: [
              {
                seat_number: num,
                fare: this.service.tarifaPrimerPisoInternet,
                title: 'Mr',
                name: 'Ivan Valenzuela',
                age: '33',
                sex: 'M',
                is_primary: 'true',
                id_card_type: '1',
                id_card_number: '17211508k',
                id_card_issued_by: 'oneone'
              }
            ]
          },
          contact_detail: {
            mobile_number: '942858102',
            emergency_name: 'Ivan Valenzuela',
            email: 'ivalenzuela@wit.la'
          }
        }
        this.param.origin_id = this.param.origen
        this.param.destination_id = this.param.destino
        this.param.boarding_at = this.param.boarding_at
        this.param.no_of_seats = '1'
        this.param.travel_date = this.param.fecha
        this.param.travel_time = this.param.horaSalida
        this.param.cost
        this.param.bus_type
        this.param.route_id

        // console.log(this.drawSeats)
        await this.seatReservation('add', this.param, this.param.servicio)
        console.log('DinamicBus: add', this.param)
      } else if (state === 'delete') {
        //   this.tmpNumSelected = this.propsPassengerCounter.numSelected - 1
        //   this.tmpNumFree = this.propsPassengerCounter.numFree + 1

        //   delete this.param.tarifa
        //   const { codeReservation } = this.getTravelBus().find((travel) => travel.asiento === num)
        //   this.param.codigoReserva = codeReservation
        //   await this.seatReservation('delete', this.param)
        //   console.log('DinamicBus: delete', this.param)
        //   this.isReservation = false // liberar asiento
        await this.deselectSeat(num)
      }
    },

    async deselectSeat(seatNumber) {
      try {
        const seatRef = `seat-${seatNumber}`
        const seatComponent = (this.$refs[seatRef] && this.$refs[seatRef][0]) || null

        if (seatComponent) {
          seatComponent.changeColor()
          this.tmpNumSelected = this.propsPassengerCounter.numSelected - 1
          this.tmpNumFree = this.propsPassengerCounter.numFree + 1
          delete this.param.tarifa
          const travel = this.getTravelBus().find((t) => t.asiento === seatNumber)
          if (travel) this.param.codigoReserva = travel.codeReservation
          this.isReservation = false
          console.log('DinamicBus: delete', this.param)
        }
      } catch (error) {
        console.error('Error al deseleccionar asiento:', error)
      }
    },

    async reservaHandler(seatNumber) {
      try {
        const seatRef = `seat-${seatNumber}`
        const seatComponent = (this.$refs[seatRef] && this.$refs[seatRef][0]) || null

        if (seatComponent) {
          seatComponent.changeColor()
          seatComponent.initialColor('busy')
          seatComponent.statusSeat = 'busy'
          this.tmpNumSelected = this.propsPassengerCounter.numSelected - 1
          this.propsPassengerCounter.numBusy += 1
          const travel = this.getTravelBus().find((t) => t.asiento === seatNumber)
          if (travel) this.param.codigoReserva = travel.codeReservation
          this.isReservation = false
          console.log('DinamicBus: reserva fallida, asiento marcado como ocupado', this.param)
        }
      } catch (error) {
        console.error('Error en reservaHandler:', error)
      }
    },

    setupParam() {
      const seat = this.availableSeats.find((availableSeat) => availableSeat.num === this.seatNum)
      const tarifaStr = seat.price

      delete this.param.codigoReserva
      this.param.tarifa = Number(tarifaStr.split('.').join(''))
    }
  },

  watch: {
    isLoadingReservation(value) {
      if (!value) {
        this.propsPassengerCounter.numSelected = this.tmpNumSelected
        this.propsPassengerCounter.numFree = this.tmpNumFree

        // cambiar el color del asiento
        this.seatComponent.changeColor()

        // Show and change the text on the ListBus component badge
        // (Seleccionados y Disponibles)
        let nameSelected = ['badge-selected', this.$parent.name].join('-')
        let comp = this.$parent.$parent.$parent
        // Show or hide badge selected
        comp.$refs[nameSelected][0].style.display = 0 < this.propsPassengerCounter.numSelected ? '' : 'none'
        // Change the number of seats selected
        comp.$refs[nameSelected][0].textContent = ['Seleccionados:', this.propsPassengerCounter.numSelected].join(' ')
      }
    },
    statusReservation(value) {
      console.log('DinamicBus: statusReservation ', value)
      if (!value) this.showMsgBoxError(this.seatNum)
    }
  }
}
</script>

