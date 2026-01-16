# @syster/diagram-core

Core data types and conversion utilities for SysML v2 diagrams.

## Installation

```bash
npm install @syster/diagram-core
```

## Usage

```typescript
import { 
  convertLspToDiagram, 
  applyAutoLayout,
  SysMLNodeType,
  SysMLEdgeType
} from '@syster/diagram-core';

// Convert LSP diagram data to React Flow format
const { nodes, edges } = convertLspToDiagram(lspDiagramData);

// Apply automatic layout
const layoutedNodes = applyAutoLayout(nodes, edges);
```

## Features

- Type definitions for SysML diagram nodes and edges
- LSP to React Flow data conversion
- Automatic layout algorithms
- SysML-specific node/edge type mappings

## License

MIT

## Development

### DevContainer Setup (Recommended)

This project includes a DevContainer configuration for a consistent development environment.

**Using VS Code:**
1. Install the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
2. Open this repository in VS Code
3. Click "Reopen in Container" when prompted (or use Command Palette: "Dev Containers: Reopen in Container")

**What's included:**
- Node.js 20 LTS
- Bun runtime
- ESLint, Prettier
- GitHub CLI
- All VS Code extensions pre-configured

### Manual Setup

If not using DevContainer:

```bash
# Install dependencies
npm install
# or
bun install

# Run tests
npm test
# or
bun test
```
