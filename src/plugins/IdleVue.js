import Vue from 'vue'
import IdleVue from 'idle-vue'

if (process.env.NODE_ENV !== 'development') {
  const eventsHub = new Vue()

  const options = {
    eventEmitter: eventsHub,
    idleTime: (2*60*1000) //<- Tiempo de espera antes de pasar al inicio
  }

  Vue.use(IdleVue, options)
}
