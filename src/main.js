import Vue from 'vue'
import App from './views/App'
import router from './router'
import store from './store'
import 'es6-promise/auto'

// PLUGINS
import './plugins/VueAxios'
// import './plugins/ActionCableVue'
import './plugins/BootstrapVue'
import './plugins/VueFontawesome'
import './plugins/vueScrollTo'
import './plugins/IdleVue'

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
