import { createApp } from "vue";
import App from "./App.vue";

// 使用包名导入，模拟外部应用使用已发布包的场景
import VueResizable from "@hllshiro/vue-resizable";
import "@hllshiro/vue-resizable/style.css";

const app = createApp(App);
app.use(VueResizable);
app.mount("#app");
