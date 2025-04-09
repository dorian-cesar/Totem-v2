<template>
  <div class="pt-3">
    <b-card class="transparent-main card-custon">
      <blockquote class="card-blockquote">
        <!-- Título de la pantalla-->
        <top-header-caption v-bind="propsHeaderCaption"/>
        <!-- ToolBar option OneWay or RoundTrip -->
        <toolbar-one-way-round-trip
          @activeDatepicker2="propsDatepicker.statusDatepicker2 = $event"
          class="pt-5 pb-4"
        />
        <!-- Icon position + Line  -->
        <icon-line v-bind="propsIconLine1"/>
        <!-- Input selects origin and destination -->
        <origin-destination-city
          ref="origin-destination-city"
          @selectAction="selectAction"
          @selected="showKeyBoard(false)"
        />
        <!-- Icon calendar + Line           v-on:click.native="showKeyBoard(false)"-->
        <icon-line v-bind="propsIconLine2"/>
        <!-- Input dates origin destination-->
        <date-one-way-round-trip
          v-bind="propsDatepicker"

        />
        <!-- Keyboard-->
        <br>
        <keyboard-touch
          v-show="isShowKeyBoard "
          @onKeyPress="onKeyPress"
        />
      </blockquote>
    </b-card>
    <!-- Toolbar button-->
    <toolbar-button-new3 :rbIsDisable="isDisable" @nameButton="clickButton"/>

  </div>
</template>

<script>
  import TopHeaderCaption from '@/components/TopHeaderCaption'
  import ToolbarOneWayRoundTrip from '@/components/travel_selection/ToolbarOneWayRoundTrip'
  import OriginDestinationCity from '@/components/travel_selection/OriginDestinationCity'
  import DateOneWayRoundTrip from '@/components/travel_selection/DateOneWayRoundTrip'
  import IconLine from '@/components/travel_selection/IconLine'
  import ToolbarButtonNew3 from '@/components/ToolbarButtonNew3'
  import {mapGetters} from 'vuex'
  import KeyboardTouch from '@/components/KeyboardTouch'

  export default {
    name: 'FormTravelSelection',
    data: () => ({
      propsHeaderCaption: {
        caption: 'SELECCIÓN DEL VIAJE'
      },
      // Props datepicker
      propsDatepicker: {
        statusDatepicker2: false
      },
      // Props Icon Line 1
      propsIconLine1: {
        iconName: 'map-marker-alt'
      },
      // Props Icon Line 2
      propsIconLine2: {
        iconName: 'calendar-alt'
      },
      // KeyBoard
      isShowKeyBoard: false,
      //inputKeyBoard: '',
      input: '',
      nameSelect:'',
      statusKeyPress: false
    }),
    components: {
      TopHeaderCaption,
      ToolbarOneWayRoundTrip,
      OriginDestinationCity,
      DateOneWayRoundTrip,
      IconLine,
      ToolbarButtonNew3,
      KeyboardTouch
    },
    methods: {
      ...mapGetters('TravelSelection', ['isDepartureCity', 'isArrivalCity']),

      clickButton(name) {
        this.$router.push({name: ('Left-Button' === name) ? 'Home' : 'BusSelection'})
      },
      selectAction(val) {
        console.log('selectAction', val)
        console.log('statusKeyPress', this.statusKeyPress)
        if ('open' === val.status) {
          this.isShowKeyBoard = true
          this.nameSelect = val.name
        }else if('close' === val.status && this.statusKeyPress){
          this.buscar()
          this.statusKeyPress = false
          this.isShowKeyBoard = false
        }else {
          this.isShowKeyBoard = false
        }

      },
      /**
       * KeyBoard
       * */
      showKeyBoard(val) {
        this.isShowKeyBoard = val
        this.input = ''
      },
      onKeyPress(key) {
        this.statusKeyPress = true
        switch (key) {
            case '{bksp}':{
              this.borrar()
              break
            }
            case '{sp}':{
              this.input += ' '
              break
            }
            default:{
              this.input += key
              this.buscar()
            }
          }
      },
      buscar(){ console.log('buscar', this.input)
        this
            .$refs['origin-destination-city']
            .$refs[this.nameSelect]
            .$children[0]
            .open = true
        this
          .$refs['origin-destination-city']
          .$refs[this.nameSelect]
          .$children[0]
          .search = this.input
      },
      borrar(){ console.log('borrar')
        this.input = ''
        this.buscar()
      }
    },
    computed: {
      isDisable: function () {
        return !(this.isDepartureCity() && this.isArrivalCity())
      }
    },
  }
</script>
