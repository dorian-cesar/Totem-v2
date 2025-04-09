<template>
  <div class="pt-5 pb-4">
    <b-row>
      <!-- Left Button -->
      <b-col cols="6" class="container-fluid">
        <b-button
          class="custom-button btn-lg"
          :variant="(lbIsDisable) ? 'secondary' : 'primary'"
          :disabled="lbIsDisable"
          @click="$emit('nameButton','Left-Button')"
        >
          <h2>{{lbLabel}}</h2>
          {{lbDesc}}
        </b-button>
      </b-col>
      <!-- Center Button -->
      <!-- <b-col cols="4" class="container-fluid text-right">
        <b-button
          class="custom-button btn-lg"
          :variant="(cbIsDisable) ? 'secondary' : 'info'"
          :disabled="cbIsDisable"
          @click="$emit('nameButton','Center-Button')"
        >
          <h2>{{cbLabel}}</h2>
          {{cbDesc}}
        </b-button>
      </b-col> -->
      <!-- Right Button -->
      <b-col cols="6" class="container-fluid text-right">
        <b-button
          class="custom-button btn-lg"
          :variant="(rbIsDisable) ? 'secondary' : 'info'"
          :disabled="rbIsDisable"
          @click="$emit('nameButton','Right-Button')"
        >
          <h2>{{rbLabel}}</h2>
          {{rbDesc}}
        </b-button>
      </b-col>
    </b-row>
  </div>
</template>

<script>
  export default {
    name: 'ToolBarButtonNew4',
    props: {
      lbLabel: {type: String, default: () => 'REGRESAR'},
      lbDesc: {type: String, default: () => 'Compra'},
      lbIsDisable:{type: Boolean, default: () => false},
      cbLabel: {type: String, default: () => 'PAGAR'},
      cbDesc: {type: String, default: () => 'Atendedor'},
      cbIsDisable:{type: Boolean, default: () => false},
      rbLabel: {type: String, default: () => 'PAGAR'},
      rbDesc: {type: String, default: () => 'Máquina de Pago'},
      rbIsDisable:{type: Boolean, default: () => true},
    },
  }
</script>
