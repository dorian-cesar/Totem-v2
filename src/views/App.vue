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
    background-image: url("../assets/img/background.jpg");
    // background-color: #1863d1;
    width: 1060px;
    height: 1910px;
    margin: 0px;
  }

  @import '../assets/style/app';
</style>


