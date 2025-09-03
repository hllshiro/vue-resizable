<!-- ResizableContainer.vue -->
<template>
  <div class="resize-container" :class="direction" ref="containerRef">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { provide, ref, onMounted, nextTick, reactive } from "vue";

interface PanelState {
  id: string;
  element: HTMLElement;
  visible: boolean;
  lastSize: number;
  isFixed: boolean;
  minSize: number;
  flexGrow: number;
}

interface ContainerState {
  panels: Map<string, PanelState>;
  totalSpace: number;
  availableSpace: number;
}

const props = defineProps<{
  direction: "horizontal" | "vertical";
}>();

const emit = defineEmits<{
  layoutChange: [layout: ContainerState];
}>();

const containerRef = ref<HTMLElement>();
const containerState = reactive<ContainerState>({
  panels: new Map(),
  totalSpace: 0,
  availableSpace: 0,
});

// 提供给子组件的方法
provide("resizeDirection", props.direction);
provide("containerRef", containerRef);

// 注册面板
const registerPanel = (panelState: PanelState) => {
  containerState.panels.set(panelState.id, panelState);
  // 延迟初始化以确保 DOM 完全渲染
  nextTick(() => {
    initializePanels();
  });
};

// 注销面板
const unregisterPanel = (panelId: string) => {
  containerState.panels.delete(panelId);
  nextTick(() => {
    recalculateLayout();
  });
};

// 更新面板可见性
const updatePanelVisibility = (panelId: string, visible: boolean) => {
  const panel = containerState.panels.get(panelId);
  if (panel) {
    panel.visible = visible;
    nextTick(() => {
      recalculateLayout();
    });
  }
};

provide("registerPanel", registerPanel);
provide("unregisterPanel", unregisterPanel);
provide("updatePanelVisibility", updatePanelVisibility);

// 获取容器的可用空间
const getContainerSize = () => {
  if (!containerRef.value) return 0;

  const rect = containerRef.value.getBoundingClientRect();
  const isHorizontal = props.direction === "horizontal";
  return isHorizontal ? rect.width : rect.height;
};

// 初始化面板 - 使用flex-grow方式（混合方法）
const initializePanels = () => {
  if (!containerRef.value) return;

  // 使用原始的DOM查询方式获取面板，确保兼容性
  const panels = Array.from(containerRef.value.children).filter((child) =>
    child.classList.contains("resize-panel")
  ) as HTMLElement[];

  if (panels.length === 0) return;

  const isHorizontal = props.direction === "horizontal";
  containerState.totalSpace = getContainerSize();

  // 计算有固定尺寸的面板（原始逻辑）
  const panelConfigs = panels.map((panel: HTMLElement) => {
    const inlineStyle = panel.style;
    const sizeValue = isHorizontal ? inlineStyle.width : inlineStyle.height;

    if (sizeValue && sizeValue.includes("px")) {
      const size = parseInt(sizeValue);
      return { panel, fixedSize: size > 0 ? size : null, isFixed: size > 0 };
    }

    return { panel, fixedSize: null, isFixed: false };
  });

  // 为面板设置flex属性（原始逻辑）
  panelConfigs.forEach((config: any) => {
    if (config.isFixed && config.fixedSize) {
      // 固定大小的面板
      if (isHorizontal) {
        config.panel.style.width = `${config.fixedSize}px`;
        config.panel.style.flexGrow = "0";
        config.panel.style.flexShrink = "0";
        config.panel.style.flexBasis = `${config.fixedSize}px`;
      } else {
        config.panel.style.height = `${config.fixedSize}px`;
        config.panel.style.flexGrow = "0";
        config.panel.style.flexShrink = "0";
        config.panel.style.flexBasis = `${config.fixedSize}px`;
      }
    } else {
      // 可伸缩的面板
      config.panel.style.flexGrow = "1";
      config.panel.style.flexShrink = "1";
      config.panel.style.flexBasis = "0";
      if (isHorizontal) {
        config.panel.style.width = "auto";
      } else {
        config.panel.style.height = "auto";
      }
    }
  });

  // 同步更新面板状态到新的状态管理系统
  panelConfigs.forEach((config: any) => {
    const panelElement = config.panel;
    const panelId = panelElement.getAttribute('data-panel-id');
    
    if (panelId && containerState.panels.has(panelId)) {
      const panelState = containerState.panels.get(panelId)!;
      panelState.isFixed = config.isFixed;
      panelState.lastSize = config.fixedSize || 0;
      panelState.flexGrow = config.isFixed ? 0 : 1;
    }
  });

  emit("layoutChange", containerState);
};

// 重新计算布局 - 面板显隐时调用（简化逻辑）
const recalculateLayout = () => {
  if (!containerRef.value || containerState.panels.size === 0) return;

  const isHorizontal = props.direction === "horizontal";
  containerState.totalSpace = getContainerSize();

  // 获取所有可见面板
  const visiblePanels = Array.from(containerState.panels.values()).filter(
    (p) => p.visible
  );
  
  if (visiblePanels.length === 0) {
    containerState.availableSpace = 0;
    return;
  }

  // 简化策略：重新计算所有可见面板的布局，不进行复杂的空间重分配
  let fixedSpace = 0;
  const flexiblePanels: PanelState[] = [];
  
  // 计算固定面板占用的空间
  visiblePanels.forEach((panel) => {
    if (panel.isFixed && panel.lastSize > 0) {
      fixedSpace += panel.lastSize;
      // 确保固定面板保持其尺寸
      updatePanelSize(panel, isHorizontal);
    } else {
      flexiblePanels.push(panel);
    }
  });

  // 计算剩余可用空间
  containerState.availableSpace = containerState.totalSpace - fixedSpace;

  // 更新弹性面板，让它们平均分配剩余空间
  if (flexiblePanels.length > 0) {
    flexiblePanels.forEach((panel) => {
      panel.element.style.flexGrow = "1";
      panel.element.style.flexShrink = "1";
      panel.element.style.flexBasis = "0";
      
      if (isHorizontal) {
        panel.element.style.width = "auto";
      } else {
        panel.element.style.height = "auto";
      }
    });
  }

  emit("layoutChange", containerState);
};



// 更新面板尺寸
const updatePanelSize = (panel: PanelState, isHorizontal: boolean) => {
  if (panel.isFixed) {
    if (isHorizontal) {
      panel.element.style.width = `${panel.lastSize}px`;
      panel.element.style.flexBasis = `${panel.lastSize}px`;
    } else {
      panel.element.style.height = `${panel.lastSize}px`;
      panel.element.style.flexBasis = `${panel.lastSize}px`;
    }
  }
};

// 处理面板显示 - 恢复尺寸（简化逻辑）
const handlePanelShow = (panelId: string) => {
  const panel = containerState.panels.get(panelId);
  if (!panel) return;

  panel.visible = true;
  
  // 直接调用重新计算布局，让Flexbox处理空间分配
  nextTick(() => {
    recalculateLayout();
  });
};

// 处理面板隐藏 - 保存尺寸（修复逻辑）
const handlePanelHide = (panelId: string) => {
  const panel = containerState.panels.get(panelId);
  if (!panel) return;

  // 隐藏前保存当前实际尺寸
  const rect = panel.element.getBoundingClientRect();
  const isHorizontal = props.direction === "horizontal";
  const currentSize = isHorizontal ? rect.width : rect.height;
  
  // 只有当尺寸大于0时才保存，避免保存错误值
  if (currentSize > 0) {
    panel.lastSize = currentSize;
    // 检查是否为固定尺寸面板
    panel.isFixed = panel.element.style.flexGrow === "0";
    if (!panel.isFixed) {
      panel.flexGrow = parseFloat(panel.element.style.flexGrow || "1");
    }
  }

  panel.visible = false;
  
  // 重新计算布局
  nextTick(() => {
    recalculateLayout();
  });
};

// 监听容器尺寸变化
const resizeObserver = new ResizeObserver(() => {
  nextTick(() => {
    recalculateLayout();
  });
});

onMounted(async () => {
  await nextTick();

  if (containerRef.value) {
    resizeObserver.observe(containerRef.value);
  }

  const tryInitialize = (attempts = 0) => {
    if (attempts > 10) return;

    if (!containerRef.value || containerRef.value.offsetWidth === 0) {
      setTimeout(() => tryInitialize(attempts + 1), 50);
      return;
    }

    initializePanels();
  };

  setTimeout(() => tryInitialize(), 100);
});

// 提供重新初始化的方法
provide("reinitializePanels", initializePanels);
provide("handlePanelShow", handlePanelShow);
provide("handlePanelHide", handlePanelHide);

// 暴露方法供外部调用
defineExpose({
  recalculateLayout,
  getContainerState: () => containerState,
  getVisiblePanels: () =>
    Array.from(containerState.panels.values()).filter((p) => p.visible),
  getHiddenPanels: () =>
    Array.from(containerState.panels.values()).filter((p) => !p.visible),
});
</script>

<style>
.resize-container {
  display: flex;
  overflow: hidden;
  flex-wrap: nowrap;
  width: 100%;
  height: 100%;
}

.horizontal {
  flex-direction: row;
}

.vertical {
  flex-direction: column;
}
</style>
