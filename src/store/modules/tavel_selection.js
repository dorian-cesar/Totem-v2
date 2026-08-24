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
    // Convenios state
    convenioSeleccionado: null,
    convenioTipo: '',
    convenioCodigo: '',
    descuentoValor: 0,
    descuentoTipo: '',
    rut: ''
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
    },
    // Convenios getters
    getConvenioSeleccionado: state => state.convenioSeleccionado,
    getConvenioTipo: state => state.convenioTipo,
    getConvenioCodigo: state => state.convenioCodigo,
    getDescuentoValor: state => state.descuentoValor,
    getDescuentoTipo: state => state.descuentoTipo,
    getRut: state => state.rut
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
    setRoundTrip (state, value) {
      state.roundTrip = value
    },
    setDepartureDate (state, value) {
      state.departureDate = value
    },
    setReturnDate (state, value) {
      state.returnDate = value
    },
    // Convenios mutations
    setConvenio (state, payload = {}) {
      state.convenioSeleccionado = payload.seleccionado || null
      state.convenioTipo = payload.tipo || ''
      state.convenioCodigo = payload.codigo || ''
      state.descuentoValor = payload.descuentoValor || 0
      state.descuentoTipo = payload.descuentoTipo || ''
    },
    clearConvenio (state) {
      state.convenioSeleccionado = null
      state.convenioTipo = ''
      state.convenioCodigo = ''
      state.descuentoValor = 0
      state.descuentoTipo = ''
    },
    setRut (state, value) {
      state.rut = value
    }
  },
  actions: {
    setDepartureCity ({commit}, value) {
      commit('setDepartureCity', value)
    },
    setArrivalCity ({commit}, value) {
      commit('setArrivalCity', value)
    },
    setRoundTrip ({commit}, value) {
      commit('setRoundTrip', value)
    },
    setDepartureDate ({commit}, value) {
      commit('setDepartureDate', value)
    },
    setReturnDate ({commit}, value) {
      commit('setReturnDate', value)
    },
    // Convenios actions
    setConvenio ({commit}, payload) {
      commit('setConvenio', payload)
    },
    clearConvenio ({commit}) {
      commit('clearConvenio')
    },
    setRut ({commit}, value) {
      commit('setRut', value)
    }
  }
}
