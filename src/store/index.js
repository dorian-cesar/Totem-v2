import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

// Modules
import TravelSelection from './modules/tavel_selection'
import BusSelection from "./modules/bus_selection"
import Recursive from "./modules/recursive"

Vue.use(Vuex);

export default new Vuex.Store({
  plugins: [createPersistedState()],
  modules: {
    TravelSelection,
    BusSelection,
    Recursive
  }
})
