const isProd = process.env.NODE_ENV === 'production'
const path = require('path')

module.exports = {
  lintOnSave: false,
  productionSourceMap: isProd,
  publicPath: isProd ? '/vue-beautiful-chat/' : '/',
  configureWebpack: {
    resolve: {
      alias: {
        // 确保所有 Vue 导入都指向同一个实例
        'vue': path.resolve(__dirname, 'node_modules/vue')
      }
    }
  }
}
