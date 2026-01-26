import { createApp } from 'vue'
import App from './App.vue'
import Chat from '../../dist/vue-beautiful-chat.umd.js'
import '../../dist/style.css'
// import vmodal from 'vue-js-modal' // temporarily disabled due to Vue 3 compatibility

console.log('Chat plugin:', Chat)

const app = createApp(App)
// app.use(vmodal, {dialog: true})
console.log('Before installing Chat plugin')
try {
  app.use(Chat)
  console.log('Chat plugin installed successfully')
} catch (error) {
  console.error('Failed to install Chat plugin:', error)
}

// Create error display div
const errorEl = document.createElement('div')
errorEl.id = 'vue-errors'
errorEl.style.position = 'fixed'
errorEl.style.top = '0'
errorEl.style.left = '0'
errorEl.style.background = 'red'
errorEl.style.color = 'white'
errorEl.style.zIndex = '9999'
errorEl.style.padding = '10px'
errorEl.style.fontFamily = 'monospace'
errorEl.style.fontSize = '12px'
document.body.appendChild(errorEl)

app.config.errorHandler = (err, instance, info) => {
  console.error('Vue error:', err, info)
  errorEl.textContent = String(err) + ' ' + info
}

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
})

try {
  app.mount('#app')
} catch (err) {
  console.error('Mount error:', err)
  const appEl = document.getElementById('app')
  if (appEl) {
    appEl.innerHTML = '<div style="color: red; padding: 20px;">Mount error: ' + err.message + '</div>'
  }
}
