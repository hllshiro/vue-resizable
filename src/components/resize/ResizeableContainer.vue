<!-- ResizeContainer.vue -->
<template>
  <div class="resize-container" :class="direction">
    <slot />
  </div>
</template>

<script setup lang="ts">
  import { provide } from "vue";

  const props = defineProps<{
    direction: "horizontal" | "vertical";
  }>();

  provide("resizeDirection", props.direction);
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
