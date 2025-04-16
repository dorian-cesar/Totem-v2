<template>
  <div>
    <p class="text-white h3 text-">{{ caption }}</p>
    <vue-date-picker
      :format="styleDatepicker.formatDate"
      :language="styleDatepicker.language"
      :monday-first="styleDatepicker.mondayFirst"
      :bootstrap-styling="styleDatepicker.bootstrapStyling"
      :calendar-button="styleDatepicker.calendarButton"
      :disabled-dates="{ to: disabledDatesTo, from: disabledDatesFrom }"
      :value="dateSet"
      @input="change"
      :open-date="dateSet"
      input-class="startDate"
      :calendar-class="(isAlignLeft) ? 'calendar-custom-left': 'calendar-custom-right'"
    />
  </div>
</template>

<script>
  import VueDatePicker from 'vuejs-datepicker'
  import {es} from 'vuejs-datepicker/dist/locale'

  export default {
    name: 'inputDatePicker',
    components: {VueDatePicker},
    data() {
      return {
        styleDatepicker: {
          formatDate: 'dd/MM/yyyy',
          language: es,
          mondayFirst: true,
          bootstrapStyling: true,
          calendarButton: true
        },
      }
    },
    props: ['caption', 'dateSet', 'disabledDatesTo', 'disabledDatesFrom', 'isAlignLeft'],
    methods: {
      change(value) {
        this.$emit('changeValue', value)
      },
    },
  }
</script>

<style>
  .startDate {
    width: 10px !important;
    height: 75px;
    font-size: 42px;
  }

  .calendar-custom-left {
    background: azure !important;
    width: 700px !important;
    height: 500px;
    font-size: 42px;
    border-radius: 12px;
  }

  .calendar-custom-right {
    background: azure !important;
    width: 700px !important;
    height: 500px;
    font-size: 42px;
    position: absolute;
    right: 0px;
    border-radius: 12px;
  }
</style>
