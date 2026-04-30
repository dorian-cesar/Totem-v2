<template>
  <div class="totem-id-container" v-if="visible">
    <div class="identification-form shadow-lg p-5">
      <h1 class="text-center mb-4 text-primary font-weight-bold">Configuración de Totem</h1>
      <p class="text-center text-muted mb-4 h4">Ingrese el identificador numérico de este equipo</p>

      <div class="input-container mb-4">
        <b-form-input
          v-model="totemId"
          placeholder="Ej: 1001"
          class="totem-input text-center h1"
          readonly
          @click="showKeyboard = true"
        ></b-form-input>
      </div>

      <div v-if="error" class="alert alert-danger text-center h5">
        {{ error }}
      </div>

      <div class="actions mt-5">
        <b-button
          variant="primary"
          block
          size="lg"
          class="py-3 font-weight-bold h3"
          :disabled="loading || !totemId"
          @click="identifyTotem"
        >
          <b-spinner v-if="loading" small class="mr-2"></b-spinner>
          IDENTIFICAR EQUIPO
        </b-button>
      </div>

      <div class="keyboard-wrapper mt-5">
        <div class="simple-keyboard-numeric"></div>
      </div>
    </div>
  </div>
</template>

<script>
import SimpleKeyboard from 'simple-keyboard'
import '@/assets/style/vendor/simple-keyboard.css'
import axios from 'axios'

export default {
  name: 'TotemIdentification',
  props: {
    visible: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      totemId: '',
      loading: false,
      error: null,
      keyboard: null
    }
  },
  mounted() {
    if (this.visible) {
      this.initKeyboard()
    }
    // Cargar ID previo si existe
    const savedId = localStorage.getItem('totemIdentifier')
    if (savedId) {
      this.totemId = savedId
    }
  },
  watch: {
    visible(val) {
      if (val && !this.keyboard) {
        this.$nextTick(() => {
          this.initKeyboard()
        })
      }
    }
  },
  methods: {
    initKeyboard() {
      this.keyboard = new SimpleKeyboard('.simple-keyboard-numeric', {
        onChange: (input) => this.onChange(input),
        onKeyPress: (button) => this.onKeyPress(button),
        layout: {
          default: ['1 2 3', '4 5 6', '7 8 9', '0 {bksp}']
        },
        display: {
          '{bksp}': 'Borrar'
        },
        theme: 'hg-theme-default hg-layout-numeric numeric-theme'
      })
      this.keyboard.setInput(this.totemId)
    },
    onChange(input) {
      this.totemId = input
    },
    onKeyPress(button) {
      console.log('Button pressed', button)
    },
    async identifyTotem() {
      this.loading = true
      this.error = null
      try {
        const response = await axios.get(
          `https://backend-bano-autoservicio.dev-wit.com/api/dispositivos/${this.totemId}`
        )
        if (response.data && response.data.ok) {
          const deviceData = response.data.data
          localStorage.setItem('ipServer', deviceData.ip)
          localStorage.setItem('totemIdentifier', deviceData.identificador)
          localStorage.setItem('totemLocation', deviceData.ubicacion)
          localStorage.setItem('totemId', deviceData.id)

          console.log('Totem identificado correctamente:', deviceData)
          this.$emit('identified', deviceData)
        } else {
          this.error = 'No se encontró información para este ID.'
        }
      } catch (err) {
        console.error('Error identificando totem:', err)
        this.error = 'Error de conexión o ID inválido. Intente nuevamente.'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.totem-id-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 22, 137, 0.95);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.identification-form {
  background: white;
  width: 900px;
  border-radius: 30px;
  max-height: 90vh;
  overflow-y: auto;
}

.totem-input {
  border: 3px solid #001689;
  border-radius: 15px;
  height: 100px;
  font-size: 3rem !important;
  color: #001689;
}

.keyboard-wrapper {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 20px;
}

/* Estilos personalizados para el teclado numérico */
:deep(.numeric-theme) {
  background-color: transparent;
}

:deep(.numeric-theme .hg-button) {
  height: 120px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: white;
  border-bottom: 5px solid #ddd;
  font-size: 2.5rem;
  font-weight: bold;
}

:deep(.numeric-theme .hg-button:active) {
  background-color: #efefef;
}

:deep(.numeric-theme .hg-button.hg-button-bksp) {
  background: #ff5200;
  color: white;
  border-bottom: 5px solid #c43f00;
}
</style>
