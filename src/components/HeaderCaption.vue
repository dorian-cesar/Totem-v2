<template>
  <div>
    <b-row class="text-white py-3">
      <b-col cols="12" class="text-center">
        <h3>{{caption}}</h3>
      </b-col>
    </b-row>
  </div>
</template>

<script>
  export default {
    name: 'HeaderCaption',
    props: {
      caption: { type: String, default: () => ('NADA')
      }
    }
  }
</script>
