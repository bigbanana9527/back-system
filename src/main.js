import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/element.js'
import './assets/css/global.css'
import 'element-ui/lib/theme-chalk/index.css'
import './assets/fonts/iconfont.css'
import TreeTable from 'vue-table-with-tree-grid'
//导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
//导入富文本编辑器对应样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme


Vue.use(VueQuillEditor, /* { default global options } */)

//导入nprogress包对应的js和css
import Nprogress from 'nprogress'
import 'nprogress/nprogress.css'

//配置请求根路径
import axios from 'axios'
axios.defaults.baseURL='http://127.0.0.1:8888/api/private/v1/'
//通过axios请求拦截器添加token，保证拥有获取数据的权限。
//在request拦截器中，展示进度条Nprogress.start()
axios.interceptors.request.use(config=>{
  Nprogress.start()
  //console.log(config)
  //为请求头对象，添加Token验证的Authorization字段
  config.headers.Authorization=window.sessionStorage.getItem('token')
  return config
})
//在response拦截器中，隐藏进度条Nprogress.done()
axios.interceptors.response.use(config=>{
  Nprogress.done()
  return config
})
Vue.prototype.$http=axios
Vue.component('tree-table',TreeTable)
Vue.filter('dateFormat',function(originVal){
  const dt =new Date(originVal)
  const y=dt.getFullYear()
  const m=(dt.getMonth()+1+'').padStart(2,'0')
  const d=(dt.getDate()+'').padStart(2,'0')

  const h=(dt.getHours()+'').padStart(2,'0')
  const mm=(dt.getMonth()+1+'').padStart(2,'0')
  const s=(dt.getSeconds()+1+'').padStart(2,'0')
  return `${y}-${m}-${d} -${h}-${mm}-${s}` 



})

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
