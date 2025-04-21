import { createApp } from 'vue'
import App from "./App.vue";
import router from "./router";
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// 导入Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// 导入中文语言包
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

const app = createApp(App)
const pinia = createPinia()
// 使用持久化插件
pinia.use(piniaPluginPersistedstate)

// 使用ElementPlus，并配置中文
app.use(ElementPlus, {
  locale: zhCn
})

app.use(router)
app.use(pinia)
app.mount("#app");
