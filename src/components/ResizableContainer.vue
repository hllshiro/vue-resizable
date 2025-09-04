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
  minSize: number;
  ratio: number;
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

// 检测旧用法并提供警告
const detectLegacyUsage = () => {
  if (!containerRef.value) return;
  
  const panels = Array.from(containerRef.value.children)
    .filter(child => child.classList.contains("resize-panel")) as HTMLElement[];
  
  panels.forEach(panel => {
    const hasFixedWidth = panel.style.width?.includes('px');
    const hasFixedHeight = panel.style.height?.includes('px');
    
    if (hasFixedWidth || hasFixedHeight) {
      console.warn(
        '[vue-resizable] 检测到使用 style 设置面板固定尺寸。' +
        '建议使用 ratio 属性替代。固定尺寸设置将被忽略。'
      );
      
      // 清除固定尺寸样式
      panel.style.width = "";
      panel.style.height = "";
    }
  });
};

// 初始化面板 - 基于 ratio 分配空间
const initializePanels = () => {
  if (!containerRef.value) return;

  // 首先检测并清除旧用法
  detectLegacyUsage();

  const visiblePanels = Array.from(containerState.panels.values())
    .filter(panel => panel.visible);
  
  if (visiblePanels.length === 0) return;

  const isHorizontal = props.direction === "horizontal";
  containerState.totalSpace = getContainerSize();

  // 为每个面板设置基于 ratio 的 flex 属性
  visiblePanels.forEach(panel => {
    const element = panel.element;
    
    // 设置 flex 属性
    element.style.flexGrow = panel.ratio.toString();
    element.style.flexShrink = "1";
    element.style.flexBasis = "0";
    
    // 清除可能的固定尺寸样式
    element.style.width = "";
    element.style.height = "";
    
    // 保持最小尺寸约束
    if (isHorizontal) {
      element.style.minWidth = `${panel.minSize}px`;
    } else {
      element.style.minHeight = `${panel.minSize}px`;
    }
  });

  emit("layoutChange", containerState);
};

// 重新计算布局 - 面板显隐时调用（基于 ratio）
const recalculateLayout = () => {
  if (!containerRef.value || containerState.panels.size === 0) return;

  containerState.totalSpace = getContainerSize();

  // 获取所有可见面板
  const visiblePanels = Array.from(containerState.panels.values()).filter(
    (p) => p.visible
  );
  
  if (visiblePanels.length === 0) {
    containerState.availableSpace = 0;
    return;
  }

  // 重新初始化所有面板以重新分配比例
  initializePanels();

  emit("layoutChange", containerState);
};



// 更新指定面板的ratio值（用于拖拽后保持状态）
const updatePanelRatio = (panelId: string, newRatio: number) => {
  const panel = containerState.panels.get(panelId);
  if (panel) {
    panel.ratio = newRatio;
    // 同步更新DOM元素的flex-grow
    panel.element.style.flexGrow = newRatio.toString();
  }
};

// 根据当前flex-grow值同步更新面板ratio状态
const syncPanelRatios = () => {
  const visiblePanels = Array.from(containerState.panels.values())
    .filter(panel => panel.visible);
  
  if (visiblePanels.length === 0) return;
  
  // 获取所有可见面板的当前flex-grow值
  const flexGrowValues = visiblePanels.map(panel => {
    const currentFlexGrow = parseFloat(panel.element.style.flexGrow || "1");
    return { panel, flexGrow: currentFlexGrow };
  });
  
  // 计算总的flex-grow值
  const totalFlexGrow = flexGrowValues.reduce((sum, item) => sum + item.flexGrow, 0);
  
  // 保持相对比例，但规范化为理解的数值
  if (totalFlexGrow > 0) {
    flexGrowValues.forEach(({ panel, flexGrow }) => {
      // 计算相对比例，保持原有的比例关系
      const relativeRatio = flexGrow / totalFlexGrow * visiblePanels.length;
      panel.ratio = Math.max(0.1, relativeRatio); // 确保最小值为0.1
    });
  }
};

// 处理面板显示 - 重新分配比例
const handlePanelShow = (panelId: string) => {
  const panel = containerState.panels.get(panelId);
  if (!panel) return;

  panel.visible = true;
  
  // 重新初始化所有面板以重新分配比例
  nextTick(() => {
    initializePanels();
  });
};

// 处理面板隐藏 - 保存尺寸
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
    panel.flexGrow = parseFloat(panel.element.style.flexGrow || "1");
  }

  panel.visible = false;
  
  // 重新初始化所有面板以重新分配比例
  nextTick(() => {
    initializePanels();
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
provide("updatePanelRatio", updatePanelRatio);
provide("syncPanelRatios", syncPanelRatios);
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
