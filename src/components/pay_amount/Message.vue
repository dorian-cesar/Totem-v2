<template>
  <div>

    <b-card class="px-2 mx-3">
      <b-row>
        <b-col cols="12" class="text-center pt-4">
          <font-awesome-icon
            :icon="['fas', 'check-circle']"
            size="7x"
            :style="{ color: 'blue'}"
          />
        </b-col>
        <b-col cols="12">
          <p class="text-center font-weight-normal" style="font-size: 80px">Feliz Viaje</p>
        </b-col>
        <b-col cols="12">
          <h5 class="text-center font-italic">Gracias por su preferencia.</h5>
        </b-col>
        <b-col cols="12" class="pt-4">
          <hr>
          <p class="font-weight-light">
            Si presenta algún problema o necesita información adicional puede comunicarse con
            nosotros a través de info@pullman.cl o por los teléfonos +56 999 999999.
          </p>
        </b-col>
      </b-row>
    </b-card>

  </div>
</template>

<script>
  export default {
    name: 'Message',
    // data() {
    //   return {}
    // },
    // props: {
    //   amount: {
    //     type: String, default: () => {
    //       return '18.000'
    //     }
    //   }
    // }
  }
  /*
  *
  *      <p>Si presenta algún problema o necesita información adicional puede comunicarse con nosotros a través de
          info@pullman.cl o por los teléfonos +56 999 999999.</p>
  * **/
</script>
