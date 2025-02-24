<!-- ResizeSplitter.vue -->
<template>
  <div
    class="resize-splitter"
    :class="[direction, { active: isActive }]"
    @mousedown.prevent="startDrag"
    ref="splitterRef"
  ></div>
</template>

<script setup lang="ts">
  import { inject, ref } from "vue";

  const direction = inject<"horizontal" | "vertical">("resizeDirection")!;
  const splitterRef = ref<HTMLElement>(); // 模板引用

  const isActive = ref(false);

  const startDrag = (e: MouseEvent) => {
    if (!splitterRef.value) return;

    isActive.value = true;
    const getPanelMinSize = (panel: HTMLElement, isHorizontal: boolean) => {
      const style = getComputedStyle(panel);
      return isHorizontal
        ? parseInt(style.minWidth) || 0
        : parseInt(style.minHeight) || 0;
    };
    // 通过模板引用获取元素
    const prevPanel = splitterRef.value.previousElementSibling as HTMLElement;
    const nextPanel = splitterRef.value.nextElementSibling as HTMLElement;

    const isHorizontal = direction === "horizontal";
    const prevSize = isHorizontal
      ? prevPanel.offsetWidth
      : prevPanel.offsetHeight;
    const nextSize = isHorizontal
      ? nextPanel.offsetWidth
      : nextPanel.offsetHeight;
    const prevMin = getPanelMinSize(prevPanel, isHorizontal);
    const nextMin = getPanelMinSize(nextPanel, isHorizontal);
    const startPos = isHorizontal ? e.clientX : e.clientY;

    const doDrag = (moveEvent: MouseEvent) => {
      const currentPos = isHorizontal ? moveEvent.clientX : moveEvent.clientY;
      const delta = currentPos - startPos;
      const newPrev = prevSize + delta;
      const newNext = nextSize - delta;
      if (isHorizontal) {
        if (newPrev >= prevMin && newNext >= nextMin) {
          prevPanel.style.width = `${newPrev}px`;
          nextPanel.style.width = `${newNext}px`;
        }
      } else {
        if (newPrev >= prevMin && newNext >= nextMin) {
          prevPanel.style.height = `${newPrev}px`;
          nextPanel.style.height = `${newNext}px`;
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
    /* position: relative; */
    background: #e0e0e0;
    transition: background-color 0.2s;
  }

  .resize-splitter.horizontal {
    width: 5px;
    cursor: col-resize;
  }

  .resize-splitter.vertical {
    height: 5px;
    cursor: row-resize;
  }

  .resize-splitter.active {
    background: #2196f3;
  }

  .resize-splitter:hover {
    background: #90caf9;
  }
</style>
