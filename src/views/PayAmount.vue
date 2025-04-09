<template>
  <div>
    <form-pay-amount/>
  </div>
</template>

<script>
  import FormPayAmount from '@/components/pay_amount/FormPayAmount.vue'

  export default {
    name: 'PayAmount',
    components: {FormPayAmount}
  }
</script>
