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

const startDrag = (e: MouseEvent) => {
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

  // 获取初始尺寸
  const prevRect = prevPanel.getBoundingClientRect();
  const nextRect = nextPanel.getBoundingClientRect();
  const prevInitialSize = isHorizontal ? prevRect.width : prevRect.height;
  const nextInitialSize = isHorizontal ? nextRect.width : nextRect.height;

  // 获取最小尺寸约束
  const prevMinSize = getPanelMinSize(prevPanel, isHorizontal);
  const nextMinSize = getPanelMinSize(nextPanel, isHorizontal);

  const startPos = isHorizontal ? e.clientX : e.clientY;

  const doDrag = (moveEvent: MouseEvent) => {
    const currentPos = isHorizontal ? moveEvent.clientX : moveEvent.clientY;
    const delta = currentPos - startPos;

    // 如果移动距离太小，直接返回
    if (Math.abs(delta) < 1) {
      return;
    }

    // 计算新的尺寸
    const newPrevSize = prevInitialSize + delta;
    const newNextSize = nextInitialSize - delta;

    // 检查最小尺寸约束
    if (newPrevSize < prevMinSize || newNextSize < nextMinSize) {
      return;
    }

    // 新的比例模式：直接调整flex-grow比例
    const totalSize = prevInitialSize + nextInitialSize;
    if (totalSize > 0) {
      const prevRatio = Math.max(0.1, newPrevSize / totalSize);
      const nextRatio = Math.max(0.1, newNextSize / totalSize);
      
      // 获取当前的flex-grow值作为基础权重
      const prevCurrentGrow = parseFloat(prevPanel.style.flexGrow || "1");
      const nextCurrentGrow = parseFloat(nextPanel.style.flexGrow || "1");
      const totalGrow = prevCurrentGrow + nextCurrentGrow;
      
      // 按新比例重新分配flex-grow
      prevPanel.style.flexGrow = String(totalGrow * prevRatio);
      nextPanel.style.flexGrow = String(totalGrow * nextRatio);
      
      // 确保面板使用flex模式
      prevPanel.style.flexShrink = "1";
      prevPanel.style.flexBasis = "0";
      nextPanel.style.flexShrink = "1";
      nextPanel.style.flexBasis = "0";
      
      // 清除可能的固定尺寸
      if (isHorizontal) {
        prevPanel.style.width = "";
        nextPanel.style.width = "";
      } else {
        prevPanel.style.height = "";
        nextPanel.style.height = "";
      }
    }
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
