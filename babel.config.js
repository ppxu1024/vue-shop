// 此配置文件全局共享，不论项目开发阶段、项目发布阶段还是项目测试阶段

// 项目发布阶段需要用到的babel插件
const prodPlugins = []
// 项目发布阶段
if (process.env.NODE_ENV === 'production') {
  prodPlugins.push('transform-remove-console')
}

module.exports = {
  presets: ['@vue/cli-plugin-babel/preset'],
  plugins: [
    [
      'component',
      {
        libraryName: 'element-ui',
        styleLibraryName: 'theme-chalk',
      },
    ],
    // ...是展开运算符，就是把数组中的每一项放到另一个数组中
    // 发布产品时候的插件数组
    ...prodPlugins,
    // 此插件实现路由懒加载
    '@babel/plugin-syntax-dynamic-import',
  ],
}
