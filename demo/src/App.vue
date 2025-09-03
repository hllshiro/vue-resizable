<template>
  <div class="app">
    <h1>Vue Resizable 面板显隐控制测试</h1>
    <p>测试面板显隐控制功能和智能分割器显隐</p>

    <!-- 第一组：使用ResizableContainer组合显隐控制、基础测试和日志 -->
    <div class="test-section">
      <h2>核心功能演示</h2>
      <ResizableContainer
        direction="horizontal"
        style="height: 400px; border: 1px solid #ccc; margin-bottom: 30px"
        @layoutChange="onLayoutChange"
      >
        <!-- 左侧：控制面板和测试区域 -->
        <ResizablePanel style="min-width: 500px; background: #f8f9fa">
          <ResizableContainer direction="vertical" style="height: 100%">
            <!-- 显隐控制面板 -->
            <ResizablePanel style="height: 120px; min-height: 100px">
              <div class="control-panel">
                <h3>显隐控制</h3>
                <div class="controls">
                  <label>
                    <input type="checkbox" v-model="panelVisibility.panel1" />
                    面板1
                  </label>
                  <label>
                    <input type="checkbox" v-model="panelVisibility.panel2" />
                    面板2
                  </label>
                  <label>
                    <input type="checkbox" v-model="panelVisibility.panel3" />
                    面板3
                  </label>
                  <label>
                    <input type="checkbox" v-model="panelVisibility.panel4" />
                    面板4
                  </label>
                </div>
                <button @click="resetVisibility" class="reset-btn">
                  重置所有
                </button>
              </div>
            </ResizablePanel>

            <ResizableSplitter />

            <!-- 基础测试区域 -->
            <ResizablePanel style="min-height: 200px">
              <div class="test-content">
                <h3>测试1: 基础面板显隐控制</h3>
                <p class="description">
                  使用上方的复选框控制面板显隐，观察分割器智能显隐和空间重分配
                </p>
                <ResizableContainer
                  direction="horizontal"
                  style="height: 180px; border: 1px solid #ddd"
                  @layoutChange="onLayoutChange"
                >
                  <ResizablePanel
                    :show="panelVisibility.panel1"
                    style="width: 120px; min-width: 80px; background: #ffcdd2"
                    @panelShow="onPanelShow"
                    @panelHide="onPanelHide"
                  >
                    <div class="panel-content">
                      <h4>面板1 (固定120px)</h4>
                      <button
                        @click="
                          panelVisibility.panel1 = !panelVisibility.panel1
                        "
                      >
                        切换显隐
                      </button>
                    </div>
                  </ResizablePanel>
                  <ResizableSplitter />
                  <ResizablePanel
                    :show="panelVisibility.panel2"
                    style="min-width: 80px; background: #c8e6c9"
                    @panelShow="onPanelShow"
                    @panelHide="onPanelHide"
                  >
                    <div class="panel-content">
                      <h4>面板2 (弹性)</h4>
                      <button
                        @click="
                          panelVisibility.panel2 = !panelVisibility.panel2
                        "
                      >
                        切换显隐
                      </button>
                    </div>
                  </ResizablePanel>
                  <ResizableSplitter />
                  <ResizablePanel
                    :show="panelVisibility.panel3"
                    style="min-width: 80px; background: #bbdefb"
                    @panelShow="onPanelShow"
                    @panelHide="onPanelHide"
                  >
                    <div class="panel-content">
                      <h4>面板3 (弹性)</h4>
                      <button
                        @click="
                          panelVisibility.panel3 = !panelVisibility.panel3
                        "
                      >
                        切换显隐
                      </button>
                    </div>
                  </ResizablePanel>
                  <ResizableSplitter />
                  <ResizablePanel
                    :show="panelVisibility.panel4"
                    style="width: 100px; min-width: 80px; background: #fff3e0"
                    @panelShow="onPanelShow"
                    @panelHide="onPanelHide"
                  >
                    <div class="panel-content">
                      <h4>面板4 (固定100px)</h4>
                      <button
                        @click="
                          panelVisibility.panel4 = !panelVisibility.panel4
                        "
                      >
                        切换显隐
                      </button>
                    </div>
                  </ResizablePanel>
                </ResizableContainer>
              </div>
            </ResizablePanel>
          </ResizableContainer>
        </ResizablePanel>

        <ResizableSplitter />

        <!-- 右侧：事件日志 -->
        <ResizablePanel
          style="width: 350px; min-width: 300px; background: #fff"
        >
          <div class="event-log">
            <h3>事件日志</h3>
            <button @click="clearLogs" class="clear-btn">清空日志</button>
            <div class="log-entries">
              <div
                v-for="(log, index) in eventLogs"
                :key="index"
                class="log-entry"
              >
                <span class="timestamp">{{ log.timestamp }}</span>
                <span class="event-type" :class="log.type">{{ log.type }}</span>
                <span class="message">{{ log.message }}</span>
              </div>
            </div>
          </div>
        </ResizablePanel>
      </ResizableContainer>
    </div>

    <!-- 测试场景2: 垂直布局显隐控制 -->
    <div class="test-section">
      <h2>测试2: 垂直布局显隐控制</h2>
      <div class="controls">
        <label>
          <input type="checkbox" v-model="verticalPanelVisibility.top" />
          顶部面板
        </label>
        <label>
          <input type="checkbox" v-model="verticalPanelVisibility.middle" />
          中间面板
        </label>
        <label>
          <input type="checkbox" v-model="verticalPanelVisibility.bottom" />
          底部面板
        </label>
      </div>
      <ResizableContainer
        direction="vertical"
        style="height: 300px; border: 1px solid #ccc"
      >
        <ResizablePanel
          :show="verticalPanelVisibility.top"
          style="height: 80px; min-height: 50px; background: #ffcdd2"
        >
          <div class="panel-content">
            <h4>顶部面板 (固定80px)</h4>
          </div>
        </ResizablePanel>
        <ResizableSplitter />
        <ResizablePanel
          :show="verticalPanelVisibility.middle"
          style="min-height: 50px; background: #c8e6c9"
        >
          <div class="panel-content">
            <h4>中间面板 (弹性)</h4>
          </div>
        </ResizablePanel>
        <ResizableSplitter />
        <ResizablePanel
          :show="verticalPanelVisibility.bottom"
          style="height: 60px; min-height: 40px; background: #bbdefb"
        >
          <div class="panel-content">
            <h4>底部面板 (固定60px)</h4>
          </div>
        </ResizablePanel>
      </ResizableContainer>
    </div>

    <!-- 测试场景3: 嵌套布局显隐控制 -->
    <div class="test-section">
      <h2>测试3: 嵌套布局显隐控制</h2>
      <div class="controls">
        <label>
          <input type="checkbox" v-model="nestedPanelVisibility.left" />
          左侧面板
        </label>
        <label>
          <input type="checkbox" v-model="nestedPanelVisibility.centerTop" />
          中央上部
        </label>
        <label>
          <input type="checkbox" v-model="nestedPanelVisibility.centerBottom" />
          中央下部
        </label>
        <label>
          <input type="checkbox" v-model="nestedPanelVisibility.right" />
          右侧面板
        </label>
      </div>
      <ResizableContainer
        direction="horizontal"
        style="height: 300px; border: 1px solid #ccc"
      >
        <ResizablePanel
          :show="nestedPanelVisibility.left"
          style="width: 200px; min-width: 150px; background: #ffcdd2"
        >
          <div class="panel-content">
            <h4>左侧面板</h4>
          </div>
        </ResizablePanel>
        <ResizableSplitter />
        <ResizablePanel style="min-width: 200px; background: #f5f5f5">
          <ResizableContainer direction="vertical" style="height: 100%">
            <ResizablePanel
              :show="nestedPanelVisibility.centerTop"
              style="min-height: 50px; background: #c8e6c9"
            >
              <div class="panel-content">
                <h4>中央上部</h4>
              </div>
            </ResizablePanel>
            <ResizableSplitter />
            <ResizablePanel
              :show="nestedPanelVisibility.centerBottom"
              style="min-height: 50px; background: #bbdefb"
            >
              <div class="panel-content">
                <h4>中央下部</h4>
              </div>
            </ResizablePanel>
          </ResizableContainer>
        </ResizablePanel>
        <ResizableSplitter />
        <ResizablePanel
          :show="nestedPanelVisibility.right"
          style="width: 150px; min-width: 100px; background: #fff3e0"
        >
          <div class="panel-content">
            <h4>右侧面板</h4>
          </div>
        </ResizablePanel>
      </ResizableContainer>
    </div>

    <!-- 测试说明 -->
    <div class="instructions">
      <h3>测试说明:</h3>
      <ul>
        <li><strong>面板显隐:</strong> 使用复选框或面板内按钮控制面板显隐</li>
        <li>
          <strong>智能分割器:</strong> 分割器会根据相邻面板的可见性自动显隐
        </li>
        <li>
          <strong>空间重分配:</strong> 隐藏面板时空间自动分配给其他可见面板
        </li>
        <li><strong>状态恢复:</strong> 显示面板时尝试恢复之前的尺寸</li>
        <li><strong>拖拽调整:</strong> 可见面板间的分割器仍可正常拖拽调整</li>
        <li><strong>嵌套布局:</strong> 嵌套容器中的显隐控制独立工作</li>
        <li><strong>事件监听:</strong> 观察事件日志了解组件内部状态变化</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { type ContainerState } from "@hllshiro/vue-resizable";

// 面板可见性状态
const panelVisibility = reactive({
  panel1: true,
  panel2: true,
  panel3: true,
  panel4: true,
});

const verticalPanelVisibility = reactive({
  top: true,
  middle: true,
  bottom: true,
});

const nestedPanelVisibility = reactive({
  left: true,
  centerTop: true,
  centerBottom: true,
  right: true,
});

// 事件日志
interface EventLog {
  timestamp: string;
  type: "panelShow" | "panelHide" | "layoutChange";
  message: string;
}

const eventLogs = ref<EventLog[]>([]);

const addLog = (type: EventLog["type"], message: string) => {
  const timestamp = new Date().toLocaleTimeString();
  eventLogs.value.unshift({ timestamp, type, message });
  // 保持最新的20条日志
  if (eventLogs.value.length > 20) {
    eventLogs.value = eventLogs.value.slice(0, 20);
  }
};

// 事件处理函数
const onPanelShow = (panelId: string) => {
  addLog("panelShow", `面板 ${panelId} 显示`);
};

const onPanelHide = (panelId: string) => {
  addLog("panelHide", `面板 ${panelId} 隐藏`);
};

const onLayoutChange = (layout: ContainerState) => {
  const visibleCount = Array.from(layout.panels.values()).filter(
    (p) => p.visible
  ).length;
  const hiddenCount = layout.panels.size - visibleCount;
  addLog(
    "layoutChange",
    `布局变化: ${visibleCount} 个可见面板, ${hiddenCount} 个隐藏面板`
  );
};

// 辅助功能
const resetVisibility = () => {
  panelVisibility.panel1 = true;
  panelVisibility.panel2 = true;
  panelVisibility.panel3 = true;
  panelVisibility.panel4 = true;
  addLog("layoutChange", "重置所有面板为可见");
};

const clearLogs = () => {
  eventLogs.value = [];
};
</script>

<style>
.app {
  padding: 20px;
  font-family: Arial, sans-serif;
  max-width: 1400px;
  margin: 0 auto;
}

.test-section {
  margin: 30px 0;
}

.test-section h2 {
  margin-bottom: 15px;
  color: #333;
  border-bottom: 2px solid #2196f3;
  padding-bottom: 5px;
}

.description {
  color: #666;
  font-style: italic;
  margin-bottom: 15px;
}

.control-panel {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  height: 100%;
  box-sizing: border-box;
}

.control-panel h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #495057;
  font-size: 16px;
}

.test-content {
  padding: 15px;
  height: 100%;
  box-sizing: border-box;
  background: #fff;
}

.test-content h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #333;
  font-size: 16px;
}

.controls {
  display: flex;
  gap: 15px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.controls label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
}

.controls input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.reset-btn,
.clear-btn {
  padding: 6px 12px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s;
}

.reset-btn:hover,
.clear-btn:hover {
  background: #5a6268;
}

.panel-content {
  padding: 10px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  box-sizing: border-box;
}

.panel-content h4 {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #333;
}

.panel-content button {
  padding: 4px 8px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 10px;
  transition: background-color 0.2s;
}

.panel-content button:hover {
  background: #0056b3;
}

.event-log {
  background: #fff;
  padding: 15px;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.event-log h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #333;
  font-size: 16px;
}

.log-entries {
  flex: 1;
  overflow-y: auto;
  margin-top: 10px;
  max-height: 320px;
}

.log-entry {
  display: flex;
  gap: 8px;
  padding: 4px 0;
  border-bottom: 1px solid #e9ecef;
  font-family: monospace;
  font-size: 11px;
  line-height: 1.3;
}

.log-entry:last-child {
  border-bottom: none;
}

.timestamp {
  color: #6c757d;
  min-width: 60px;
  font-size: 10px;
}

.event-type {
  font-weight: bold;
  min-width: 80px;
  font-size: 10px;
}

.event-type.panelShow {
  color: #28a745;
}

.event-type.panelHide {
  color: #dc3545;
}

.event-type.layoutChange {
  color: #007bff;
}

.message {
  color: #333;
  flex: 1;
  font-size: 10px;
}

.instructions {
  margin-top: 40px;
  padding: 20px;
  background: #e3f2fd;
  border-radius: 8px;
  border-left: 4px solid #2196f3;
}

.instructions h3 {
  margin-top: 0;
  color: #1565c0;
}

.instructions ul {
  margin: 15px 0;
}

.instructions li {
  margin: 8px 0;
  line-height: 1.5;
}

.instructions strong {
  color: #1565c0;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .app {
    padding: 15px;
  }

  .controls {
    flex-direction: column;
    gap: 8px;
  }

  .test-section {
    margin: 20px 0;
  }
}

@media (max-width: 768px) {
  .app {
    padding: 10px;
  }

  .event-log {
    min-width: 250px;
  }
}
</style>
