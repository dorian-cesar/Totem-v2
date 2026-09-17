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
          :options="visibleOptions"
          :placeholder="placeholder"
          :resetOnOptionsChange="!virtualKeyboard"
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
      value: null,
      searchText: ''
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
      // Impide que el blur del input (por tocar el teclado virtual) cierre el
      // listado. En modo teclado virtual el cierre lo controlamos externamente.
      parchearBlur(active) {
        if (!active || !this.$refs || !this.$refs.vSelect) return
        this.$refs.vSelect.onSearchBlur = () => {}
      },
      // Escribe el texto buscado en el input readonly del select para que se vea
      // siempre, y mantiene el listado abierto.
      setSearchText(texto) {
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