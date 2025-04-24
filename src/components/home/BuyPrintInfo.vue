<template>
  <div class="pt-3">
    <b-card class="transparent-main card-custom">
      <blockquote class="card-blockquote">
        <!-- Button Buy Ticket -->
        <div class="btn-img">
          <b-button variant="link" block href="./travelselection">
            <b-img :src="BtnBuyTicket" fluid alt="Buy Ticket" />
          </b-button>
        </div>
        <!-- Button Print Ticket -->
        <div class="btn-img">
          <b-button variant="link" block href="./print">
            <b-img :src="BtnPrintTicket" fluid alt="Print Ticket image" />
          </b-button>
        </div>
        <!-- Button Get Ticket -->
        <div class="btn-img">
          <b-button variant="link" block>
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

export default {
  name: 'BuyPrintInfo',
  data: () => ({
    BtnBuyTicket,
    BtnPrintTicket,
    BtnGetInfo
  })
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
