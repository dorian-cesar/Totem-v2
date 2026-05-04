<template>
  <div>
    <form-bus-selection/>
  </div>
</template>

<script>
  import FormBusSelection from '@/components/bus_selection/FormBusSelection'

  export default {
    name: 'BusSelection',
    components: {FormBusSelection},
    onIdle() {
      sessionStorage.setItem('autoReload', 'true')
      this.$router.push({name: 'Home'}).then(() => {
        window.location.reload()
      })
    },
    onActive() {
      this.messageStr = 'Hello'
    }
  }
</script>
