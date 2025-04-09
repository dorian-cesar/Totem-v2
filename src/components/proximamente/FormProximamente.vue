<template>
  <div class="pt-5">
    <b-container>
      <b-row align-v="center" class="s-custom-height">
        <b-col cols="12">
          <b-card border-variant="primary">
            <b-card-text>
              <b-row>
                <b-col cols="12" class="text-center pt-5">
                  <b-img :src="imgAtencion"></b-img>
                </b-col>
                <b-col class="pt-5">
                  <p class="text-center text-primary pb-2 font-weight-bolder s-custom-font">
                    {{texto}}
                  </p>
                </b-col>
              </b-row>
            </b-card-text>
          </b-card>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>
<script>
  import imgAtencion from '@/assets/2-1-aviso-importante.jpg'

  export default {
    name: 'FormProximamente',
    data: () => ({
      imgAtencion,
      texto: 'PRÓXIMAMENTE ADQUIERE TUS BOLETOS EN EL TÓTEM DE AUTOSERVICIOS'
    }),
  }
</script>

<style scoped>
  .s-custom-height{
    height: 1300px
  }

  .s-custom-font {
    font-size: 52px;
  }
</style>
