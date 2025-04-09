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
    // Formato sin eliminar guiones
    formatYYYYMMDD(value) {
      let year = value.getFullYear()
      let month = (value.getMonth() + 1) < 10 ? '0' + (value.getMonth() + 1) : (value.getMonth() + 1)
      let date = value.getDate() < 10 ? '0' + value.getDate() : value.getDate()
      return `${year}-${month}-${date}` // Formato YYYY-MM-DD
    }
  }
};
