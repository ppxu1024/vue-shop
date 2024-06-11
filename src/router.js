import Vue from "vue";
import VueRouter from "vue-router";
import Login from "./components/Login.vue";
import Home from "./components/Home.vue";

Vue.use(VueRouter);
// 需要拿到一个路由对象挂载导航守卫
const router = new VueRouter({
  routes: [
    // 只要访问根路径就重定向到login
    { path: "/", redirect: "/login" },
    { path: "/login", component: Login },
    { path: "/home", component: Home },
  ],
});

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 代表将要访问的路径
  // from代表从哪个路径跳转而来
  // next是一个函数，表示放行
  // 两种调用方式：next() 放行  next('/login') 强制跳转到login
  if (to.path === "/login") return next();
  // 获取token
  const tokenStr = window.sessionStorage.getItem("token");
  if (!tokenStr) return next("/login");
  next();
});

export default router;
