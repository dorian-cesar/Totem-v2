<template>
  <div class="px-5 selector-origin-destiny">
    <!-- Input select departure -->
    <b-row align-h="center">
      <b-col cols="12">
        <select-input
          v-bind="propsDepartureCity"
          @selectedValue="propsDepartureCity.selected = $event"
          @selectedStatus="action('select-origin', $event)"
          ref="select-origin"
        />
      </b-col>
    </b-row>
    <hr>
    <!-- Input select arrival -->
    <b-row align-h="center">
      <b-col cols="12">
        <select-input
          v-bind="propsArrivalCity"
          @selectedValue="propsArrivalCity.selected = $event"
          @selectedStatus="action('select-arrival', $event)"
          ref="select-arrival"
        />
      </b-col>
    </b-row>
  </div>
</template>

<script>
import Select from "@/components/Select.vue";
import {mapActions} from "vuex";
import ImgOrigin from '@/assets/img/origin.svg'
import ImgDestiny from '@/assets/img/destination.svg'

export default {
  name: "OriginDestination",
  data: () => ({
    // Props departure city,
    ImgOrigin,
    ImgDestiny,
    propsDepartureCity: {
      caption: "ORIGEN",
      icon: ImgOrigin,
      options: [],
      placeholder: "Seleccione el origen",
      selected: "",
      reset: false,
      preSelectLabel: PRESELECT_LABEL,
      preSelectValue: PRESELECT_VALUE,
      imgClass: 'origin-img-class',
    },
    // Props arrival city
    propsArrivalCity: {
      caption: "DESTINO",
      icon: ImgDestiny,
      options: [],
      placeholder: "Seleccione el destino",
      selected: "",
      reset: false,
      imgClass: 'destiny-img-class',
    },
  }),
  components: {selectInput: Select},
  watch: {
    "propsDepartureCity.selected": function () {
      // Reset arrival city values
      if (!this.propsDepartureCity.selected) {
        // default city
        this.propsDepartureCity.selected = {
          label: PRESELECT_LABEL,
          value: PRESELECT_VALUE,
        };
      }
      this.setArrivalCity();
      // Reset the options in input select arrival when the
      // departure city is select
      if (this.propsDepartureCity.selected) {
        this.propsArrivalCity.options = [];
        this.getListArrivalCities();
        this.$emit("selected", true);
      }
    },

    "propsArrivalCity.selected": function () {
      if (this.propsArrivalCity.selected) {
        // Save values in the store
        this.setValues();
        this.$emit("selected", true);
      }
    },
  },
  mounted() {
    // Get list of departure cities
    this.getListDepartureCities();
    //this.setArrivalCity()
  },
  methods: {
    // Map store
    ...mapActions("TravelSelection", ["setDepartureCity", "setArrivalCity"]),

    eliminarRepetidos(data) {
      let hash = {};
      let unique = data.filter((o) =>
        hash[o.value] ? false : (hash[o.value] = true)
      );
      return unique;
    },

    getListDepartureCities: async function () {
      try {
        // api antigua
        // const proxy = "https://gds.ticketsimply.us"
        // const API_KEY = "TSSDFPAPI30103014"
        const proxy = "https://newstg3-gdsbus.kupos.cl"
        const API_KEY = "TSXFQYAPI25766888"
        const api = `/gds/api/cities.json?api_key=${API_KEY}`

        const response = await this.axios.get([proxy, api].join("/"), {
          headers: {
            'content-type': 'application/json',
          }
        })
        let results = response.data.result;
        results.shift();
        let data = []
        for (let result of results) {
          const r = {
            label: result[1],
            value: result[0]
          }
          data.push(r)
        }
        this.propsDepartureCity.options = this.eliminarRepetidos(data)
      } catch (error) {
        console.error(error)
      }
    },

    // Get arrival cities
    getListArrivalCities: async function () {
      try {
        // api antigua
        // const proxy = "https://gds.ticketsimply.us"
        // const API_KEY = "TSSDFPAPI30103014"
        const proxy = "https://newstg3-gdsbus.kupos.cl"
        const API_KEY = "TSXFQYAPI25766888"
        const api = `/gds/api/cities.json?api_key=${API_KEY}`
        const body = this.propsDepartureCity.selected.value

        const response = await this.axios.get([proxy, api].join("/"), {
          headers: {
            'content-type': 'application/json',
          }
        })
        let results = response.data.result;
        results.shift();
        let data = []
        for (let result of results) {
          const r = {
            label: result[1],
            value: result[0]
          }
          data.push(r)
        }

        this.propsArrivalCity.options = this.eliminarRepetidos(data)
        this.propsArrivalCity.reset = false
      } catch (error) {
        console.error(error)
      }
    },

    // Set the values of the cities in the store
    setValues() {
      this.setDepartureCity({
        name: this.propsDepartureCity.selected.label,
        code: this.propsDepartureCity.selected.value,
      });

      this.setArrivalCity({
        name: this.propsArrivalCity.selected.label,
        code: this.propsArrivalCity.selected.value,
      });
    },
    action(name, val) {
      this.$emit("selectAction", {name: name, status: val});
    },
  },
};
</script>
