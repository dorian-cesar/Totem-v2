<template>
  <div>
    <form-out-of-service/>
  </div>
</template>

<script>
  import FormOutOfService from "@/components/out_of_service/FormOutOfService.vue"

  export default {
    name: 'OutOfService',
    components: {
      FormOutOfService
    }
  }
</script>
