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
        const mode =
          this.keyboardMode === 'rut'
            ? 'rut'
            : this.numeric
            ? 'numeric'
            : this.keyboardMode === 'city'
            ? 'city'
            : this.keyboardMode === 'convenio'
            ? 'convenio'
            : 'text'
        const layouts = {
          rut: [
            "1 2 3 4 5",
            "6 7 8 9 0",
            ". - K {bksp} {close}"
          ],
          numeric: ["1 2 3 4 5 6 7 8 9 0", "{bksp}"],
          text: [
            "Q W E R T Y U I O P",
            "A S D F G H J K L Ñ",
            "Z X C V B N M {bksp}",
            "{sp}"
          ],
          convenio: [
            "1 2 3 4 5 6 7 8 9 0",
            "Q W E R T Y U I O P",
            "A S D F G H J K L Ñ",
            "Z X C V B N M {bksp}",
            "á é í ó ú ü {close}",
            "{sp}"
          ],
          city: [
            "q w e r t y u i o p",
            "a s d f g h j k l ñ",
            "z x c v b n m {bksp}",
            "á é í ó ú ü {close}",
            "{sp}"
          ]
        }
        this.keyboard = new SimpleKeyboard({
          onKeyPress: this.onKeyPress,
          layoutName: "default",
          layout: {
            default: layouts[mode]
          },
          display: {
            '{bksp}': '⌫ Borrar',
            '{close}': '✓ Listo',
            ...(mode === 'rut' || mode === 'numeric' ? {} : { '{sp}': ' ' })
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

