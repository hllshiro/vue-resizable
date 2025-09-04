<!-- ResizableSplitter.vue -->
<template>
  <div
    v-show="isVisible"
    class="resize-splitter"
    :class="[direction, { active: isActive }]"
    @mousedown.prevent="startDrag"
    ref="splitterRef"
  ></div>
</template>

<script setup lang="ts">
import { inject, ref, onMounted, nextTick } from "vue";
import type { Ref } from "vue";

const direction = inject<"horizontal" | "vertical">("resizeDirection")!;
const containerRef = inject<Ref<HTMLElement | undefined>>("containerRef");
const syncPanelRatios = inject<() => void>("syncPanelRatios");
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
import { onUnmounted } from "vue";
onUnmounted(() => {
  cleanup();
});

// 获取面板的最小尺寸
const getPanelMinSize = (panel: HTMLElement, isHorizontal: boolean) => {
  const style = getComputedStyle(panel);
  return isHorizontal
    ? parseInt(style.minWidth) || 50
    : parseInt(style.minHeight) || 50;
};

const startDrag = (_e: MouseEvent) => {
  if (!splitterRef.value || !containerRef?.value || !isVisible.value) return;

  isActive.value = true;

  const prevPanel = splitterRef.value.previousElementSibling as HTMLElement;
  const nextPanel = splitterRef.value.nextElementSibling as HTMLElement;

  if (!prevPanel || !nextPanel) return;

  // 确保相邻面板都可见
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

  // 获取容器当前尺寸
  const containerSize = isHorizontal
    ? containerRef.value?.getBoundingClientRect().width
    : containerRef.value?.getBoundingClientRect().height;

  if (!containerSize || containerSize <= 0) {
    isActive.value = false;
    return;
  }

  // 在拖拽开始时，锁定相邻两个面板的总尺寸，避免拖拽过程中尺寸持续变化
  const prevRect = prevPanel.getBoundingClientRect();
  const nextRect = nextPanel.getBoundingClientRect();
  const initialPrevSize = isHorizontal ? prevRect.width : prevRect.height;
  const initialNextSize = isHorizontal ? nextRect.width : nextRect.height;
  const lockedAdjacentTotalSize = initialPrevSize + initialNextSize;

  // 获取初始的面板起始位置，用于计算鼠标相对位置
  const initialPrevStart = isHorizontal ? prevRect.left : prevRect.top;

  // 在拖拽开始前，确保所有面板都使用百分比模式，避免尺寸跳跃
  const allPanels = Array.from(containerRef.value.children).filter((child) =>
    child.classList.contains("resize-panel")
  ) as HTMLElement[];

  // 获取当前所有面板的实际尺寸
  const panelSizes = allPanels.map((panel) => {
    const rect = panel.getBoundingClientRect();
    const size = isHorizontal ? rect.width : rect.height;
    return { panel, size };
  });

  // 计算总尺寸
  const totalSize = panelSizes.reduce((sum, item) => sum + item.size, 0);

  // 将所有面板转换为百分比模式，保持当前尺寸不变
  if (totalSize > 0) {
    panelSizes.forEach(({ panel, size }) => {
      const percentage = (size / totalSize) * 100;
      panel.style.flexBasis = `${percentage}%`;
      panel.style.flexGrow = "0";
      panel.style.flexShrink = "0";

      // 清除固定尺寸
      if (isHorizontal) {
        panel.style.width = "";
      } else {
        panel.style.height = "";
      }
    });
  }

  const doDrag = (moveEvent: MouseEvent) => {
    // 获取容器当前尺寸（用于转换为百分比）
    const currentContainerSize = isHorizontal
      ? containerRef.value?.getBoundingClientRect().width
      : containerRef.value?.getBoundingClientRect().height;

    if (!currentContainerSize || currentContainerSize <= 0) return;

    // 使用锁定的相邻面板总尺寸，而不是实时获取
    const adjacentTotalSize = lockedAdjacentTotalSize;

    // 计算鼠标相对于初始面板起始位置的偏移
    const mousePositionInAdjacent = isHorizontal
      ? moveEvent.clientX - initialPrevStart
      : moveEvent.clientY - initialPrevStart;

    // 计算在相邻面板范围内的目标分割比例
    let targetSplitRatio = mousePositionInAdjacent / adjacentTotalSize;

    // 获取最小尺寸约束
    const prevMinSize = getPanelMinSize(prevPanel, isHorizontal);
    const nextMinSize = getPanelMinSize(nextPanel, isHorizontal);

    // 计算最小尺寸约束在相邻面板中的比例
    const minPrevRatio = prevMinSize / adjacentTotalSize;
    const minNextRatio = nextMinSize / adjacentTotalSize;

    // 应用约束，但只在相邻两个面板范围内
    targetSplitRatio = Math.max(minPrevRatio, targetSplitRatio);
    targetSplitRatio = Math.min(1 - minNextRatio, targetSplitRatio);

    // 使用锁定的总尺寸计算新的相邻面板尺寸
    const newPrevSize = adjacentTotalSize * targetSplitRatio;
    const newNextSize = adjacentTotalSize * (1 - targetSplitRatio);

    // 转换为百分比（相对于整个容器）
    const newPrevBasis = (newPrevSize / currentContainerSize) * 100;
    const newNextBasis = (newNextSize / currentContainerSize) * 100;

    // 设置新的flex-basis百分比，只调整相邻两个面板
    prevPanel.style.flexBasis = `${newPrevBasis}%`;
    nextPanel.style.flexBasis = `${newNextBasis}%`;
  };

  const stopDrag = () => {
    isActive.value = false;

    // 拖拽结束后同步面板的ratio状态，而不是重新初始化
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
