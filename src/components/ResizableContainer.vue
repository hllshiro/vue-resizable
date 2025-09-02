<!-- ResizableContainer.vue -->
<template>
  <div class="resize-container" :class="direction" ref="containerRef">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { provide, ref, onMounted, onUnmounted, nextTick } from "vue";

const props = defineProps<{
  direction: "horizontal" | "vertical";
}>();

const containerRef = ref<HTMLElement>();
let isInitialized = ref(false);

provide("resizeDirection", props.direction);
provide("containerRef", containerRef);

// 监听窗口resize事件 - 使用百分比时不需要特殊处理
const handleResize = () => {
  // 使用百分比布局时，浏览器会自动处理resize
  // 这里保留空函数以防将来需要添加特殊逻辑
};

// 初始化面板大小 - 使用flex-basis和百分比布局
const initializePanels = () => {
  if (!containerRef.value) return;

  const panels = Array.from(containerRef.value.children).filter((child) =>
    child.classList.contains("resize-panel")
  ) as HTMLElement[];

  if (panels.length === 0) return;

  const isHorizontal = props.direction === "horizontal";

  // 获取容器的实际大小
  const containerSize = isHorizontal
    ? containerRef.value.offsetWidth
    : containerRef.value.offsetHeight;

  if (containerSize === 0) {
    setTimeout(() => initializePanels(), 50);
    return;
  }

  // 计算splitter占用的空间
  const splitters = Array.from(containerRef.value.children).filter((child) =>
    child.classList.contains("resize-splitter")
  ) as HTMLElement[];

  // 如果splitter的实际大小为0，使用默认大小
  const splitterSize = splitters.reduce((total, splitter) => {
    const actualSize = isHorizontal
      ? splitter.offsetWidth
      : splitter.offsetHeight;
    // 如果实际大小为0，使用默认的5px
    const size = actualSize > 0 ? actualSize : 5;
    return total + size;
  }, 0);

  console.log(
    "Splitter详情:",
    splitters.map((splitter, index) => {
      const computed = getComputedStyle(splitter);
      return {
        index,
        offsetWidth: splitter.offsetWidth,
        offsetHeight: splitter.offsetHeight,
        computedWidth: computed.width,
        computedMinWidth: computed.minWidth,
        classList: Array.from(splitter.classList),
      };
    })
  );

  const availableSize = containerSize - splitterSize;

  console.log("初始化面板:", {
    containerSize,
    splitterSize,
    availableSize,
    panelCount: panels.length,
  });

  // 检查哪些面板已经设置了大小（通过内联样式）
  const panelConfigs = panels.map((panel: HTMLElement, index: number) => {
    // 检查内联样式，而不是计算样式
    const inlineStyle = panel.style;
    const sizeValue = isHorizontal ? inlineStyle.width : inlineStyle.height;

    console.log(`面板${index + 1} 内联样式:`, sizeValue);

    if (sizeValue && sizeValue.includes("px")) {
      const size = parseInt(sizeValue);
      console.log(`面板${index + 1} 固定大小:`, size);
      return { panel, fixedSize: size > 0 ? size : null, isFixed: size > 0 };
    }

    return { panel, fixedSize: null, isFixed: false };
  });

  // 计算已设置固定大小的面板总大小
  const totalFixedSize = panelConfigs
    .filter((config: any) => config.isFixed)
    .reduce((sum: number, config: any) => sum + (config.fixedSize || 0), 0);

  // 计算未设置大小的面板数量
  const flexiblePanels = panelConfigs.filter(
    (config: any) => !config.isFixed
  ).length;

  // 计算剩余可用空间
  const remainingSize = availableSize - totalFixedSize;

  console.log("计算结果:", {
    totalFixedSize,
    flexiblePanels,
    remainingSize,
  });

  // 为每个面板设置大小
  panelConfigs.forEach((config: any, index: number) => {
    if (config.isFixed && config.fixedSize) {
      // 固定大小的面板，转换为百分比
      const percentage = (config.fixedSize / availableSize) * 100;
      if (isHorizontal) {
        config.panel.style.width = `${percentage}%`;
        config.panel.style.flexBasis = `${percentage}%`;
      } else {
        config.panel.style.height = `${percentage}%`;
        config.panel.style.flexBasis = `${percentage}%`;
      }
      console.log(`面板${index + 1} (固定): ${percentage}%`);
    } else {
      // 未设置大小的面板，平分剩余空间
      const width = flexiblePanels > 0 ? remainingSize / flexiblePanels : 0;
      const percentage = (width / availableSize) * 100;
      if (isHorizontal) {
        config.panel.style.width = `${percentage}%`;
        config.panel.style.flexBasis = `${percentage}%`;
      } else {
        config.panel.style.height = `${percentage}%`;
        config.panel.style.flexBasis = `${percentage}%`;
      }
      console.log(`面板${index + 1} (灵活): ${percentage}%`);
    }
  });

  isInitialized.value = true;
};

onMounted(async () => {
  await nextTick();

  // 多次尝试初始化，确保DOM完全渲染
  const tryInitialize = (attempts = 0) => {
    if (attempts > 10) return; // 最多尝试10次

    if (!containerRef.value || containerRef.value.offsetWidth === 0) {
      setTimeout(() => tryInitialize(attempts + 1), 50);
      return;
    }

    // 检查splitter是否已经渲染
    const splitters = Array.from(containerRef.value.children).filter((child) =>
      child.classList.contains("resize-splitter")
    ) as HTMLElement[];

    const splitterRendered =
      splitters.length === 0 ||
      splitters.some((splitter) => {
        const isHorizontal = props.direction === "horizontal";
        return (
          (isHorizontal ? splitter.offsetWidth : splitter.offsetHeight) > 0
        );
      });

    if (!splitterRendered) {
      console.log(`尝试 ${attempts + 1}: splitter还未完全渲染`);
      setTimeout(() => tryInitialize(attempts + 1), 50);
      return;
    }

    initializePanels();
  };

  setTimeout(() => tryInitialize(), 100);

  // 监听窗口resize（虽然百分比布局通常不需要特殊处理）
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});

// 提供重新初始化的方法
provide("reinitializePanels", initializePanels);

// 添加一个强制重新计算的方法
const forceRecalculate = () => {
  if (!containerRef.value) return;

  // 触发一次resize事件来强制重新计算
  const resizeEvent = new Event("resize");
  window.dispatchEvent(resizeEvent);

  // 同时手动调用初始化
  setTimeout(() => {
    initializePanels();
  }, 0);
};

provide("forceRecalculate", forceRecalculate);
</script>

<style>
.resize-container {
  display: flex;
  overflow: hidden;
  flex-wrap: nowrap;
}

.horizontal {
  flex-direction: row;
}
.vertical {
  flex-direction: column;
}
</style>
