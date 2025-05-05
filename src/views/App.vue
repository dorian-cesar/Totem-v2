<template>
  <div id="app">
    <logo class="p-3" />
    <p class="version-text text-right pr-5 mb-0 font-weight-bold">1.9.8 Version</p>
    <b-row align-h="center">
      <b-col cols="11">
        <router-view />
      </b-col>
    </b-row>
  </div>
</template>

<script>
import Logo from '@/components/Logo.vue'
import axios from 'axios'
import infoData from '../../info.json' // Asegúrate que el archivo esté en src/info.json

export default {
  name: 'App',
  components: { Logo },

  data() {
    return {
      info: { ...infoData } // Clonamos para poder modificarlo sin afectar el módulo original
    }
  },

  mounted() {
    // Obtener IP del backend y actualizar solo urlServer
    axios
      .get(this.info.urlGetIp)
      .then((resIp) => {
        const ip = resIp.data.ip // Ejemplo de respuesta: { ip: "192.168.88.246" }

        this.info.urlServer = `https://${ip}:3000`
        console.log('info actualizada:', this.info)
      })
      .catch((error) => {
        console.error('Error al obtener IP desde el backend:', error)
      })
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
}

.version-text {
  color: #001689;
}

@import '../assets/style/app';
</style>

