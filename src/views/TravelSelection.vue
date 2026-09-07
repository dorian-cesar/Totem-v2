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
      if (this.$router && this.$route && this.$route.name !== 'Home') {
        this.$router.push({name: 'Home'})
      }
    },
  }
</script>



