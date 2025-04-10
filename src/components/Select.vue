<template>
  <div>
    <b-row>
      <b-col cols="4">
        <!-- Caption -->
      </b-col>
      <b-col cols="8">
        <!-- Spinner -->
        <div v-show="showSpinner" class="text-white text-right h3">
          <b-spinner type="grow"/>
          Cargando listado
        </div>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="12 selector-selects">
        <!-- Input select -->
        <img center :src="icon" :class="imgClass" fluid alt="Logo"/>
        <v-select
          :options="options"
          :placeholder="placeholder"
          :resetOnOptionsChange="true"
          :disabled="showSpinner"
          @input="selected"
          :value="value"
          @open="status('open')"
          @close="status('close')"
        />
      </b-col>
    </b-row>
  </div>
</template>

<script>
  import vSelect from 'vue-select'
  export default {
    name: 'Select',
    data: () => ({
      value: null
    }),
    components: {vSelect},
    props: {
      caption: {type: String, default: () => ''},
      options: {type: Array, default: () => []},
      placeholder: {type: String, default: () => ''},
      preSelectLabel: {type: String, default: () => ''},
      preSelectValue: {type: String, default: () => ''},
      icon: {type: String, default: () => ''},
      imgClass: String,
    },
    mounted() {
      if (this.preSelectLabel && this.preSelectValue) {
        this.value = {label: this.preSelectLabel, value: this.preSelectValue}
        this.selected(this.value)
      }
    },
    computed: {
      showSpinner: function () {
        return !(this.options.length > 0)
      }
    },
    methods: {
      selected(val) {
        if (val) {
          this.value = val
          this.$emit('selectedValue', val)
        }
      },
      status(name){
        this.$emit('selectedStatus', name)
      },
    },
  }
</script>

<style scoped>
  .v-select {
    font-size: 42px;
    width: 830px;
  }
  .v-select .v-text-field.v-text-field--solo .v-input__control { max-height: 18px; }

  .origin-img-class {
    width: 60px;
    height: auto;
  }

  .destiny-img-class {
    width: 60px;
    height: auto;
  }
</style>
