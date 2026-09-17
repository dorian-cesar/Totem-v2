<template>
  <div class="campo-teclado">
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
          :options="visibleOptions"
          :placeholder="placeholder"
          :resetOnOptionsChange="!virtualKeyboard"
          :disabled="showSpinner"
          :searchable="!virtualKeyboard"
          class="vs-virtual-keyboard"
          :class="{ 'select-ok': seleccionOk }"
          @input="onSelect"
          :value="value"
          @open="status('open')"
          @close="status('close')"
        />
        <div v-show="seleccionOk" class="select-ok-indicator">✓</div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
  import vSelect from 'vue-select'
  export default {
    name: 'Select',
    data: () => ({
      value: null,
      searchText: '',
      seleccionOk: false,
      seleccionOkTimer: null
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
      },
      virtualKeyboard(active) {
        this.parchearBlur(active)
      }
    },
    mounted() {
      if (this.preSelectLabel && this.preSelectValue) {
        this.value = {label: this.preSelectLabel, value: this.preSelectValue}
        this.onSelect(this.value)
      }
      this.parchearBlur(this.virtualKeyboard)
    },
    beforeDestroy() {
      if (this.seleccionOkTimer) {
        clearTimeout(this.seleccionOkTimer)
        this.seleccionOkTimer = null
      }
    },
    updated() {
      this.parchearBlur(this.virtualKeyboard)
    },
    computed: {
      showSpinner: function () {
        return !(this.options.length > 0)
      },
      // Filtramos las opciones nosotros mismos: ignora mayúsculas/tildes
      visibleOptions() {
        if (!this.virtualKeyboard || !this.searchText) {
          return this.options
        }
        const q = this.normalizar(this.searchText)
        return this.options.filter((o) => {
          const label = typeof o === 'object' ? (o.label != null ? o.label : o.value) : o
          return this.normalizar(String(label)).includes(q)
        })
      }
    },
    methods: {
      onSelect(val) {
        if (val) {
          this.value = val
          this.$emit('selectedValue', val)
          this.searchText = ''
          this.mostrarConfirmacion()
          this.$nextTick(() => {
            const input = this.$refs.vSelect && this.$refs.vSelect.$el
              ? this.$refs.vSelect.$el.querySelector('input')
              : null
            if (input) {
              input.value = ''
              input.blur()
            }
          })
        }
      },
      mostrarConfirmacion() {
        if (this.seleccionOkTimer) {
          clearTimeout(this.seleccionOkTimer)
        }
        this.seleccionOk = true
        this.seleccionOkTimer = setTimeout(() => {
          this.seleccionOk = false
          this.seleccionOkTimer = null
        }, 1200)
      },
      // Impide que el blur del input (por tocar el teclado virtual) cierre el
      // listado. En modo teclado virtual el cierre lo controlamos externamente.
      parchearBlur(active) {
        if (!active || !this.$refs || !this.$refs.vSelect) return
        this.$refs.vSelect.onSearchBlur = () => {}
      },
      // Escribe el texto buscado en el input readonly del select para que se vea
      // siempre, y mantiene el listado abierto.
      setSearchText(texto) {
        if (texto && !this.searchText && this.value != null) {
          // Nueva búsqueda: oculta la selección anterior para que no quede
          // superpuesta al texto que se está escribiendo.
          this.value = null
        }
        this.searchText = texto
        const field = this.$refs && this.$refs.vSelect
        if (!field) return
        field.search = ''
        field.open = true
        this.$nextTick(() => {
          const input = field.$el ? field.$el.querySelector('input') : null
          if (input) input.value = this.searchText
        })
      },
      onVirtualKey(key) {
        if (!this.virtualKeyboard) return
        if (key === '{bksp}') {
          this.setSearchText(this.searchText.slice(0, -1))
        } else if (key === '{sp}') {
          this.setSearchText(this.searchText + ' ')
        } else if (/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]$/.test(key)) {
          this.setSearchText(this.searchText + key)
        }
      },
      closeFromKeyboard() {
        this.searchText = ''
        const field = this.$refs && this.$refs.vSelect
        if (!field) return
        field.open = false
        field.search = ''
        const input = field.$el ? field.$el.querySelector('input') : null
        if (input) input.value = ''
      },
      closeDropdown() {
        const field = this.$refs && this.$refs.vSelect
        if (field) {
          field.open = false
        }
      },
      resetKeyboardSearch() {
        this.searchText = ''
        const field = this.$refs && this.$refs.vSelect
        if (!field) return
        field.search = ''
        const input = field.$el ? field.$el.querySelector('input') : null
        if (input) input.value = ''
      },
      normalizar(texto) {
        return String(texto)
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
      },
      status(name){
        this.$emit('selectedStatus', name)
      },
    },
  }
</script>

<style scoped>
  .selector-selects {
    position: relative;
  }

  .select-ok-indicator {
    position: absolute;
    top: -12px;
    right: 8px;
    z-index: 3;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background-color: #16a34a;
    color: #ffffff;
    font-size: 26px;
    font-weight: bold;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
    animation: ok-pop 0.3s ease;
    pointer-events: none;
  }

  @keyframes ok-pop {
    0% { transform: scale(0.4); opacity: 0; }
    60% { transform: scale(1.15); }
    100% { transform: scale(1); opacity: 1; }
  }

  .v-select.select-ok ::v-deep .vs__dropdown-toggle {
    border: 3px solid #16a34a !important;
    box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.25) !important;
  }

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