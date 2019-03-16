import Vue from 'vue'
import '../plugins/element.js'
import axios from 'axios'
import VueAxios from 'vue-axios'
import LoginPage from './login.vue'

Vue.use(VueAxios, axios)

Vue.config.productionTip = false

new Vue({
    render: h => h(LoginPage),
}).$mount('#app')