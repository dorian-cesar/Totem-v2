<template>
  <div class="screensaver-wrapper" @click="salirScreensaver">
    <form-proximamente/>
  </div>
</template>

<script>
  import FormProximamente from "@/components/proximamente/FormProximamente";

  export default {
    name: "Proximamente",
    components: {
      FormProximamente
    },
    methods: {
      salirScreensaver() {
        // Redirige explícitamente a la pantalla deseada al tocar la portada
        if (this.$route.name !== 'TravelSelection') {
          this.$router.push({ name: 'TravelSelection' }).catch(() => {})
        }
      }
    }
  }
</script>

<style scoped>
.screensaver-wrapper {
  width: 100%;
  min-height: 100vh;
  cursor: pointer;
}
</style>