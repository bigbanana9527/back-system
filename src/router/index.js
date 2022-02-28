import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '@/components/Login'
import Home from '@/components/Home'
import Welcome from '@/components/Welcome'
import Users from '@/components/user/Users.vue'
import Rights from '@/components/Power/Rights'
import Roles from '@/components/Power/Roles'
import Cate from '@/components/goods/Cate'
import Params from '@/components/goods/Params'
import List from '@/components/goods/List'
import Add from '@/components/goods/Add'
import Order from '@/components/order/Order'
import Report from '@/components/report/Report'

Vue.use(VueRouter)

 
  //如果用户没有登录，但是直接通过URL访问特定页面，需要重新导航到登录页面。
  //为路由对象，保加beforeEach导航守卫



const router = new VueRouter({
  routes:[
    {
      path:'/login',
      component:Login
    },
    {
      path:'/',
      redirect:'/login'
    },
    {
      path:'/home',
      component:Home,
      redirect:'/welcome',
      children:[{
        path:'/welcome',
        component:Welcome
      },
      {
        path:'/users',
        component:Users
      },
      {
        path:'/rights',
        component:Rights
      },
      {
        path:'/roles',
        component:Roles
      },
      {
        path:'/categories',
        component:Cate
      },
      {
        path:'/params',
        component:Params
      },
      {
        path:'/goods',
        component:List
      },
      {
        path:'/goods/add',
        component:Add
      },
      {
        path:'/orders',
        component:Order
      },
      {
        path:'/reports',
        component:Report
      },
      ]
    }

  ]
  
})


router.beforeEach((to,from,next)=>{
  if(to.path=='/login') return next();
  const tokenStr=window.sessionStorage.getItem('token')
  if(!tokenStr) return next('/login')
  next();

})

export default router
