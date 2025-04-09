export default {
  methods: {
    // fix data2
    fixData2(seats) {
      let numFree = 0
      let numBusy = 0
      this.data2[0][1].forEach(function (value) {
        value.forEach(function (value2) {
          if (!isNaN(parseInt(value2.asiento))) {
            seats.push({
              num: (value2.asiento.length === 2) ? value2.asiento : ['0', value2.asiento].join(''),
              status: (value2.estado === 'libre') ? 'free' : 'busy'
            });
            ('libre' === value2.estado) ? numFree += 1 : numBusy += 1
          }
        })
      })
      this.setCounter(numFree, numBusy)
    },
    // Find value of seat
    value(item) {
      return this.seats.find((value) => (value.num === item))
    },
    // Set passenger counter
    setCounter(numFree = 0, numBusy = 0) {
      this.propsPassengerCounter.numFree = numFree
      this.propsPassengerCounter.numBusy = numBusy
    },
  },
  watch: {
    check: function (val) {
      val = val.slice(0, 3) // delete name
      if ('add' === val) {
        this.propsPassengerCounter.numSelected += 1
        this.propsPassengerCounter.numFree -= 1
      } else {
        this.propsPassengerCounter.numSelected -= 1
        this.propsPassengerCounter.numFree += 1
      }
      // Show and change the text on the ListBus component badge (Seleccionados y Disponibles)
      let nameSelected = ['badge-selected', this.$parent.name].join('-')
      let comp = this.$parent.$parent.$parent
      // Show or hide badge selected
      comp
        .$refs[nameSelected][0]
        .style.display = (0 < this.propsPassengerCounter.numSelected) ? '' : 'none'
      // Change the number of seats selected
      comp
        .$refs[nameSelected][0]
        .textContent = ['Seleccionados:', this.propsPassengerCounter.numSelected].join(' ')
    }
  },
  mounted() {
    this.setCounter()
    this.fixData2(this.seats)
  }
}
