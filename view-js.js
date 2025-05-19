// guardar reserva tentativa
this.axios.post('https://url-db.cl', {
  type: 'tentative_booking',
  call_url: api,
  call_data: formatParams,
  data: data,
  name: this.info.totemName
})

// guardar error reserva tentativa
this.axios.post('https://url-db.cl', {
  type: 'tentative_booking_error',
  data: data,
  name: this.info.totemName
})

// guardar transacción POS transbank
this.axios.post(
  'https://url-db.cl',
  {
    type: 'saveTransaction',
    data: {
      valuePOS: this.valuePOS,
      ballotNumberPOS: this.ballotNumberPOS,
      loadingGuardarTransaccion: this.loadingGuardarTransaccion,
      ticketsProcessed: this.ticketsProcessed,
      tickets: this.propsPersonalInformation.tickets,
      isErrorGuardarTransaccion: this.isErrorGuardarTransaccion,
    },
    name: this.info.totemName
  }
)

// guardar reserva confirmada
this.axios.post(
  'https://url-db.cl',
  {
    type: 'confirmed_booking',
    call_url: api,
    data: ticketsGeneradosFormatted,
    name: this.info.totemName
  }
)

// guardar error reserva confirmada
this.axios.post(
  'https://url-db.cl',
  {
    type: 'confirmed_booking_error',
    call_url: api,
    data: ticketsGeneradosFormatted,
    error: JSON.stringify(error),
    name: this.info.totemName
  }
)





//buscar distribución y estado de los asientos en el bus
    searchBusService: async function () {
      try {
        // api dev
        const proxy = 'https://newstg3-gdsbus.kupos.cl'
        const API_KEY = 'TSXFQYAPI25766888'
        // api kupos
        // const proxy = 'https://gds.kupos.com'
        // const API_KEY = 'TSSDFPAPI30103014'
        const api1 = `/gds/api/ui_schedule/${this.idServicio}.json?api_key=${API_KEY}`
        //const api1 = "integrador-web/rest/private/venta/planilla"
        //const api2 = "integrador-web/rest/private/venta/buscarPlantillaVertical"

        const response = await this.axios.get([proxy, api1].join('/'), {
          headers: {
            'content-type': 'application/json'
          }
        })

        if (!response.data || !response.data.result || !response.data.result.bus_layout) {
          throw new Error('La respuesta de la API no contiene los datos esperados.')
        }
        // Procesamiento inicial de layout y asientos disponibles
        let layout = response.data.result.bus_layout.coach_details
        let layout_available = response.data.result.bus_layout.available.split(',')
        layout_available.shift()

        let available_seats = []
        for (let avail of layout_available) {
          let available_seat = avail.split('|')
          let available_seat_parsed = {
            num: available_seat[0],
            price: available_seat[1],
            floor: 0
          }
          available_seats.push(available_seat_parsed)
        }

        // Procesamiento de filas y asientos
        let rows = layout.split(',').filter((row) => row !== 'DR_IMG|.GY')
        // console.log('Filas después de filtrar:', rows)

        let seats_rows = []
        let seat_null = {
          numfloor: 0,
          floor: 0,
          num: 'blank-seat',
          type: null,
          status: null
        }

        for (let row of rows) {
          let row_seats = row.split('-')
          let seats = []

          for (let row_seat of row_seats) {
            let seat_info = row_seat.split('|')
            let seat = seat_null

            if (seat_info[0] !== '') {
              seat = {
                numfloor: 0,
                floor: 0,
                num: seat_info[0],
                type: seat_info[1],
                status: 'busy'
              }
            } else if (seat_info[0] !== 'DR_IMG') {
              seat = {
                numfloor: 0,
                floor: 0,
                num: '%',
                type: seat_info[0],
                status: '%'
              }
            }
            seats.push(seat)
          }
          seats_rows.push(seats)
        }

        // Lógica para determinar pisos del bus
        let floor_available = response.data.result.bus_layout.floor
        let seats_floor_1 = []
        let seats_floor_2 = []
        let floors = []

        if (floor_available !== '') {
          floor_available = floor_available.split('@')
          let floor_1 = floor_available[0].split(',').filter((num) => num && num !== 'DR_IMG')
          let floor_2 = floor_available[1].split(',').filter((num) => num && num !== 'DR_IMG')

          // Actualizar información de piso en asientos disponibles
          for (let avail of available_seats) {
            if (floor_1.includes(avail.num)) {
              avail.floor = 0
            } else if (floor_2.includes(avail.num)) {
              avail.floor = 1
            }
          }

          // Asignar asientos a cada piso
          for (let sr of seats_rows) {
            let row_floor_1 = []
            let row_floor_2 = []
            let current_floor = null

            for (let s of sr) {
              if (floor_1.includes(s.num)) {
                current_floor = 0
              } else if (floor_2.includes(s.num)) {
                current_floor = 1
              }

              if (current_floor === 0) {
                row_floor_1.push({ ...s, numfloor: 0, floor: 0 })
              } else if (current_floor === 1) {
                row_floor_2.push({ ...s, numfloor: 1, floor: 1 })
              }
            }

            if (row_floor_1.length > 0) seats_floor_1.push(row_floor_1)
            if (row_floor_2.length > 0) seats_floor_2.push(row_floor_2)
          }

          floors = [seats_floor_1, seats_floor_2]

          // Actualizar disponibilidad después de dividir por pisos
          const updateSeatAvailability = (floorSeats, availableSeats) => {
            for (let row of floorSeats) {
              for (let seat of row) {
                if (!seat.num || seat.num === 'blank-seat' || seat.num === '%') continue

                const isAvailable = availableSeats.some((avail) => avail.num === seat.num)
                if (isAvailable) {
                  seat.status = 'available'
                }
              }
            }
          }

          updateSeatAvailability(seats_floor_1, available_seats)
          updateSeatAvailability(seats_floor_2, available_seats)
        } else {
          floors = [seats_rows]

          // Actualizar disponibilidad para caso de un solo piso
          for (let row of seats_rows) {
            for (let seat of row) {
              if (!seat.num || seat.num === 'blank-seat') continue

              const isAvailable = available_seats.some((avail) => avail.num === seat.num)
              if (isAvailable) {
                seat.status = 'available'
              }
            }
          }
        }

        // Determinar las columnas para la visualización
        let grid_full = []

        for (let floor of floors) {
          let filtered_floor = floor.filter((row) => row.length > 0)
          let row_size = 5
          let grid_horizontal = new Array(row_size).fill(0).map(() => new Array(filtered_floor.length).fill(seat_null))

          let row_position = 0
          for (let row of filtered_floor) {
            let seat_position = 4
            for (let seat of row) {
              grid_horizontal[seat_position][row_position] = seat
              seat_position--
            }
            row_position++
          }

          if (grid_horizontal[0].every((seat) => seat === seat_null)) {
            grid_horizontal.shift()
          }

          grid_full.push(grid_horizontal)
        }

        // console.log('Grid completo generado:', grid_full)

        this.propsDinamicBus.drawSeats = [...grid_full]
        this.propsDinamicBus.availableSeats = [...available_seats]
        this.loading = false
      } catch (error) {
        console.error('Error al obtener los datos del servicio del bus:', error)
        this.loading = false
      }
    }
  },


