<template>
  <div id="app">
    <!-- Capa limpia del Screensaver sin botones ni lógica de Home -->
    <div v-if="isIdle" class="screensaver-layer" @click="despertar">
      <div class="screensaver-content">
        <!-- Si tienes un componente de video/slideshow para el screensaver, va aquí -->
        <h1 class="text-white text-center">Toca la pantalla para comenzar</h1>
      </div>
    </div>

    <!-- La aplicación normal funciona en segundo plano sin redirigir de URL -->
    <router-view v-show="!isIdle" />
  </div>
</template>

<script>
export default {
  name: 'App',
  data: () => ({
    isIdle: false,
    idleTimer: null,
    timeoutDuration: 30000 // 30 segundos
  }),
  mounted() {
    const events = ['mousemove', 'mousedown', 'touchstart', 'click', 'keypress', 'scroll']
    events.forEach(event => {
      window.addEventListener(event, this.resetTimer, { passive: true })
    })
    this.startTimer()
  },
  beforeDestroy() {
    const events = ['mousemove', 'mousedown', 'touchstart', 'click', 'keypress', 'scroll']
    events.forEach(event => {
      window.removeEventListener(event, this.resetTimer)
    })
    this.clearTimer()
  },
  methods: {
    startTimer() {
      this.clearTimer()
      this.idleTimer = setTimeout(() => {
        this.isIdle = true
      }, this.timeoutDuration)
    },
    clearTimer() {
      if (this.idleTimer) {
        clearTimeout(this.idleTimer)
        this.idleTimer = null
      }
    },
    resetTimer() {
      if (!this.isIdle) {
        this.startTimer()
      }
    },
    despertar() {
      this.isIdle = false
      this.startTimer()

      // Redirección explícita e instantánea únicamente al tocar la pantalla
      if (this.$route.name !== 'TravelSelection') {
        this.$router.replace({ name: 'TravelSelection' }).catch(() => {})
      }
    }
  }
}
</script>

<style>
.screensaver-layer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999999;
  background-color: #000;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}
</style>