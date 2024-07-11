import Vue from 'vue'
import VueRouter from 'vue-router'

// import Login from './components/Login.vue'
// 路由懒加载形式，提高运行效率
const Login = () =>
  import(/* webpackChunkName: "login_home_welcome" */ './components/Login.vue')
// import Home from './components/Home.vue'
const Home = () =>
  import(/* webpackChunkName: "login_home_welcome" */ './components/Home.vue')
// import Welcome from './components/Welcome.vue'
const Welcome = () =>
  import(
    /* webpackChunkName: "login_home_welcome" */ './components/Welcome.vue'
  )

// import Users from './components/user/Users.vue'
const Users = () =>
  import(
    /* webpackChunkName: "users_rights_roles" */ './components/user/Users.vue'
  )
// import Rights from './components/power/Rights.vue'
const Rights = () =>
  import(
    /* webpackChunkName: "users_rights_roles" */ './components/power/Rights.vue'
  )
// import Roles from './components/power/Roles.vue'
const Roles = () =>
  import(
    /* webpackChunkName: "users_rights_roles" */ './components/power/Roles.vue'
  )

// import Cate from './components/goods/Cate.vue'
const Cate = () =>
  import(/* webpackChunkName: "cate_params" */ './components/goods/Cate.vue')
// import Params from './components/goods/Params.vue'
const Params = () =>
  import(/* webpackChunkName: "cate_params" */ './components/goods/Params.vue')

// import GoodsList from './components/goods/List.vue'
const GoodsList = () =>
  import(/* webpackChunkName: "goodslist_add" */ './components/goods/List.vue')
// import Add from './components/goods/Add.vue'
const Add = () =>
  import(/* webpackChunkName: "goodslist_add" */ './components/goods/Add.vue')

// import Order from './components/order/Order.vue'
const Order = () =>
  import(/* webpackChunkName: "order_report" */ './components/order/Order.vue')
// import Report from './components/report/Report.vue'
const Report = () =>
  import(
    /* webpackChunkName: "order_report" */ './components/report/Report.vue'
  )

Vue.use(VueRouter)

// 需要拿到一个路由对象挂载导航守卫
const router = new VueRouter({
  routes: [
    // 只要访问根路径就重定向到login
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    // Welcome嵌套在Home页面中,children[]放子路由
    // 只要访问Home地址，就重定向访问到welcome地址
    // component指定要渲染的组件
    {
      path: '/home',
      component: Home,
      redirect: '/welcome',
      children: [
        { path: '/welcome', component: Welcome },
        { path: '/users', component: Users },
        { path: '/rights', component: Rights },
        { path: '/roles', component: Roles },
        { path: '/categories', component: Cate },
        { path: '/params', component: Params },
        { path: '/goods', component: GoodsList },
        { path: '/goods/add', component: Add },
        { path: '/orders', component: Order },
        { path: '/reports', component: Report },
      ],
    },
  ],
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 代表将要访问的路径
  // from代表从哪个路径跳转而来
  // next是一个函数，表示放行
  // 两种调用方式：next() 放行  next('/login') 强制跳转到login
  if (to.path === '/login') return next()
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
