import Vue from 'vue'

import { library } from '@fortawesome/fontawesome-svg-core'

import {
  faMapMarkerAlt,
  faCalendarAlt,
  faArrowRight,
  faArrowLeft,
  faBackspace,
  faArrowUp,
  faExclamationTriangle,
  faPlusSquare,
  faTicketAlt,
  faSpinner,
  faCheckCircle,
  faPhoneVolume,
  faBus,
  faCircle
} from '@fortawesome/free-solid-svg-icons'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(
  faMapMarkerAlt,
  faCalendarAlt,
  faArrowRight,
  faArrowLeft,
  faBackspace,
  faArrowUp,
  faExclamationTriangle,
  faPlusSquare,
  faTicketAlt,
  faSpinner,
  faCheckCircle,
  faPhoneVolume,
  faBus,
  faCircle
)

Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.config.productionTip = false
