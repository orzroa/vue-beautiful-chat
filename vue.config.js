const {defineConfig} = require('@vue/cli-service')
const isProd = process.env.NODE_ENV === 'production'

module.exports = defineConfig({
  lintOnSave: false,
  productionSourceMap: isProd,
  css: {
    extract: false
  }
})
