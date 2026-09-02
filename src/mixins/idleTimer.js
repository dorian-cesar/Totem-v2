import axios from 'axios'

export default {
  data() {
    return {
      idleTimeoutDuration: 30000, // 30 segundos de inactividad
      idleTimer: null,
      showAdScreenSaver: false,
      adVideos: [],
      lastFetchTime: 0,
      cacheDurationMs: 300000 // Cache inteligente de 5 minutos (300.000 ms)
    }
  },

  mounted() {
    this.startIdleMonitoring()
  },

  beforeDestroy() {
    this.stopIdleMonitoring()
  },

  methods: {
    startIdleMonitoring() {
      // Monitoreamos eventos táctiles y de teclado
      const events = ['click', 'touchstart', 'mousedown', 'pointerdown', 'keydown']
      events.forEach((event) => {
        window.addEventListener(event, this.resetIdleTimer, { passive: true })
      })
      this.resetIdleTimer()
    },

    stopIdleMonitoring() {
      const events = ['click', 'touchstart', 'mousedown', 'pointerdown', 'keydown']
      events.forEach((event) => {
        window.removeEventListener(event, this.resetIdleTimer)
      })
      if (this.idleTimer) {
        clearTimeout(this.idleTimer)
        this.idleTimer = null
      }
    },

    resetIdleTimer() {
      // Si la publicidad está visible, el timer permanece pausado hasta que el usuario toque la pantalla
      if (this.showAdScreenSaver) return

      if (this.idleTimer) {
        clearTimeout(this.idleTimer)
      }

      this.idleTimer = setTimeout(() => {
        this.onIdleTimeout()
      }, this.idleTimeoutDuration)
    },

    async onIdleTimeout() {
      console.log('[IdleTimer] 30 segundos de inactividad detectados. Verificando videos asignados...')
      await this.fetchLocalAdVideos()

      // Si no hay videos devueltos, usamos los videos de muestra por defecto
      if (!this.adVideos || this.adVideos.length === 0) {
        console.log('[IdleTimer] Cargando videos de muestra por defecto.')
        this.adVideos = [
          'https://vjs.zencdn.net/v/oceans.mp4',
          'https://www.w3schools.com/html/mov_bbb.mp4',
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
        ]
      }
      this.showAdScreenSaver = true
    },

    async fetchLocalAdVideos() {
      const now = Date.now()

      // 0. Si ya tenemos la lista de vídeos y han pasado menos de 5 minutos, usamos la lista en caché (0 peticiones)
      if (this.adVideos && this.adVideos.length > 0 && (now - this.lastFetchTime < this.cacheDurationMs)) {
        console.log('[IdleTimer] Usando lista de vídeos en caché local (0 consumo de red).')
        return
      }

      // 1. Consultar primero el Mantenedor BBDD Central en Netlify (PostgreSQL / AWS S3)
      try {
        const mantenedorUrl = 'https://mantenedor-totems-alameda.netlify.app/api/totems'
        const response = await axios.get(mantenedorUrl, { timeout: 3000 })
        if (response.data && response.data.success && Array.isArray(response.data.totems)) {
          const currentIdentifier = localStorage.getItem('totemIdentifier') || localStorage.getItem('identificador') || 'totem-alameda-01'
          const currentIp = localStorage.getItem('ipServer') || '172.26.10.66'
          
          // 1. Coincidencia por Identificador (Fijo y persistente, resiste cambios de IP por DHCP)
          let matchedTotem = response.data.totems.find(
            t => t.identificador && t.identificador.toLowerCase() === currentIdentifier.toLowerCase()
          )

          // 2. Respaldo por IP si el identificador no coincide
          if (!matchedTotem) {
            matchedTotem = response.data.totems.find(t => t.ip === currentIp)
          }

          // 3. Respaldo al primer tótem si ninguno coincide
          if (!matchedTotem) {
            matchedTotem = response.data.totems[0]
          }
          
          if (matchedTotem && Array.isArray(matchedTotem.videos)) {
            const assigned = matchedTotem.videos
              .map(v => typeof v === 'string' ? v : v.url)
              .filter(url => url && url.trim() !== '')
              .map(url => {
                if (url.startsWith('/uploads/')) {
                  return `https://mantenedor-totems-alameda.netlify.app${url}`
                }
                return url
              })
            
            if (assigned.length > 0) {
              console.log(`[IdleTimer] Videos asignados para '${matchedTotem.identificador}' (IP: ${matchedTotem.ip}):`, assigned)
              this.adVideos = assigned
              this.lastFetchTime = now
              
              // Pre-descarga silenciosa en segundo plano para evitar pegados por mala conexion
              this.preloadAndCacheVideos(assigned)
              return
            }
          }
        }
      } catch (e) {
        console.warn('[IdleTimer] No se pudo obtener videos del Mantenedor central:', e.message)
      }

      // 2. Fallback: Consultar al servidor local de la máquina
      try {
        const ipServer = localStorage.getItem('ipServer') || 'localhost'
        const url = `https://${ipServer}:3000/api/videos/list`

        const response = await axios.get(url, { timeout: 3000 })
        if (response.data && Array.isArray(response.data.videos) && response.data.videos.length > 0) {
          this.adVideos = response.data.videos.map((item) => {
            if (typeof item === 'string') {
              return item.startsWith('http') ? item : `https://${ipServer}:3000${item}`
            }
            return {
              ...item,
              url: item.url.startsWith('http') ? item.url : `https://${ipServer}:3000${item.url}`
            }
          })
          this.lastFetchTime = now
        } else {
          this.adVideos = []
        }
      } catch (error) {
        console.warn('[IdleTimer] No se pudieron cargar los videos del servidor local:', error.message)
        this.adVideos = []
      }
    },

    // Pre-descarga inteligente y almacenamiento en caché del navegador (CacheStorage API)
    async preloadAndCacheVideos(urls) {
      if (!('caches' in window)) return
      try {
        const cache = await caches.open('totem-ad-videos-v1')
        for (const url of urls) {
          try {
            const match = await cache.match(url)
            if (!match) {
              console.log(`[CacheManager] Pre-descargando vídeo para reproducción offline/lenta: ${url}`)
              fetch(url, { mode: 'cors' }).then(res => {
                if (res.ok) cache.put(url, res)
              }).catch(() => {})
            }
          } catch (err) {}
        }
      } catch (e) {
        console.warn('[CacheManager] Error inicializando caché de vídeos:', e)
      }
    },

    closeAdScreenSaver() {
      console.log('[IdleTimer] Interrupción de publicidad. Retornando inmediatamente a Home...')
      this.showAdScreenSaver = false

      if (this.$router && this.$route && this.$route.name !== 'Home') {
        this.$router.push({ name: 'Home' }).catch(() => {})
      }

      this.resetIdleTimer()
    }
  }
}
