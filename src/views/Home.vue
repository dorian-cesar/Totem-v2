<template>
  <div>
    <buy-print-info/>
    <b-button
      variant="link"
      style="height: 1px"
      class="text-white"
      @click="onClick">
      {{texto}}
    </b-button>

    <b-modal id="modal-center" centered title="BootstrapVue">
      <p class="my-4">Hacer el Cierre de Caja</p>
    </b-modal>

  </div>
</template>

<script>
  import BuyPrintInfo from '@/components/home/BuyPrintInfo'

  export default {
    name: 'Home',
    data: () => ({
      texto: '*',
      cont: 0,
      key1: false,
      key2: false
    }),
    components: {BuyPrintInfo},
    methods: {
      onClick() {
        this.cont++
        this.texto = '@'
      }
    },
    // inactivo
    onIdle() {
      console.log(KEY_VALUE)

      if(KEY_VALUE.find(e => e === this.cont)){
        if(KEY_VALUE[1] === this.cont && !this.key1 && !this.key2){
          this.key1 = true
        }else if(KEY_VALUE[2] === this.cont && this.key1 && !this.key2){
          this.key2 = true
        }else if(KEY_VALUE[3] === this.cont && this.key1 && this.key2){
          this.$bvModal.show('modal-center')
          this.key1 = false
          this.key2 = false
        }
      }else{
        this.key1 = false
        this.key2 = false
      }
      this.texto = '*'
      this.cont = 0

      console.log('key1',this.key1 )
      console.log('key2', this.key2)
      console.log('cont',  this.cont )
    }
  }
</script>
