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
      const proxy = 'https://newstg3-gdsbus.kupos.cl'
      const API_KEY = 'TSXFQYAPI25766888'
      // api kupos
      // const proxy = "https://gds.kupos.com"
      // const API_KEY = "TSSDFPAPI30103014"
      let api = ''
      const rut = localStorage.getItem('rut')

      if ('add' === option)
        api = `/gds/api/tentative_booking/${service}.json?api_key=${API_KEY}&region=chile` // reservar asiento
      else if (option === 'delete') {
        this.isLoadingReservation = false
        return Promise.resolve()
      } // liberar asiento
      // else if (option === 'delete') api = 'integrador-web/rest/private/venta/liberarAsiento'

      // console.log('param', param)
      this.axios.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8'
      const formatParams = {
        book_ticket: param.book_ticket,
        // seat_number: param.book_ticket.seat_detail[0].seat_number,
        origin_id: param.origin_id,
        destination_id: param.destination_id,
        boarding_at: param.boarding_at,
        no_of_seats: param.no_of_seats,
        travel_date: param.travel_date,
        travel_time: param.travel_time,
        rut: rut
        // data de api antigua
        // customer_company_gst: {
        //   name: "Pullman",
        //   gst_id: "T123DT",
        //   address: "TEST"
        // }
      }
      // console.log(JSON.stringify(formatParams, null, 2))
      await this.axios
        .post([proxy, api].join('/'), formatParams, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          }
        })
        .then(({ data }) => {
          if (typeof data === 'object') {
            const bookingData = {
              ticket: {
                rut: rut,
                origen: this.$store.state.TravelSelection.nameDepartureCity,
                destino: this.$store.state.TravelSelection.nameArrivalCity,
                fecha_viaje: formatParams.travel_date,
                hora_viaje: formatParams.travel_time,
                asiento: param.book_ticket.seat_details.seat_detail[0].seat_number,
                codigo_reserva: data.result.ticket_details.pnr_number,
                estado_boleto: "Reservado",
                codigo_confirmacion: ""
              },
              pos: {
                codigo_venta: "",
                estado_transaccion: "",
                numero_transaccion: "",
                fecha_transaccion: "",
                hora_transaccion: "",
                total: ""
              }
            };

            console.log('Datos para DB tentative booking:', bookingData)

            this.axios.post('https://log-totem.dev-wit.com/backend-log-totem-transbank/api.php', {
              data: bookingData,
            })
            if (
              typeof data.response !== 'undefined' &&
              typeof data.response.code !== 'undefined' &&
              typeof data.response.code == 500
            ) {
              this.statusReservation = false
              console.log('no ticket', data)
              bookingData.ticket.estado_boleto = "Reserva cancelada";
              bookingData.ticket.codigo_reserva = "";

              this.axios.post('https://log-totem.dev-wit.com/backend-log-totem-transbank/api.php', {
                data: bookingData
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
              }
            } else {
              this.statusReservation = false
              console.log('no result', data)
              bookingData.ticket.estado_boleto = "Reserva cancelada";
              bookingData.ticket.codigo_reserva = "";

              this.axios.post('https://log-totem.dev-wit.com/backend-log-totem-transbank/api.php', {
                data: bookingData
              })
            }
          }

          //Guardar log
          // this.axios.post('http://3.80.65.145/logtotem', {frame: { url:[proxy, api].join('/'), resquest: param }, name: this.$info.totemName})
          // this.axios.post('http://3.80.65.145/logtotem', {frame: { url:[proxy, api].join('/'), response: data }, name: this.$info.totemName})
        })
        .catch((error) => {
          console.error(error)
          this.statusReservation = false
          this.codeReservation = ''
          // console.log('no result', data)
          console.log('no result')
        })
        .finally(() => (this.isLoadingReservation = false))
    }
  }
}

