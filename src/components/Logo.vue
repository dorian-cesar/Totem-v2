<template>
  <div>
    <b-row>
      <b-col cols="12" class="pt-5">
        <b-img center :src="ImgLogo" fluid alt="Logo"/>
      </b-col>
    </b-row>
  </div>
</template>

<script>
  // Images
  //import ImgLogo from '@/assets/img/logo_pullman.png'
  import ImgLogo from '@/assets/img/Logo-Pullman-naranja.png'
  // Exports
  export default {
    name: 'Logo',
    data: () => ({
      ImgLogo
    })
  }
</script>
