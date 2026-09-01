<template>
  <transition name="fade">
    <div
      v-if="show"
      class="ad-screensaver-overlay"
      @mousedown="onScreenTouch"
      @touchstart="onScreenTouch"
      @click="onScreenTouch"
    >
      <video
        ref="videoPlayer"
        v-show="!hasError && currentVideoUrl"
        :src="currentVideoUrl"
        autoplay
        muted
        playsinline
        class="ad-video"
        @ended="nextVideo"
        @playing="onPlaying"
        @error="onVideoError"
      ></video>

      <!-- Pantalla promocional fallback SOLO si el video realmente falla en cargar -->
      <div v-if="hasError || !currentVideoUrl" class="ad-fallback-banner">
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
      hasError: false,
      hasLoggedPlaying: false
    }
  },
  computed: {
    validVideos() {
      if (!this.videos || !Array.isArray(this.videos)) return []
      return this.videos.filter((v) => {
        const u = typeof v === 'string' ? v : v.url || v.path || ''
        return u && u.trim() !== ''
      })
    },
    currentVideoUrl() {
      if (!this.validVideos || this.validVideos.length === 0) return ''
      const item = this.validVideos[this.currentIndex % this.validVideos.length]
      return typeof item === 'string' ? item : item.url || item.path || ''
    }
  },
  watch: {
    show(val) {
      if (val) {
        this.currentIndex = 0
        this.hasError = false
        this.hasLoggedPlaying = false
        this.$nextTick(() => {
          this.playVideo()
        })
      } else if (this.$refs.videoPlayer) {
        this.$refs.videoPlayer.pause()
      }
    },
    currentIndex() {
      this.hasError = false
      this.hasLoggedPlaying = false
      this.$nextTick(() => {
        this.playVideo()
      })
    }
  },
  methods: {
    playVideo() {
      const video = this.$refs.videoPlayer
      if (video) {
        video.muted = true
        video.volume = 0
        const p = video.play()
        if (p && typeof p.catch === 'function') {
          p.catch((err) => {
            console.warn('[AdScreenSaver] Carga diferida de video:', err)
          })
        }
      }
    },
    onPlaying() {
      if (!this.hasLoggedPlaying) {
        console.log('[AdScreenSaver] Reproduciendo video:', this.currentVideoUrl)
        this.hasLoggedPlaying = true
      }
      this.hasError = false
    },
    nextVideo() {
      console.log('[AdScreenSaver] Video finalizado. Avanzando al siguiente...')
      if (this.validVideos && this.validVideos.length > 1) {
        this.currentIndex = (this.currentIndex + 1) % this.validVideos.length
      } else {
        this.playVideo()
      }
    },
    onVideoError(e) {
      console.warn('[AdScreenSaver] Error en fuente de video:', this.currentVideoUrl, e)
      if (this.validVideos && this.validVideos.length > 1) {
        this.nextVideo()
      } else {
        this.hasError = true
      }
    },
    onScreenTouch(e) {
      if (e) {
        e.stopPropagation()
      }
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
  background-color: #012873;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  cursor: pointer;
  user-select: none;
}

.ad-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ad-fallback-banner {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #012873 0%, #013ba7 50%, #0056b3 100%);
  text-align: center;
  padding: 40px;
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
