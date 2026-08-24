<template>
  <div id="app">
    <logo class="p-3" />
    <DateAndTime />
    <b-row align-h="center">
      <b-col cols="11">
        <router-view />
      </b-col>
    </b-row>
  </div>
</template>

<script>
import Logo from '@/components/Logo.vue'
import DateAndTime from '@/components/DateAndTime.vue'
import axios from 'axios'
import infoData from '@/info'

export default {
  name: 'App',
  components: {
    Logo,
    DateAndTime
  },

  data() {
    return {
      info: { ...infoData }
    }
  },

  mounted() {
    document.addEventListener('contextmenu', (e) => e.preventDefault())

    if (!sessionStorage.getItem('welcome_printed')) {
      this.printWelcome()
      sessionStorage.setItem('welcome_printed', 'true')
    }

    // Lógica de IP movida a TotemIdentification.vue y BuyPrintInfo.vue
    // let ip = null
    // if (this.$route && this.$route.query && this.$route.query.ip) {
    //   ip = this.$route.query.ip
    // } else {
    //   const params = new URLSearchParams(window.location.search)
    //   ip = params.get('ip')
    // }
    // if (ip) {
    //   localStorage.setItem('ipServer', ip)
    // } else {
    //   ip = localStorage.getItem('ipServer')
    // }

    window.addEventListener('touchstart', this.showTouchCircle)
  },
  beforeUnmount() {
    window.removeEventListener('touchstart', this.showTouchCircle)
  },
  methods: {
    showTouchCircle(e) {
      const touch = e.touches[0]
      const circle = document.createElement('div')
      circle.classList.add('touch-circle')
      circle.style.top = `${touch.clientY - 30}px`
      circle.style.left = `${touch.clientX - 30}px`
      document.body.appendChild(circle)
      setTimeout(() => {
        document.body.removeChild(circle)
      }, 600)
    },
    printWelcome() {
      try {
        const encoder = new TextEncoder()
        
        function append(arr1, arr2) {
          const m = new Uint8Array(arr1.length + arr2.length)
          m.set(arr1)
          m.set(arr2, arr1.length)
          return m
        }

        let escPos = new Uint8Array([0x1B, 0x40]) // Init
        escPos = append(escPos, new Uint8Array([0x1B, 0x61, 0x01])) // Center
        escPos = append(escPos, encoder.encode('\n\n\n--------------------------------\n      BIENVENIDO AL TOTEM       \n        DE AUTOSERVICIO         \n--------------------------------\n\n\n\n\n'))
        escPos = append(escPos, new Uint8Array([0x1D, 0x56, 0x00])) // Cut

        let binary = ''
        for (let i = 0; i < escPos.length; i++) {
          binary += String.fromCharCode(escPos[i])
        }
        
        window.location.href = `rawbt:base64,${btoa(binary)}`
      } catch (error) {
        console.error('Error printing welcome message:', error)
      }
    }
  }
}
</script>

<style lang="scss">
/*#app*/

body {
  // background-image: url("../assets/img/background.jpg");
  background: #013ba7 !important;
  width: 1060px;
  height: 1910px;
  margin: 0px;
}

* {
  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans',
    'Liberation Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji' !important;
  user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  touch-action: manipulation;
}

.touch-circle {
  position: absolute;
  width: 55px;
  height: 55px;
  background: rgba(241, 241, 241, 0.45);
  border: 2px solid #e2e2e2;
  border-radius: 50%;
  pointer-events: none;
  animation: fadeOut 0.5s ease-out forwards;
  z-index: 9999;
}

@keyframes fadeOut {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(1.5);
  }
}

@import '../assets/style/app';
</style>
