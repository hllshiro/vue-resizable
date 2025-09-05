# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2025-09-05

### Features
- **(splitter):** Added a feature to equally distribute space between adjacent panels on double-click.

### Bug Fixes
- **(resizable-panel):** Corrected the minimum size detection logic and removed the default minimum width.

### Documentation
- **(README):** Updated the README file and added a Chinese version.

## [0.1.1]

### Bug Fixes
- **(resizable-container):** Fixed an issue where a single panel would not correctly fill the container and optimized container management.
- Removed an unused file.

### Code Refactoring
- **(core):** Refactored panel and container state management to use a type-safe provide/inject mechanism.
- **(resizable-container):** Optimized panel size initialization and ratio synchronization logic.

### Documentation
- Updated the demo GIF.

## [0.0.5]

### Performance Improvements
- Updated the demo application.

### Code Refactoring
- **(resizable):** Switched to using the 'ratio' property to manage panel size proportions.

### Chore
- **(deps):** Unified and updated dependencies to resolve TypeScript type mismatch issues.

## [0.0.4]

### Features
- Added support for showing/hiding panels, with automatic handling of the associated splitter.
- **(layout):** Components without a specified size now automatically share the remaining container space.

### Bug Fixes
- Fixed a missing component export.
- **(resizable-container):** Optimized panel initialization logic and style application.

### Chore
- Added a demo project.

## [0.0.3]

### Chore
- Fixed a CSS export issue.
- Major project refactoring including renaming the package, updating package information, and restructuring files and directories.
