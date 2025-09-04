<template>
  <div class="drag-test">
    <h2>拖拽持久性测试</h2>
    <p>拖动下方的分割器，然后观察面板比例是否保持</p>
    
    <div class="test-info">
      <h3>当前面板比例：</h3>
      <div v-for="(panel, index) in panelStates" :key="index" class="panel-info">
        面板{{ index + 1 }}: ratio={{ panel.ratio?.toFixed(2) || 'N/A' }}
      </div>
      <button @click="logPanelStates">打印面板状态</button>
    </div>
    
    <ResizableContainer
      direction="horizontal"
      style="height: 200px; border: 2px solid #333; margin: 20px 0"
      @layoutChange="onLayoutChange"
      ref="containerRef"
    >
      <ResizablePanel
        :ratio="1"
        style="min-width: 80px; background: #ffcdd2"
      >
        <div class="panel-content">
          <h4>面板1 (初始 ratio=1)</h4>
          <p>拖动右侧分割器测试</p>
        </div>
      </ResizablePanel>
      
      <ResizableSplitter />
      
      <ResizablePanel
        :ratio="2"
        style="min-width: 80px; background: #c8e6c9"
      >
        <div class="panel-content">
          <h4>面板2 (初始 ratio=2)</h4>
          <p>应该是面板1的两倍宽</p>
        </div>
      </ResizablePanel>
      
      <ResizableSplitter />
      
      <ResizablePanel
        :ratio="1"
        style="min-width: 80px; background: #bbdefb"
      >
        <div class="panel-content">
          <h4>面板3 (初始 ratio=1)</h4>
          <p>与面板1相同宽度</p>
        </div>
      </ResizablePanel>
    </ResizableContainer>
    
    <div class="instructions">
      <h3>测试步骤：</h3>
      <ol>
        <li>观察初始状态：面板2应该是面板1和面板3的两倍宽</li>
        <li>拖动任意分割器调整面板大小</li>
        <li>观察拖动后面板是否保持调整后的尺寸（不会回到原始比例）</li>
        <li>点击"打印面板状态"查看内部ratio值是否已更新</li>
      </ol>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";
import { type ContainerState } from "@hllshiro/vue-resizable";

const containerRef = ref();
const panelStates = ref<Array<{ ratio?: number }>>([]);

const onLayoutChange = (layout: ContainerState) => {
  console.log("Layout changed:", layout);
  
  // 更新面板状态显示
  panelStates.value = Array.from(layout.panels.values()).map(panel => ({
    ratio: panel.ratio
  }));
};

const logPanelStates = () => {
  if (containerRef.value) {
    const state = containerRef.value.getContainerState();
    console.log("当前容器状态:", state);
    
    Array.from(state.panels.values()).forEach((panel, index) => {
      console.log(`面板${index + 1}:`, {
        id: panel.id,
        ratio: panel.ratio,
        flexGrow: panel.element.style.flexGrow,
        visible: panel.visible
      });
    });
  }
};

// 初始化时触发一次布局变化来获取初始状态
nextTick(() => {
  if (containerRef.value) {
    const state = containerRef.value.getContainerState();
    onLayoutChange(state);
  }
});
</script>

<style scoped>
.drag-test {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.test-info {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  margin: 15px 0;
}

.test-info h3 {
  margin-top: 0;
  color: #333;
}

.panel-info {
  display: inline-block;
  margin: 5px 10px;
  padding: 5px 10px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: monospace;
}

.panel-content {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  box-sizing: border-box;
}

.panel-content h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.panel-content p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.instructions {
  background: #e3f2fd;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #2196f3;
  margin-top: 20px;
}

.instructions h3 {
  margin-top: 0;
  color: #1565c0;
}

.instructions ol {
  color: #333;
}

.instructions li {
  margin: 8px 0;
  line-height: 1.5;
}

button {
  background: #2196f3;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 10px;
}

button:hover {
  background: #1976d2;
}
</style>