import info from '../../info.json'

export default {
  data() {
    return {
      isLoadingReservation: false, //<- waiting response
      statusReservation: '',
      codeReservation: '',
      operatorPnr: '',
      info
    }
  },

  methods: {
    // cambiar el estatus del flag loading
    async seatReservation(option, param, service) {
      this.isLoadingReservation = true
      // api dev
      // const proxy = 'https://newstg3-gdsbus.kupos.cl'
      // const API_KEY = 'TSXFQYAPI25766888'
      // api kupos
      const proxy = 'https://gds.kupos.com'
      const API_KEY = 'TSSDFPAPI30103014'
      let api = ''

      const rut = localStorage.getItem('rut')
      localStorage.setItem('id_bus', service)

      if ('add' === option)
        api = `/gds/api/tentative_booking/${service}.json?api_key=${API_KEY}&region=chile` // reservar asiento
      else if (option === 'delete') {
        this.isLoadingReservation = false
        return Promise.resolve()
      } // liberar asiento
      // else if (option === 'delete') api = 'integrador-web/rest/private/venta/liberarAsiento'

      // console.log('param', param)
      this.axios.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8'
      // console.log("parametros de tentative: ", param)
      const formatParams = {
        book_ticket: param.book_ticket,
        // seat_number: param.book_ticket.seat_detail[0].seat_number,
        origin_id: param.origin_id,
        destination_id: param.destination_id,
        boarding_at: param.boarding_at,
        no_of_seats: param.no_of_seats,
        travel_date: param.travel_date,
        // travel_time: param.travel_time,
        available_seats: param.available_seats,
        cost: param.cost,
        bus_type: param.bus_type,
        route_id: param.route_id
      }

      const MAX_RETRIES = 10
      const RETRY_DELAY_MS = 3000

      let attempt = 0
      let success = false
      let data = null

      while (attempt < MAX_RETRIES && !success) {
        try {
          console.log(`Intento ${attempt + 1} de ${MAX_RETRIES} - realizando reserva...`)
          const response = await this.axios.post([proxy, api].join('/'), formatParams, {
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            }
          })
          data = response.data
          success = true
        } catch (error) {
          const bookingData = {
            numTotem: localStorage.getItem('ipServer'),
            rut: localStorage.getItem('rut') || 'empty',
            origen: this.$store.state.TravelSelection.nameDepartureCity,
            destino: this.$store.state.TravelSelection.nameArrivalCity,
            fecha_viaje: param.fecha,
            hora_viaje: param.horaSalida,
            asiento: param.book_ticket.seat_details.seat_detail[0].seat_number,
            codigo_reserva: 'Reserva fallida',
            // numero_boleto: hasTicketDetails ? data.result.ticket_details.operator_pnr : '',
            estado_boleto: `Reserva fallida - Intento: ${attempt}`,
            codigo_autorizacion: '',
            id_pos: '',
            id_bus: localStorage.getItem('id_bus'),
            tipo_tarjeta: '',
            tarjeta_marca: '',
            codigo_transaccion: '',
            estado_transaccion: 'Pendiente',
            numero_transaccion: '',
            fecha_transaccion: '',
            hora_transaccion: '',
            total_transaccion: ''
          }
          this.axios
            .post(this.info.urlLogs, {
              bookingData
            })
            .then(() => {
              console.log(`Intento ${attempt} guardado en DB (tentative booking)`)
            })
            .catch((error) => {
              console.error(`Error al guardar en intento ${attempt} en DB, tentative_booking: `, error)
            })
          attempt++
          console.warn(`Intento de tentative booking falló, reintentando (${attempt}/${MAX_RETRIES})...`)
          if (attempt >= MAX_RETRIES) {
            console.error('Máximos intentos para tentative booking', error)
            this.statusReservation = false
            this.codeReservation = ''
            this.isLoadingReservation = false
            const bookingData = {
              numTotem: localStorage.getItem('ipServer'),
              rut: rut || 'empty',
              origen: this.$store.state.TravelSelection.nameDepartureCity,
              destino: this.$store.state.TravelSelection.nameArrivalCity,
              fecha_viaje: param.fecha,
              hora_viaje: param.horaSalida,
              asiento: param.book_ticket.seat_details.seat_detail[0].seat_number,
              codigo_reserva: 'Reserva fallida',
              // numero_boleto: hasTicketDetails ? data.result.ticket_details.operator_pnr : '',
              estado_boleto: 'Reserva fallida - Máximo intentos',
              codigo_autorizacion: '',
              id_pos: '',
              id_bus: localStorage.getItem('id_bus'),
              tipo_tarjeta: '',
              tarjeta_marca: '',
              codigo_transaccion: '',
              estado_transaccion: 'Pendiente',
              numero_transaccion: '',
              fecha_transaccion: '',
              hora_transaccion: '',
              total_transaccion: ''
            }
            this.axios
              .post(this.info.urlLogs, {
                bookingData
              })
              .then(() => {
                console.log('Error guardado en DB (tentative booking)')
              })
              .catch((error) => {
                console.error('Error al guardar en DB, tentative_booking: ', error)
              })
            setTimeout(() => {
              this.$router.push('/travelselection')
              window.location.reload()
            }, 3000)
            return
          }
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS))
        }
      }

      if (typeof data === 'object') {
        console.log('response de tentative_booking', data)

        const hasTicketDetails = data && data.result && data.result.ticket_details

        const bookingData = {
          numTotem: localStorage.getItem('ipServer'),
          rut: rut || 'empty',
          origen: this.$store.state.TravelSelection.nameDepartureCity,
          destino: this.$store.state.TravelSelection.nameArrivalCity,
          fecha_viaje: param.fecha,
          hora_viaje: param.horaSalida,
          asiento: param.book_ticket.seat_details.seat_detail[0].seat_number,
          codigo_reserva: hasTicketDetails ? data.result.ticket_details.pnr_number : '',
          // numero_boleto: hasTicketDetails ? data.result.ticket_details.operator_pnr : '',
          estado_boleto: hasTicketDetails ? 'Reservado' : 'Reserva fallida',
          codigo_autorizacion: '',
          id_pos: '',
          id_bus: localStorage.getItem('id_bus'),
          tipo_tarjeta: '',
          tarjeta_marca: '',
          codigo_transaccion: '',
          estado_transaccion: 'Pendiente',
          numero_transaccion: '',
          fecha_transaccion: '',
          hora_transaccion: '',
          total_transaccion: ''
        }

        console.log('Datos para DB tentative booking:', bookingData)
        if (hasTicketDetails) {
          this.axios
            .post(this.info.urlLogs, {
              bookingData
            })
            .then(() => {
              console.log('Guardado exitoso en DB (tentative booking)')
            })
            .catch((error) => {
              console.error('Error al guardar en DB, tentative booking: ', error)
            })
        }
        if (
          typeof data.response !== 'undefined' &&
          typeof data.response.code !== 'undefined' &&
          typeof data.response.code == 500
        ) {
          this.statusReservation = false
          console.log('no ticket', data)
          console.log('Datos para DB tentative booking:', bookingData)

          this.axios
            .post(this.info.urlLogs, {
              bookingData
            })
            .then(() => {
              console.log('Error guardado en DB (tentative booking)')
            })
            .catch((error) => {
              console.error('Error al guardar en DB, tentative_booking: ', error)
            })
        } else if (typeof data.result !== 'undefined') {
          if (typeof data.result.ticket_details !== 'undefined') {
            this.statusReservation = true
            this.codeReservation = data.result.ticket_details.pnr_number || ''
            this.operatorPnr = data.result.ticket_details.operator_pnr || ''
            console.log('ok', data)
          } else {
            this.statusReservation = false
            console.log('no ticket', data)
            setTimeout(() => {
              this.$router.push('/travelselection')
              window.location.reload()
            }, 3000)
          }
        } else {
          this.statusReservation = false
          bookingData.codigo_reserva = 'Reserva fallida'
          console.log('no result', data)

          console.log('Datos para DB tentative booking:', bookingData)
          this.axios
            .post(this.info.urlLogs, {
              bookingData
            })
            .then(() => {
              console.log('Error guardado en DB (tentative booking)')
            })
            .catch((error) => {
              console.error('Error al guardar en DB, tentative_booking :', error)
            })
          setTimeout(() => {
            this.$router.push('/travelselection')
            window.location.reload()
          }, 3000)
        }
      }
      this.isLoadingReservation = false
    }
  }
}

