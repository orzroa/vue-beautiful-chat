import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import {resolve} from 'path'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

export default defineConfig({
  plugins: [vue(), cssInjectedByJsPlugin()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'VueBeautifulChat',
      fileName: (format) => `vue-beautiful-chat.${format}.js`
    },
    // 关键配置：不提取 CSS 到单独文件
    cssCodeSplit: true,
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['vue'],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          vue: 'Vue'
        },
        // 可选的：重命名或避免生成 CSS 文件
        assetFileNames: (assetInfo) => {
          // 阻止生成单独的 CSS 文件
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'style.css' // 但插件会注入，所以这个文件可能是空的
          }
          return assetInfo.name
        }
      }
    }
  }
})
