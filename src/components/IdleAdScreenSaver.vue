<template>
  <transition name="fade">
    <div
      v-if="show"
      class="ad-screensaver-overlay"
      @mousedown="onScreenTouch"
      @touchstart="onScreenTouch"
      @click="onScreenTouch"
    >
      <!-- Reproductor A -->
      <video
        ref="videoPlayerA"
        :src="urlA"
        autoplay
        muted
        playsinline
        preload="auto"
        :class="['ad-video', { 'is-active': activePlayer === 'A' }]"
        @ended="onVideoEnded('A')"
        @error="onVideoError('A')"
        @waiting="onVideoStalled('A')"
        @stalled="onVideoStalled('A')"
      ></video>

      <!-- Reproductor B -->
      <video
        ref="videoPlayerB"
        :src="urlB"
        autoplay
        muted
        playsinline
        preload="auto"
        :class="['ad-video', { 'is-active': activePlayer === 'B' }]"
        @ended="onVideoEnded('B')"
        @error="onVideoError('B')"
        @waiting="onVideoStalled('B')"
        @stalled="onVideoStalled('B')"
      ></video>

      <!-- Pantalla promocional fallback SOLO si realmente no hay videos funcionales -->
      <div v-if="hasError || validVideos.length === 0" class="ad-fallback-banner">
        <div class="ad-banner-content">
          <div class="ad-logo-icon">🚌</div>
          <h1 class="ad-title">BIENVENIDO AL TÓTEM DE AUTOSERVICIO</h1>
          <p class="ad-subtitle">Compre sus pasajes fácilmente en pocos pasos</p>
        </div>
      </div>

      <div class="ad-touch-prompt">
        <div class="prompt-badge">
          <span>👇 TOCAR LA PANTALLA PARA COMENZAR</span>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'IdleAdScreenSaver',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    videos: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      currentIndex: 0,
      activePlayer: 'A', // 'A' o 'B'
      urlA: '',
      urlB: '',
      hasError: false,
      stallTimer: null
    }
  },
  computed: {
    validVideos() {
      if (!this.videos || !Array.isArray(this.videos)) return []
      return this.videos.filter((v) => {
        const u = typeof v === 'string' ? v : v.url || v.path || ''
        return u && u.trim() !== ''
      })
    }
  },
  watch: {
    show(val) {
      if (val) {
        this.currentIndex = 0
        this.hasError = false
        this.activePlayer = 'A'
        this.preparePlayback()
      } else {
        this.stopAllVideos()
      }
    }
  },
  methods: {
    getUrlAtIndex(index) {
      if (!this.validVideos || this.validVideos.length === 0) return ''
      const item = this.validVideos[index % this.validVideos.length]
      return typeof item === 'string' ? item : item.url || item.path || ''
    },
    preparePlayback() {
      if (this.validVideos.length === 0) {
        this.hasError = true
        return
      }

      this.urlA = this.getUrlAtIndex(this.currentIndex)
      this.urlB = this.getUrlAtIndex(this.currentIndex + 1)
      this.activePlayer = 'A'

      this.$nextTick(() => {
        this.playPlayer('A')
      })
    },
    playPlayer(playerKey) {
      const video = playerKey === 'A' ? this.$refs.videoPlayerA : this.$refs.videoPlayerB
      if (video) {
        video.muted = true
        video.volume = 0
        const p = video.play()
        if (p && typeof p.catch === 'function') {
          p.catch((err) => {
            console.warn(`[AdScreenSaver] Reproductor ${playerKey} diferido:`, err)
          })
        }
      }
    },
    onVideoEnded(playerKey) {
      this.clearStallTimer()

      // Solo respondemos cuando termina el reproductor activo
      if (playerKey !== this.activePlayer) return

      if (this.validVideos.length <= 1) {
        // Si hay un solo vídeo, reiniciar reproducción continua
        this.playPlayer(this.activePlayer)
        return
      }

      this.currentIndex = (this.currentIndex + 1) % this.validVideos.length
      const nextUrl = this.getUrlAtIndex(this.currentIndex + 1)

      if (this.activePlayer === 'A') {
        // Transición fluida a B
        this.activePlayer = 'B'
        this.playPlayer('B')
        // Pre-cargar el siguiente video en A en segundo plano
        setTimeout(() => {
          this.urlA = nextUrl
        }, 300)
      } else {
        // Transición fluida a A
        this.activePlayer = 'A'
        this.playPlayer('A')
        // Pre-cargar el siguiente video en B en segundo plano
        setTimeout(() => {
          this.urlB = nextUrl
        }, 300)
      }
    },
    onVideoError(playerKey) {
      if (playerKey === this.activePlayer) {
        console.warn(`[AdScreenSaver] Error en reproductor ${playerKey}, avanzando al siguiente...`)
        this.onVideoEnded(playerKey)
      }
    },
    onVideoStalled(playerKey) {
      // Si la señal de internet es muy lenta y el video activo se congela por > 2.5 seg, avanzar al siguiente
      if (playerKey !== this.activePlayer) return
      this.clearStallTimer()
      this.stallTimer = setTimeout(() => {
        console.warn(`[AdScreenSaver] Conexión lenta detectada (vídeo ${playerKey} congelado). Saltando al siguiente vídeo...`)
        this.onVideoEnded(playerKey)
      }, 2500)
    },
    clearStallTimer() {
      if (this.stallTimer) {
        clearTimeout(this.stallTimer)
        this.stallTimer = null
      }
    },
    stopAllVideos() {
      this.clearStallTimer()
      if (this.$refs.videoPlayerA) this.$refs.videoPlayerA.pause()
      if (this.$refs.videoPlayerB) this.$refs.videoPlayerB.pause()
    },
    onScreenTouch(e) {
      if (e) {
        e.stopPropagation()
      }
      this.stopAllVideos()
      this.$emit('close')
    }
  }
}
</script>

<style scoped lang="scss">
.ad-screensaver-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 999999;
  background-color: #000000; /* Fondo negro puro sin destellos de color */
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  cursor: pointer;
  user-select: none;
}

.ad-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.3s ease-in-out; /* Transición crossfade suelta de 300ms */
  pointer-events: none;
}

.ad-video.is-active {
  opacity: 1;
}

.ad-fallback-banner {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #012873 0%, #013ba7 50%, #0056b3 100%);
  text-align: center;
  padding: 40px;
  z-index: 10;
}

.ad-banner-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.ad-logo-icon {
  font-size: 5rem;
  background: rgba(255, 255, 255, 0.15);
  width: 120px;
  height: 120px;
  border-radius: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.ad-title {
  color: #ffffff;
  font-size: 2.8rem;
  font-weight: 800;
  letter-spacing: 1px;
  margin: 0;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.ad-subtitle {
  color: #93c5fd;
  font-size: 1.6rem;
  margin: 0;
  font-weight: 500;
}

.ad-touch-prompt {
  position: absolute;
  bottom: 90px;
  width: 100%;
  display: flex;
  justify-content: center;
  pointer-events: none;
  z-index: 20;
}

.prompt-badge {
  background: rgba(234, 179, 8, 0.95);
  color: #0f172a;
  padding: 20px 48px;
  border-radius: 50px;
  font-size: 1.6rem;
  font-weight: 900;
  letter-spacing: 1px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
  animation: pulse 1.8s infinite;
  border: 3px solid #ffffff;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(234, 179, 8, 0.7);
  }
  70% {
    transform: scale(1.06);
    box-shadow: 0 0 0 22px rgba(234, 179, 8, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(234, 179, 8, 0);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
