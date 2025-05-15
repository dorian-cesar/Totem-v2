<template>
  <div class="pt-3">
    <b-row align-h="center">
      <!-- One way button -->
      <b-col cols="5" class="text-right pl-0">
        <b-button
          pill
          class="custom-button"
          @click="changeState('oneWay')"
          :variant="oneWayState"
        >
          <h2>IDA</h2>
        </b-button>
      </b-col>
      <!-- Round trip button -->
      <b-col cols="5" class="text-left pr-2">
        <b-button
          pill
          class="custom-button"
          @click="changeState('roundTrip')"
          :variant="roundTripState"
        >
          <h2>IDA Y VUELTA</h2>
        </b-button>
      </b-col>
    </b-row>
  </div>
</template>

<script>
  import {mapActions} from 'vuex'

  export default {
    name: 'ToolBarOneWayRoundTrip',
    data: () => ({
      oneWayState: 'primary',
      roundTripState: 'secondary'
    }),
    methods: {
      ...mapActions('TravelSelection', ['setRoundTrip']),

      // change the state of the button
      changeState(buttonName) {
        if ('oneWay' === buttonName) {
          this.oneWayState = 'primary'
          this.roundTripState = 'secondary'
          this.$emit('activeDatepicker2', false)
          this.setRoundTrip(false)
        } else {
          this.oneWayState = 'secondary'
          this.roundTripState = 'primary'
          this.$emit('activeDatepicker2', true)
          this.setRoundTrip(true)
        }
      }
    },
    mounted() {
      this.setRoundTrip(false)
    }
  }
</script>

<style scoped>
.btn-primary {
  background-color: #ff5200;
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: #c0c0c0;
  color: white;
}
</style>