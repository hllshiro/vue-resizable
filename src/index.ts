import { type App, type Plugin } from "vue";
import ResizableContainer from "./components/ResizableContainer.vue";
import ResizablePanel from "./components/ResizablePanel.vue";
import ResizableSplitter from "./components/ResizableSplitter.vue";

export const VueResizable: Plugin = {
  install(app: App) {
    app.component("ResizableContainer", ResizableContainer);
    app.component("ResizablePanel", ResizablePanel);
    app.component("ResizableSplitter", ResizableSplitter);
  },
};

// 导出单个组件用于按需引入
export { ResizableContainer, ResizablePanel, ResizableSplitter };

// 默认导出插件安装方式
export default VueResizable;
