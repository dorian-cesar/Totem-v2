<template>
  <div class="pt-2">
    <b-card class="transparent-main" style="border-radius: 10px;">
      <blockquote class="card-blockquote">
        <top-header-caption caption="PAGO REALIZADO" class="pt-2" />
        <!--        <message :amount="getAmount()"/>-->
        <message />
      </blockquote>
    </b-card>

    <!-- b-button @click="pruebax">prueba</b-button -->
  </div>
</template>

<script>
import TopHeaderCaption from '@/components/TopHeaderCaption.vue'
import Message from '@/components/pay_amount/Message.vue'
//import ToolBarButton from '@/components/ToolbarButtonNew.vue'
//import {mapGetters} from 'vuex'

export default {
  name: 'FormPayAmount',
  components: {
    TopHeaderCaption,
    Message,
    //ToolBarButton
  },
  mounted() {
    setTimeout(() => {
      this.$router.push('/');
      window.location.reload();
    }, 6000);
  }
}
</script>
