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

      <div class="keyboard-wrapper mt-3">
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
  background: linear-gradient(135deg, rgba(0, 22, 137, 0.98) 0%, rgba(0, 11, 74, 0.98) 100%);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(10px);
}

.identification-form {
  background: white;
  width: 750px;
  border-radius: 40px;
  max-height: 95vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.totem-input {
  border: 2px solid #e2e8f0;
  border-radius: 20px;
  height: 90px;
  font-size: 3.5rem !important;
  color: #001689;
  background-color: #f8fafc;
  transition: all 0.3s ease;
  font-weight: 700;
}

.totem-input:focus {
  border-color: #001689;
  box-shadow: 0 0 0 4px rgba(0, 22, 137, 0.1);
  background-color: white;
}

.keyboard-wrapper {
  background: #f1f5f9;
  padding: 15px;
  border-radius: 25px;
  width: 90%;
  margin: 0 auto;
}

/* Estilos personalizados para el teclado numérico */
:deep(.numeric-theme) {
  background-color: transparent;
}

:deep(.numeric-theme .hg-button) {
  height: 85px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: white;
  border-bottom: 4px solid #cbd5e1;
  font-size: 2.2rem;
  font-weight: 800;
  border-radius: 15px;
  margin: 4px;
  transition: all 0.1s ease;
  color: #1e293b;
}

:deep(.numeric-theme .hg-button:active) {
  background-color: #e2e8f0;
  transform: translateY(2px);
  border-bottom-width: 2px;
}

:deep(.numeric-theme .hg-button.hg-button-bksp) {
  background: #f43f5e;
  color: white;
  border-bottom: 4px solid #be123c;
}

:deep(.numeric-theme .hg-button.hg-button-bksp:active) {
  background: #e11d48;
}

.btn-primary {
  background-color: #001689;
  border: none;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.btn-primary:hover:not(:disabled) {
  background-color: #000b4a;
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 22, 137, 0.4);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}
</style>
