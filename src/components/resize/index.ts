import { type App, type Plugin } from "vue";
import ResizeableContainer from "./ResizeableContainer.vue";
import ResizeablePanel from "./ResizeablePanel.vue";
import ResizeableSplitter from "./ResizeableSplitter.vue";

export const VueResizeable: Plugin = {
  install(app: App) {
    app.component("ResizeableContainer", ResizeableContainer);
    app.component("ResizeablePanel", ResizeablePanel);
    app.component("ResizeableSplitter", ResizeableSplitter);
  },
};

// 导出单个组件用于按需引入
export { ResizeableContainer, ResizeablePanel, ResizeableSplitter };

// 默认导出插件安装方式
export default VueResizeable;
