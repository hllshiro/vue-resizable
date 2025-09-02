<!-- ResizePanel.vue -->
<template>
  <div class="resize-panel">
    <slot />
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
  .resize-panel {
    flex-shrink: 0;
  }
</style>
