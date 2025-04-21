<template>
  <div>
    <!-- Show the spinner, when searching seats bus -->
    <div v-if="loading" class="text-black-50 text-center">
      <b-spinner type="grow"></b-spinner>
      <span class="text-black-50 pl-2 h4"
      >Espere cargando información del Bus</span
      >
    </div>
    <!-- draw bus  -->
    <dinamic-bus
      v-else
      :param="{
        servicio: idServicio,
        fecha: fechaServicio,
        boarding_at: boarding_at,
        origen: idOrigen,
        destino: idDestino,
        integrador
      }"
      :service="{
        tarifaPrimerPisoInternet,
        tarifaSegundoPisoInternet,
        servicioPrimerPiso,
        servicioSegundoPiso
      }"
      :drawSeats="propsDinamicBus.drawSeats"
      :availableSeats="propsDinamicBus.availableSeats"
      :key="key"
    />
  </div>
</template>

<script>
import DinamicBus from "@/components/bus_selection/DinamicBus";
import Utils from "@/mixins/utils";

export default {
  name: "BusSeat",
  mixins: [Utils],
  data: () => ({
    //key:'',
    loading: true,
    propsDinamicBus: {
      drawSeats: [],
      availableSeats: [],
    },
  }),
  components: {DinamicBus},
  props: {
    type: {type: String, required: true, default: () => ""},
    name: {type: String, required: true, default: () => ""},
    active: {type: String, required: true, default: () => ""},
    nameBus: {type: String, required: true, default: () => ""},
    idServicio: {type: Number, required: true, default: () => ""},
    idOrigen: {type: Number, required: true, default: () => ""},
    idDestino: {type: Number, required: true, default: () => ""},
    tipoBusPiso1: {type: String, required: true, default: () => ""},
    tipoBusPiso2: {type: String, default: () => ""},
    fechaServicio: {type: String, required: true, default: () => ""},
    boarding_at: {type: String, required: true, default: () => ""},
    horaSalida: {type: String, required: true, default: () => ""},
    horaLlegada: {type: String, required: true, default: () => ""},
    asientosDisponibles: {type: Number, required: true, default: () => ""},
    asientosReservados:  {type: Number, required: true, default: () => ""},
    asientosTotales:  {type: Number, required: true, default: () => ""},
    integrador: {type: Number, required: true, default: () => 0},
    empresa: {type: String, required: true, default: () => ""},
    idClaseBusPisoUno: {type: String, required: true, default: () => ""},
    idClaseBusPisoDos: {type: String, required: true, default: () => ""},
    busPiso1: {type: String, required: true, default: () => ""},
    busPiso2: {type: String, required: true, default: () => ""},
    tarifaPrimerPisoInternet: {type: String, required: true},
    tarifaSegundoPisoInternet: {type: String, required: true},
    servicioPrimerPiso: {type: String, required: true},
    servicioSegundoPiso: {type: String, required: true}
  },
  methods: {
    // Arreglar los datos para dibujar los asientos del bus
    fixFloorLayout(responseData) {
      const val = [responseData[1]]
      const responseDataFloor2 = responseData[2] || false

      if (responseDataFloor2) {
        let hasSeatsFloor2 = false

        for (let i = 0; i < responseDataFloor2.length; i++) {
          const row = responseDataFloor2[i]
          hasSeatsFloor2 = row.findIndex(seatNro => seatNro !== null) > -1
          if (hasSeatsFloor2) break
        }

        if (hasSeatsFloor2) val.push(responseDataFloor2)
      }

      return val
    },

    // Arreglas los datos para determinar el estado del asiento
    fixSeatsData(responseData) {
      let val = [];

      // Floor
      for (let floor in responseData) {
        // Column
        for (let column of responseData[floor]) {
          // Position
          for (let position of column) {
            if (
              this.isNumeric(position.asiento) &&
              position.estado !== 'sinasiento'
            ) {

              val.push({
                floor: floor - 1,
                seat: position.asiento,
                status: this.getChangeName(position.estado)
              });
            }
          }
        }
      }
      return val;
    },

    //cambiar el nombre por compatibilidad con el código del componente Seat
    getChangeName(value) {
      return [
        {name: "libre", change: "free"},
        {name: "ocupado", change: "busy"},
        {name: "pet-free", change: "busy"}, // <- Bloquea los puestos de mascotas
        {name: "pet-busy", change: "busy"}, // <- Bloquea los puestos de mascotas
        {name: "seleccionado", change: "selected"}
      ].find((val) => val.name === value).change;
    },

    //buscar distribución y estado de los asientos en el bus
    searchBusService: async function () {
      try {

        const proxy = "https://newstg3-gdsbus.kupos.cl"
        const API_KEY = "TSXFQYAPI25766888"
        const api1 = `/gds/api/ui_schedule/${this.idServicio}.json?api_key=${API_KEY}`
        //const api1 = "integrador-web/rest/private/venta/planilla"
        // const api2 = "integrador-web/rest/private/venta/buscarPlantillaVertical"


        const response = await this.axios.get([proxy, api1].join("/"), {
          headers: {
            'content-type': 'application/json'
          }
        })

        if (!response.data || !response.data.result || !response.data.result.bus_layout) {
          throw new Error('La respuesta de la API no contiene los datos esperados.');
        }
        // búsqueda de planilla
//        const requestOne = this.axios.post([proxy, api1].join("/"), {
//          idServicio: this.idServicio,
//          tipoBusPiso1:  this.tipoBusPiso1,
//          tipoBusPiso2:  this.tipoBusPiso2,
//          fechaServicio:  this.fechaServicio,
//          integrador:  this.integrador,
//        })
//
//        // búsqueda de planilla vertical
//        const requestTwo = this.axios.post([proxy, api2].join("/"), {
//          idServicio: this.idServicio,
//          tipoBusPiso1: this.tipoBusPiso1,
//          tipoBusPiso2: this.tipoBusPiso2,
//          fechaServicio: this.fechaServicio,
//          idOrigen: this.idOrigen,
//          idDestino: this.idDestino,
//          integrador: this.integrador,
//          clasePiso1: this.idClaseBusPisoUno,
//	        clasePiso2: this.idClaseBusPisoDos
//        })


//         let responseOne, responseTwo
//         for( let times = 0, isEmpty = true; times < 10 && isEmpty; times++ ){
//           [responseOne, responseTwo] = await this.axios.all([ requestOne, requestTwo])
//
//           isEmpty = (Object.keys(responseOne.data).length === 0 || Object.keys(responseTwo.data).length === 0)
//         }
        let layout = response.data.result.bus_layout.coach_details
        let layout_available = response.data.result.bus_layout.available.split(',')
        layout_available.shift();
        let available_seats = []
        for (let avail of layout_available) {
          let available_seat = avail.split('|')
          let available_seat_parsed = {
            num: available_seat[0],
            price: available_seat[1],
            floor: 0
          }
          available_seats.push(available_seat_parsed)
        }

        let rows = layout.split(',').filter(row => row !== "DR_IMG|.GY")
        // console.log("Filas después de filtrar:", rows)
        let seats_rows = []
        let seats_rows_plain = []
        let seats_available = []

        let seat_null = {
          numfloor: 0,
          floor: 0,
          num: 'blank-seat',
          type: null,
          status: null
        }
        for (let row of rows) {
          let row_seats = row.split('-')
          let seats = []
          let seats_plain = []
          for (let row_seat of row_seats) {
            seats_plain.push(row_seat)
            let seat_info = row_seat.split('|')
            let seat = seat_null
            if (seat_info[0] !== '') {
              seat = {
                numfloor: 0,
                floor: 0,
                num: seat_info[0],
                type: seat_info[1],
                status: 'busy'
              }
            } else if (seat_info[0] !== 'DR_IMG') {
              seat = {
                numfloor: 0,
                floor: 0,
                num: '%',
                type: seat_info[0],
                status: '%'
              }
            }
            seats.push(seat)
            seats_available.push(seat)
          }
          seats_rows.push(seats)
          seats_rows_plain.push(seats_plain)
        }

        // logica para determinar los pisos del bus y cuantos asientos tiene
        let floor_available = response.data.result.bus_layout.floor
        let seats_floor_1 = []
        let seats_floor_2 = []
        let floors = []
        if (floor_available !== '') {
          floor_available = floor_available.split('@')
          let floor_1 = floor_available[0]
          let floor_2 = floor_available[1]
          floor_1 = floor_1.split(',')
          floor_2 = floor_2.split(',')
          for (let sr of seats_rows) {
            let row = []
            let floor_activated = false
            for (let s of sr) {
              if (floor_1.includes(s.num) || floor_activated) {
                floor_activated = true
                s.numfloor = 0
                s.floor = 0
                row.push(s)
              }
            }
            seats_floor_1.push(row)
          }

          for (let sr of seats_rows) {
            let row = []
            let floor_activated = false
            for (let s of sr) {
              if (floor_2.includes(s.num) || floor_activated) {
                floor_activated = true
                s.numfloor = 1
                s.floor = 1
                row.push(s)
              }
            }
            seats_floor_2.push(row)
          }
          floors = [seats_floor_1, seats_floor_2]
          // console.log(floors)
        } else {
          floors = [seats_rows]
          // console.log(floors)
        }
        // determina las columnas
        let grid_full = []

        for (let floor of floors) {
          // Filtra los arrays vacíos en cada piso
          let filtered_floor = floor.filter(row => row.length > 0)

          let row_size = 5
          let grid_horizontal = new Array(row_size).fill(0).map(() => new Array(filtered_floor.length).fill(seat_null));

          let row_position = 0
          for (let row of filtered_floor) {
            let seat_position = 4
            for (let seat of row) {
              grid_horizontal[seat_position][row_position] = seat
              seat_position--
            }
            row_position++
          }

          // Eliminar el índice 0 si todos los asientos son 'seat_null'
          if (grid_horizontal[0].every(seat => seat === seat_null)) {
            grid_horizontal.shift(); // Elimina el primer índice (índice 0)
          }

          grid_full.push(grid_horizontal)
        }

        // console.log(grid_full);

        this.propsDinamicBus.drawSeats = [...grid_full]
        this.propsDinamicBus.availableSeats = [...available_seats]

        this.loading = false;

        //Guardar log
        // this.axios.post('http://3.80.65.145/logtotem', {frame: { url:[proxy, api1].join('/'), request: requestOne }, name: this.$info.totemName})
        // this.axios.post('http://3.80.65.145/logtotem', { frame: { url:[proxy, api1].join('/'), response: responseOne.data }, name: this.$info.totemName})
        // this.axios.post('http://3.80.65.145/logtotem', { frame: { url:[proxy, api2].join('/'), request: requestTwo }, name: this.$info.totemName})
        // this.axios.post('http://3.80.65.145/logtotem', { frame: { url:[proxy, api2].join('/'), response: responseTwo.data }, name: this.$info.totemName})

      } catch (error) {
        console.error("Error al obtener los datos del servicio del bus:", error);
        this.loading = false;
      }
    },
  },

  mounted() {
    this.searchBusService();
    this.key = this.numeroEquivalente(this.idServicio);
  },
  watch: {
    loading: function (val) {
      if (!val) {
        // scroll Top after show bus seat
        this.$scrollTo(["#list", this.name].join("-"), 500, {
          container: ["#listado", this.type].join("-"),
          easing: 'ease-in-out',
        });
      }
    },
  },
};
</script>
