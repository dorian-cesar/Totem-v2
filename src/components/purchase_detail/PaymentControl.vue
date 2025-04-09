<template>
  <div>
    <b-modal
      :id="idModalPaymentControl"
      centered
      title="Mensaje de Pago"
      no-close-on-backdrop
      no-close-on-esc
      hide-header-close
      size="lg"
      hide-footer
      no-fade
    >
      <b-row>
        <b-col cols="4" class="text-center pt-3">
          <font-awesome-icon
            :icon="['fas', (!isChangeStatus) ? 'spinner' : 'exclamation-triangle']"
            :class="(!isChangeStatus) ? 'fa-pulse' : ''"
            size="5x"
            :style="{ color: (!isChangeStatus) ? 'blue' : 'orange'}"
          />
          <!-- Monto -->
        </b-col>
        <b-col cols="8" class="pt-4">
          <p class="h1">Monto Total: $ {{total}}</p>
        </b-col>
        <!-- Mensaje -->
        <b-col colos="12" class="text-center font-italic">
          <h1 v-show="!isChangeStatus" class="text-primary py-5">Realice el pago en el equipo POS</h1>
          <h1 v-show="isChangeStatus" class="text-danger py-4">{{msg}}</h1>
        </b-col>
        <b-col cols="12" v-show="isChangeStatus" class="text-center">
          <b-button
            @click="actionButton('cerrar')"
            :variant="isTryAgain ? 'primary' : 'secondary'"
            class="custom-button-alert  text-center mr-3"
            :disabled = "!isTryAgain"
          >
            Intente de Nuevo
          </b-button>
          <b-button
            @click="actionButton('salir')"
            variant="danger"
            class="custom-button-alert text-center ml-3"
          >
            Salir
          </b-button>
        </b-col>
        <!-- Logos -->
        <b-col cols="12" class="text-right">
          <b-img :src="imgTransbank" fluid alt="Fluid image"/>
        </b-col>
      </b-row>
    </b-modal>
  </div>
</template>
<script>
  import imgTransbank from '@/assets/img/transbank.png'

  export default {
    name: 'PaymentControl',

    data() {
      return {
        imgTransbank, // Imagen del mensaje
      }
    },

    props: {
      total: {type: String, default: () => ('0')},// Monto a pagar
      idModalPaymentControl: {type: String, default: () => 'modal-payment-control'},// Nombre de la pantalla modal
      isChangeStatus: {type: Boolean, default: () => false},// Estatus del proceso de pago
      msg: {type: String, default: () => ''},// Mensaje al cambiar el estatus
      isTryAgain:{type: Boolean, default: () => true}// Estado del botón "Intentar de Nuevo"
    },

    methods: {
      //cuando se hace click en un botón
      actionButton(name) {
        this.$emit('nameAction', name)
      },
    },

    watch:{
      //último intento
      isTryAgain: function(){
        // Esperar antes de enviar mensaje de ir Home
        setTimeout(function(){
          this.$emit('nameAction', 'salir')
        }.bind(this), (10 * 1000))//<- tiempo de espera por respuesta del POS
      }
    }
  }
</script>
<style scoped>
  .custom-button-alert {
    width: 200px !important;
    height: 80px !important;

  }
</style>
