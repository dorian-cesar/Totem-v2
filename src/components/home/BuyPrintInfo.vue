<template>
  <div class="pt-3">
    <div v-if="loading" class="text-black-50 text-center pb-4">
      <b-spinner type="grow"></b-spinner>
      <span class="text-white pl-2 h2">Espere mientras se inicia el servidor</span>
    </div>
    <b-card class="transparent-main card-custom">
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
        <!-- Button Get Ticket -->
        <!-- <div class="btn-img">
          <b-button variant="link" block :disabled="!serverAvailable">
            <b-img :src="BtnGetInfo" fluid alt="Get Info" />
          </b-button>
        </div> -->
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
import axios from 'axios'
import info from '../../../info.json'

export default {
  name: 'BuyPrintInfo',
  data: () => ({
    loading: true, //true
    serverAvailable: false, //false
    BtnBuyTicket,
    BtnPrintTicket,
    // BtnGetInfo,
    ImgLogoBlanco,
    info,
    monitorInterval: null
  }),
  methods: {
    checkServerStatus() {
      let monitorIp = null

      // 1. Intentar desde Vue Router
      if (this.$route && this.$route.query && this.$route.query.ip) {
        monitorIp = this.$route.query.ip
      } else {
        // 2. Intentar desde query string nativo
        const params = new URLSearchParams(window.location.search)
        monitorIp = params.get('ip')
      }

      // 3. Fallback a localStorage
      if (!monitorIp) {
        monitorIp = localStorage.getItem('ipServer')
        console.log('IP desde localStorage:', monitorIp)
      } else {
        // 4. Guardar si viene por URL
        localStorage.setItem('ipServer', monitorIp)
        console.log('IP guardada desde URL:', monitorIp)
      }

      // 5. Validación final
      if (!monitorIp) {
        console.error('No hay IP disponible (ni URL ni localStorage)')
        this.serverAvailable = false
        this.loading = true
        return
      }

      console.log('IP final usada:', monitorIp)

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
    this.checkServerStatus()
    this.monitorInterval = setInterval(this.checkServerStatus, 5000) // tiempo entre checkServerStatus
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
