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
