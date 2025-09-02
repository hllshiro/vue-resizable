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
    ? parseInt(style.minWidth) || 50
    : parseInt(style.minHeight) || 50;
};

const startDrag = (e: MouseEvent) => {
  if (!splitterRef.value || !containerRef?.value) return;

  isActive.value = true;

  const prevPanel = splitterRef.value.previousElementSibling as HTMLElement;
  const nextPanel = splitterRef.value.nextElementSibling as HTMLElement;

  if (!prevPanel || !nextPanel) return;

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

    // 检查面板是否为固定尺寸
    const prevIsFixed = prevPanel.style.flexGrow === "0";
    const nextIsFixed = nextPanel.style.flexGrow === "0";

    if (prevIsFixed && nextIsFixed) {
      // 两个都是固定尺寸，直接调整像素值
      if (isHorizontal) {
        prevPanel.style.width = `${newPrevSize}px`;
        prevPanel.style.flexBasis = `${newPrevSize}px`;
        nextPanel.style.width = `${newNextSize}px`;
        nextPanel.style.flexBasis = `${newNextSize}px`;
      } else {
        prevPanel.style.height = `${newPrevSize}px`;
        prevPanel.style.flexBasis = `${newPrevSize}px`;
        nextPanel.style.height = `${newNextSize}px`;
        nextPanel.style.flexBasis = `${newNextSize}px`;
      }
    } else if (!prevIsFixed && !nextIsFixed) {
      // 两个都是弹性面板，调整flex-grow比例
      const totalSize = prevInitialSize + nextInitialSize;
      const prevRatio = newPrevSize / totalSize;
      const nextRatio = newNextSize / totalSize;

      // 确保比例合理
      if (prevRatio > 0.05 && nextRatio > 0.05) {
        const growTotal =
          parseFloat(prevPanel.style.flexGrow || "1") +
          parseFloat(nextPanel.style.flexGrow || "1");

        prevPanel.style.flexGrow = String(growTotal * prevRatio);
        nextPanel.style.flexGrow = String(growTotal * nextRatio);
      }
    } else {
      // 混合情况：一个固定一个弹性
      // 策略：将弹性面板转换为固定面板，实现更直观的调整
      if (prevIsFixed && !nextIsFixed) {
        // 前面板固定，后面板弹性 -> 将后面板也转为固定
        nextPanel.style.flexGrow = "0";
        nextPanel.style.flexShrink = "0";

        if (isHorizontal) {
          prevPanel.style.width = `${newPrevSize}px`;
          prevPanel.style.flexBasis = `${newPrevSize}px`;
          nextPanel.style.width = `${newNextSize}px`;
          nextPanel.style.flexBasis = `${newNextSize}px`;
        } else {
          prevPanel.style.height = `${newPrevSize}px`;
          prevPanel.style.flexBasis = `${newPrevSize}px`;
          nextPanel.style.height = `${newNextSize}px`;
          nextPanel.style.flexBasis = `${newNextSize}px`;
        }
      } else if (!prevIsFixed && nextIsFixed) {
        // 前面板弹性，后面板固定 -> 将前面板也转为固定
        prevPanel.style.flexGrow = "0";
        prevPanel.style.flexShrink = "0";

        if (isHorizontal) {
          prevPanel.style.width = `${newPrevSize}px`;
          prevPanel.style.flexBasis = `${newPrevSize}px`;
          nextPanel.style.width = `${newNextSize}px`;
          nextPanel.style.flexBasis = `${newNextSize}px`;
        } else {
          prevPanel.style.height = `${newPrevSize}px`;
          prevPanel.style.flexBasis = `${newPrevSize}px`;
          nextPanel.style.height = `${newNextSize}px`;
          nextPanel.style.flexBasis = `${newNextSize}px`;
        }
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
