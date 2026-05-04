export default {
  namespaced: true,
  state: {
    originCity: '',
    destinationCity: '',
    roundTrip: '', // True or false
    departureDate: '',
    returnDate: '',
    nameDepartureCity: '',
    codeDepartureCity: '',
    nameArrivalCity: '',
    codeArrivalCity: '',
  },
  getters: {
    getNameDepartureCity: state => {
      return state.nameDepartureCity
    },
    getCodeDepartureCity: state => {
      return state.codeDepartureCity
    },
    getNameArrivalCity: state => {
      return state.nameArrivalCity
    },
    getCodeArrivalCity: state => {
      return state.codeArrivalCity
    },
    isDepartureCity: state => {
      return Boolean(state.nameDepartureCity && state.codeDepartureCity !== undefined && state.codeDepartureCity !== null && state.codeDepartureCity !== '')
    },
    isArrivalCity: state => {
      return Boolean(state.nameArrivalCity && state.codeArrivalCity !== undefined && state.codeArrivalCity !== null && state.codeArrivalCity !== '')
    },

    getOriginCity: state => {
      return state.originCity
    },
    getDestinationCity: state => {
      return state.destinationCity
    },
    getRoundTrip: state => {
      return state.roundTrip
    },
    getDepartureDate: state => {
      return state.departureDate
    },
    getReturnDate: state => {
      return state.returnDate
    }
  },
  mutations: {
    setDepartureCity (state, value = {code:'',name:''}) {
      state.nameDepartureCity = value.name
      state.codeDepartureCity = value.code
    },
    setArrivalCity (state, value = {code:'',name:''}) {
      state.nameArrivalCity = value.name
      state.codeArrivalCity = value.code
    },


    // setOriginCity (state, value) {
    //   state.originCity = value
    // },
    // setDestinationCity (state, value) {
    //   state.destinationCity = value
    // },
    setRoundTrip (state, value) {
      state.roundTrip = value
    },
    setDepartureDate (state, value) {
      state.departureDate = value
    },
    setReturnDate (state, value) {
      state.returnDate = value
    },
  },
  actions: {
    setDepartureCity ({commit}, value) {
      commit('setDepartureCity', value)
    },
    setArrivalCity ({commit}, value) {
      commit('setArrivalCity', value)
    },


    // setOriginCity ({commit}, value) {
    //   commit('setOriginCity', value)
    // },
    // setDestinationCity ({commit}, value) {
    //   commit('setDestinationCity', value)
    // },
    setRoundTrip ({commit}, value) {
      commit('setRoundTrip', value)
    },
    setDepartureDate ({commit}, value) {
      commit('setDepartureDate', value)
    },
    setReturnDate ({commit}, value) {
      commit('setReturnDate', value)
    },
  }
}
