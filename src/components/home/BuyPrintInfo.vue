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
        <div class="btn-img">
          <b-button variant="link" block :disabled="!serverAvailable">
            <b-img :src="BtnGetInfo" fluid alt="Get Info" />
          </b-button>
        </div>
      </blockquote>
    </b-card>
  </div>
</template>

<script>
import BtnBuyTicket from '@/assets/img/buy_print_info/btn_buy_ticket.png'
import BtnPrintTicket from '@/assets/img/buy_print_info/btn_print_ticket_enabled.png'
import BtnGetInfo from '@/assets/img/buy_print_info/btn_get_info.png'
import axios from 'axios'
import info from '../../../info.json'

export default {
  name: 'BuyPrintInfo',
  data: () => ({
    loading: true, // true
    serverAvailable: false, // false
    BtnBuyTicket,
    BtnPrintTicket,
    BtnGetInfo,
    info,
    monitorInterval: null
  }),
  methods: {
    checkServerStatus() {
      axios
        .get(this.info.urlGetIp, { timeout: 2500 })
        .then((res) => {
          const monitorIp = res.data.ip
          console.log('IP del servidor obtenida:', monitorIp)
          if (!monitorIp) {
            console.error('No se pudo obtener la IP del servidor')
            this.serverAvailable = false
            this.loading = true
            return
          }
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
        })
        .catch((error) => {
          console.error('Error al obtener IP desde el backend:', error)
          this.serverAvailable = false
          this.loading = true
        })
    }
  },
  mounted() {
    this.checkServerStatus()
    this.monitorInterval = setInterval(this.checkServerStatus, 5000) // tiempo entre checkServerStatus
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
</style>

