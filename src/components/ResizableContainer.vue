<!-- ResizableContainer.vue -->
<template>
  <div class="resize-container" :class="direction" ref="containerRef">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { provide, ref, onMounted, nextTick } from "vue";

const props = defineProps<{
  direction: "horizontal" | "vertical";
}>();

const containerRef = ref<HTMLElement>();

provide("resizeDirection", props.direction);
provide("containerRef", containerRef);

// 初始化面板 - 使用flex-grow方式
const initializePanels = () => {
  if (!containerRef.value) return;

  const panels = Array.from(containerRef.value.children).filter((child) =>
    child.classList.contains("resize-panel")
  ) as HTMLElement[];

  if (panels.length === 0) return;

  const isHorizontal = props.direction === "horizontal";

  // 计算有固定尺寸的面板
  const panelConfigs = panels.map((panel: HTMLElement) => {
    const inlineStyle = panel.style;
    const sizeValue = isHorizontal ? inlineStyle.width : inlineStyle.height;

    if (sizeValue && sizeValue.includes("px")) {
      const size = parseInt(sizeValue);
      return { panel, fixedSize: size > 0 ? size : null, isFixed: size > 0 };
    }

    return { panel, fixedSize: null, isFixed: false };
  });

  // 为面板设置flex属性
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
};

onMounted(async () => {
  await nextTick();

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
