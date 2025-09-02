<!-- ResizableSplitter.vue -->
<template>
  <div
    class="resize-splitter"
    :class="[direction, { active: isActive }]"
    @mousedown.prevent="startDrag"
    ref="splitterRef"
  ></div>
</template>

<script setup lang="ts">
import { inject, ref, type Ref } from "vue";

const direction = inject<"horizontal" | "vertical">("resizeDirection")!;
const containerRef = inject<Ref<HTMLElement | undefined>>("containerRef");
const splitterRef = ref<HTMLElement>();

const isActive = ref(false);

const getPanelMinSize = (panel: HTMLElement, isHorizontal: boolean) => {
  const style = getComputedStyle(panel);
  return isHorizontal
    ? parseInt(style.minWidth) || 0
    : parseInt(style.minHeight) || 0;
};

const getPanelMaxSize = (panel: HTMLElement, isHorizontal: boolean) => {
  const style = getComputedStyle(panel);
  const maxSize = isHorizontal ? style.maxWidth : style.maxHeight;
  return maxSize && maxSize !== "none" ? parseInt(maxSize) : Infinity;
};

const startDrag = (e: MouseEvent) => {
  if (!splitterRef.value || !containerRef?.value) return;

  isActive.value = true;

  const prevPanel = splitterRef.value.previousElementSibling as HTMLElement;
  const nextPanel = splitterRef.value.nextElementSibling as HTMLElement;

  if (!prevPanel || !nextPanel) return;

  const isHorizontal = direction === "horizontal";
  const containerSize = isHorizontal
    ? containerRef.value.offsetWidth
    : containerRef.value.offsetHeight;

  // 获取所有splitter的总大小
  const allSplitters = Array.from(containerRef.value.children).filter((child) =>
    child.classList.contains("resize-splitter")
  ) as HTMLElement[];

  const totalSplitterSize = allSplitters.reduce((total, splitter) => {
    return (
      total + (isHorizontal ? splitter.offsetWidth : splitter.offsetHeight)
    );
  }, 0);

  const availableSize = containerSize - totalSplitterSize;

  // 获取当前面板的实际像素大小（更精确）
  const prevPixelSize = isHorizontal
    ? prevPanel.offsetWidth
    : prevPanel.offsetHeight;
  const nextPixelSize = isHorizontal
    ? nextPanel.offsetWidth
    : nextPanel.offsetHeight;

  const prevMin = getPanelMinSize(prevPanel, isHorizontal);
  const nextMin = getPanelMinSize(nextPanel, isHorizontal);
  const prevMax = getPanelMaxSize(prevPanel, isHorizontal);
  const nextMax = getPanelMaxSize(nextPanel, isHorizontal);

  const startPos = isHorizontal ? e.clientX : e.clientY;

  const doDrag = (moveEvent: MouseEvent) => {
    const currentPos = isHorizontal ? moveEvent.clientX : moveEvent.clientY;
    const delta = currentPos - startPos;

    // 基于像素计算新尺寸，提高精度
    let newPrevPixelSize = prevPixelSize + delta;
    let newNextPixelSize = nextPixelSize - delta;

    // 应用最小和最大尺寸约束
    newPrevPixelSize = Math.max(
      prevMin,
      Math.min(prevMax === Infinity ? availableSize : prevMax, newPrevPixelSize)
    );
    newNextPixelSize = Math.max(
      nextMin,
      Math.min(nextMax === Infinity ? availableSize : nextMax, newNextPixelSize)
    );

    // 确保总尺寸不超过可用空间
    const totalPixelSize = newPrevPixelSize + newNextPixelSize;
    const maxTotalPixelSize = prevPixelSize + nextPixelSize;

    if (totalPixelSize > maxTotalPixelSize) {
      const ratio = maxTotalPixelSize / totalPixelSize;
      newPrevPixelSize = Math.round(newPrevPixelSize * ratio);
      newNextPixelSize = Math.round(newNextPixelSize * ratio);
    }

    // 再次检查最小尺寸约束
    if (newPrevPixelSize >= prevMin && newNextPixelSize >= nextMin) {
      // 转换为高精度百分比（保留4位小数）
      const newPrevPercentage =
        Math.round((newPrevPixelSize / availableSize) * 100 * 10000) / 10000;
      const newNextPercentage =
        Math.round((newNextPixelSize / availableSize) * 100 * 10000) / 10000;

      if (isHorizontal) {
        prevPanel.style.width = `${newPrevPercentage}%`;
        prevPanel.style.flexBasis = `${newPrevPercentage}%`;
        nextPanel.style.width = `${newNextPercentage}%`;
        nextPanel.style.flexBasis = `${newNextPercentage}%`;
      } else {
        prevPanel.style.height = `${newPrevPercentage}%`;
        prevPanel.style.flexBasis = `${newPrevPercentage}%`;
        nextPanel.style.height = `${newNextPercentage}%`;
        nextPanel.style.flexBasis = `${newNextPercentage}%`;
      }
    }
  };

  const stopDrag = () => {
    isActive.value = false;
    document.removeEventListener("mousemove", doDrag);
    document.removeEventListener("mouseup", stopDrag);
  };

  document.addEventListener("mousemove", doDrag);
  document.addEventListener("mouseup", stopDrag, { once: true });
};
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
