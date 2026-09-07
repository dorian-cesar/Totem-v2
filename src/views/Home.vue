<template>
  <div class="screensaver-wrapper" @click="salirScreensaver">
    <buy-print-info/>
    
    <!-- <b-button
      variant="link"
      style="height: 1px"
      class="text-white"
      @click.stop="onClick">
      {{texto}}
    </b-button> -->

    <b-modal id="modal-center" centered title="BootstrapVue">
      <p class="my-4">Hacer el Cierre de Caja</p>
    </b-modal>
  </div>
</template>

<script>
  import BuyPrintInfo from '@/components/home/BuyPrintInfo'

  export default {
    name: 'Home',
    data: () => ({
      texto: '*',
      cont: 0,
      key1: false,
      key2: false
    }),
    components: { BuyPrintInfo },
    mounted() {
      // Guardamos la IP e ID del tótem para no desconfigurar la identificación
      const ipServer = localStorage.getItem('ipServer')
      const totemIdentifier = localStorage.getItem('totemIdentifier')

      // Limpiamos la memoria local y de sesión para borrar la compra anterior
      localStorage.clear()
      sessionStorage.clear()

      // Restauramos las credenciales del equipo si existían
      if (ipServer) localStorage.setItem('ipServer', ipServer)
      if (totemIdentifier) localStorage.setItem('totemIdentifier', totemIdentifier)
    },
    methods: {
      salirScreensaver(event) {
        // Evita interferir si se presiona el modal de cierre de caja
        if (event.target.closest('#modal-center')) return;

        // Redirige explícitamente a la pantalla de selección de viaje
        if (this.$route.name !== 'TravelSelection') {
          this.$router.push({ name: 'TravelSelection' }).catch(() => {})
        }
      },
      onClick() {
        this.cont++
        this.texto = '@'
      }
    },
    // Lógica para la clave de Cierre de Caja
    onIdle() {
      if (typeof KEY_VALUE !== 'undefined') {
        if (KEY_VALUE.find(e => e === this.cont)) {
          if (KEY_VALUE[1] === this.cont && !this.key1 && !this.key2) {
            this.key1 = true
          } else if (KEY_VALUE[2] === this.cont && this.key1 && !this.key2) {
            this.key2 = true
          } else if (KEY_VALUE[3] === this.cont && this.key1 && this.key2) {
            this.$bvModal.show('modal-center')
            this.key1 = false
            this.key2 = false
          }
        } else {
          this.key1 = false
          this.key2 = false
        }
      }
      
      this.texto = '*'
      this.cont = 0
    }
  }
</script>

<style scoped>
.screensaver-wrapper {
  width: 100%;
  min-height: 100vh;
  cursor: pointer;
}
</style>