<template>
  <div>
    <b-row align-h="center">
      <!-- Datepicker departure date -->
      <b-col cols="5" class="pl-0 pr-5">
        <input-date-picker
          v-bind="propsInputDatePicker1"
          @changeValue="propsInputDatePicker1.dateSet= $event"
        />
      </b-col>
      <!-- Datepicker return date -->
      <b-col cols="5" v-show="statusDatepicker2 || false" class="pl-5 pr-0">
        <input-date-picker
          v-bind="propsInputDatePicker2"
          @changeValue="propsInputDatePicker2.dateSet= $event"
        />
      </b-col>
    </b-row>
  </div>
</template>

<script>
  import inputDatePicker from '@/components/DatePicker'
  import {
    dateNow,     // Today
    dateBefore,  // Yesterday
    date45       // day number 46
  } from '@/lib/calculateDays'
  import {mapActions} from 'vuex'

  export default {
    name: 'DateOneWayRoundTrip',
    components: {inputDatePicker},
    data: () => ({
      propsInputDatePicker1: {
        caption: 'FECHA IDA',
        dateSet: dateNow,
        disabledDatesTo: dateBefore,
        disabledDatesFrom: date45,
        isAlignLeft: true
      },
      propsInputDatePicker2: {
        caption: 'FECHA VUELTA',
        dateSet: dateNow,
        disabledDatesTo: dateBefore,
        disabledDatesFrom: date45,
        isAlignLeft: false
      }
    }),
    props: {statusDatepicker2: {type: Boolean, default: () => false}},
    methods: {
      // map store TravelSelection with actions setDepartureDate and setReturnDate
      ...mapActions('TravelSelection', ['setDepartureDate', 'setReturnDate']),

      // Persist in store travel_selection departure date
      assignDepartureDate() {
        this.setDepartureDate(this.propsInputDatePicker1.dateSet)
        this.setReturnDate(this.propsInputDatePicker1.dateSet)
      },

      // Persist in store travel_selection return date
      assignReturnDate() {
        this.setReturnDate(this.propsInputDatePicker2.dateSet)
      },
    },
    watch: {
      // when change propsInputDatePicker1.dateSet'
      'propsInputDatePicker1.dateSet': function () {
        // Set the value for date-picker2 the same as date-picker1
        this.propsInputDatePicker2.dateSet = this.propsInputDatePicker1.dateSet
        // Disable dates before the date-picker1 value
        this.propsInputDatePicker2.disabledDatesTo = this.propsInputDatePicker1.dateSet
        // Persist departure date
        this.assignDepartureDate()
      },

      'propsInputDatePicker2.dateSet': function () {
        this.assignReturnDate()
      },
    },
    mounted() {
      this.assignDepartureDate()
    }

  }
</script>
