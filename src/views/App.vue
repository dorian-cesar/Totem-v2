<template>
  <div id="app">
    <logo class="p-3"/>
    <b-row align-h="center">
      <b-col cols="11">
        <router-view/>
      </b-col>
    </b-row>
  </div>
</template>

<script>
  import Logo from '@/components/Logo.vue'

  export default {
    name: 'App',
    components: {Logo}
  }
</script>

<style lang="scss">
  /*#app*/

  body {
    // background-image: url("../assets/img/background.jpg");
    background: #013ba7 !important;
    width: 1080px;
    height: 1920px;
    margin: 0px;
  }

  * {
    font-family: "DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji" !important;
  }

  @import '../assets/style/app';
</style>


