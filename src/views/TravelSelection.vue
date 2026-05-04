<template>
  <div>
    <form-travel-selection/>
  </div>
</template>

<script>
  import FormTravelSelection from '@/components/travel_selection/FormTravelSelection'

  export default {
    name: 'TravelSelection',
    components: {FormTravelSelection},
    onIdle() {
      sessionStorage.setItem('autoReload', 'true')
      this.$router.push({name: 'Home'}).then(() => {
        window.location.reload()
      })
    },
  }
</script>



