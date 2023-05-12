import { createSSRApp } from 'vue'
import App from '../app.vue'

const app = createSSRApp(App)
app.mount('#root')
