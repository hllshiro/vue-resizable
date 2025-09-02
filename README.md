# vue-resizable

A Vue 3 component library for creating resizable areas. Supports flexible combinations and custom styles.

![vue-resizable.gif](./assets/vue-resizable.gif)

## Features

- 🎯 **Intuitive Drag Behavior**: Only adjacent panels are affected when dragging splitters
- 🚀 **High Precision**: Built with native Flexbox for pixel-perfect calculations
- 🔧 **Smart Layout Management**: Automatic space allocation using flex-grow properties
- 📱 **Responsive**: Adapts to container size changes automatically
- 🎨 **Customizable**: Full control over panel sizing and constraints
- 💪 **TypeScript**: Complete type safety out of the box
- 🪶 **Lightweight**: Minimal bundle size with zero dependencies

## Architecture

This library uses a **Flexbox-based architecture** that leverages browser-native layout algorithms:

- **Fixed Panels**: Use `flex-grow: 0` with pixel-based sizing for precise control
- **Flexible Panels**: Use `flex-grow: 1` for automatic space distribution
- **Smart Conversion**: Flexible panels automatically convert to fixed when dragged for consistent behavior
- **Space Conservation**: Guarantees total space allocation equals container size

## Installation

```bash
npm install @hllshiro/vue-resizable
```

**Note**: This library requires Vue 3 as a peer dependency. Make sure you have Vue 3 installed in your project:

```bash
npm install vue@^3.0.0
```

## Vue Version Compatibility

- Vue 3.0.0 and above
- Built with TypeScript for better development experience
- Supports both JavaScript and TypeScript projects

## Usage

### Global Registration

Register all components globally in your main application file:

```javascript
// main.ts
import { createApp } from 'vue'
import VueResizable from '@hllshiro/vue-resizable'
import '@hllshiro/vue-resizable/style.css'

const app = createApp(App)
app.use(VueResizable)
app.mount('#app')
```

### Local Registration (Recommended)

Import and use components locally for better tree-shaking:

```javascript
// Component.vue
<script setup>
import { ResizableContainer, ResizablePanel, ResizableSplitter } from '@hllshiro/vue-resizable'
import '@hllshiro/vue-resizable/style.css'
</script>
```

### TypeScript Support

This library is built with TypeScript and provides full type definitions. No additional `@types` packages are needed.

```typescript
// Component.vue
<script setup lang="ts">
import { ResizableContainer, ResizablePanel, ResizableSplitter } from '@hllshiro/vue-resizable'
import type { Component } from 'vue'
import '@hllshiro/vue-resizable/style.css'

// Components are fully typed
const container: Component = ResizableContainer
</script>
```
## Example

### Basic Usage

```vue
<template>
  <!-- Horizontal layout -->
  <ResizableContainer direction="horizontal" style="height: 100vh">
    <ResizablePanel style="min-width: 150px; background: #ffe0b2">
      Left Panel
    </ResizablePanel>
    <ResizableSplitter />
    <ResizablePanel :style="middleStyle">
      <!-- Nested vertical layout -->
      <ResizableContainer direction="vertical">
        <ResizablePanel style="min-height: 150px">Top</ResizablePanel>
        <ResizableSplitter style="background: #000" />
        <ResizablePanel style="height: 200px; min-height: 150px">Center</ResizablePanel>
        <ResizableSplitter />
        <ResizablePanel style="height: 300px; min-height: 50px; border: 1px solid #ccc">
          Bottom
        </ResizablePanel>
      </ResizableContainer>
    </ResizablePanel>
    <ResizableSplitter />
    <ResizablePanel :style="rightStyle">Right Panel</ResizablePanel>
  </ResizableContainer>
</template>

<script setup>
import { ResizableContainer, ResizablePanel, ResizableSplitter } from '@hllshiro/vue-resizable'
import '@hllshiro/vue-resizable/style.css'

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

### TypeScript Example

```vue
<template>
  <ResizableContainer direction="horizontal" style="height: 100vh">
    <ResizablePanel style="min-width: 200px">
      Content 1
    </ResizablePanel>
    <ResizableSplitter />
    <ResizablePanel style="min-width: 200px">
      Content 2
    </ResizablePanel>
  </ResizableContainer>
</template>

<script setup lang="ts">
import { ResizableContainer, ResizablePanel, ResizableSplitter } from '@hllshiro/vue-resizable'
import '@hllshiro/vue-resizable/style.css'

// TypeScript will provide full intellisense and type checking
</script>
```

## API

### ResizableContainer

The main container component that manages the layout of panels and splitters.

**Props:**
- `direction`: `'horizontal' | 'vertical'` - Layout direction

**Features:**
- Automatically initializes panel sizing based on inline styles
- Converts pixel values to appropriate flex properties
- Handles container resize events

### ResizablePanel

A flexible panel that can be resized by adjacent splitters.

**Sizing Behavior:**
- **Fixed Size**: Set `width` or `height` in pixels (e.g., `style="width: 200px"`)
  - Panel becomes `flex-grow: 0` with fixed `flex-basis`
  - Maintains exact size until manually resized
- **Flexible Size**: No explicit size or use `auto`
  - Panel becomes `flex-grow: 1` and shares available space
  - Automatically fills remaining space

**CSS Properties:**
- `min-width`, `min-height`: Minimum size constraints
- `max-width`, `max-height`: Maximum size constraints (optional)
- `width`, `height`: Initial size (converts to fixed mode if in pixels)

**Example:**
```vue
<!-- Fixed panel -->
<ResizablePanel style="width: 200px; min-width: 150px">
  Fixed width panel
</ResizablePanel>

<!-- Flexible panel -->
<ResizablePanel style="min-width: 100px">
  Flexible panel
</ResizablePanel>
```

### ResizableSplitter

A draggable divider that allows users to resize adjacent panels.

**Behavior:**
- Only affects the two immediately adjacent panels
- Automatically handles different panel type combinations:
  - **Fixed + Fixed**: Adjusts pixel values directly
  - **Flexible + Flexible**: Adjusts `flex-grow` ratios
  - **Fixed + Flexible**: Converts flexible panel to fixed for consistent behavior

**Styling:**
- Default size: 5px width/height
- Hover and active states included
- Fully customizable via CSS

**Example:**
```vue
<ResizableSplitter style="background: #ccc; width: 8px" />
```

## Migration Guide

### From v0.0.1 to v0.0.2

This version includes significant architectural improvements. While the API remains the same, behavior is more consistent:

**What's Changed:**
- Dragging splitters now only affects adjacent panels (more intuitive)
- Improved precision eliminates micro-movements
- Better space management prevents layout overflow

**What to Check:**
- Verify that your panel sizing still works as expected
- Test drag interactions in complex nested layouts
- No code changes required - only behavioral improvements

## Best Practices

### Panel Sizing Strategy

1. **Use Fixed Panels for Sidebars/Toolbars**
   ```vue
   <ResizablePanel style="width: 250px; min-width: 200px">
     Sidebar content
   </ResizablePanel>
   ```

2. **Use Flexible Panels for Main Content**
   ```vue
   <ResizablePanel style="min-width: 300px">
     Main content area
   </ResizablePanel>
   ```

3. **Set Meaningful Constraints**
   - Always set `min-width`/`min-height` to prevent panels from becoming too small
   - Use `max-width`/`max-height` sparingly, only when necessary

### Performance Tips

- Avoid deeply nested ResizableContainers when possible
- Use CSS transitions sparingly on resizable panels
- Set appropriate minimum sizes to prevent layout thrashing

## Development

This library is built with:
- Vue 3 Composition API
- TypeScript for type safety
- Vite for fast builds
- Native Flexbox for layout calculations
- Zero external dependencies

## Browser Support

- Chrome/Edge 88+
- Firefox 78+
- Safari 14+
- Modern browsers with Flexbox support

## Contributing

Contributions are welcome! Please ensure:
- TypeScript types are properly maintained
- Changes follow the Flexbox-based architecture
- Performance implications are considered
- Tests cover new functionality

## License

MIT