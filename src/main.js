import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(console.warn)
  })
}

createApp(App).mount('#root')
