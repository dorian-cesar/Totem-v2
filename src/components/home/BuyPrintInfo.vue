<template>
  <div class="pt-3">
    <!-- Formulario de Identificación -->
    <totem-identification
      v-if="!isIdentified"
      @identified="onTotemIdentified"
    />

    <div v-if="loading && isIdentified" class="text-black-50 text-center pb-4">
      <b-spinner type="grow"></b-spinner>
      <span class="text-white pl-2 h2">Espere mientras se inicia el servidor</span>
    </div>

    <b-card v-if="isIdentified" class="transparent-main card-custom">
      <blockquote class="card-blockquote">
        <!-- Button Buy Ticket -->
        <div class="btn-img">
          <b-button
            variant="link"
            block
            :href="serverAvailable ? './travelselection' : null"
            :disabled="!serverAvailable"
          >
            <b-img :src="BtnBuyTicket" fluid alt="Buy Ticket" />
          </b-button>
        </div>
        <!-- Button Print Ticket -->
        <div class="btn-img">
          <b-button variant="link" block :href="serverAvailable ? './print' : null" :disabled="!serverAvailable">
            <b-img :src="BtnPrintTicket" fluid alt="Print Ticket image" />
          </b-button>
        </div>
        <div class="text-center">
          <b-img :src="ImgLogoBlanco" fluid alt="Logo Pullman" class="logo-blanco" />
        </div>
      </blockquote>
    </b-card>
  </div>
</template>

<script>
import BtnBuyTicket from '@/assets/img/buy_print_info/btn_buy_ticket.png'
import BtnPrintTicket from '@/assets/img/buy_print_info/btn_print_ticket_enabled.png'
import BtnGetInfo from '@/assets/img/buy_print_info/btn_get_info.png'
import ImgLogoBlanco from '@/assets/img/logo-pullman-nuevo-blanco.svg'
import TotemIdentification from '@/components/home/TotemIdentification'
import axios from 'axios'
import info from '../../../info.json'

export default {
  name: 'BuyPrintInfo',
  components: {
    TotemIdentification
  },
  data: () => ({
    loading: true,
    serverAvailable: false,
    isIdentified: false,
    BtnBuyTicket,
    BtnPrintTicket,
    ImgLogoBlanco,
    info,
    monitorInterval: null
  }),
  methods: {
    onTotemIdentified(deviceData) {
      console.log('Identificación completada:', deviceData)
      this.isIdentified = true
      this.checkServerStatus()
      this.monitorInterval = setInterval(this.checkServerStatus, 5000)
    },
    checkServerStatus() {
      if (!this.isIdentified) return

      const monitorIp = localStorage.getItem('ipServer')

      if (!monitorIp) {
        console.error('No hay IP disponible')
        this.serverAvailable = false
        this.loading = true
        return
      }

      console.log('Verificando servidor en IP:', monitorIp)

      axios
        .get(`https://${monitorIp}:3000/monitor`, { timeout: 2500 })
        .then((response) => {
          console.log('Estado del servidor:', response.data)
          const isAvailable = response.data.server === true
          this.serverAvailable = isAvailable
          this.loading = !isAvailable
        })
        .catch((error) => {
          console.error('Error al verificar el estado del servidor:', error)
          this.serverAvailable = false
          this.loading = true
        })
    }
  },
  mounted() {
    // Al refrescar, siempre pedimos identificación según requerimiento
    this.isIdentified = false
    localStorage.removeItem('rut')
    localStorage.removeItem('id_bus')
  },
  beforeDestroy() {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval)
    }
  }
}
</script>

<style scoped>
.card-custom {
  height: 1600px;
}

.btn-img {
  margin-top: 190px;
}

.logo-blanco {
  margin-top: 230px;
  width: 45%;
  height: auto;
  opacity: 0.2;
}
</style>
