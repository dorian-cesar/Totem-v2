<template>
  <div class="px-5">
    <b-row align-h="center" class="pt-5 pb-5">
      <b-col cols="12">
        <select-input
          v-bind="propsDepartureCity"
          @selectedValue="handleDepartureSelect"
          @selectedStatus="action('select-origin', $event)"
          ref="select-origin"
        />
      </b-col>
    </b-row>
    <b-row align-h="center" class="pt-5 pb-5">
      <b-col cols="12">
        <select-input
          v-bind="propsArrivalCity"
          @selectedValue="handleArrivalSelect"
          @selectedStatus="action('select-arrival', $event)"
          ref="select-arrival"
        />
      </b-col>
    </b-row>
  </div>
</template>

<script>
import Select from "@/components/Select.vue"
import { mapActions } from "vuex"
import axios from "axios"

const SANTIAGO_ID = 1646
const SANTIAGO_LABEL = "Santiago"

export default {
  name: "OriginDestination",
  data: () => ({
    propsDepartureCity: {
      caption: "ORIGEN",
      options: [],
      placeholder: "Seleccione el origen",
      selected: null,
      preSelectLabel: SANTIAGO_LABEL,
      preSelectValue: SANTIAGO_ID
    },
    propsArrivalCity: {
      caption: "DESTINO",
      options: [],
      placeholder: "Seleccione el destino",
      selected: null
    }
  }),
  components: { selectInput: Select },
  async mounted() {
    await this.loadDepartureCities()
  },
  methods: {
    ...mapActions("TravelSelection", ["setDepartureCity", "setArrivalCity"]),

    async loadDepartureCities() {
      try {
        const response = await axios.get("https://preprod-pullmanbus.kupos.cl/api/uniq_cities")
        this.propsDepartureCity.options = this.formatCities(response.data)
        
        const santiago = this.propsDepartureCity.options.find(c => c.value === SANTIAGO_ID)
        if (santiago) {
          this.propsDepartureCity.selected = santiago
          this.handleDepartureSelect(santiago)
        }
      } catch (error) {
        console.error("Error loading cities:", error)
      }
    },

    async loadArrivalCities() {
      try {
        const response = await axios.get(
          `https://preprod-pullmanbus.kupos.cl/api/uniq_cities`
        )
        this.propsArrivalCity.options = this.formatCities(response.data)
      } catch (error) {
        console.error("Error loading arrival cities:", error)
      }
    },

    formatCities(cities) {
      return cities.map(city => ({
        label: city[0].split(",")[0].trim(), // Solo el nombre de la ciudad
        value: city[1] // ID de la ciudad
      }))
    },

    handleDepartureSelect(city) {
      this.propsDepartureCity.selected = city
      this.setDepartureCity({
        name: city.label,
        code: city.value
      })
      this.resetArrivalCities()
      this.loadArrivalCities(city.value)
      this.$emit("selected", true)
    },

    handleArrivalSelect(city) {
      this.propsArrivalCity.selected = city
      this.setArrivalCity({
        name: city.label,
        code: city.value
      })
      this.$emit("selected", true)
    },

    resetArrivalCities() {
      this.propsArrivalCity.options = []
      this.propsArrivalCity.selected = null
    },

    action(name, val) {
      this.$emit("selectAction", { name: name, status: val })
    }
  }
}
</script>