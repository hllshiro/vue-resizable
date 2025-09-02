import { type App, type Plugin } from "vue";
import resizableContainer from "./resizableContainer.vue";
import resizablePanel from "./resizablePanel.vue";
import resizableSplitter from "./resizableSplitter.vue";

export const Vueresizable: Plugin = {
  install(app: App) {
    app.component("resizableContainer", resizableContainer);
    app.component("resizablePanel", resizablePanel);
    app.component("resizableSplitter", resizableSplitter);
  },
};

// 导出单个组件用于按需引入
export { resizableContainer, resizablePanel, resizableSplitter };

// 默认导出插件安装方式
export default Vueresizable;
