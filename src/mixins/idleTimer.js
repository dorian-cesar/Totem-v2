import axios from 'axios'

export default {
  data() {
    return {
      idleTimeoutDuration: 30000, // 30 segundos de inactividad
      idleTimer: null,
      showAdScreenSaver: false,
      adVideos: [
        'https://vjs.zencdn.net/v/oceans.mp4'
      ],
      lastFetchTime: 0,
      cacheDurationMs: 300000, // Cache inteligente de 5 minutos (300.000 ms)
      isFetchingVideos: false
    }
  },

  mounted() {
    this.startIdleMonitoring()
    // Carga preventiva de videos al montar el componente para tenerlos en memoria/caché antes de que expire el tiempo
    this.fetchLocalAdVideos().catch((err) => {
      console.warn('[IdleTimer] Error en carga preventiva de videos:', err)
    })
  },

  beforeDestroy() {
    this.stopIdleMonitoring()
  },

  methods: {
    startIdleMonitoring() {
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
      // Si la publicidad está visible, el timer permanece en espera hasta que el usuario toque la pantalla
      if (this.showAdScreenSaver) return

      if (this.idleTimer) {
        clearTimeout(this.idleTimer)
      }

      this.idleTimer = setTimeout(() => {
        this.onIdleTimeout()
      }, this.idleTimeoutDuration)
    },

    clearTemporaryPurchaseData() {
      try {
        localStorage.removeItem('rut')
        localStorage.removeItem('id_bus')
      } catch (e) {
        console.warn('[IdleTimer] Error al limpiar datos de compra:', e)
      }
    },

    onIdleTimeout() {
      console.log('[IdleTimer] 30 segundos de inactividad detectados. Mostrando screensaver de inmediato...')

      // 1. ACTIVACIÓN SÍNCRONA INMEDIATA
      // Se activa en este instante exacto para cubrir el 100% de la pantalla sin parpadeo
      this.showAdScreenSaver = true

      // 2. Limpieza de variables temporales de compra
      this.clearTemporaryPurchaseData()

      // 3. Redirección en segundo plano a Home mientras el overlay ya cubre la pantalla
      const targetHomeName = (typeof IS_STANDBY !== 'undefined' && IS_STANDBY) ? 'Proximamente' : 'Home'
      setTimeout(() => {
        if (this.showAdScreenSaver && this.$router && this.$route && this.$route.name !== targetHomeName) {
          this.$router.replace({ name: targetHomeName }).catch(() => {})
        }
      }, 350)

      // 4. Refresco preventivo de videos en segundo plano sin bloquear el renderizado
      this.fetchLocalAdVideos().catch((err) => {
        console.warn('[IdleTimer] Error refrescando videos:', err)
      })
    },

    async fetchLocalAdVideos() {
      const now = Date.now()

      if (this.isFetchingVideos) return
      this.isFetchingVideos = true

      // 0. Si ya tenemos vídeos y están dentro del tiempo de caché (5 min), no hacemos peticiones de red
      if (this.adVideos && this.adVideos.length > 0 && this.lastFetchTime > 0 && (now - this.lastFetchTime < this.cacheDurationMs)) {
        console.log('[IdleTimer] Usando lista de vídeos en caché local (0 consumo de red).')
        this.isFetchingVideos = false
        return
      }

      // 1. Consultar primero el Mantenedor BBDD Central en Netlify (PostgreSQL / AWS S3)
      try {
        const mantenedorUrl = 'https://mantenedor-totems-alameda.netlify.app/api/totems'
        const response = await axios.get(mantenedorUrl, { timeout: 3000 })
        if (response.data && response.data.success && Array.isArray(response.data.totems)) {
          const currentIdentifier = localStorage.getItem('totemIdentifier') || localStorage.getItem('identificador') || 'totem-alameda-01'
          const currentIp = localStorage.getItem('ipServer') || '172.26.10.66'
          
          // Coincidencia por Identificador
          let matchedTotem = response.data.totems.find(
            t => t.identificador && t.identificador.toLowerCase() === currentIdentifier.toLowerCase()
          )

          // Respaldo por IP si el identificador no coincide
          if (!matchedTotem) {
            matchedTotem = response.data.totems.find(t => t.ip === currentIp)
          }

          // Respaldo al primer tótem si ninguno coincide
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
              
              // Filtrar y descargar en segundo plano
              const readyVideos = await this.filterAndDownloadVideos(assigned)
              if (readyVideos && readyVideos.length > 0) {
                this.adVideos = readyVideos
              }
              this.lastFetchTime = now
              this.isFetchingVideos = false
              return
            }
          }
        }
      } catch (e) {
        console.warn('[IdleTimer] No se pudo obtener videos del Mantenedor central:', e.message)
      }

      // 2. Fallback: Servidor local de la máquina
      try {
        const ipServer = localStorage.getItem('ipServer') || 'localhost'
        const url = `https://${ipServer}:3000/api/videos/list`

        const response = await axios.get(url, { timeout: 3000 })
        if (response.data && Array.isArray(response.data.videos) && response.data.videos.length > 0) {
          const localUrls = response.data.videos.map((item) => {
            if (typeof item === 'string') {
              return item.startsWith('http') ? item : `https://${ipServer}:3000${item}`
            }
            return item.url.startsWith('http') ? item.url : `https://${ipServer}:3000${item.url}`
          })
          const readyVideos = await this.filterAndDownloadVideos(localUrls)
          if (readyVideos && readyVideos.length > 0) {
            this.adVideos = readyVideos
          }
          this.lastFetchTime = now
        }
      } catch (error) {
        console.warn('[IdleTimer] No se pudieron cargar los videos del servidor local:', error.message)
      } finally {
        this.isFetchingVideos = false
      }

      // 3. Fallback seguro final si no hay vídeos
      if (!this.adVideos || this.adVideos.length === 0) {
        this.adVideos = ['https://vjs.zencdn.net/v/oceans.mp4']
      }
    },

    // Filtra para reproducir los vídeos en caché local y descarga los pendientes en segundo plano
    async filterAndDownloadVideos(assignedUrls) {
      if (!('caches' in window) || !assignedUrls || assignedUrls.length === 0) {
        return assignedUrls
      }

      try {
        const cache = await caches.open('totem-ad-videos-v1')
        const readyUrls = []
        const pendingUrls = []

        for (const url of assignedUrls) {
          const match = await cache.match(url)
          if (match) {
            readyUrls.push(url)
          } else {
            pendingUrls.push(url)
          }
        }

        if (pendingUrls.length > 0) {
          console.log('[CacheManager] Detectados vídeos nuevos no guardados en caché local:', pendingUrls)
          pendingUrls.forEach((url) => {
            console.log(`[CacheManager] Descargando 100% en segundo plano: ${url}`)
            fetch(url, { mode: 'cors' })
              .then((res) => {
                if (res.ok) {
                  return cache.put(url, res).then(() => {
                    console.log(`[CacheManager] ¡Vídeo ${url} cargado 100% en caché local!`)
                    if (!this.adVideos.includes(url)) {
                      this.adVideos.push(url)
                    }
                  })
                }
              })
              .catch((err) => {
                console.warn(`[CacheManager] Error descarga en segundo plano ${url}:`, err.message)
              })
          })
        }

        return readyUrls.length > 0 ? readyUrls : assignedUrls
      } catch (e) {
        console.warn('[CacheManager] Error procesando caché:', e)
        return assignedUrls
      }
    },

    closeAdScreenSaver() {
      console.log('[IdleTimer] Despertando tótem. Ocultando screensaver...')
      
      // 1. Ocultar screensaver
      this.showAdScreenSaver = false

      // 2. Limpieza de datos temporales
      this.clearTemporaryPurchaseData()

      // 3. Garantizar que quede en Home sin saltos bruscos
      const targetHomeName = (typeof IS_STANDBY !== 'undefined' && IS_STANDBY) ? 'Proximamente' : 'Home'
      if (this.$router && this.$route && this.$route.name !== targetHomeName) {
        this.$router.replace({ name: targetHomeName }).catch(() => {})
      }

      // 4. Reiniciar temporizador
      this.resetIdleTimer()
    }
  }
}
