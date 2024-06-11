import Vue from 'vue'
// {}表示按需导入，需要什么导入什么
// 导入弹框提示组件Message
import { Button, Form, FormItem, Input, Message } from 'element-ui'

Vue.use(Button)
// 用Vue.use把他们注册为全局可用的对象
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
// Message需要进行全局挂载,挂载为Vue原型上的一个属性
// $message是一个自定义属性，可自己更改名字
Vue.prototype.$message = Message
