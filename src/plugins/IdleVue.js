import Vue from 'vue'
import idleVue from 'idle-vue'

const eventsHub = new Vue()

// Permitir acceso al eventsHub desde App.vue
Vue.prototype.$idleEventHub = eventsHub

const options = {
  eventEmitter: eventsHub,
  idleTime: 30000, // 30 segundos
  startAtIdle: false
}

Vue.use(idleVue, options)