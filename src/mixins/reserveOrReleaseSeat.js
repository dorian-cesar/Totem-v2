import info from "../../info.json"; 

export default {
  data() {
    return {
      isLoadingReservation: false, //<- waiting response
      statusReservation: '',
      codeReservation: '',
      operatorPnr: '',
      info,
    }
  },

  methods: {
    // cambiar el estatus del flag loading
    async seatReservation(option, param, service) {

      // const ticket_num = param.codigoReserva
      // const seat_num = param.asiento
      
      this.isLoadingReservation = true
      // const proxy = "https://newstg3-gdsbus.kupos.cl";
      // const API_KEY = "TSXFQYAPI25766888"
      const proxy = "https://cors-anywhere.herokuapp.com/https://gds.ticketsimply.us";
      const API_KEY = "TSSDFPAPI30103014"
      let api = ''

      if ('add' === option) api = `/gds/api/tentative_booking/${service}.json?api_key=${API_KEY}&region=chile` // reservar asiento
      // else if (option === 'delete') api = 'integrador-web/rest/private/venta/liberarAsiento'

      this.axios.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8';
      const formatParams = {
        book_ticket: param.book_ticket,
        origin_id: param.origin_id,
        destination_id: param.destination_id,
        boarding_at: param.boarding_at,
        no_of_seats: param.no_of_seats,
        travel_date: param.travel_date,
        customer_company_gst: {
          name: "Pullman",
          gst_id: "T123DT",
          address: "TEST"
        }
      };
      // console.log(JSON.stringify(formatParams, null, 2));
      await this.axios
        .post([proxy, api].join('/'), formatParams, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE', 
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        })
        .then(({data}) => {
          if (typeof data === 'object') {
            this.axios.post(
              'https://s1.ntic.cl/totem-costa-handler/index.php',
              {
                type: 'tentative_booking',
                call_url: api,
                call_data: formatParams,
                data: data,
                name: this.info.totemName
              }
            )
            if (typeof data.response !== 'undefined' && typeof data.response.code !== 'undefined' && typeof data.response.code == 500) {
              this.statusReservation = false
              console.log('no ticket', data)

              this.axios.post(
                'https://s1.ntic.cl/totem-costa-handler/index.php',
                {
                  type: 'tentative_booking_error',
                  data: data,
                  name: this.info.totemName
                }
              )
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
            }
          }

          //Guardar log
          // this.axios.post('http://3.80.65.145/logtotem', {frame: { url:[proxy, api].join('/'), resquest: param }, name: this.$info.totemName})
          // this.axios.post('http://3.80.65.145/logtotem', {frame: { url:[proxy, api].join('/'), response: data }, name: this.$info.totemName})
        })
        .catch(error => {
            console.error(error)

            this.statusReservation = false
            this.codeReservation = ''
            // console.log('no result', data)
            console.log('no result')

          }
        )
        .finally(() => this.isLoadingReservation = false)

    }
  }
}
