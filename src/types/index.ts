import type { Component, App, Ref, InjectionKey } from "vue";

// Panel State Interface
export interface PanelState {
  id: string;
  element: HTMLElement;
  visible: boolean;
  lastSize: number;
  minSize: number;
  ratio: number;
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
  ratio?: number; // 面板初始大小比例，默认值为 1
}

export interface ResizableSplitterProps {
  // Currently no specific props, behavior controlled by parent container
}

// Event Interfaces
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
export const RESIZE_DIRECTION: InjectionKey<'horizontal' | 'vertical'> = Symbol('RESIZE_DIRECTION');
export const CONTAINER_REF: InjectionKey<Ref<HTMLElement | undefined>> = Symbol('CONTAINER_REF');
export const REGISTER_PANEL: InjectionKey<(panel: PanelState) => void> = Symbol('REGISTER_PANEL');
export const UNREGISTER_PANEL: InjectionKey<(panelId: string) => void> = Symbol('UNREGISTER_PANEL');
export const UPDATE_PANEL_VISIBILITY: InjectionKey<(panelId: string, visible: boolean) => void> = Symbol('UPDATE_PANEL_VISIBILITY');
export const REINITIALIZE_PANELS: InjectionKey<() => void> = Symbol('REINITIALIZE_PANELS');
export const UPDATE_PANEL_RATIO: InjectionKey<(panelId: string, newRatio: number) => void> = Symbol('UPDATE_PANEL_RATIO');
export const SYNC_PANEL_RATIOS: InjectionKey<() => void> = Symbol('SYNC_PANEL_RATIOS');
