export default {
  data() {
    return {
      isLoadingReservation: false, //<- waiting response
      statusReservation: '',
      codeReservation: '',
      operatorPnr: ''
    }
  },

  methods: {
    // cambiar el estatus del flag loading
    async seatReservation(option, param, service) {


      this.isLoadingReservation = true
      const proxy = "https://cors.kupos-api.workers.dev"
      const API_KEY = "TSSDFPAPI30103014"
      let api = ''

      if ('add' === option) api = `gds/api/tentative_booking/${service}.json?api_key=${API_KEY}&region=chile` // reservar asiento
      else if (option === 'delete') api = 'integrador-web/rest/private/venta/liberarAsiento'// liberar asiento
      this.axios.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8';
      await this.axios
        .post([proxy, api].join('/'), param)
        .then(({data}) => {
          if (typeof data === 'object') {
            this.axios.post(
              'https://s1.ntic.cl/totem-costa-handler/index.php',
              {
                type: 'tentative_booking',
                call_url: api,
                call_data: param,
                data: data,
                name: this.$info.totemName
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
                  name: this.$info.totemName
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
            console.log('no result', data)
          }
        )
        .finally(() => this.isLoadingReservation = false)

    }
  }
}
