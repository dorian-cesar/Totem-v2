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
        <b-col cols="3" class="text-center pt-3 spinner-container">
          <div v-if="!isChangeStatus" class="spinner"></div>
          <font-awesome-icon
            v-else
            :icon="['fas', 'exclamation-triangle']"
            size="4x"
            :style="{ color: 'orange'}"
          />
        </b-col>
        <!-- Monto -->
        <b-col cols="9" class="pt-4 pl-0">
          <p class="h1 font-weight-bold">Monto Total: $ {{total}}</p>
        </b-col>
        <!-- Mensaje -->
        <b-col colos="12" class="text-center font-italic">
          <h1 v-show="!isChangeStatus" class="text-primary py-5">Realice el pago en el equipo</h1>
          <h1 v-show="isChangeStatus" class="text-danger py-1 pb-5 pt-4">{{msg}}</h1>
        </b-col>
        <b-col cols="12" v-show="isChangeStatus" class="text-center mb-3">
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
        <b-col cols="12" class="text-right mb-3 pr-4">
          <b-img :src="imgTransbank" fluid alt="Fluid image" class="logo-transbank"/>
        </b-col>
      </b-row>
    </b-modal>
  </div>
</template>
<script>
  import imgTransbank from '@/assets/img/logo-transbank-nuevo.png'

  export default {
    name: 'PaymentControl',

    data() {
      return {
        imgTransbank,
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
    width: 180px !important;
    height: 60px !important;
  }

  .spinner-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    margin-top: 10px;
  }

  .spinner {
    border: 9px solid #dfdfdf;
    border-top: 9px solid #001689;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    animation: spin 1.6s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .logo-transbank {
    width: 200px;
    height: auto;
  }
</style>
