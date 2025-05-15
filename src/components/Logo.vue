<template>
  <div>
    <b-row>
      <b-col cols="12" class="pt-5 text-center">
        <b-img :src="ImgLogo" fluid alt="Logo" class="ml-2"/>
      </b-col>
    </b-row>
  </div>
</template>

<script>
// Imagen
import ImgLogo from '@/assets/img/logo-pullman-nuevo.svg'
// import ImgLogo from '@/assets/img/logo-pullman-contigo.png'


export default {
  name: 'Logo',
  data: () => ({
    ImgLogo
  })
}
</script>

