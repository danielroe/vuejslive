import { createApp } from 'vue'
import { renderToString } from 'vue/server-renderer'

import App from '../app.vue'

export default defineEventHandler(async event => {
  const template = await useStorage().getItem('templates:index.html')

  const app = createApp(App, {})
  const html = await renderToString(app)

  return template.replace('<main id="root"></main>', `<main id="root">${html}</main>`)
})
