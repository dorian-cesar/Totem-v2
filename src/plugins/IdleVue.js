import Vue from 'vue'
import idleVue from 'idle-vue'
import router from '../router'

const eventsHub = new Vue()

// Bandera global de estado
window.isIdleResetting = false

const options = {
  eventEmitter: eventsHub,
  idleTime: 30000, // 30 segundos
  startAtIdle: false
}

Vue.use(idleVue, options)

eventsHub.$on('idle', () => {
  const targetHomeName = (typeof IS_STANDBY !== 'undefined' && IS_STANDBY) ? 'Proximamente' : 'Home'

  if (router.currentRoute.name !== targetHomeName && router.currentRoute.path !== '/') {
    // Activa el escudo de bloqueo
    window.isIdleResetting = true

    // Redirección directa reemplazando la vista actual en el historial
    router.replace({ name: targetHomeName }).catch(() => { }).finally(() => {
      setTimeout(() => {
        window.isIdleResetting = false
      }, 500)
    })
  }
})