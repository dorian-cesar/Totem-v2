<template>
  <div id="app">
    <logo class="p-3"/>
    <p class="version-text text-right pr-5 mb-0 font-weight-bold">1.9.6 Version</p>
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
    width: 1060px;
    height: 1910px;
    margin: 0px;
  }

  * {
    font-family: "DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji" !important;
  }

  .version-text {
    color: #001689;
  }

  @import '../assets/style/app';
</style>


