<template>
  <div id="app">
    <!-- Overlay del Screensaver que se coloca encima de la vista actual -->
    <div v-if="isIdle" class="screensaver-overlay" @click="despertar">
      <home-view />
    </div>

    <!-- La vista actual de la ruta permanece congelada de fondo sin saltar -->
    <router-view v-show="!isIdle" />
  </div>
</template>

<script>
import HomeView from '@/views/Home.vue'

export default {
  name: 'App',
  components: {
    HomeView
  },
  data: () => ({
    isIdle: false
  }),
  mounted() {
    // Escuchar inactividad
    this.$idleEventHub.$on('idle', () => {
      // Activa la capa negra/screensaver de inmediato SIN cambiar de ruta
      this.isIdle = true
    })

    this.$idleEventHub.$on('active', () => {
      this.isIdle = false
    })
  },
  methods: {
    despertar() {
      this.isIdle = false
      // Al tocar la pantalla, destruye el estado anterior y navega a la selección de viaje
      if (this.$route.name !== 'TravelSelection') {
        this.$router.replace({ name: 'TravelSelection' }).catch(() => {})
      }
    }
  }
}
</script>

<style>
.screensaver-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 999999;
  background-color: #000;
  cursor: pointer;
}
</style>