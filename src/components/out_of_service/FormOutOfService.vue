<template>
  <div class="pt-5">
    <b-card border-variant="primary">
      <b-card-text>
        <b-row>
          <b-col cols="12" class="text-center pt-5">
            <font-awesome-icon
              :icon="['fas', 'exclamation-triangle']"
              size="10x"
              :style="{ color: 'red'}"
            />
          </b-col>
          <b-col class="pt-5">
            <p class="h1 text-center text-primary pb-2 font-weight-bold">
              {{text1}}
            </p>
            <p class="h1 text-center text-primary pb-5 font-weight-bold">
              {{text2}}
            </p>
            <p class="h4 text-center p-4 font-italic">
              {{text3}}
            </p>
          </b-col>
        </b-row>
      </b-card-text>
    </b-card>
  </div>
</template>
<script>
  import WebSocket from '@/mixins/websocket.js'

  export default {
    name: 'FormOutOfService',
    mixins: [WebSocket],
    data() {
      return {
        text1: 'EQUIPO TEMPORALMENTE',
        text2: 'FUERA DE SERVICIO',
        text3: 'Estimado usuario pedimos disculpas por las molestias ocasionadas.' +
          'Nos encontramos trabajando para mejorar el servicio.',
        interval: null,
      }
    },

    mounted() {

      // Limpiar posibles intervalos abiertos
      clearInterval(this.interval)

      // Comenzar intervalos de 10 seg
      // this.interval = setInterval(() => {
      //  this.checkStatusConn()//<- Ejecutar método en mixin
      // }, 10000)

    },

    watch: {

      /*
      * Monitoreo de la variable fuera de servicio
      * */
      isOutService: function () {
        if (!this.isOutService && 'status_internet' === this.messageWebSocket.type) {//<- variables del mixin
          // Terminar intervalos
          clearInterval(this.interval)
          // Ir a Home
          this.$router.push('/')
        }
      },

    },
  }
</script>
