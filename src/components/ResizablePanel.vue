<!-- ResizablePanel.vue -->
<template>
  <div class="resize-panel">
    <slot />
  </div>
</template>

<script setup lang="ts"></script>

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
