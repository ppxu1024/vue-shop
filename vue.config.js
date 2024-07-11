module.exports = {
  chainWebpack: (config) => {
    // config.when()可判断当前所处的编译模式，process.env.NODE_ENV拿到当前的编译模式：开发还是发布
    // 产品发布模式
    config.when(process.env.NODE_ENV === 'production', (config) => {
      // 新增自己的打包入口文件
      config.entry('app').clear().add('./src/main-prod.js')

      //使用externals设置排除项
      config.set('externals', {
        vue: 'Vue',
        'vue-router': 'VueRouter',
        axios: 'axios',
        lodash: '_',
        echarts: 'echarts',
        nprogress: 'NProgress',
        'vue-quill-editor': 'VueQuillEditor',
      })

      config.plugin('html').tap((args) => {
        args[0].isProd = true
        return args
      })
    })
    // 产品开发模式
    config.when(process.env.NODE_ENV === 'development', (config) => {
      config.entry('app').clear().add('./src/main-dev.js')

      config.plugin('html').tap((args) => {
        args[0].isProd = false
        return args
      })
    })
  },
}
