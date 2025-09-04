<template>
  <div class="app">
    <div class="tabs">
      <button
        :class="{ active: activeTab === 'main' }"
        @click="activeTab = 'main'"
      >
        主要演示
      </button>
    </div>

    <!-- 主要演示页面 -->
    <div v-if="activeTab === 'main'" class="tab-content">
      <MainDemo />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import MainDemo from "./MainDemo.vue";

const activeTab = ref("main"); // 默认显示拖拽测试
</script>

<style>
.app {
  font-family: Arial, sans-serif;
}

.tabs {
  display: flex;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
  padding: 0 20px;
}

.tabs button {
  background: none;
  border: none;
  padding: 15px 20px;
  cursor: pointer;
  font-size: 16px;
  color: #666;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
}

.tabs button:hover {
  color: #333;
  background: #eeeeee;
}

.tabs button.active {
  color: #2196f3;
  border-bottom-color: #2196f3;
  background: white;
}

.tab-content {
  min-height: 100vh;
}
</style>
