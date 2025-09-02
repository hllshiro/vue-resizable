import type { Component, App } from "vue";

// Component Props Interfaces
export interface ResizableContainerProps {
  direction: "horizontal" | "vertical";
}

export interface ResizablePanelProps {
  // Currently no specific props, serves as content container
}

export interface ResizableSplitterProps {
  // Currently no specific props, behavior controlled by parent container
}

// Plugin Interface
export interface VueResizablePlugin {
  install(app: App): void;
}

// Component Type Definitions
export type ResizableContainerComponent = Component<ResizableContainerProps>;
export type ResizablePanelComponent = Component<ResizablePanelProps>;
export type ResizableSplitterComponent = Component<ResizableSplitterProps>;

// Export all component types
export interface VueResizableComponents {
  ResizableContainer: ResizableContainerComponent;
  ResizablePanel: ResizablePanelComponent;
  ResizableSplitter: ResizableSplitterComponent;
}
