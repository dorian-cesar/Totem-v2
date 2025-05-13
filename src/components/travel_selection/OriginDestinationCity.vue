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
            @input="rut = formatearRut(rut)"
            @blur="validarRut"
            style="height: 68px; font-size: 40px; color: black; background-color: azure; border-radius: 10px;"
            autocomplete="off"
          />
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
    rut: ''
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
      if (!this.rut || this.rut.trim() === '') {
        await this.showMsgBoxError('Debe ingresar su RUT.')
        this.rutValido = false
        return
      }
      const formattedRut = this.formatearRut(this.rut)
      const rutRegex = /^[0-9]{1,2}\.?[0-9]{3}\.?[0-9]{3}-[0-9kK]$/
      if (!rutRegex.test(formattedRut)) {
        await this.showMsgBoxError('El RUT ingresado no es válido. Por favor, verifíquelo.')
        this.rutValido = false
        return
      }
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
      const dvEsperado = resto === 11 ? '0' : resto === 10 ? 'K' : resto.toString()
      if (dvIngresado !== dvEsperado) {
        await this.showMsgBoxError('El RUT ingresado tiene un dígito verificador incorrecto.')
        this.rutValido = false
        return
      }
      this.rut = formattedRut
      this.rutValido = true
      let rut = formattedRut.replace(/\./g, '').replace('-', '')
      if (rut.length > 1) {
        rut = rut.slice(0, rut.length - 1) + '-' + rut.slice(-1)
      }
      localStorage.setItem('rut', rut)
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
  width: 50px;
  margin-bottom: 10px;
  margin-left: 7px;
}
</style>

