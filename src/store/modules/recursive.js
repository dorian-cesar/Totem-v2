export default {
  namespaced: true,
  state: {
    idSetInterval: null,
  },
  getters: {
    getIdSetInterval: state => {
      return state.idSetInterval
    },
  },
  mutations: {
    setIdSetInterval(state, value) {
      state.idSetInterval = value
    },
  },
  actions: {
    setIdSetInterval({commit}, value) {
      commit('setIdSetInterval', value)
    },
  }
}
