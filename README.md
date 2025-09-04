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
- 👁️ **Dynamic Visibility**: Show/hide panels with automatic layout adjustment
- ⚖️ **Ratio-based Sizing**: Use ratio properties for proportional panel sizing
- 🔄 **Auto Space Distribution**: Components without explicit size automatically distribute remaining space

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

**Props:**
- `show`: `boolean` (default: `true`) - Controls panel visibility
- `ratio`: `number` (default: `1`) - Panel size ratio for proportional sizing

**Sizing Behavior:**
- **Ratio-based Sizing**: Use the `ratio` prop to control panel proportions
  - Higher ratio values get more space allocation
  - All panels' ratios are calculated proportionally
- **Auto Distribution**: Panels without explicit sizing automatically distribute remaining space
- **Dynamic Visibility**: Use the `show` prop to hide/show panels with automatic layout recalculation

**CSS Properties:**
- `min-width`, `min-height`: Minimum size constraints
- `max-width`, `max-height`: Maximum size constraints (optional)

### ResizableSplitter

A draggable divider that allows users to resize adjacent panels.

**Behavior:**
- Only affects the two immediately adjacent panels
- Automatically handles different panel configurations:
  - **Ratio-based Panels**: Adjusts ratio proportions dynamically
  - **Mixed Configurations**: Seamlessly handles combinations of different panel types
- **Smart Visibility**: Automatically hides when adjacent panels are hidden
- **Precise Calculations**: Uses ratio-based calculations for smooth resizing

**Styling:**
- Default size: 5px width/height
- Hover and active states included
- Fully customizable via CSS

## Contributing

Contributions are welcome! Please ensure:
- TypeScript types are properly maintained
- Changes follow the Flexbox-based architecture

## License

MIT