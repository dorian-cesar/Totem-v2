<template>
  <div class="px-5 pt-5">
    <font-awesome-icon
      :icon="['fas', iconName]"
      :style="{ color: 'white' }"
      size="2x"
    />
    <hr>
  </div>
</template>

<script>
  export default {
    name: 'IconLine',
    props: {
      iconName: {type: String, default: () => ''}
    }
  }
</script>

<style scoped>
  hr {
    color: white;
    background-color: white;
    height: 1px;
  }
</style>

