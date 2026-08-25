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
    height: 75px !important;
    font-size: 42px !important;
    background-color: azure !important;
    color: #111 !important;
    text-align: center !important;
    font-weight: 500 !important;
    border-radius: 10px !important;
  }

  .calendar-custom-left {
    background: azure !important;
    width: 595px !important;
    font-size: 34px !important;
    border-radius: 14px !important;
    position: absolute !important;
    bottom: 100% !important;
    top: auto !important;
    left: 0 !important;
    margin-bottom: 15px !important;
    z-index: 9999 !important;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4) !important;
    border: 2px solid #ccc !important;
    padding: 10px !important;
  }

  .calendar-custom-right {
    background: azure !important;
    width: 595px !important;
    font-size: 34px !important;
    position: absolute !important;
    bottom: 100% !important;
    top: auto !important;
    right: 0px !important;
    left: auto !important;
    margin-bottom: 15px !important;
    border-radius: 14px !important;
    z-index: 9999 !important;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4) !important;
    border: 2px solid #ccc !important;
    padding: 10px !important;
  }

  .calendar-custom-left .cell,
  .calendar-custom-right .cell {
    width: 14.285714% !important;
    height: 80px !important;
    line-height: 80px !important;
    font-size: 32px !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    box-sizing: border-box !important;
  }

  .calendar-custom-left header span,
  .calendar-custom-right header span {
    font-size: 32px !important;
    height: 60px !important;
    line-height: 60px !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
  }

  .calendar-custom-left .day-header,
  .calendar-custom-right .day-header {
    height: 50px !important;
    line-height: 50px !important;
    font-size: 26px !important;
    font-weight: bold !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
  }

  .calendar-custom-left .cell.selected,
  .calendar-custom-right .cell.selected {
    background: #ff5200 !important;
    color: #fff !important;
    border-radius: 12px !important;
  }

  .calendar-custom-left .cell:not(.blank):not(.disabled).day:hover,
  .calendar-custom-right .cell:not(.blank):not(.disabled).day:hover {
    border: 2px solid #ff5200 !important;
    border-radius: 12px !important;
  }
</style>
