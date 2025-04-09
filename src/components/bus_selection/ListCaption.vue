<template>
  <div>
    <b-row class="px-3">
      <b-col class="text-white p-2 text-left bg-dark" cols="5">
        <h4>{{nameOrigin}} / {{nameDestination}}</h4>
      </b-col>
      <b-col class="text-white p-2 text-center bg-dark" cols="2">
        <h4>{{travelDate}}</h4>
      </b-col>
      <b-col class="text-white p-2 text-center bg-dark" cols="5">
        <h4>TOTAL DE RESULTADOS: {{totalList}}</h4>
      </b-col>
    </b-row>
  </div>
</template>

<script>
  export default {
    name: 'ListCaption',
    props: {
      nameOrigin: {type: String, default: () => ''},
      nameDestination: {type: String, default: () => ''},
      travelDate: {type: String, default: () => ''},
      totalList: {type: String, default: () => '0'}
    },
  }
</script>
