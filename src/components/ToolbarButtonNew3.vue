<template>
  <div class="pt-5 pb-4">
    <b-row>
      <!-- Left Button -->
      <b-col cols="6" class="container-fluid">
        <b-button class="custom-button btn-lg button-radius" :variant="(lbIsDisable) ? 'secondary' : 'primary'"
          :disabled="lbIsDisable" @click="$emit('nameButton', 'Left-Button')">
          <h2>{{ lbLabel }}</h2>
        </b-button>
      </b-col>
      <!-- Right Button -->
      <b-col cols="6" class="container-fluid text-right">
        <b-button class="custom-button btn-lg button-radius" :variant="(rbIsDisable) ? 'secondary' : 'info'"
          :disabled="rbIsDisable" @click="$emit('nameButton', 'Right-Button')">
          <h2>{{ rbLabel }}</h2>
        </b-button>
      </b-col>
    </b-row>
  </div>
</template>

<script>

export default {
  name: 'ToolBarButtonNew3',
  props: {
    lbLabel: { type: String, default: () => 'REGRESAR' },
    lbIsDisable: { type: Boolean, default: () => false },
    rbLabel: { type: String, default: () => 'CONTINUAR' },
    rbIsDisable: { type: Boolean, default: () => true },
  },
}

</script>

<style scoped>
.button-radius {
  border-radius: 60px;
}
</style>