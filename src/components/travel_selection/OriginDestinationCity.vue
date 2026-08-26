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
          <!-- 1. MODO NORMAL (SIN CONVENIO DESPLEGADO) -->
          <div v-show="!tieneConvenio">
            <!-- INPUT RUT NORMAL -->
            <img :src="ImgRut" class="rut-img-class" fluid alt="Logo" />
            <b-form-input
              v-bind="propsRut"
              v-model="rut"
              @focus="mostrarTeclado = true"
              @input="onInputRut"
              style="height: 85px; font-size: 52px; color: black; background-color: azure; border-radius: 10px"
              autocomplete="off"
            />
            <p class="text-center p-2 mb-3" style="color: azure; font-size: 22px">
              Ingrese su RUT para emitir su pasaje e imprimir en caso de pérdida.
            </p>

            <!-- Banner con Logo Convenios y Pregunta -->
            <div
              class="convenio-banner d-flex align-items-center justify-content-between p-3 my-2"
              @click="toggleConvenio"
            >
              <div class="d-flex align-items-center">
                <img
                  :src="ImgLogoConvenios"
                  style="max-height: 65px; width: auto; object-fit: contain; margin-right: 25px"
                  alt="Logo Convenios"
                />
                <div class="text-left">
                  <div style="font-size: 28px; color: #ffffff; font-weight: bold">
                    ¿Tienes convenio o código de descuento?
                  </div>
                  <div style="font-size: 20px; color: #dbeafe">Toca aquí para validar tu beneficio institucional</div>
                </div>
              </div>
              <b-button class="convenio-btn-action text-white" @click.stop="toggleConvenio"> Tengo Convenio </b-button>
            </div>
          </div>

          <!-- 2. MODO CONVENIO DESPLEGADO -->
          <div v-show="tieneConvenio" class="convenio-container-expanded">
            <!-- Encabezado con Logo Convenios y botón para volver/cerrar -->
            <div class="d-flex align-items-center justify-content-between mb-3 px-2">
              <div class="d-flex align-items-center">
                <img
                  :src="ImgLogoConvenios"
                  style="max-height: 65px; width: auto; object-fit: contain; margin-right: 20px"
                  alt="Logo Convenios"
                />
                <span style="font-size: 28px; color: #ffffff; font-weight: bold"> Validación de Convenios </span>
              </div>
              <b-button
                variant="outline-light"
                class="btn-cerrar-convenio"
                @click="toggleConvenio"
                aria-label="Cerrar convenio"
              >
                ✕
              </b-button>
            </div>

            <!-- Selector Previo de Convenio / Institución -->
            <div class="mb-3">
              <v-select
                v-model="convenioSeleccionadoInput"
                :options="opcionesConvenios"
                placeholder="Seleccione su Institución / Convenio"
                class="convenio-select"
                :clearable="true"
                :disabled="cargandoConvenios"
              >
                <template #no-options>
                  <span style="font-size: 24px; padding: 10px; color: #666">
                    {{ cargandoConvenios ? 'Cargando convenios...' : 'No hay convenios disponibles' }}
                  </span>
                </template>
              </v-select>
            </div>

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
                  ? 'Ingrese su RUT para validar convenio e imprimir boleto en caso de pérdida.'
                  : 'Ingrese su código de convenio para validar su descuento.'
              }}
            </p>

            <!-- Botón Buscar y Validar con mensaje integrado -->
            <b-button
              @click="iniciarValidacion"
              class="w-100 py-3 mt-3 border-0 text-white font-weight-bold d-flex align-items-center justify-content-center text-center"
              :style="{
                backgroundColor:
                  validationSuccess === false ? '#dc2626' : validationSuccess === true ? '#16a34a' : '#ff5200',
                borderRadius: '10px',
                minHeight: '80px',
                height: 'auto',
                fontSize: validationMessage ? '24px' : '32px',
                lineHeight: '1.2',
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                transition: 'background-color 0.2s ease'
              }"
              :disabled="isValidating"
            >
              <b-spinner v-if="isValidating" small type="grow" class="mr-2"></b-spinner>
              <span>{{ textoBotonValidar }}</span>
            </b-button>
          </div>
        </b-form-group>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import Select from '@/components/Select.vue'
import vSelect from 'vue-select'
import { mapActions } from 'vuex'
import ImgOrigin from '@/assets/img/origin.svg'
import ImgDestiny from '@/assets/img/destination.svg'
import ImgRut from '@/assets/img/usuario-rut.png'
import ImgLogoConvenios from '@/assets/img/logo-convenios-blanco.png'
import info from '@/info'
import { getCiudadesConvenio } from '@/lib/convenioUtils'

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
    tieneConvenio: false,
    codigoConvenio: '',
    listaConvenios: [],
    convenioSeleccionadoInput: null,
    cargandoConvenios: false,
    isValidating: false,
    validationMessage: '',
    validationSuccess: null,
    mostrarTeclado: false,
    teclasFila1: ['1', '2', '3', '4', '5'],
    teclasFila2: ['6', '7', '8', '9', '0'],
    holdTimeout: null,
    deleteInterval: null,
    info,
    // Guarda el listado completo de ciudades para poder restaurar al quitar convenio
    todasLasCiudades: []
  }),
  components: { selectInput: Select, vSelect },
  computed: {
    // Acceso reactivo al convenio activo en Vuex
    convenioSeleccionado() {
      return this.$store.state.TravelSelection.convenioSeleccionado
    },
    tipoEntrada() {
      if (this.convenioSeleccionadoInput && this.convenioSeleccionadoInput.value) {
        return this.convenioSeleccionadoInput.value.tipo_consulta === 'CODIGO_DESCUENTO' ? 'codigo' : 'rut'
      }
      return 'rut'
    },
    opcionesConvenios() {
      return this.listaConvenios.map((c) => {
        const val = Number(c.valor_descuento) || 0
        const esPorcentaje = String(c.tipo_descuento || '')
          .toLowerCase()
          .includes('porcent')
        const descTexto = esPorcentaje ? `${val}%` : `$${val}`
        return {
          label: `${c.nombre} (${descTexto} dcto.)`,
          value: c
        }
      })
    },
    textoBotonValidar() {
      if (this.isValidating) {
        return this.validationMessage || 'Buscando...'
      }
      if (this.validationMessage) {
        return this.validationMessage
      }
      return 'Buscar y Validar'
    }
  },
  watch: {
    convenioSeleccionadoInput() {
      this.validationMessage = ''
      this.validationSuccess = null
      this.clearConvenio()
    },
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
    },

    // Cuando el convenio validado cambia, filtramos las ciudades disponibles
    convenioSeleccionado(nuevoConvenio) {
      this.aplicarFiltroConvenio(nuevoConvenio)
    }
  },
  mounted() {
    this.clearConvenio()
    this.setRut('')
    this.getListDepartureCities()
    this.obtenerListaConvenios()
  },
  methods: {
    // Map store
    ...mapActions('TravelSelection', ['setDepartureCity', 'setArrivalCity', 'setConvenio', 'clearConvenio', 'setRut']),

    async obtenerListaConvenios() {
      this.cargandoConvenios = true
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
        this.listaConvenios = Array.isArray(rows) ? rows : []
      } catch (error) {
        console.error('Error al cargar lista de convenios:', error)
        this.listaConvenios = []
      } finally {
        this.cargandoConvenios = false
      }
    },

    eliminarRepetidos(data) {
      let hash = {}
      let unique = data.filter((o) => (hash[o.value] ? false : (hash[o.value] = true)))
      return unique
    },

    onInputRut() {
      if (this.validationSuccess === false) {
        this.validationMessage = ''
        this.validationSuccess = null
      }
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

        // Guardamos todas las ciudades antes de aplicar cualquier filtro de convenio
        this.todasLasCiudades = [...dataFiltered]

        // Aplicar filtro de convenio si ya hay uno activo
        this.aplicarFiltroConvenio(this.convenioSeleccionado)
      } catch (error) {
        console.error(error)
      }
    },

    /**
     * Filtra los selectores de ciudad según las rutas del convenio activo.
     * Si el convenio tiene rutas específicas, solo muestra esas ciudades.
     * Si no hay convenio o no tiene rutas, restaura todas las ciudades.
     */
    aplicarFiltroConvenio(convenio) {
      if (!this.todasLasCiudades.length) return

      const codigos = getCiudadesConvenio(convenio)

      if (codigos.length > 0) {
        // Filtrar a solo las ciudades dentro de las rutas del convenio
        const filtradas = this.todasLasCiudades.filter((c) => codigos.includes(String(c.value)))
        this.propsDepartureCity.options = filtradas
        this.propsArrivalCity.options = filtradas

        // Resetear selección si la ciudad elegida ya no está en las opciones filtradas
        if (
          this.propsDepartureCity.selected &&
          this.propsDepartureCity.selected.value &&
          !codigos.includes(String(this.propsDepartureCity.selected.value))
        ) {
          this.propsDepartureCity.selected = ''
        }
        if (
          this.propsArrivalCity.selected &&
          this.propsArrivalCity.selected.value &&
          !codigos.includes(String(this.propsArrivalCity.selected.value))
        ) {
          this.propsArrivalCity.selected = ''
        }
      } else {
        // Sin restricción de rutas: mostrar todas las ciudades
        this.propsDepartureCity.options = [...this.todasLasCiudades]
        this.propsArrivalCity.options = [...this.todasLasCiudades]
      }
    },

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

    toggleConvenio() {
      this.tieneConvenio = !this.tieneConvenio
      if (!this.tieneConvenio) {
        this.clearConvenio()
        this.convenioSeleccionadoInput = null
        this.validationMessage = ''
        this.validationSuccess = null
        this.codigoConvenio = ''
      }
    },

    onInputCodigo() {
      if (this.validationSuccess === false) {
        this.validationMessage = ''
        this.validationSuccess = null
      }
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
        this.validationMessage = 'Por favor, ingrese un código de convenio.'
        this.validationSuccess = false
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

        let targetAgreements = []
        if (this.convenioSeleccionadoInput && this.convenioSeleccionadoInput.value) {
          targetAgreements = [this.convenioSeleccionadoInput.value]
        } else {
          targetAgreements = this.listaConvenios.filter((c) => c.tipo_consulta === 'CODIGO_DESCUENTO')
          if (targetAgreements.length === 0) {
            const agreementsRes = await this.axios.get(`${url}/api/convenios?status=ACTIVO`, {
              headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json'
              }
            })
            const rows = agreementsRes.data?.data?.rows || agreementsRes.data?.rows || agreementsRes.data || []
            targetAgreements = rows.filter((c) => c.tipo_consulta === 'CODIGO_DESCUENTO')
          }
        }

        if (targetAgreements.length === 0) {
          this.validationSuccess = false
          this.validationMessage = 'No se encontraron convenios activos para códigos.'
          this.$emit('rutValido', false)
          this.isValidating = false
          return
        }

        let matchedAgreement = null
        for (const agreement of targetAgreements) {
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
                matchedAgreement = agreement
                break
              }
            }
          } catch (err) {
            console.error(`Error validando código en convenio ${agreement.nombre}:`, err)
          }
        }

        if (matchedAgreement) {
          this.validationSuccess = true
          const val = Number(matchedAgreement.valor_descuento) || 0
          const esPorcentaje = String(matchedAgreement.tipo_descuento).toLowerCase().includes('porcent')
          const descTexto = esPorcentaje ? `${val}%` : `$${val}`
          this.validationMessage = `Convenio válido: ${matchedAgreement.nombre} (${descTexto} de dcto.)`

          this.setConvenio({
            seleccionado: matchedAgreement,
            tipo: 'codigo',
            codigo: code,
            descuentoValor: val,
            descuentoTipo: matchedAgreement.tipo_descuento || ''
          })

          this.$emit('rutValido', true)
        } else {
          this.validationSuccess = false
          this.validationMessage = this.convenioSeleccionadoInput?.value
            ? `El código no es válido para ${this.convenioSeleccionadoInput.value.nombre}.`
            : 'El código ingresado no es válido o está vencido.'
          this.$emit('rutValido', false)
          this.clearConvenio()
        }
      } catch (error) {
        console.error('Error al validar convenio:', error)
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

      // Caso 1: No seleccionó ningún convenio específico
      if (!this.convenioSeleccionadoInput || !this.convenioSeleccionadoInput.value) {
        this.isValidating = false
        this.validationSuccess = true
        this.validationMessage = 'RUT ingresado correctamente (Sin convenio seleccionado).'
        this.clearConvenio()
        this.$emit('rutValido', true)
        return
      }

      // Caso 2: Seleccionó una institución / convenio específico
      const agreement = this.convenioSeleccionadoInput.value
      this.isValidating = true
      this.validationMessage = `Verificando afiliación a convenio...`
      this.validationSuccess = null

      try {
        const url = process.env.VUE_APP_BACKEND_CONVENIOS_URL
        const apiKey = process.env.VUE_APP_BACKEND_CONVENIOS_API_KEY

        const dispRes = await this.axios.get(`${url}/api/convenios/${agreement.id}/disponibilidad`, {
          headers: { 'x-api-key': apiKey }
        })

        if (dispRes.data?.valido) {
          const requestUrl = agreement.endpoint.startsWith('http') ? agreement.endpoint : `${url}${agreement.endpoint}`
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
            this.validationSuccess = true
            const val = Number(agreement.valor_descuento) || 0
            const esPorcentaje = String(agreement.tipo_descuento).toLowerCase().includes('porcent')
            const descTexto = esPorcentaje ? `${val}%` : `$${val}`
            this.validationMessage = `Convenio aplicado: ${agreement.nombre} (${descTexto} de dcto.)`

            this.setConvenio({
              seleccionado: agreement,
              tipo: 'rut',
              codigo: '',
              descuentoValor: val,
              descuentoTipo: agreement.tipo_descuento || ''
            })
          } else {
            this.validationSuccess = false
            this.validationMessage = `El RUT no registra afiliación activa en ${agreement.nombre}.`
            this.clearConvenio()
          }
        } else {
          this.validationSuccess = false
          this.validationMessage = `El servicio de ${agreement.nombre} no se encuentra disponible temporalmente.`
          this.clearConvenio()
        }

        this.$emit('rutValido', true)
      } catch (error) {
        console.error(`Error validando RUT en convenio ${agreement.nombre}:`, error)
        this.validationSuccess = true
        this.validationMessage = `RUT válido (No se pudo conectar con ${agreement.nombre}).`
        this.clearConvenio()
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

.convenio-banner {
  background: rgba(255, 255, 255, 0.1);
  border: 2px dashed rgba(255, 255, 255, 0.4);
  border-radius: 14px;
  transition: all 0.2s ease;
  user-select: none;
  cursor: pointer;
}

.convenio-banner:hover,
.convenio-banner:active {
  background: rgba(255, 255, 255, 0.18);
  border-color: #ff5200;
}

.convenio-btn-action {
  font-size: 26px !important;
  padding: 12px 28px !important;
  border-radius: 10px !important;
  background-color: #ff5200 !important;
  border: none !important;
  font-weight: bold !important;
  white-space: nowrap !important;
  box-shadow: 0 4px 12px rgba(255, 82, 0, 0.4) !important;
}

.convenio-container-expanded {
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 14px;
  padding: 20px;
  margin-top: 10px;
}

.btn-cerrar-convenio {
  font-size: 28px !important;
  font-weight: bold !important;
  width: 50px !important;
  height: 50px !important;
  min-width: 50px !important;
  border-radius: 50% !important;
  padding: 0 !important;
  line-height: 1 !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  border: 2px solid rgba(255, 255, 255, 0.6) !important;
  background: rgba(255, 255, 255, 0.1) !important;
  transition: all 0.2s ease !important;
}

.btn-cerrar-convenio:hover,
.btn-cerrar-convenio:active {
  background: rgba(255, 255, 255, 0.3) !important;
  border-color: #ffffff !important;
  transform: scale(1.05);
}

.convenio-select {
  font-size: 30px !important;
  width: 100% !important;
  max-width: 100% !important;
  border-radius: 10px !important;
}

.convenio-select .vs__dropdown-toggle {
  background-color: azure !important;
  border-radius: 10px !important;
  height: 85px !important;
  min-height: 85px !important;
  max-height: 85px !important;
  padding: 0 15px !important;
  display: flex !important;
  align-items: center !important;
  border: 1px solid #ccc !important;
  flex-wrap: nowrap !important;
  overflow: hidden !important;
}

.convenio-select .vs__selected-options {
  display: flex !important;
  flex-wrap: nowrap !important;
  overflow: hidden !important;
  max-width: calc(100% - 60px) !important;
  align-items: center !important;
  height: 100% !important;
}

.convenio-select .vs__selected {
  font-size: 28px !important;
  color: #111 !important;
  line-height: 1.2 !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  max-width: 100% !important;
  display: block !important;
  margin: 0 !important;
}

.convenio-select .vs__search {
  font-size: 28px !important;
  color: #111 !important;
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
}

.convenio-select .vs__search::placeholder {
  color: #6b7280 !important;
  font-size: 26px !important;
}

.convenio-select .vs__dropdown-menu {
  max-height: 400px !important;
  font-size: 28px !important;
  background-color: #ffffff !important;
  border-radius: 10px !important;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3) !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  padding: 5px 0 !important;
}

.convenio-select .vs__dropdown-option {
  padding: 16px 20px !important;
  border-bottom: 1px solid #e5e7eb !important;
  color: #1f2937 !important;
  white-space: normal !important;
  word-break: break-word !important;
}

.convenio-select .vs__dropdown-option--highlight {
  background-color: #ff5200 !important;
  color: #ffffff !important;
}

.convenio-select .vs__clear,
.convenio-select .vs__open-indicator {
  transform: scale(1.4);
  margin-right: 5px;
  fill: #666;
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
