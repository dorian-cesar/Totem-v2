<template>
  <div class="pt-5 pb-4">
    <b-row>
      <!-- Button left -->
      <b-col cols="6" class="container-fluid">
        <b-button
          :href="linkButtonBack"
          class="custom-button btn-lg"
          :variant="(isDisableButtonBack) ? 'secondary' : 'primary'"
          :disabled="isDisableButtonBack"
          @click="pushButton(txtButtonBack)"
          :ref="['button',txtButtonBack].join('-')"
        >
          <h2>{{txtButtonBack}}</h2>
        </b-button>
      </b-col>
      <!-- Button right -->
      <b-col cols="6" class="container-fluid text-right">
        <b-button
          name="buttonR"
          :href="linkButtonNext"
          class="custom-button btn-lg"
          :variant="(isDisableButtonNext) ? 'secondary' : 'info'"
          :disabled="isDisableButtonNext"
          @click="pushButton(txtButtonNext)"
          :ref="['button',txtButtonNext].join('-')"
        >
          <h2>{{txtButtonNext}}</h2>
        </b-button>
      </b-col>
    </b-row>
  </div>
</template>

<script>
  export default {
    name: 'ToolBarButtonNew',
    props: {
      txtButtonBack: {type: String, default: () => 'REGRESAR'},
      isDisableButtonBack: {type: Boolean, default: () => false},
      linkButtonBack: {type: String, default: () => ''},
      txtButtonNext: {type: String, default: () => 'CONTINUAR'},
      isDisableButtonNext: {type: Boolean, default: () => false},
      linkButtonNext: {type: String, default: () => ''},
    },
    methods: {
      pushButton(val){
        this.$emit('nameButton', val)
      },
    },
  }
</script>
