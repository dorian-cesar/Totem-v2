<template>
  <!-- Header-->
  <div>
    <b-row class="px-3">
      <b-col class="text-white text-left bg-dark py-3 h3" cols="6">
        LISTADO DE BOLETOS
      </b-col>
      <b-col class="text-white text-right p-3 bg-dark h3" cols="6">
        <font-awesome-icon
          :icon="['fas', 'ticket-alt']"
          :style="{ color: 'white' }"
          size="1x"
        />
        CANTIDAD: {{tickets.length}}
      </b-col>
    </b-row>
    <!-- Tickets -->
    <div role="tablist" class="px-4 py-2">
      <b-card no-body class="mb-1" v-for="(ticket, index) in tickets " :key="index">
        <b-card-header header-tag="header" class="p-0" role="tab">
          <b-button block href="#" v-b-toggle="['accordion',index].join('-')" variant="light" class="button-style">
            <b-row>
              <b-col cols="8" class="text-left mt-3 h4">
                <font-awesome-icon
                  :icon="['fas', 'plus-square']"
                />
                {{
                [
                ticket.name,
                'Servicio '+ticket.type,
                'Fecha: ' + ticket.date,
                ].join(' - ')
                }}
              </b-col>
              <b-col cols="4" class="text-right ml-auto mt-3 h4">
                {{'Valor: $' + ticket.price}}
              </b-col>
            </b-row>
          </b-button>
        </b-card-header>
        <b-collapse :id="['accordion',index].join('-')" :visible="false" accordion="my-accordion" role="tabpanel">
          <b-card-body>
            <b-card-text>
              <b-row>
                <b-col cols="4" class="text-right h4">Ruta:</b-col>
                <b-col cols="8" class="text-left h4">{{ticket.trip}}</b-col>
                <b-col cols="4" class="text-right h4">Terminal:</b-col>
                <b-col cols="8" class="text-left h4">{{ticket.station}}</b-col>
                <b-col cols="4" class="text-right h4">Fecha:</b-col>
                <b-col cols="8" class="text-left h4">{{ticket.date}}</b-col>
                <b-col cols="4" class="text-right h4">Hora:</b-col>
                <b-col cols="8" class="text-left h4">{{ticket.hour}}</b-col>
                <b-col cols="4" class="text-right h4">Asiento:</b-col>
                <b-col cols="8" class="text-left h4">{{ticket.seat}}</b-col>
              </b-row>
            </b-card-text>
          </b-card-body>
        </b-collapse>
      </b-card>
    </div>
    <!-- Foot total -->
    <div class="bg-light text-right pr-3 py-2 foot-style font-weight-bold" style="height: 110px">
      <h3 class="mb-0 mt-1">TOTAL A CANCELAR:
      <b-badge pill variant="dark" class="p-3" style="border-radius: 35px;"><h1 class="mb-0">${{total}}</h1></b-badge>
      </h3>
    </div>
  </div>
</template>

<script>

  export default {
    name: 'PersonalInformation',
    props: {
      tickets: {type: Array, default: () => ([])},
      total: {type: String, default: () => ('0')}
    },
  }
</script>

<style scoped>
  .foot-style {
    height: 70px;
    font-size: 24px;
  }

  .button-style {
    height: 80px;
  }
</style>
