<template>
  <div :class="keyboardClass"></div>
</template>

<script>
  import SimpleKeyboard from 'simple-keyboard'
  import '@/assets/style/keyboard.css'

  export default {
    name: "KeyboardTouch",
    props: {
      keyboardClass: {
        default: "simple-keyboard",
        type: String,
      },
      numeric: {
        default: false,
        type: Boolean,
      },
      keyboardMode: {
        default: 'text',
        type: String,
      }
    },
    data: () => ({
      keyboard: null
    }),
    mounted() {
      this.initKeyboard()
    },
    watch: {
      keyboardMode() {
        if (this.keyboard) {
          this.keyboard.destroy()
        }
        this.initKeyboard()
      }
    },
    methods: {
      initKeyboard() {
        this.keyboard = new SimpleKeyboard({
          onKeyPress: this.onKeyPress,
          layoutName: "default",
          layout: {
            default: this.keyboardMode === 'rut'
              ? [
                  "1 2 3 4 5",
                  "6 7 8 9 0",
                  ". - K {bksp} {close}"
                ]
              : this.numeric
              ? ["1 2 3 4 5 6 7 8 9 0", "{bksp}"]
              : [
                  "Q W E R T Y U I O P",
                  "A S D F G H J K L Ñ",
                  "Z X C V B N M {bksp}",
                  "{sp}"
                ]
          },
          display: {
            '{bksp}': '⌫ Borrar',
            '{close}': '✓ Listo',
            ...(this.keyboardMode === 'rut' || this.numeric ? {} : { '{sp}': ' ' })
          }
        });
      },
      onKeyPress(key) {
        if (key === '{close}') {
          this.$emit("close")
        } else {
          this.$emit("onKeyPress", key)
        }
      }
    },
    beforeDestroy() {
      if (this.keyboard) {
        this.keyboard.destroy()
      }
    }
  }
</script>

