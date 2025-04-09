export default {
  namespaced: true,
  state: {
    countSeat: 0,
    nameBustSeatActive: '', // active BusSeat component name
    /*
    *  Array values travelBus
    * ------------------------
    *  busList: type String, bus name in listBus
    *  seat: type String, seat number
    *  hour: type String, departure time
    *  station: type String, station name
    *  price: type String, ticket price
    *  type: type String, type departure or arrival
    *  trip: type String, trip name
    *  date: type String, date name
    *  rut: type String, rut of the ticket
    *  name: type String, (Boleto 1, Boleto 2, ...)
    *  nuevos
    * serviceId
    * */
    travelBus: [],
    totalAmount:''
  },
  getters: {
    getCountSeat: state => {
      return state.countSeat
    },
    getNameBusSeat: state => {
      return state.nameBustSeatActive
    },

    // datos del pasaje
    getTravelBus: state => {
      return (0 === state.travelBus.length) ? [...state.travelBus] : state.travelBus
    },
    getCountTravelBus: state => {
      return state.travelBus.length
    },
    // Monto total de la compra
    getTotalAmount(){
      return state.totalAmount
    },
  },
  mutations: {
    addCountSeat (state) {
      state.countSeat += 1
    },
    remCountSeat (state) {
      state.countSeat -= 1
    },
    resetCountSeat (state) {
      state.countSeat = 0
    },
    setNameBustSeatActive (state, value) {
      state.nameBustSeatActive = value
    },
    setTravelBus (state, value) {
      state.travelBus = (state.travelBus.length > 0)
        ?
        [...state.travelBus, ...value]
        :
        state.travelBus = [...value]
    },
    // resetTravelBus (state) {
    //   state.travelBus.length = 0 // = []
    // },

    /*
    * borrar boleto, se necesita nombre del bus (busList) y el número de asiento (seat)
    * {busList: '', seat:''}
    * */
    removeBus (state, value) {
      state.travelBus =
        state
          .travelBus
          //.filter(busSeat => (busSeat['busList'] !== value['nameBus'] || busSeat['seat'] !== value['seat']))
          .filter(busSeat => (busSeat['busList'] !== value['busList'] || busSeat['seat'] !== value['seat']))

    },


    setRut (state, value) {
      state.travelBus[value['position']].rut = value['value']
    },


    // borrar todos registros
    resetTravelBus (state) {state.travelBus.length = 0 },
    // incluir el asiento
    addTravelBus (state, value) {

      state.travelBus =
        (state.travelBus.length > 0)
          ? [...state.travelBus, ...value]
          : state.travelBus = [...value]
    },
    /* Eliminar sacar el asiento
    *  {busList:'', seat:''}
    * */
    removeTravelBus(state, value){
      state.travelBus =
        state
          .travelBus
          // .filter((busSeat) => (value.nameBus !== busSeat.busList || value.seat !== busSeat.seat))
          .filter((busSeat) => (value.busList !== busSeat.busList || value.seat !== busSeat.seat))
    },
    //
    // setName(state, value){
    //   state.travelBus[value[position]].name =  value['value']
    // }
    setTotalAmount(state, value){
      state.totalamoun = value
    }

  },
  actions: {
    addCountSeat ({commit}) {
      commit('addCountSeat')
    },
    remCountSeat ({commit}) {
      commit('remCountSeat')
    },
    resetCountSeat ({commit}) {
      commit('resetCountSeat')
    },
    setNameBustSeatActive ({commit}, value) {
      commit('setNameBustSeatActive', value)
    },
    setTravelBus ({commit}, value) {
      commit('setTravelBus', value)
    },
    // value. {position: '', value:''}
    setRut ({commit}, value) {
      commit('setRut', value)
    },

    // borrar todos los registros
    resetTravelBus ({commit}) {commit('resetTravelBus')},
    // agregar datos del asiento
    addTravelBus({commit}, value) {commit('addTravelBus', value)},
    // eliminar datos del asiento
    removeTravelBus ({commit}, value) {commit('removeTravelBus', value)},
    //
    //setName({commit}, value) {commit('setName', value)},
    setTotalAmount({commit}, value) { commit('setTotalAmount', value)}

  }
}
