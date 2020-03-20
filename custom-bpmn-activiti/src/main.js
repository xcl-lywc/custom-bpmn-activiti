import Vue from 'vue'
import App from './App.vue'
	
//引用公用js
import commonJS from "./js/common.js"
Vue.prototype.common = commonJS;

//引用customform组件
import 'customform/src/components/index.js'
import 'customform/lib/customform.common.js'

// Element-ui
import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
Vue.use(Element)

// 阻止启动生产消息
Vue.config.productionTip = false

// 全局引入axios 并配置
import axios from 'axios'
axios.defaults.headers['X-Requested-With'] = 'XMLHttpRequest';
Vue.prototype.axios = axios;

/******************axios拦截器****************/

// Vue.prototype.axios.defaults.headers.common['Authorization'] = `Bearer ${JSON.parse(sessionStorage.getItem("Access-Token"))}`;

//response 拦截
Vue.prototype.axios.interceptors.response.use(
  response => {
    //请求成功的拦截
    // 当meta信息为空时，表示后台回传的文件流
    if(!response.data.meta) return response;

    if (response.data.meta.code != 0) { 

      if(response.data.meta.code == 401 || response.data.meta.code == 405) {
        setTimeout(() => {
          window.location.href = window.location.origin + "/web/login"
        }, 1500)
        return Promise.reject("登录验证失效, 请重新登录");
      } else if (response.data.meta.code == 403) {
        setTimeout(() => {
          window.location.href = window.location.origin + "/web/login"
        }, 2000)
        return Promise.reject("您的权限已被修改, 请重新登录");
      } else {
        return Promise.reject(response.data.meta.message)
      }
    } else {
      return response
    }
  }, 
  error => {
    console.log(error.response)
    if(error.response.data.meta){
      return Promise.reject(error.response.data.meta.message);
    }else{
      return Promise.reject(error.response.statusText||error.response.data||error.response.data.error||error.response.data.message);
    }
  }
);

new Vue({
  render: h => h(App),
}).$mount('#app')
