<template>
  <div class="px-5 selector-origin-destiny">
    <!-- Input select departure -->
    <b-row align-h="center">
      <b-col cols="12">
        <select-input
          v-bind="propsDepartureCity"
          @selectedValue="propsDepartureCity.selected = $event"
          @selectedStatus="action('select-origin', $event)"
          ref="select-origin"
        />
      </b-col>
    </b-row>
    <hr />
    <!-- Input select arrival -->
    <b-row align-h="center">
      <b-col cols="12">
        <select-input
          v-bind="propsArrivalCity"
          @selectedValue="propsArrivalCity.selected = $event"
          @selectedStatus="action('select-arrival', $event)"
          ref="select-arrival"
        />
      </b-col>
    </b-row>
    <hr />
    <b-row align-h="center">
      <b-col cols="12">
        <img :src="ImgRut" class="rut-img-class" fluid alt="Logo" />
        <b-form-group>
          <b-form-input
            v-bind="propsRut"
            v-model="rut"
            @focus="mostrarTeclado = true"
            @input="onInputRut"
            style="height: 85px; font-size: 52px; color: black; background-color: azure; border-radius: 10px"
            autocomplete="off"
          />
          <p class="text-center p-2 mb-0" style="color: azure; font-size: 22px;">Porfavor, ingrese su rut para la reimpresión de su boleto en caso de pérdida.</p>
          <!-- Teclado virtual para rut -->
          <div v-if="mostrarTeclado" class="teclado-virtual">
            <div class="fila-teclas">
              <button v-for="tecla in teclasFila1" :key="tecla" @click="agregarCaracter(tecla)">
                {{ tecla }}
              </button>
            </div>
            <div class="fila-teclas">
              <button v-for="tecla in teclasFila2" :key="tecla" @click="agregarCaracter(tecla)">
                {{ tecla }}
              </button>
            </div>
            <div class="fila-teclas">
              <button @click="agregarCaracter('K')">K</button>
              <button @click="borrarUltimo()">⌫</button>
              <button @click="ocultarTeclado()">Cerrar</button>
            </div>
          </div>
        </b-form-group>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import Select from '@/components/Select.vue'
import { mapActions } from 'vuex'
import ImgOrigin from '@/assets/img/origin.svg'
import ImgDestiny from '@/assets/img/destination.svg'
import ImgRut from '@/assets/img/usuario-rut.png'

export default {
  name: 'OriginDestination',
  data: () => ({
    ImgOrigin,
    ImgDestiny,
    ImgRut,
    // Props departure city
    propsDepartureCity: {
      caption: 'ORIGEN',
      icon: ImgOrigin,
      options: [],
      placeholder: 'Seleccione el origen',
      selected: '',
      reset: false,
      preSelectLabel: PRESELECT_LABEL,
      preSelectValue: PRESELECT_VALUE,
      imgClass: 'origin-img-class'
    },
    // Props arrival city
    propsArrivalCity: {
      caption: 'DESTINO',
      icon: ImgDestiny,
      options: [],
      placeholder: 'Seleccione el destino',
      selected: '',
      reset: false,
      imgClass: 'destiny-img-class'
    },
    propsRut: {
      caption: 'RUT',
      icon: ImgRut,
      options: [],
      placeholder: 'Ej: 12.345.678-9',
      rutValido: '',
      reset: false
    },
    rut: '',
    mostrarTeclado: false,
    teclasFila1: ['1', '2', '3', '4', '5'],
    teclasFila2: ['6', '7', '8', '9', '0']
  }),
  components: { selectInput: Select },
  watch: {
    'propsDepartureCity.selected'(newVal) {
      if (!newVal) {
        this.propsDepartureCity.selected = {
          label: PRESELECT_LABEL,
          value: PRESELECT_VALUE
        }
      }
      this.setArrivalCity()
      if (newVal) {
        this.propsArrivalCity.options = []
        this.getListArrivalCities()
        this.$emit('selected', true)
      }
    },

    'propsArrivalCity.selected'(newVal) {
      if (newVal) {
        this.setValues()
        this.$emit('selected', true)
      }
    },

    rut(newRut) {
      if (newRut) {
        const rutParaStorage = newRut.replace(/\./g, '')
        localStorage.setItem('rut', rutParaStorage)
      } else {
        localStorage.removeItem('rut')
      }
    }
  },
  mounted() {
    // Get list of departure cities
    this.getListDepartureCities()
    //this.setArrivalCity()
  },
  methods: {
    // Map store
    ...mapActions('TravelSelection', ['setDepartureCity', 'setArrivalCity']),

    eliminarRepetidos(data) {
      let hash = {}
      let unique = data.filter((o) => (hash[o.value] ? false : (hash[o.value] = true)))
      return unique
    },

    onInputRut() {
      this.rut = this.formatearRut(this.rut)
      this.validarRut()
    },

    agregarCaracter(tecla) {
      this.rut += tecla
      this.rut = this.formatearRut(this.rut)
    },

    borrarUltimo() {
      this.rut = this.rut.slice(0, -1)
      this.rut = this.formatearRut(this.rut)
    },

    ocultarTeclado() {
      this.mostrarTeclado = false
    },

    getListDepartureCities: async function () {
      try {
        // api antigua
        // const proxy = "https://gds.ticketsimply.us"
        // const API_KEY = "TSSDFPAPI30103014"
        // api dev
        // const proxy = "https://newstg3-gdsbus.kupos.cl"
        // const API_KEY = "TSXFQYAPI25766888"
        // api kupos
        const proxy = 'https://gds.kupos.com'
        const API_KEY = 'TSSDFPAPI30103014'
        const api = `/gds/api/cities.json?api_key=${API_KEY}`

        const response = await this.axios.get([proxy, api].join('/'), {
          headers: {
            'content-type': 'application/json'
          }
        })
        let results = response.data.result
        results.shift()
        let data = []
        for (let result of results) {
          const r = {
            label: result[1],
            value: result[0]
          }
          data.push(r)
        }
        this.propsDepartureCity.options = this.eliminarRepetidos(data)
      } catch (error) {
        console.error(error)
      }
    },

    // Get arrival cities
    getListArrivalCities: async function () {
      try {
        // api antigua
        // const proxy = "https://gds.ticketsimply.us"
        // const API_KEY = "TSSDFPAPI30103014"
        // const proxy = "https://newstg3-gdsbus.kupos.cl"
        // const API_KEY = "TSXFQYAPI25766888"
        // api kupos
        const proxy = 'https://gds.kupos.com'
        const API_KEY = 'TSSDFPAPI30103014'
        const api = `/gds/api/cities.json?api_key=${API_KEY}`
        const body = this.propsDepartureCity.selected.value

        const response = await this.axios.get([proxy, api].join('/'), {
          headers: {
            'content-type': 'application/json'
          }
        })
        let results = response.data.result
        // console.log(results)
        results.shift()
        let data = []
        for (let result of results) {
          const r = {
            label: result[1],
            value: result[0]
          }
          data.push(r)
        }

        this.propsArrivalCity.options = this.eliminarRepetidos(data)
        this.propsArrivalCity.reset = false
      } catch (error) {
        console.error(error)
      }
    },

    // Set the values of the cities in the store
    setValues() {
      this.setDepartureCity({
        name: this.propsDepartureCity.selected.label,
        code: this.propsDepartureCity.selected.value
      })

      this.setArrivalCity({
        name: this.propsArrivalCity.selected.label,
        code: this.propsArrivalCity.selected.value
      })
    },
    action(name, val) {
      this.$emit('selectAction', { name: name, status: val })
    },

    async validarRut() {
      // if (!this.rut || this.rut.trim() === '') {
      //   await this.showMsgBoxError('Debe ingresar su RUT.')
      //   this.rutValido = false
      //   return
      // }
      const formattedRut = this.formatearRut(this.rut)
      // const rutRegex = /^[0-9]{1,2}\.?[0-9]{3}\.?[0-9]{3}-[0-9kK]$/
      // if (!rutRegex.test(formattedRut)) {
      //   await this.showMsgBoxError('El RUT ingresado no es válido. Por favor, verifíquelo.')
      //   this.rutValido = false
      //   return
      // }
      const rutSinFormato = formattedRut.replace(/\./g, '').replace('-', '')
      const cuerpo = rutSinFormato.slice(0, -1)
      const dvIngresado = rutSinFormato.slice(-1).toUpperCase()
      let suma = 0
      let multiplo = 2
      for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += parseInt(cuerpo[i]) * multiplo
        multiplo = multiplo < 7 ? multiplo + 1 : 2
      }
      const resto = 11 - (suma % 11)
      // const dvEsperado = resto === 11 ? '0' : resto === 10 ? 'K' : resto.toString()
      // if (dvIngresado !== dvEsperado) {
      //   await this.showMsgBoxError('El RUT ingresado tiene un dígito verificador incorrecto.')
      //   this.rutValido = false
      //   return
      // }
      this.rut = formattedRut
      this.rutValido = true
      let rut = formattedRut.replace(/\./g, '').replace('-', '')
      if (rut.length > 1) {
        rut = rut.slice(0, rut.length - 1) + '-' + rut.slice(-1)
      }
      // localStorage.setItem('rut', rut)
      this.$emit('rutValido', this.rutValido)
    },
    formatearRut(rut) {
      rut = rut.replace(/[^0-9kK]/g, '').toUpperCase()
      if (rut.length < 2) return rut
      let cuerpo = rut.slice(0, -1)
      let dv = rut.slice(-1)
      let formateado = ''
      for (let i = cuerpo.length - 1, j = 0; i >= 0; i--, j++) {
        formateado = cuerpo[i] + formateado
        if (j % 3 === 2 && i !== 0) {
          formateado = '.' + formateado
        }
      }
      return `${formateado}-${dv}`
    },
    async showMsgBoxError(msg) {
      await this.$bvModal.msgBoxOk(msg, {
        title: 'Información',
        size: 'sm',
        buttonSize: 'lg',
        okVariant: 'danger',
        headerClass: 'p-2 ml-2 mr-3 mt-2 border-bottom-0',
        footerClass: 'p-2 ml-3 border-top-0',
        centered: true
      })
    }
  }
}
</script>

<style>
.rut-img-class {
  width: 55px;
  padding-bottom: 10px;
  padding-left: 7px;
}

.vs__dropdown-menu {
  max-height: 500px !important;
  font-size: 52px !important;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 10px;
}

.teclado-virtual {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 15px;
}

.fila-teclas {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.teclado-virtual button {
  font-size: 36px;
  padding: 15px 25px;
  min-width: 85px;
  border-radius: 15px;
  background-color: #dbeafe;
  border: none;
  color: #111;
  cursor: pointer;
}

.teclado-virtual button:hover {
  background-color: #93c5fd;
}
</style>

