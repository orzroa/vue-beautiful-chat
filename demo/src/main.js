import { createApp } from 'vue'
import App from './App.vue'
import Chat from '../../dist/vue-beautiful-chat.umd.js'
import '../../dist/style.css'
// import vmodal from 'vue-js-modal' // temporarily disabled due to Vue 3 compatibility

console.log('Chat plugin:', Chat)

const app = createApp(App)
// app.use(vmodal, {dialog: true})
try {
  app.use(Chat)
} catch (error) {
  console.error('Failed to install Chat plugin:', error)
}

app.config.errorHandler = (err, instance, info) => {
  console.error('Vue error:', err, info)
}

app.mount('#app')
