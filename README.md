# vue-resizable

A component for vuejs resizable areas,Supports random combination,support custom styles

![vue-resizable.gif](./assets/vue-resizable.gif)
### install

```bash
npm install vue-resizable
```

## Component Registration 
### Global Registration All Components
```javascript
// main.ts

import { createApp } from 'vue'
import Vueresizable from 'vue-resizable'
import 'vue-resizable/style.css'

createApp(App).use(Vueresizable).mount('#app')
```
The above imports Vueresizable entirely. Note that CSS file needs to be imported separately.

### Local Registration
In this way, component sub-components, such as resizableContainer and resizablePanel and resizableSplitter, need to be registered separately, and they are only valid in the current component after registration.that CSS file needs to be imported separately.

```javascript
// index.vue
<script setup>
    import { resizableContainer, resizablePanel, resizableSplitter } from 'vue-resizable'
    import 'vue-resizable/style.css'
</script>
```
## Example


```javascript
// index.vue
<template>
  <!-- horizontal -->
  <resizableContainer direction="horizontal" style="height: 100vh">
    <resizablePanel style="min-width: 150px; background: #ffe0b2">Left</resizablePanel>
    <resizableSplitter />
    <resizablePanel :style="middleStyle">
      <!-- vertical -->
      <resizableContainer direction="vertical">
        <resizablePanel style="min-height: 150px">Top</resizablePanel>
        <resizableSplitter style="background: #000" />
        <resizablePanel style="height: 200px; min-height: 150px">center</resizablePanel>
        <resizableSplitter />
        <resizablePanel style="height: 300px; min-height: 50px; border: 1px solid #ccc">Bottom</resizablePanel>
      </resizableContainer>
    </resizablePanel>
    <resizableSplitter />
    <resizablePanel :style="rightStyle">Right</resizablePanel>
  </resizableContainer>
</template>

<script setup>
const rightStyle = {
  width: '500px',
  minWidth: '150px',
  border: '1px solid #ccc'
}
const middleStyle = {
  width: '500px',
  minWidth: '150px',
  border: '1px solid #ccc',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'hidden'
}
</script>
```