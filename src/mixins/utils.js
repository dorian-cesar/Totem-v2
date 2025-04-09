export default {
  methods: {
    changeFormatDate2(valueDate, format) {
      let newDate = new Date()
      switch (format) {
        case 'yyyymmdd': {
          newDate = this.formatYYYYMMDD(valueDate)
          break
        }
        default: {
          break
        }
      }
      return newDate
    },
    formatYYYYMMDD: (value) => (value.replace(new RegExp('-', 'g'), '').slice(0, 8)),
    // verify if a string var contains numbers
    isNumeric: (value) => { return !isNaN(parseInt(value))},

    numeroEquivalente: (val) => {
      let val2 = 0

      for(let i = 0; i < val.length-1; i++){
        val2 += parseInt(val.charCodeAt(i))
      }

      return val2
    }

  },
};
