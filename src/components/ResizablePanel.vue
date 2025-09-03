<!-- ResizablePanel.vue -->
<template>
  <div
    v-show="show"
    class="resize-panel"
    ref="panelRef"
    :data-panel-id="panelId"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, inject, watch, onMounted, onUnmounted, nextTick } from "vue";

interface PanelState {
  id: string;
  element: HTMLElement;
  visible: boolean;
  lastSize: number;
  isFixed: boolean;
  minSize: number;
  flexGrow: number;
}

const props = withDefaults(
  defineProps<{
    show?: boolean;
  }>(),
  {
    show: true,
  }
);

const emit = defineEmits<{
  panelShow: [panelId: string];
  panelHide: [panelId: string];
}>();

const panelRef = ref<HTMLElement>();
const panelId = ref(`panel-${Math.random().toString(36).substr(2, 9)}`);

// 注入容器提供的方法
const direction = inject<"horizontal" | "vertical">("resizeDirection");
const registerPanel = inject<(panel: PanelState) => void>("registerPanel");
const unregisterPanel = inject<(panelId: string) => void>("unregisterPanel");
const updatePanelVisibility = inject<
  (panelId: string, visible: boolean) => void
>("updatePanelVisibility");

// 保存上次的尺寸状态
const lastSize = ref(0);
const isFixed = ref(false);
const minSize = ref(50);
const flexGrow = ref(1);

// 获取面板的最小尺寸
const getMinSize = () => {
  if (!panelRef.value || !direction) return 50;

  const style = getComputedStyle(panelRef.value);
  const isHorizontal = direction === "horizontal";
  return isHorizontal
    ? parseInt(style.minWidth) || 50
    : parseInt(style.minHeight) || 50;
};

// 保存当前尺寸状态（优化版）
const saveCurrentState = () => {
  if (!panelRef.value || !direction) return;

  const isHorizontal = direction === "horizontal";
  const rect = panelRef.value.getBoundingClientRect();
  const currentSize = isHorizontal ? rect.width : rect.height;
  
  // 只有当尺寸大于0时才保存，避免保存错误值
  if (currentSize > 0) {
    lastSize.value = currentSize;
  }

  const computedStyle = getComputedStyle(panelRef.value);
  isFixed.value = computedStyle.flexGrow === "0";
  flexGrow.value = parseFloat(computedStyle.flexGrow || "1");
  minSize.value = getMinSize();
};

// 监听 show 属性变化
watch(
  () => props.show,
  async (newShow, oldShow) => {
    if (newShow === oldShow) return;

    if (!newShow) {
      // 隐藏前保存状态
      saveCurrentState();
      emit("panelHide", panelId.value);
    } else {
      // 显示时恢复状态
      await nextTick();
      emit("panelShow", panelId.value);
    }

    // 通知容器更新布局
    if (updatePanelVisibility) {
      updatePanelVisibility(panelId.value, newShow);
    }
  },
  { immediate: false }
);

// 组件挂载时注册到容器
onMounted(async () => {
  await nextTick();

  if (panelRef.value && registerPanel) {
    saveCurrentState();

    registerPanel({
      id: panelId.value,
      element: panelRef.value,
      visible: props.show,
      lastSize: lastSize.value,
      isFixed: isFixed.value,
      minSize: minSize.value,
      flexGrow: flexGrow.value,
    });
  }
});

// 组件卸载时从容器注销
onUnmounted(() => {
  if (unregisterPanel) {
    unregisterPanel(panelId.value);
  }
});

// 暴露方法供容器调用
defineExpose({
  panelId: panelId.value,
  saveCurrentState,
  getLastSize: () => lastSize.value,
  getIsFixed: () => isFixed.value,
  getMinSize: () => minSize.value,
  getFlexGrow: () => flexGrow.value,
});
</script>

<style>
.resize-panel {
  flex-shrink: 0;
  flex-grow: 0;
  box-sizing: border-box;
  overflow: hidden;
  /* 确保面板能够正确响应flex-basis */
  min-width: 0;
  min-height: 0;
}
</style>
