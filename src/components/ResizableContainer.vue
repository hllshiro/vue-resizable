<!-- ResizableContainer.vue -->
<template>
  <div class="resize-container" :class="direction" ref="containerRef">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { provide, ref, onMounted, nextTick, reactive } from "vue";
import {
  RESIZE_DIRECTION,
  CONTAINER_REF,
  REGISTER_PANEL,
  UNREGISTER_PANEL,
  UPDATE_PANEL_VISIBILITY,
  REINITIALIZE_PANELS,
  UPDATE_PANEL_RATIO,
  SYNC_PANEL_RATIOS,
  type PanelState,
  type ContainerState,
} from "../types";

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
provide(RESIZE_DIRECTION, props.direction);
provide(CONTAINER_REF, containerRef);

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

provide(REGISTER_PANEL, registerPanel);
provide(UNREGISTER_PANEL, unregisterPanel);
provide(UPDATE_PANEL_VISIBILITY, updatePanelVisibility);

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

  const panels = Array.from(containerRef.value.children).filter((child) =>
    child.classList.contains("resize-panel")
  ) as HTMLElement[];

  panels.forEach((panel) => {
    const hasFixedWidth = panel.style.width?.includes("px");
    const hasFixedHeight = panel.style.height?.includes("px");

    if (hasFixedWidth || hasFixedHeight) {
      console.warn(
        "[vue-resizable] 检测到使用 style 设置面板固定尺寸。" +
          "建议使用 ratio 属性替代。固定尺寸设置将被忽略。"
      );

      // 清除固定尺寸样式
      panel.style.width = "";
      panel.style.height = "";
    }
  });
};

// 初始化面板 - 基于 ratio 使用 flex-basis 百分比分配空间
const initializePanels = () => {
  if (!containerRef.value) return;

  // 首先检测并清除旧用法
  detectLegacyUsage();

  const visiblePanels = Array.from(containerState.panels.values()).filter(
    (panel) => panel.visible
  );

  if (visiblePanels.length === 0) return;

  const isHorizontal = props.direction === "horizontal";
  containerState.totalSpace = getContainerSize();

  // 计算所有可见面板的ratio总和
  const totalRatio = visiblePanels.reduce((sum, panel) => sum + panel.ratio, 0);

  if (totalRatio === 0) return;

  // 为每个面板分配基于ratio的百分比
  visiblePanels.forEach((panel) => {
    const element = panel.element;

    // 计算百分比：(panel.ratio / totalRatio) * 100
    const percentage = (panel.ratio / totalRatio) * 100;

    // 使用 flex-basis 百分比模式
    element.style.flexBasis = `${percentage}%`;
    element.style.flexGrow = "0";
    element.style.flexShrink = "0";

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
    // 重新初始化所有面板以重新计算百分比分配
    nextTick(() => {
      initializePanels();
    });
  }
};

// 根据当前flex-basis百分比值同步更新面板ratio状态
const syncPanelRatios = () => {
  const visiblePanels = Array.from(containerState.panels.values()).filter(
    (panel) => panel.visible
  );

  if (visiblePanels.length === 0) return;

  // 获取所有可见面板的当前flex-basis百分比值
  const flexBasisValues = visiblePanels.map((panel) => {
    const basisStr = panel.element.style.flexBasis || "0%";
    const currentBasis = parseFloat(basisStr); // 获取百分比数值
    return { panel, basis: currentBasis };
  });

  // 计算总的百分比值（理论上应该接近100）
  const totalBasis = flexBasisValues.reduce((sum, item) => sum + item.basis, 0);

  // 将百分比转换为ratio比例关系
  if (totalBasis > 0) {
    flexBasisValues.forEach(({ panel, basis }) => {
      // 计算相对比例，将百分比转换为ratio值
      const relativeRatio = (basis / totalBasis) * visiblePanels.length;
      panel.ratio = Math.max(0.1, relativeRatio); // 确保最小值为0.1
    });
  }
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
provide(REINITIALIZE_PANELS, initializePanels);
provide(UPDATE_PANEL_RATIO, updatePanelRatio);
provide(SYNC_PANEL_RATIOS, syncPanelRatios);

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
