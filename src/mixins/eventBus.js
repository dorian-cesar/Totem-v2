import { reactive } from 'vue';

export const eventBus = reactive({
  isFormValid: false,
  updateFormValidity(status) {
    this.isFormValid = status;
  },
});