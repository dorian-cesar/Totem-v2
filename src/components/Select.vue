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
          ref="vSelect"
          :options="options"
          :placeholder="placeholder"
          :resetOnOptionsChange="true"
          :disabled="showSpinner"
          :searchable="!virtualKeyboard"
          class="vs-virtual-keyboard"
          @input="onSelect"
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
      selected: {type: [String, Object], default: null},
      virtualKeyboard: {type: Boolean, default: false}
    },
    watch: {
      selected(newVal) {
        this.value = newVal || null
      }
    },
    mounted() {
      if (this.preSelectLabel && this.preSelectValue) {
        this.value = {label: this.preSelectLabel, value: this.preSelectValue}
        this.onSelect(this.value)
      }
    },
    computed: {
      showSpinner: function () {
        return !(this.options.length > 0)
      }
    },
    methods: {
      onSelect(val) {
        if (val) {
          this.value = val
          this.$emit('selectedValue', val)
          this.$nextTick(() => {
            const input = this.$refs.vSelect && this.$refs.vSelect.$el
              ? this.$refs.vSelect.$el.querySelector('input')
              : null
            if (input) {
              input.blur()
            }
          })
        }
      },
      onVirtualKey(key) {
        const field = this.$refs && this.$refs.vSelect
        if (!field) return
        const current = field.search || ''
        if (key === '{bksp}') {
          field.search = current.slice(0, -1)
        } else if (key === '{sp}') {
          field.search = current + ' '
        } else if (/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]$/.test(key)) {
          field.search = current + key
        }
      },
      closeFromKeyboard() {
        const field = this.$refs && this.$refs.vSelect
        if (!field) return
        field.open = false
        field.search = ''
      },
      closeDropdown() {
        const field = this.$refs && this.$refs.vSelect
        if (field) {
          field.open = false
        }
      },
      resetKeyboardSearch() {
        const field = this.$refs && this.$refs.vSelect
        if (field) {
          field.search = ''
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
    font-size: 52px;
    width: 830px;
    border-radius: 10px;
    min-height: 85px;
  }
  .v-select .v-text-field.v-text-field--solo .v-input__control { max-height: 18px; }

  .v-select.vs-virtual-keyboard ::v-deep .vs__search {
    pointer-events: none;
    caret-color: transparent;
  }
  .v-select.vs-virtual-keyboard ::v-deep .vs__search:focus-visible {
    outline: none;
  }

  .origin-img-class {
    width: 60px;
    height: auto;
    padding-bottom: 5px;
  }

  .destiny-img-class {
    width: 60px;
    height: auto;
    padding-bottom: 5px;
  }
</style>
