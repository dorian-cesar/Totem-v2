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
      if (this.$router && this.$route && this.$route.name !== 'Home') {
        this.$router.push({name: 'Home'})
      }
    },
    onActive() {
      this.messageStr = 'Hello'
    }
  }
</script>
