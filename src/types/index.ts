import type { Component, App } from "vue";

// Panel State Interface
export interface PanelState {
  id: string;
  element: HTMLElement;
  visible: boolean;
  lastSize: number;
  isFixed: boolean;
  minSize: number;
  flexGrow: number;
}

// Container State Interface
export interface ContainerState {
  panels: Map<string, PanelState>;
  totalSpace: number;
  availableSpace: number;
}

// Component Props Interfaces
export interface ResizableContainerProps {
  direction: "horizontal" | "vertical";
}

export interface ResizablePanelProps {
  show?: boolean; // 控制面板显示和隐藏的属性
}

export interface ResizableSplitterProps {
  // Currently no specific props, behavior controlled by parent container
}

// Event Interfaces
export interface PanelVisibilityEvents {
  panelShow: [panelId: string];
  panelHide: [panelId: string];
}

export interface ContainerLayoutEvents {
  layoutChange: [layout: ContainerState];
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

// Utility Types
export type PanelId = string;
export type LayoutDirection = "horizontal" | "vertical";
export type FlexGrowValue = number;
export type SizeValue = number;

// Provider/Inject Keys (for type safety)
export const INJECTION_KEYS = {
  RESIZE_DIRECTION: 'resizeDirection' as const,
  CONTAINER_REF: 'containerRef' as const,
  REGISTER_PANEL: 'registerPanel' as const,
  UNREGISTER_PANEL: 'unregisterPanel' as const,
  UPDATE_PANEL_VISIBILITY: 'updatePanelVisibility' as const,
  REINITIALIZE_PANELS: 'reinitializePanels' as const,
  HANDLE_PANEL_SHOW: 'handlePanelShow' as const,
  HANDLE_PANEL_HIDE: 'handlePanelHide' as const,
} as const;

// Layout Calculation Types
export interface LayoutCalculationOptions {
  respectMinSizes: boolean;
  preserveFlexRatios: boolean;
  smoothTransitions: boolean;
}

export interface SpaceDistributionStrategy {
  type: 'proportional' | 'equal' | 'weighted';
  weights?: number[];
}

// Configuration Interface
export interface ResizableConfig {
  defaultMinSize: number;
  transitionDuration: number;
  enableSmartSplitters: boolean;
  layoutCalculation: LayoutCalculationOptions;
  spaceDistribution: SpaceDistributionStrategy;
}
