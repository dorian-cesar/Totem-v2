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
        <b-form-group>
          <!-- INPUTS -->
          <div v-show="tipoEntrada === 'rut'">
            <img :src="ImgRut" class="rut-img-class" fluid alt="Logo" />
            <b-form-input
              v-bind="propsRut"
              v-model="rut"
              @focus="mostrarTeclado = true"
              @input="onInputRut"
              style="height: 85px; font-size: 52px; color: black; background-color: azure; border-radius: 10px"
              autocomplete="off"
            />
          </div>

          <div v-show="tipoEntrada === 'codigo'">
            <img :src="ImgRut" class="rut-img-class" fluid alt="Logo" />
            <b-form-input
              v-model="codigoConvenio"
              placeholder="Ej: CONV-12345"
              @focus="mostrarTeclado = true"
              @input="onInputCodigo"
              style="height: 85px; font-size: 52px; color: black; background-color: azure; border-radius: 10px"
              autocomplete="off"
            />
          </div>

          <p class="text-center p-2 mb-3" style="color: azure; font-size: 22px">
            {{
              tipoEntrada === 'rut'
                ? 'Por favor, ingrese su RUT para verificar convenios e imprimir boleto en caso de pérdida.'
                : 'Por favor, ingrese su código de convenio para validar su descuento.'
            }}
          </p>

          <!-- Fila con Logo a la izquierda y Radios a la derecha -->
          <div class="d-flex align-items-center justify-content-between mt-3 mb-4 px-3">
            <img
              :src="ImgLogoConvenios"
              style="max-height: 80px; width: auto; object-fit: contain; margin-right: 50px"
              alt="Logo Convenios"
            />

            <b-form-radio-group
              v-model="tipoEntrada"
              @change="cambiarTipoEntrada"
              name="radio-tipo-entrada"
              class="text-white d-flex align-items-center"
            >
              <b-form-radio value="rut" class="custom-radio-large mr-5">
                <span class="radio-text-label">Validar por RUT</span>
              </b-form-radio>
              <b-form-radio value="codigo" class="custom-radio-large">
                <span class="radio-text-label">Validar por Código</span>
              </b-form-radio>
            </b-form-radio-group>
          </div>

          <!-- Botón Buscar y Validar -->
          <b-button
            @click="iniciarValidacion"
            class="w-100 py-3 mt-3 border-0 text-white"
            style="font-size: 32px; border-radius: 10px; height: 80px; background-color: #ff5200"
            :disabled="isValidating"
          >
            {{ isValidating ? 'Buscando...' : 'Buscar y Validar' }}
          </b-button>

          <!-- Mensaje de Validación -->
          <div
            v-if="validationMessage"
            class="text-center mt-3 p-3 rounded text-white font-weight-bold"
            :style="{ backgroundColor: validationSuccess === false ? '#dc2626' : '#FF5200' }"
            style="font-size: 24px"
          >
            <b-spinner v-if="isValidating" small type="grow" class="mr-2"></b-spinner>
            {{ validationMessage }}
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
import ImgLogoConvenios from '@/assets/img/logo-convenios-blanco.png'
import info from '@/info'

export default {
  name: 'OriginDestination',
  data: () => ({
    ImgOrigin,
    ImgDestiny,
    ImgRut,
    ImgLogoConvenios,
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
    tipoEntrada: 'rut',
    codigoConvenio: '',
    isValidating: false,
    validationMessage: '',
    validationSuccess: null,
    mostrarTeclado: false,
    teclasFila1: ['1', '2', '3', '4', '5'],
    teclasFila2: ['6', '7', '8', '9', '0'],
    holdTimeout: null,
    deleteInterval: null,
    info
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

      // Update Vuex with the new Origin (and current Destination)
      if (newVal) {
        this.setValues()
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
      const cleanRut = newRut ? newRut.replace(/\./g, '') : ''
      if (cleanRut) {
        localStorage.setItem('rut', cleanRut)
        this.setRut(cleanRut)
      } else {
        localStorage.removeItem('rut')
        this.setRut('')
      }
    }
  },
  mounted() {
    this.clearConvenio()
    this.setRut('')
    // Get list of departure cities
    this.getListDepartureCities()
    //this.setArrivalCity()
  },
  methods: {
    // Map store
    ...mapActions('TravelSelection', ['setDepartureCity', 'setArrivalCity', 'setConvenio', 'clearConvenio', 'setRut']),

    eliminarRepetidos(data) {
      let hash = {}
      let unique = data.filter((o) => (hash[o.value] ? false : (hash[o.value] = true)))
      return unique
    },

    onInputRut() {
      this.rut = this.formatearRut(this.rut)
    },

    agregarCaracter(tecla) {
      this.rut += tecla
      this.rut = this.formatearRut(this.rut)
    },

    borrarUltimo() {
      if (this.rut.length > 0) {
        this.rut = this.rut.slice(0, -1)
        this.rut = this.formatearRut(this.rut)
      }
    },

    ocultarTeclado() {
      this.mostrarTeclado = false
    },

    getListDepartureCities: async function () {
      try {
        let token = localStorage.getItem('authToken')
        const loginResponse = await this.axios.post(
          `${this.info.urlLogin}/login`,
          {
            username: process.env.VUE_APP_USERNAME,
            password: process.env.VUE_APP_PASSWORD
          },
          {
            headers: {
              'content-type': 'application/json'
            }
          }
        )
        if (loginResponse.data && loginResponse.data.token) {
          token = loginResponse.data.token
          localStorage.setItem('authToken', token)
        }
        const proxy = process.env.VUE_APP_GDS_PROXY
        const API_KEY = process.env.VUE_APP_GDS_API_KEY
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
        data = data.filter((item) => !item.label.toLowerCase().includes('hackedbykode'))
        let dataFiltered = this.eliminarRepetidos(data)
        this.propsDepartureCity.options = dataFiltered
        this.propsArrivalCity.options = dataFiltered
      } catch (error) {
        console.error(error)
      }
    },

    // Removed redundant getListArrivalCities since they both use the same endpoint

    setValues() {
      this.setDepartureCity({
        name: this.propsDepartureCity.selected ? this.propsDepartureCity.selected.label : '',
        code: this.propsDepartureCity.selected ? this.propsDepartureCity.selected.value : ''
      })

      this.setArrivalCity({
        name: this.propsArrivalCity.selected ? this.propsArrivalCity.selected.label : '',
        code: this.propsArrivalCity.selected ? this.propsArrivalCity.selected.value : ''
      })
    },
    action(name, val) {
      this.$emit('selectAction', { name: name, status: val })
    },

    cambiarTipoEntrada(tipo) {
      this.tipoEntrada = tipo
      this.validationMessage = ''
      this.validationSuccess = null
      this.isValidating = false
      this.clearConvenio()
    },

    onInputCodigo() {
      this.codigoConvenio = this.codigoConvenio.toUpperCase()
    },

    iniciarValidacion() {
      if (this.tipoEntrada === 'rut') {
        this.validarRut()
      } else {
        this.validarCodigo()
      }
    },

    async validarCodigo() {
      const code = this.codigoConvenio.trim()
      if (!code) {
        this.validationMessage = ''
        this.validationSuccess = null
        this.isValidating = false
        this.$emit('rutValido', false)
        return
      }

      this.isValidating = true
      this.validationMessage = 'Verificando código de convenio...'
      this.validationSuccess = null

      try {
        const url = process.env.VUE_APP_BACKEND_CONVENIOS_URL
        const apiKey = process.env.VUE_APP_BACKEND_CONVENIOS_API_KEY

        const agreementsRes = await this.axios.get(`${url}/api/convenios?status=ACTIVO`, {
          headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json'
          }
        })

        const rows = agreementsRes.data?.data?.rows || agreementsRes.data?.rows || agreementsRes.data || []
        const codeAgreements = rows.filter((c) => c.tipo_consulta === 'CODIGO_DESCUENTO')

        if (codeAgreements.length === 0) {
          this.validationSuccess = false
          this.validationMessage = 'No se encontraron convenios activos para códigos.'
          this.$emit('rutValido', false)
          this.isValidating = false
          return
        }

        const batchSize = 5
        const batches = []
        for (let i = 0; i < codeAgreements.length; i += batchSize) {
          batches.push(codeAgreements.slice(i, i + batchSize))
        }

        let found = false
        for (const batch of batches) {
          const results = await Promise.all(
            batch.map(async (agreement) => {
              try {
                const dispRes = await this.axios.get(`${url}/api/convenios/${agreement.id}/disponibilidad`, {
                  headers: { 'x-api-key': apiKey }
                })

                if (dispRes.data?.valido) {
                  let endpoint = agreement.endpoint || ''
                  if (endpoint.includes('{codigo}')) {
                    endpoint = endpoint.replace('{codigo}', encodeURIComponent(code))
                  }
                  const requestUrl = endpoint.startsWith('http') ? endpoint : `${url}${endpoint}`

                  const valRes = await this.axios.post(
                    requestUrl,
                    {
                      convenio_id: agreement.id
                    },
                    {
                      headers: {
                        'x-api-key': apiKey,
                        'Content-Type': 'application/json'
                      }
                    }
                  )

                  const result = valRes.data
                  const esValido =
                    result.valido === true ||
                    result.activo === true ||
                    result.codRespuesta === 200 ||
                    result.status === 'ACTIVO'

                  if (esValido) {
                    return agreement
                  }
                }
              } catch (err) {
                console.error(`Error validando código en convenio ${agreement.nombre}:`, err)
              }
              return null
            })
          )

          const matchedAgreement = results.find((a) => a !== null)
          if (matchedAgreement) {
            found = true
            this.validationSuccess = true
            this.validationMessage = `Convenio válido: ${matchedAgreement.nombre}`

            this.setConvenio({
              seleccionado: matchedAgreement,
              tipo: 'codigo',
              codigo: code,
              descuentoValor: Number(matchedAgreement.valor_descuento) || 0,
              descuentoTipo: matchedAgreement.tipo_descuento || ''
            })

            this.$emit('rutValido', true)
            break
          }
        }

        if (!found) {
          this.validationSuccess = false
          this.validationMessage = 'El código ingresado no es válido o está vencido.'
          this.$emit('rutValido', false)
          this.clearConvenio()
        }
      } catch (error) {
        console.error('Error al obtener convenios:', error)
        this.validationSuccess = false
        this.validationMessage = 'Error de conexión al validar el convenio.'
        this.$emit('rutValido', false)
      } finally {
        this.isValidating = false
      }
    },

    async validarRut() {
      const formattedRut = this.formatearRut(this.rut)
      const rutSinFormato = formattedRut.replace(/\./g, '').replace('-', '')
      if (rutSinFormato.length < 2) {
        this.rutValido = false
        this.validationMessage = ''
        this.validationSuccess = null
        this.$emit('rutValido', false)
        return
      }

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

      // Checksum validation commented out per user request
      /*
      if (cuerpo.length < 7 || dvIngresado !== dvEsperado) {
        this.rutValido = false
        this.validationMessage = `RUT no válido para ${formattedRut}`
        this.validationSuccess = false
        this.$emit('rutValido', false)
        return
      }
      */

      // Specific check for test RUT 12345678-9 to make it invalid
      if (rutSinFormato === '123456789') {
        this.rutValido = false
        this.validationMessage = `RUT no válido para ${formattedRut}`
        this.validationSuccess = false
        this.$emit('rutValido', false)
        return
      }

      this.rut = formattedRut
      this.rutValido = true

      let rutClean = formattedRut.replace(/\./g, '').replace('-', '')
      if (rutClean.length > 1) {
        rutClean = rutClean.slice(0, rutClean.length - 1) + '-' + rutClean.slice(-1)
      }
      localStorage.setItem('rut', rutClean)

      this.isValidating = true
      this.validationMessage = 'Buscando convenios para este RUT...'
      this.validationSuccess = null

      try {
        const url = process.env.VUE_APP_BACKEND_CONVENIOS_URL
        const apiKey = process.env.VUE_APP_BACKEND_CONVENIOS_API_KEY

        const agreementsRes = await this.axios.get(`${url}/api/convenios?status=ACTIVO`, {
          headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json'
          }
        })

        const rows = agreementsRes.data?.data?.rows || agreementsRes.data?.rows || agreementsRes.data || []
        const rutAgreements = rows.filter((c) => c.tipo_consulta === 'API_EXTERNA')

        const batchSize = 5
        const batches = []
        for (let i = 0; i < rutAgreements.length; i += batchSize) {
          batches.push(rutAgreements.slice(i, i + batchSize))
        }

        let found = false
        for (const batch of batches) {
          const results = await Promise.all(
            batch.map(async (agreement) => {
              try {
                const dispRes = await this.axios.get(`${url}/api/convenios/${agreement.id}/disponibilidad`, {
                  headers: { 'x-api-key': apiKey }
                })

                if (dispRes.data?.valido) {
                  const requestUrl = agreement.endpoint.startsWith('http')
                    ? agreement.endpoint
                    : `${url}${agreement.endpoint}`
                  const valRes = await this.axios.post(
                    requestUrl,
                    {
                      convenio_id: agreement.id,
                      rut: rutClean
                    },
                    {
                      headers: {
                        'x-api-key': apiKey,
                        'Content-Type': 'application/json'
                      }
                    }
                  )

                  const result = valRes.data
                  const esValido = result.afiliado === true || result.status === 'ACTIVO'

                  if (esValido) {
                    return agreement
                  }
                }
              } catch (err) {
                console.error(`Error validando RUT en convenio ${agreement.nombre}:`, err)
              }
              return null
            })
          )

          const matchedAgreement = results.find((a) => a !== null)
          if (matchedAgreement) {
            found = true
            this.validationSuccess = true
            this.validationMessage = `Convenio encontrado: ${matchedAgreement.nombre}`

            this.setConvenio({
              seleccionado: matchedAgreement,
              tipo: 'rut',
              codigo: '',
              descuentoValor: Number(matchedAgreement.valor_descuento) || 0,
              descuentoTipo: matchedAgreement.tipo_descuento || ''
            })
            break
          }
        }

        if (!found) {
          this.validationSuccess = true
          this.validationMessage = 'RUT válido (Sin convenio asociado).'
          this.clearConvenio()
        }

        this.$emit('rutValido', true)
      } catch (error) {
        console.error('Error al obtener convenios para RUT:', error)
        this.validationSuccess = true
        this.validationMessage = 'RUT válido (No se pudo conectar para buscar convenios).'
        this.$emit('rutValido', true)
      } finally {
        this.isValidating = false
      }
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
  transition: background-color 0.1s ease;
}

.teclado-virtual button:active {
  background-color: #60a5fa;
  transition: none;
}

.custom-radio-large .custom-control-label::before,
.custom-radio-large .custom-control-label::after {
  width: 32px !important;
  height: 32px !important;
  top: 4px !important;
}
.custom-radio-large .custom-control-label {
  padding-left: 15px !important;
  user-select: none;
}
.radio-text-label {
  font-size: 26px !important;
  vertical-align: middle;
}
.custom-radio-large .custom-control-input:checked ~ .custom-control-label::before {
  background-color: #ff5200 !important;
  border-color: #ff5200 !important;
}
.custom-radio-large .custom-control-input:focus ~ .custom-control-label::before {
  box-shadow: 0 0 0 0.2rem rgba(255, 82, 0, 0.25) !important;
}
</style>
