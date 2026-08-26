<template>
  <div class="pt-3">
    <b-row align-h="center">
      <!-- One way button -->
      <b-col cols="5" class="text-right pl-0">
        <b-button
          pill
          class="custom-button"
          @click="changeState('oneWay')"
          :variant="oneWayState"
        >
          <h2>IDA</h2>
        </b-button>
      </b-col>
      <!-- Round trip button -->
      <b-col cols="5" class="text-left pr-2">
        <b-button
          pill
          class="custom-button"
          @click="changeState('roundTrip')"
          :variant="roundTripState"
          :disabled="isSoloIda"
        >
          <h2>IDA Y VUELTA</h2>
        </b-button>
      </b-col>
    </b-row>
  </div>
</template>

<script>
  import {mapActions} from 'vuex'

  export default {
    name: 'ToolBarOneWayRoundTrip',
    data: () => ({
      oneWayState: 'primary',
      roundTripState: 'secondary'
    }),
    computed: {
      /**
       * Determina si el convenio activo y la ruta seleccionada restringen el viaje a "Solo Ida"
       */
      isSoloIda() {
        const convenio = this.$store.state.TravelSelection.convenioSeleccionado
        const origen = this.$store.state.TravelSelection.codeDepartureCity
        const destino = this.$store.state.TravelSelection.codeArrivalCity

        console.log('--- isSoloIda Check ---')
        console.log('Convenio:', convenio ? convenio.nombre : 'Ninguno')
        console.log('Origen Code:', origen)
        console.log('Destino Code:', destino)

        if (convenio && origen && destino) {
          const rutas = Array.isArray(convenio.rutas) ? convenio.rutas : []
          const rutaCoincide = rutas.find(
            (r) =>
              (String(r.origen_codigo) === String(origen) && String(r.destino_codigo) === String(destino)) ||
              (String(r.origen_codigo) === String(destino) && String(r.destino_codigo) === String(origen))
          )

          console.log('Ruta coincidente encontrada:', rutaCoincide)

          if (rutaCoincide && Array.isArray(rutaCoincide.configuraciones) && rutaCoincide.configuraciones.length > 0) {
            const config = rutaCoincide.configuraciones[0]
            console.log('Tipo de viaje configurado:', config.tipo_viaje)
            if (config.tipo_viaje === 'Solo Ida') {
              console.log('Resultado isSoloIda: TRUE')
              return true
            }
          }
        }
        console.log('Resultado isSoloIda: FALSE')
        return false
      }
    },
    watch: {
      // Si cambia a Solo Ida (ej. al validarse el convenio), forzamos el modo "Ida"
      isSoloIda(newVal) {
        if (newVal) {
          this.changeState('oneWay')
        }
      }
    },
    methods: {
      ...mapActions('TravelSelection', ['setRoundTrip']),

      // change the state of the button
      changeState(buttonName) {
        if ('oneWay' === buttonName) {
          this.oneWayState = 'primary'
          this.roundTripState = 'secondary'
          this.$emit('activeDatepicker2', false)
          this.setRoundTrip(false)
        } else {
          this.oneWayState = 'secondary'
          this.roundTripState = 'primary'
          this.$emit('activeDatepicker2', true)
          this.setRoundTrip(true)
        }
      }
    },
    mounted() {
      this.setRoundTrip(false)
      // Si al iniciar ya es solo ida, aseguramos el estado "oneWay"
      if (this.isSoloIda) {
        this.changeState('oneWay')
      }
    }
  }
</script>

<style scoped>
.btn-primary {
  background-color: #ff5200;
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: #ee4b00;
  color: white;
}
</style>