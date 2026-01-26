import { createApp } from 'vue'
import App from './App.vue'
import Chat from '../../dist/vue-beautiful-chat.umd.js'
import vmodal from 'vue-js-modal'

const app = createApp(App)
app.use(vmodal, {dialog: true})
app.use(Chat)
app.mount('#app')
