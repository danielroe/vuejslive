<script>
import '@picocss/pico'
import { ref } from 'vue'

export default {
  setup () {
    return {
      message: ref('So nice to be here!')
    }
  }
}
</script>

<template>
  <div class="container">
    <h1>
      👋 Hi Vue.js London!
    </h1>
    <p>
      {{ message }}
    </p>
    <button @click="message = 'Let me know what you think!'">Click me!</button>
  </div>
</template>

