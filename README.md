# vue-resizeable

A component for vuejs resizeable areas,Supports random combination,support custom styles

[![vue-resizeable.gif](https://i.postimg.cc/8C0Rfsvj/vue-resizeable.gif)](https://postimg.cc/JyjD9rPL)
### install

```bash
npm install vue-resizeable
```

## Component Registration 
### Global Registration All Components
```javascript
// main.ts

import { createApp } from 'vue'
import VueResizeable from 'vue-resizeable'
import 'vue-resizeable/style.css'

createApp(App).use(VueResizeable).mount('#app')
```
The above imports VueResizeable entirely. Note that CSS file needs to be imported separately.

### Local Registration
In this way, component sub-components, such as ResizeableContainer and ResizeablePanel and ResizeableSplitter, need to be registered separately, and they are only valid in the current component after registration.that CSS file needs to be imported separately.

```javascript
// index.vue
<script setup>
    import { ResizeableContainer, ResizeablePanel, ResizeableSplitter } from 'vue-resizeable'
    import 'vue-resizeable/style.css'
</script>
```
## Example


```javascript
// index.vue
<template>
  <!-- horizontal -->
  <ResizeableContainer direction="horizontal" style="height: 100vh">
    <ResizeablePanel style="min-width: 150px; background: #ffe0b2">Left</ResizeablePanel>
    <ResizeableSplitter />
    <ResizeablePanel :style="middleStyle">
      <!-- vertical -->
      <ResizeableContainer direction="vertical">
        <ResizeablePanel style="min-height: 150px">Top</ResizeablePanel>
        <ResizeableSplitter style="background: #000" />
        <ResizeablePanel style="height: 200px; min-height: 150px">center</ResizeablePanel>
        <ResizeableSplitter />
        <ResizeablePanel style="height: 300px; min-height: 50px; border: 1px solid #ccc">Bottom</ResizeablePanel>
      </ResizeableContainer>
    </ResizeablePanel>
    <ResizeableSplitter />
    <ResizeablePanel :style="rightStyle">Right</ResizeablePanel>
  </ResizeableContainer>
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