import Vue from 'vue'
import '../plugins/element.js'
import axios from 'axios'
import VueAxios from 'vue-axios'
import normal from './normal.vue'
import VueMoment from 'vue-moment'
//import VueRouter from 'vue-router'

axios.interceptors.request.use(
    config => {
        if (localStorage.token) {
            config.headers.Authorization = "Bearer " + localStorage.token
        }
        return config
    },
    err => {
        return Promise.reject(err)
    }
)

axios.interceptors.response.use(
    response => {
        return response
    },
    error => {
        if (error.response.status === 403) {
            window.location.href = "./login.html"
        }
        return Promise.reject(error)
    }
)


Vue.use(VueAxios, axios)
//Vue.use(VueRouter)
Vue.use(VueMoment);

Vue.config.productionTip = false

new Vue({
    render: h => h(normal),
}).$mount('#app')