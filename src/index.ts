/**
 * @syster/diagram-core
 * 
 * Core diagram types and utilities for Syster SysML v2 modeller.
 */

export interface DiagramNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
}

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  label?: string;
  multiplicity?: string;
}

export interface Diagram {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

export const createEmptyDiagram = (): Diagram => ({
  nodes: [],
  edges: [],
});

export * from "./sysml-nodes";
export * from "./sysml-edges";
export * from "./converter";
export * from "./layout";
export * from "./sysml-views";
export * from "./view-resolver";
