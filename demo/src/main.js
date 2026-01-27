import { createApp } from 'vue'
import App from './App.vue'
import Chat from '../../dist/vue-beautiful-chat.es.js'
import '../../dist/style.css'

const app = createApp(App)
app.use(Chat)
app.mount('#app')
