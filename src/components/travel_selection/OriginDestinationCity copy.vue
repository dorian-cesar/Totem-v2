<template>
  <div class="px-5">
    <!-- Input select departure -->
    <b-row align-h="center" class="pt-5 pb-5">
      <b-col cols="12">
        <select-input
          v-bind="propsDepartureCity"
          @selectedValue="propsDepartureCity.selected = $event"
          @selectedStatus="action('select-origin', $event)"
          ref="select-origin"
        />
      </b-col>
    </b-row>
    <!-- Input select arrival -->
    <b-row align-h="center" class="pt-5 pb-5">
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
import { mapActions } from "vuex";
import axios from "axios";

export default {
  name: "OriginDestination",
  data: () => ({
    // Props departure city
    propsDepartureCity: {
      caption: "ORIGEN",
      options: [],
      placeholder: "Seleccione el origen",
      selected: null,
      reset: false,
      preSelectLabel: PRESELECT_LABEL,
      preSelectValue: PRESELECT_VALUE,
    },
    // Props arrival city
    propsArrivalCity: {
      caption: "DESTINO",
      options: [],
      placeholder: "Seleccione el destino",
      selected: null,
      reset: false,
    },
  }),
  components: { selectInput: Select },
  watch: {
    "propsDepartureCity.selected": function(newVal) {
      if (newVal) {
        this.setDepartureCity({ name: newVal.label, code: newVal.value })
        this.getListArrivalCities(newVal.value)
        this.$emit("selected", { type: 'departure', value: newVal })
      }
    },
    "propsArrivalCity.selected": function(newVal) {
      if (newVal) {
       this.setArrivalCity({ name: newVal.label, code: newVal.value })
       this.$emit("selected", { type: 'arrival', value: newVal }) // <-- y aquí
      }
    },
  },
  async mounted() {
    await this.getListDepartureCities();
    if (this.propsDepartureCity.options.length > 0) {
      const santiago = this.propsDepartureCity.options.find(
        city => city.value === PRESELECT_VALUE
      );
      if (santiago) {
        this.propsDepartureCity.selected = santiago;
      }
    }
  },
  methods: {
    ...mapActions("TravelSelection", ["setDepartureCity", "setArrivalCity"]),

    formatCityData(cities) {
      return cities.map(city => ({
        label: city[0].split(",")[0].trim(),
        value: city[1]
      }));
    },

    // Get departure cities
    async getListDepartureCities() {
      try {
        const response = await axios.get("https://preprod-pullmanbus.kupos.cl/api/uniq_cities");
        this.propsDepartureCity.options = this.formatCityData(response.data);
        
        // Eliminar duplicados
        this.propsDepartureCity.options = this.removeDuplicates(this.propsDepartureCity.options);
      } catch (error) {
        console.error("Error loading departure cities:", error);
      }
    },

    // Get arrival cities
    async getListArrivalCities(departureId) {
      try {
        if (!departureId) return;
        
        this.propsArrivalCity.options = [];
        this.propsArrivalCity.selected = null;
        
        const response = await axios.get(
          `https://preprod-pullmanbus.kupos.cl/api/uniq_cities`
        );
        
        this.propsArrivalCity.options = this.formatCityData(response.data);
        this.propsArrivalCity.options = this.removeDuplicates(this.propsArrivalCity.options);
        this.propsArrivalCity.reset = false;
      } catch (error) {
        console.error("Error loading arrival cities:", error);
      }
    },

    removeDuplicates(cities) {
      const unique = [];
      const seen = new Set();
      
      for (const city of cities) {
        if (!seen.has(city.value)) {
          seen.add(city.value);
          unique.push(city);
        }
      }
      
      return unique;
    },

    action(name, val) {
      this.$emit("selectAction", { name: name, status: val });
    },
  },
};
</script>