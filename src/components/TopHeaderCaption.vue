<template>
  <div>
    <b-row class="text-white pb-3">
      <b-col cols="12" class="text-center">
        <h1>{{caption}}</h1>
      </b-col>
    </b-row>
  </div>
</template>

<script>
  export default {
    name: 'HeaderCaption',
    props: {
      caption: {
        type: String,
        default: () => ('NADA')
      }
    }
  }
</script>