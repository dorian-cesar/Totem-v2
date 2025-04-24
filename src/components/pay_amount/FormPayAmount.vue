<template>
  <div>
    <b-card class="transparent-main">
      <blockquote class="card-blockquote">
        <top-header-caption caption="PAGO REALIZADO" class="pt-2"/>
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
    // data() {
      // return {
        // prueba:'',
        // propsToolbarButton: {
        //   txtButtonBack: 'SALIR',
        //   linkButtonBack: './',
        //   txtButtonNext: 'PAGAR',
        //
        // }
      // }
    // },
    components: {
      TopHeaderCaption,
      Message,
      //ToolBarButton
    },
    // methods:{
    //   pruebax(){
    //     this.prueba = "{\"cliente\":\"mailto:marco.betancourt@clamber.cl\",\"codigoTerminalOrigen\":\"MA\",\"nombreTerminalOrigen\":\"BORJA TERMINAL\",\"codigoTerminalDestino\":\"D3\",\"nombreTerminalDestino\":\"LA SERENA\",\"fechaSalida\":\"05/02/2020\",\"diaSemana\":\"MIERCOLES\",\"horaSalida\":\"18:15 de la Tarde\",\"asiento\":\"3\",\"nombreClase\":\"SALON CAMA(12)\",\"total\":\"8000\",\"medioPago\":\"POS\",\"codigoTransaccion\":\"ZMT64693425\",\"boleto\":\"INT071877\",\"piso\":\"1\",\"codigoSeguridad\":\"417269\",\"condicionesDeServicio\":\"Válido para la fecha y hora señalada.\\r\\nAnulaciones: Boleto sólo se puede anular por internet, la anulación se aceptará hasta 4 horas antes del viaje y se\\r\\ndevolverá el 85% del valor del pasaje (Art.67 D.S 212/92 MTT)\\r\\nTransporte de equipaje libre de pago (según D.S 212/92 MTT):\\r\\nEn el interior del bus: 1 bolso de mano de uso personal\\r\\nEn la maletera del bus: 1 maleta o bolso que no supere los 30 kgs. o los 18 decímetros Cúbicos\\r\\nSi el valor de su equipaje excede las 5 UTM, es su obligación declararlo previamente en la oficina de origen (Art. 70 D.S\\r\\n212/92 MTT)\\r\\nLa empresa no se hace responsable por pérdidas que puedan ocurrir al interior del bus.\\r\\nPara consultas puede llamar a nuestro Call Center al 600 600 0018 de lunes a domingo de 08:00 a 21:00 horas\",\"tipoVoucher\":\"WEB\",\"servicio\":\"BU773\",\"clase\":\"SAL12\",\"fechaHoraSalida\":\"202002051815\"}"
    //     console.log(JSON.parse(this.prueba))
    //   },
    //   getAmount(){
    //     return '18.000'
    //     //return this.getTotalAmount()
    //   }
    // },
    mounted() {
      setTimeout(() => this.$router.push('/'), 10000)
    }
  }
</script>


