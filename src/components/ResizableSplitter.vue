<!-- ResizableSplitter.vue -->
<template>
  <div
    v-show="isVisible"
    class="resize-splitter"
    :class="[direction, { active: isActive }]"
    @mousedown.prevent="startDrag"
    @dblclick.prevent="onDoubleClick"
    ref="splitterRef"
  ></div>
</template>

<script setup lang="ts">
import { inject, ref, onMounted, nextTick, onUnmounted } from "vue";
import {
  RESIZE_DIRECTION,
  CONTAINER_REF,
  SYNC_PANEL_RATIOS,
  type ResizableSplitterProps,
} from "../types";

const props = withDefaults(defineProps<ResizableSplitterProps>(), {
  allowSplit: true,
});

const direction = inject(RESIZE_DIRECTION)!;
const containerRef = inject(CONTAINER_REF);
const syncPanelRatios = inject(SYNC_PANEL_RATIOS);
const splitterRef = ref<HTMLElement>();

const isActive = ref(false);

// 计算分割器是否可见
const isVisible = ref(true);

// 检查相邻面板的可见性
const checkAdjacentPanelsVisibility = (): boolean => {
  if (!splitterRef.value) return false;

  const prevElement = splitterRef.value.previousElementSibling as HTMLElement;
  const nextElement = splitterRef.value.nextElementSibling as HTMLElement;

  // 获取相邻的面板元素（跳过其他分割器）
  let prevPanel: HTMLElement | null = null;
  let nextPanel: HTMLElement | null = null;

  // 向前找到最近的面板
  let current = prevElement;
  while (current && !prevPanel) {
    if (current.classList.contains("resize-panel")) {
      prevPanel = current;
      break;
    }
    current = current.previousElementSibling as HTMLElement;
  }

  // 向后找到最近的面板
  current = nextElement;
  while (current && !nextPanel) {
    if (current.classList.contains("resize-panel")) {
      nextPanel = current;
      break;
    }
    current = current.nextElementSibling as HTMLElement;
  }

  // 如果没有两个相邻面板，隐藏分割器
  if (!prevPanel || !nextPanel) {
    return false;
  }

  // 检查两个面板是否都可见（使用 v-show 的逻辑）
  const prevVisible =
    prevPanel.style.display !== "none" &&
    getComputedStyle(prevPanel).display !== "none";
  const nextVisible =
    nextPanel.style.display !== "none" &&
    getComputedStyle(nextPanel).display !== "none";

  return prevVisible && nextVisible;
};

// 更新分割器可见性
const updateVisibility = () => {
  const shouldBeVisible = checkAdjacentPanelsVisibility();
  isVisible.value = shouldBeVisible;
};

// 监听 DOM 变化以更新可见性
const observeContainerChanges = () => {
  if (!containerRef?.value) return;

  const observer = new MutationObserver((mutations) => {
    let shouldUpdate = false;

    mutations.forEach((mutation) => {
      // 监听子元素的添加/删除
      if (mutation.type === "childList") {
        shouldUpdate = true;
      }
      // 监听 style 属性的变化（特别是 display）
      else if (
        mutation.type === "attributes" &&
        mutation.attributeName === "style"
      ) {
        const target = mutation.target as HTMLElement;
        if (target.classList.contains("resize-panel")) {
          shouldUpdate = true;
        }
      }
    });

    if (shouldUpdate) {
      nextTick(() => {
        updateVisibility();
      });
    }
  });

  // 监听容器的子元素变化和属性变化
  observer.observe(containerRef.value, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["style"],
  });

  return observer;
};

// 监听容器内面板的显隐状态变化
let mutationObserver: MutationObserver | undefined = undefined;

onMounted(() => {
  nextTick(() => {
    updateVisibility();
    mutationObserver = observeContainerChanges();
  });
});

// 清理资源
const cleanup = () => {
  if (mutationObserver) {
    mutationObserver.disconnect();
    mutationObserver = undefined;
  }
};

// 组件卸载时清理
onUnmounted(() => {
  cleanup();
});

// 获取面板的最小尺寸
const getPanelMinSize = (panel: HTMLElement, isHorizontal: boolean) => {
  const style = getComputedStyle(panel);
  return isHorizontal
    ? parseInt(style.minWidth) || 0
    : parseInt(style.minHeight) || 0;
};

const onDoubleClick = () => {
  if (!props.allowSplit) return;
  if (!splitterRef.value || !containerRef?.value || !isVisible.value) return;

  const prevPanel = splitterRef.value.previousElementSibling as HTMLElement;
  const nextPanel = splitterRef.value.nextElementSibling as HTMLElement;

  if (!prevPanel || !nextPanel) return;

  const isHorizontal = direction === "horizontal";
  const containerSize = isHorizontal
    ? containerRef.value.getBoundingClientRect().width
    : containerRef.value.getBoundingClientRect().height;

  if (containerSize <= 0) return;

  const prevBasis = parseFloat(prevPanel.style.flexBasis) || 0;
  const nextBasis = parseFloat(nextPanel.style.flexBasis) || 0;
  const totalBasis = prevBasis + nextBasis;

  if (totalBasis <= 0) return;

  let newPrevBasis = totalBasis / 2;
  let newNextBasis = totalBasis / 2;

  const prevMinSize = getPanelMinSize(prevPanel, isHorizontal);
  const nextMinSize = getPanelMinSize(nextPanel, isHorizontal);
  const minPrevBasis = (prevMinSize / containerSize) * 100;
  const minNextBasis = (nextMinSize / containerSize) * 100;

  if (minPrevBasis + minNextBasis > totalBasis) {
    return; // Not enough space to satisfy min sizes
  }

  if (newPrevBasis < minPrevBasis) {
    newPrevBasis = minPrevBasis;
    newNextBasis = totalBasis - newPrevBasis;
  } else if (newNextBasis < minNextBasis) {
    newNextBasis = minNextBasis;
    newPrevBasis = totalBasis - newNextBasis;
  }

  prevPanel.style.flexBasis = `${newPrevBasis}%`;
  nextPanel.style.flexBasis = `${newNextBasis}%`;

  if (syncPanelRatios) {
    syncPanelRatios();
  }
};

const startDrag = (e: MouseEvent) => {
  if (!splitterRef.value || !containerRef?.value || !isVisible.value) return;

  isActive.value = true;

  const prevPanel = splitterRef.value.previousElementSibling as HTMLElement;
  const nextPanel = splitterRef.value.nextElementSibling as HTMLElement;

  if (!prevPanel || !nextPanel) return;

  const prevVisible =
    prevPanel.style.display !== "none" &&
    getComputedStyle(prevPanel).display !== "none";
  const nextVisible =
    nextPanel.style.display !== "none" &&
    getComputedStyle(nextPanel).display !== "none";

  if (!prevVisible || !nextVisible) {
    isActive.value = false;
    return;
  }

  const isHorizontal = direction === "horizontal";
  const containerSize = isHorizontal
    ? containerRef.value.getBoundingClientRect().width
    : containerRef.value.getBoundingClientRect().height;

  if (!containerSize || containerSize <= 0) {
    isActive.value = false;
    return;
  }

  // 将所有面板转换为百分比模式，以确保拖拽基于一个统一的基准
  const allPanels = Array.from(containerRef.value.children).filter((child) =>
    child.classList.contains("resize-panel")
  ) as HTMLElement[];

  const panelSizes = allPanels.map((panel) => {
    const rect = panel.getBoundingClientRect();
    return { panel, size: isHorizontal ? rect.width : rect.height };
  });

  const totalSize = panelSizes.reduce((sum, item) => sum + item.size, 0);

  if (totalSize > 0) {
    panelSizes.forEach(({ panel, size }) => {
      const percentage = (size / totalSize) * 100;
      panel.style.flexBasis = `${percentage}%`;
      panel.style.flexGrow = "0";
      panel.style.flexShrink = "0";
      panel.style.width = "";
      panel.style.height = "";
    });
  }

  // --- 增量更新算法所需变量 ---
  const initialMousePosition = isHorizontal ? e.clientX : e.clientY;
  const initialPrevBasis = parseFloat(prevPanel.style.flexBasis);
  const initialNextBasis = parseFloat(nextPanel.style.flexBasis);
  // 锁定两个面板的总 Basis，实现“零和博弈”
  const totalBasis = initialPrevBasis + initialNextBasis;

  const doDrag = (moveEvent: MouseEvent) => {
    const currentMousePosition = isHorizontal
      ? moveEvent.clientX
      : moveEvent.clientY;
    const delta = currentMousePosition - initialMousePosition;

    // 将像素差值转换为百分比差值
    const deltaPercentage = (delta / containerSize) * 100;

    // 计算理论上的新 Basis
    let newPrevBasis = initialPrevBasis + deltaPercentage;
    let newNextBasis = initialNextBasis - deltaPercentage;

    // 获取最小尺寸约束（转换为百分比）
    const prevMinSize = getPanelMinSize(prevPanel, isHorizontal);
    const nextMinSize = getPanelMinSize(nextPanel, isHorizontal);
    const minPrevBasis = (prevMinSize / containerSize) * 100;
    const minNextBasis = (nextMinSize / containerSize) * 100;

    // 应用约束，同时保持总和不变
    if (newPrevBasis < minPrevBasis) {
      newPrevBasis = minPrevBasis;
      newNextBasis = totalBasis - newPrevBasis;
    } else if (newNextBasis < minNextBasis) {
      newNextBasis = minNextBasis;
      newPrevBasis = totalBasis - newNextBasis;
    }

    // 设置新的 flex-basis
    prevPanel.style.flexBasis = `${newPrevBasis}%`;
    nextPanel.style.flexBasis = `${newNextBasis}%`;
  };

  const stopDrag = () => {
    isActive.value = false;

    if (syncPanelRatios) {
      syncPanelRatios();
    }

    document.removeEventListener("mousemove", doDrag);
    document.removeEventListener("mouseup", stopDrag);
  };

  document.addEventListener("mousemove", doDrag);
  document.addEventListener("mouseup", stopDrag, { once: true });
};

// 暴露方法供外部调用
defineExpose({
  updateVisibility,
  isVisible: () => isVisible.value,
  checkAdjacentPanelsVisibility,
});
</script>

<style>
.resize-splitter {
  background: #e0e0e0;
  transition: background-color 0.2s;
  flex-shrink: 0;
  flex-grow: 0;
  box-sizing: border-box;
}

.resize-splitter.horizontal {
  width: 5px;
  min-width: 5px;
  cursor: col-resize;
}

.resize-splitter.vertical {
  height: 5px;
  min-height: 5px;
  cursor: row-resize;
}

.resize-splitter.active {
  background: #2196f3;
}

.resize-splitter:hover {
  background: #90caf9;
}
</style>