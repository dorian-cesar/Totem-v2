<template>
  <div class="d-flex justify-content-between align-items-center pr-5 pl-5 font-weight-bold">
    <p class="mb-0 text-left" style="width: 33%; color: azure; font-size: 24px">Terminal Alameda</p>
    <div style="width: 33%" class="text-center">
      <div id="date-time">
        {{ dateTime }}
      </div>
    </div>
    <p class="version-text mb-0 text-right" style="width: 33%">2.4.0 Version © WIT 2025</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      dateTime: this.getCurrentDateTime(),
      intervalId: null
    }
  },
  methods: {
    pad(value) {
      return value.toString().padStart(2, '0')
    },
    getCurrentDateTime() {
      const now = new Date()
      const day = this.pad(now.getDate())
      const month = this.pad(now.getMonth() + 1)
      const year = now.getFullYear()

      const hours = this.pad(now.getHours())
      const minutes = this.pad(now.getMinutes())
      const seconds = this.pad(now.getSeconds())

      // formato
      // return `${day}/${month}/${year} - ${hours}:${minutes}`
      return `${day}/${month}/${year} - ${hours}:${minutes}`
    }
  },
  mounted() {
    this.intervalId = setInterval(() => {
      this.dateTime = this.getCurrentDateTime()
    }, 1000)
  },
  beforeDestroy() {
    clearInterval(this.intervalId)
  }
}
</script>

<style scoped>
#date-time {
  font-size: 24px;
  color: azure;
  font-family: 'DM Sans', sans-serif;
}

.version-text {
  color: #ffffff;
  opacity: 0.2;
}
</style>