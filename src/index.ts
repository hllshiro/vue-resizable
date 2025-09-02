import type { App } from "vue";
import ResizableContainer from "./components/ResizableContainer.vue";
import ResizablePanel from "./components/ResizablePanel.vue";
import ResizableSplitter from "./components/ResizableSplitter.vue";

// Export types
export type {
  ResizableContainerProps,
  ResizablePanelProps,
  ResizableSplitterProps,
  VueResizablePlugin,
  ResizableContainerComponent,
  ResizablePanelComponent,
  ResizableSplitterComponent,
  VueResizableComponents,
} from "./types";

// Export individual components for tree-shaking (named exports)
export { ResizableContainer, ResizablePanel, ResizableSplitter };

// Plugin installation interface
export const VueResizable = {
  install(app: App) {
    app.component("ResizableContainer", ResizableContainer);
    app.component("ResizablePanel", ResizablePanel);
    app.component("ResizableSplitter", ResizableSplitter);
  },
};

// Default export for plugin installation
export default VueResizable;
