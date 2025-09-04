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
import {
  RESIZE_DIRECTION,
  REGISTER_PANEL,
  UNREGISTER_PANEL,
  UPDATE_PANEL_VISIBILITY,
} from "../types";
import type { PanelState } from "../types";

const props = withDefaults(
  defineProps<{
    show?: boolean;
    ratio?: number;
  }>(),
  {
    show: true,
    ratio: 1,
  }
);

const panelRef = ref<HTMLElement>();
const panelId = ref(`panel-${Math.random().toString(36).substr(2, 9)}`);

// 注入容器提供的方法
const direction = inject(RESIZE_DIRECTION);
const registerPanel = inject(REGISTER_PANEL);
const unregisterPanel = inject(UNREGISTER_PANEL);
const updatePanelVisibility = inject(UPDATE_PANEL_VISIBILITY);

// 保存上次的尺寸状态
const lastSize = ref(0);
const minSize = ref(0);
const flexGrow = ref(1);

// 获取面板的最小尺寸
const getMinSize = () => {
  if (!panelRef.value || !direction) return 0;

  const style = getComputedStyle(panelRef.value);
  const isHorizontal = direction === "horizontal";
  return isHorizontal
    ? parseInt(style.minWidth) || 0
    : parseInt(style.minHeight) || 0;
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
    } else {
      // 显示时恢复状态
      await nextTick();
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

    const panelState: PanelState = {
      id: panelId.value,
      element: panelRef.value,
      visible: props.show,
      lastSize: lastSize.value,
      minSize: minSize.value,
      ratio: props.ratio,
      flexGrow: props.ratio,
    };
    registerPanel(panelState);
  }
});

// 组件卸载时从容器注销
onUnmounted(() => {
  if (unregisterPanel) {
    unregisterPanel(panelId.value);
  }
});

// 暴露方法供外部调用
defineExpose({
  panelId: panelId.value,
  saveCurrentState,
  getLastSize: () => lastSize.value,
  getMinSize: () => minSize.value,
  getFlexGrow: () => flexGrow.value,
  getRatio: () => props.ratio,
});
</script>

<style>
.resize-panel {
  flex-shrink: 1;
  flex-grow: 1;
  flex-basis: 0;
  box-sizing: border-box;
  overflow: hidden;
  /* 确保面板能够正确响应flex-basis */
  min-width: 0;
  min-height: 0;
}
</style>
