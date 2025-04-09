<template>
  <b-container>
    <b-row align-h="center">
      <b-col cols="12" align="center">
        <b-button variant="light" class="key-num m-1" @click="inputButton('1')">1</b-button>
        <b-button variant="light" class="key-num m-1" @click="inputButton('2')">2</b-button>
        <b-button variant="light" class="key-num m-1" @click="inputButton('3')">3</b-button>
        <b-button variant="light" class="key-num m-1" @click="inputButton('4')">4</b-button>
        <b-button variant="light" class="key-num m-1" @click="inputButton('5')">5</b-button>
        <b-button variant="light" class="key-num m-1" @click="inputButton('6')">6</b-button>
        <b-button variant="light" class="key-num m-1" @click="inputButton('7')">7</b-button>
        <b-button variant="light" class="key-num m-1" @click="inputButton('8')">8</b-button>
        <b-button variant="light" class="key-num m-1" @click="inputButton('9')">9</b-button>
        <b-button variant="light" class="key-num m-1" @click="inputButton('0')">0</b-button>
      </b-col>
    </b-row>
    <b-row align-h="center">
      <b-col cols="12" align="center">
        <b-button variant="light" class="key-num m-1" @click="inputButton(isUppercase ? 'Q' : 'q')">{{isUppercase ? 'Q'
          : 'q'}}
        </b-button>
        <b-button variant="light" class="key-num m-1" @click="inputButton(isUppercase ? 'W' : 'w')">{{isUppercase ? 'W'
          : 'w'}}
        </b-button>
        <b-button variant="light" class="key-num m-1" @click="inputButton(isUppercase ? 'E' : 'e')">{{isUppercase ? 'E'
          : 'e'}}
        </b-button>
        <b-button variant="light" class="key-num m-1" @click="inputButton(isUppercase ? 'R' : 'r')">{{isUppercase ? 'R'
          : 'r'}}
        </b-button>
        <b-button variant="light" class="key-num m-1" @click="inputButton(isUppercase ? 'T' : 't')">{{isUppercase ? 'T'
          : 't'}}
        </b-button>
        <b-button variant="light" class="key-num m-1" @click="inputButton(isUppercase ? 'Y' : 'y')">{{isUppercase ? 'Y'
          : 'y'}}
        </b-button>
        <b-button variant="light" class="key-num m-1" @click="inputButton(isUppercase ? 'U' : 'u')">{{isUppercase ? 'U'
          : 'u'}}
        </b-button>
        <b-button variant="light" class="key-num m-1" @click="inputButton(isUppercase ? 'I' : 'i')">{{isUppercase ? 'I'
          : 'i'}}
        </b-button>
        <b-button variant="light" class="key-num m-1" @click="inputButton(isUppercase ? 'O' : 'o')">{{isUppercase ? 'O'
          : 'o'}}
        </b-button>
        <b-button variant="light" class="key-num m-1" @click="inputButton(isUppercase ? 'P' : 'p')">{{isUppercase ? 'P'
          : 'p'}}
        </b-button>
      </b-col>
    </b-row>
    <b-row align-h="center">
      <b-col cols="12" align="center">
        <b-button variant="light" class="key-num m-1" @click="inputButton(isUppercase ? 'A' : 'a')">{{isUppercase ? 'A'
          : 'a'}}
        </b-button>
        <b-button variant="light" class="key-num m-1" @click="inputButton(isUppercase ? 'S' : 's')">{{isUppercase ? 'S'
          : 's'}}
        </b-button>
        <b-button variant="light" class="key-num m-1" @click="inputButton(isUppercase ? 'D' : 'd')">{{isUppercase ? 'D'
          : 'd'}}
        </b-button>
        <b-button variant="light" class="key-num m-1" @click="inputButton(isUppercase ? 'F' : 'f')">{{isUppercase ? 'F'
          : 'f'}}
        </b-button>
        <b-button variant="light" class="key-num m-1" @click="inputButton(isUppercase ? 'G' : 'g')">{{isUppercase ? 'G'
          : 'g'}}
        </b-button>
        <b-button variant="light" class="key-num m-1" @click="inputButton(isUppercase ? 'H' : 'h')">{{isUppercase ? 'H'
          : 'h'}}
        </b-button>
        <b-button variant="light" class="key-num m-1" @click="inputButton(isUppercase ? 'J' : 'j')">{{isUppercase ? 'J'
          : 'j'}}
        </b-button>
        <b-button variant="light" class="key-num m-1" @click="inputButton(isUppercase ? 'K' : 'k')">{{isUppercase ? 'K'
          : 'k'}}
        </b-button>
        <b-button variant="light" class="key-num m-1" @click="inputButton(isUppercase ? 'L' : 'l')">{{isUppercase ? 'L'
          : 'l'}}
        </b-button>
        <b-button variant="light" class="key-num m-1" @click="inputButton(isUppercase ? 'Ñ' : 'ñ')">{{isUppercase ? 'Ñ'
          : 'ñ'}}
        </b-button>
      </b-col>
    </b-row>
    <b-row align-h="center">
      <b-col cols="12" align="center">
        <b-button variant="light" class="key-num m-1" @click="inputButton(isUppercase ? 'Z' : 'z')">{{isUppercase ? 'Z'
          : 'z'}}
        </b-button>
        <b-button variant="light" class="key-num m-1" @click="inputButton(isUppercase ? 'X' : 'x')">{{isUppercase ? 'X'
          : 'x'}}
        </b-button>
        <b-button variant="light" class="key-num m-1" @click="inputButton(isUppercase ? 'C' : 'c')">{{isUppercase ? 'C'
          : 'c'}}
        </b-button>
        <b-button variant="light" class="key-num m-1" @click="inputButton(isUppercase ? 'V' : 'v')">{{isUppercase ? 'V'
          : 'v'}}
        </b-button>
        <b-button variant="light" class="key-num m-1" @click="inputButton(isUppercase ? 'B' : 'b')">{{isUppercase ? 'B'
          : 'b'}}
        </b-button>
        <b-button variant="light" class="key-num m-1" @click="inputButton(isUppercase ? 'N' : 'ñ')">{{isUppercase ? 'N'
          : 'ñ'}}
        </b-button>
        <b-button variant="light" class="key-num m-1" @click="inputButton(isUppercase ? 'M' : 'm')">{{isUppercase ? 'M'
          : 'm'}}
        </b-button>
        <b-button variant="light" class="key-num m-1" @click="inputButton(',')">,</b-button>
        <b-button variant="light" class="key-num m-1" @click="inputButton('.')">.</b-button>
        <b-button variant="light" class="key-num m-1" @click="inputButton('-')">-</b-button>
      </b-col>
    </b-row>
    <b-row align-h="center">
      <b-col cols="12" align="center">
        <!-- Key shift-->
        <b-button variant="light" class="key-num m-1" @click="shift">
          <font-awesome-icon :icon="['fas', 'arrow-up']"
                             :style="{ color: 'gray' }"
                             transform="left-4" size="lg"
          />
        </b-button>
        <b-button variant="light" class="key-num m-1" @click="inputButton('@')">
          <span style="position: relative; right: 30%">@</span>
        </b-button>
        <b-button variant="light" class="key-espace  m-1" @click="inputButton(' ')">&nbsp;</b-button>
        <b-button variant="light" class="key-double m-1" @click="inputButton('.com')">.com</b-button>
        <!--  key backspace-->
        <b-button variant="light" class="key-num m-1" @click="inputButton('BS')">
          <font-awesome-icon :icon="['fas', 'backspace']"
                             :style="{ color: 'gray'}"
                             transform="left-7" size="lg"
          />
        </b-button>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
  export default {
    name: 'Keyboard',
    data() {
      return {
        isUppercase: false,
      }
    },
    methods: {
      inputButton(key) {
        this.$emit('valueKey', key)
      },
      shift() {
        this.isUppercase = !this.isUppercase
      }
    }
  }
</script>

<style scoped>
  .key-num {
    width: 35px;
    height: 40px;
  }

  .key-espace {
    width: 225px;
    height: 40px;
  }

  .key-double {
    width: 85px;
    height: 40px;
  }
</style>
