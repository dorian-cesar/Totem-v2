<template>
  <div :class="keyboardClass"></div>
</template>

<script>
  import SimpleKeyboard from 'simple-keyboard'
  //import layout from 'simple-keyboard-layouts/build/layouts/spanish'
  //import 'simple-keyboard/build/css/index.css'
  import '@/assets/style/keyboard.css'

  export default {
    name: "KeyboardTouch",
    props: {
      keyboardClass: {
        default: "simple-keyboard",
        type: String,
      }
    },
    data: () => ({
      keyboard: null
    }),
    mounted() {
      this.keyboard = new SimpleKeyboard({
        // onChange: this.onChange,
        onKeyPress: this.onKeyPress,
        //layout: layout,
        layoutName: "default",
        layout: {
          default: [
            // "1 2 3 4 5 6 7 8 9 0",
            "Q W E R T Y U I O P",
            "A S D F G H J K L Ñ",
            "Z X C V B N M {bksp}",
            "{sp}"
          ]
        },
        display: {
          '{bksp}': 'Borrar',
          '{sp}': ' '
        }
      });
    },
    methods: {
      onKeyPress(key) {
        this.$emit("onKeyPress", key)
      }
    }
  }
</script>
