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
import infoData from '../../info.json'

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
    document.addEventListener('contextmenu', e => e.preventDefault());
    axios
      .get(this.info.urlGetIp)
      .then((resIp) => {
        const ip = resIp.data.ip
        localStorage.setItem('ipServer', ip)
        console.log('IP del servidor guardada:', ip)
      })
      .catch((error) => {
        console.error('Error al obtener IP desde el backend:', error)
      })

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

