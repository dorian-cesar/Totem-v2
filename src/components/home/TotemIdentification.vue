<template>
  <div class="totem-id-container" v-if="visible">
    <div v-if="initialCheck" class="text-center d-flex flex-column align-items-center justify-content-center">
      <b-spinner style="width: 5rem; height: 5rem; color: white;" class="mb-4"></b-spinner>
      <h2 class="text-white font-weight-bold">Conectando...</h2>
    </div>

    <div v-else class="identification-form shadow-lg p-5">
      <!-- Logo wit -->
      <div class="logo-container mb-4 text-center">
        <div class="logo-circle"></div>
        <span class="logo-text">wit</span>
      </div>

      <h1 class="text-center text-white font-weight-bold mb-2">Configuración</h1>
      <p class="text-center subtitle-text mb-4 h4">Ingrese el identificador único del tótem</p>

      <div class="input-container mb-4">
        <b-form-input
          v-model="totemId"
          placeholder="Ej: 1001"
          class="totem-input text-center h1"
          readonly
        ></b-form-input>
      </div>

      <div v-if="error" class="alert alert-danger text-center h5">
        {{ error }}
      </div>

      <div class="actions mt-4 mb-4">
        <b-button
          block
          size="lg"
          class="btn-iniciar py-3 font-weight-bold h3 d-flex justify-content-center align-items-center"
          :disabled="loading || !totemId"
          @click="identifyTotem"
        >
          <b-spinner v-if="loading" small class="mr-2"></b-spinner>
          Iniciar Tótem <span class="arrow-icon ml-2">➔</span>
        </b-button>
      </div>

      <div class="custom-keyboard mt-4">
        <div class="keyboard-row">
          <button class="key-btn" @click="addNumber('1')">1</button>
          <button class="key-btn" @click="addNumber('2')">2</button>
          <button class="key-btn" @click="addNumber('3')">3</button>
        </div>
        <div class="keyboard-row">
          <button class="key-btn" @click="addNumber('4')">4</button>
          <button class="key-btn" @click="addNumber('5')">5</button>
          <button class="key-btn" @click="addNumber('6')">6</button>
        </div>
        <div class="keyboard-row">
          <button class="key-btn" @click="addNumber('7')">7</button>
          <button class="key-btn" @click="addNumber('8')">8</button>
          <button class="key-btn" @click="addNumber('9')">9</button>
        </div>
        <div class="keyboard-row">
          <button class="key-btn action-key" @click="clearInput">Borrar</button>
          <button class="key-btn" @click="addNumber('0')">0</button>
          <button class="key-btn action-key" @click="backspace">⌫</button>
        </div>
      </div>

      <div class="footer-text mt-5">WIT INNOVACION Y TECNOLOGIA SPA<br />v3.0.0</div>
    </div>
  </div>
</template>

<script>
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
      initialCheck: true,
      error: null
    }
  },
  async mounted() {
    const savedId = localStorage.getItem('totemIdentifier')
    const autoReload = sessionStorage.getItem('autoReload')

    if (savedId) {
      this.totemId = savedId
      
      if (autoReload === 'true') {
        // Estamos en el paso intermedio: se hizo router.push('/') pero aún no se ejecuta window.location.reload()
        // Cambiamos el estado para que la próxima carga (el reload real) haga la validación.
        sessionStorage.setItem('autoReload', 'pending')
      } else if (autoReload === 'pending') {
        // Este es el reload real de la página. Ahora sí auto-validamos.
        sessionStorage.removeItem('autoReload')
        await this.identifyTotem()
      } else {
        // Es un inicio manual o F5, mostrar formulario
        this.initialCheck = false
      }
    } else {
      this.initialCheck = false
    }
  },
  methods: {
    addNumber(num) {
      this.totemId += num
    },
    clearInput() {
      this.totemId = ''
    },
    backspace() {
      this.totemId = this.totemId.slice(0, -1)
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
  background: radial-gradient(circle at center, #1142a6 0%, #082567 100%);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.identification-form {
  background: #1d52b1;
  width: 750px;
  border-radius: 40px;
  max-height: 95vh;
  overflow-y: auto;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
}

/* Logo Styles */
.logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
}
.logo-circle {
  width: 60px;
  height: 60px;
  background-color: white;
  border-radius: 50%;
  position: relative;
  overflow: hidden;
  display: inline-block;
}
.logo-circle::before {
  content: '';
  position: absolute;
  top: -5px;
  left: 50%;
  transform: translateX(-50%);
  width: 10px;
  height: 30px;
  background-color: #1d52b1;
  border-radius: 4px;
}
.logo-text {
  font-size: 4rem;
  font-weight: 700;
  color: white;
  margin-left: 15px;
  line-height: 1;
  letter-spacing: -2px;
}

.subtitle-text {
  color: #a4c2f4;
}

.totem-input {
  background-color: transparent !important;
  border: 2px solid #4a7ddb;
  border-radius: 20px;
  height: 90px;
  font-size: 3.5rem !important;
  color: white !important;
  transition: all 0.3s ease;
  font-weight: 700;
}

.totem-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.totem-input:focus {
  border-color: #8ea7d6;
  box-shadow: 0 0 0 4px rgba(142, 167, 214, 0.2);
  outline: none;
}

.btn-iniciar {
  background-color: #8ea7d6;
  color: #0b2e7a;
  border: none;
  border-radius: 20px;
  height: 80px;
  transition: all 0.2s ease;
}

.btn-iniciar:hover:not(:disabled) {
  background-color: #a4c2f4;
  transform: scale(1.02);
}

.btn-iniciar:active:not(:disabled) {
  transform: scale(0.98);
}

.arrow-icon {
  font-size: 1.5rem;
  font-weight: 900;
}

/* Custom Keyboard Styles */
.custom-keyboard {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 90%;
  margin: 0 auto;
}

.keyboard-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.key-btn {
  flex: 1;
  height: 85px;
  background: #2b61c4;
  border: none;
  border-bottom: 5px solid #1a4294;
  font-size: 2.2rem;
  font-weight: 800;
  border-radius: 15px;
  color: white;
  transition: all 0.1s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  outline: none !important;
}

.key-btn:active {
  background-color: #3670db;
  transform: translateY(2px);
  border-bottom-width: 2px;
}

.action-key {
  font-size: 2rem;
}

.footer-text {
  font-size: 0.8rem;
  text-align: center;
  color: #6a95e3;
  font-weight: 700;
  letter-spacing: 1px;
}

/* Fix Bootstrap overriding transparent input */
.form-control[readonly] {
  background-color: transparent;
}
</style>
