/**
 * View Resolver
 * 
 * Resolves view definitions and usages into concrete diagram content
 * by applying expose clauses and filter expressions.
 */

import type { DiagramNode, DiagramEdge } from './index';
import type {
  ViewDefinition,
  ViewUsage,
  ExposeClause,
  FilterExpression,
  ViewType,
} from './sysml-views';
import { VIEW_TYPES } from './sysml-views';

// ========== Model Context ==========

/**
 * Represents a SysML element in the model
 */
export interface SysMLElement {
  /** Unique identifier */
  id: string;
  
  /** Simple name */
  name: string;
  
  /** Fully qualified name */
  qualifiedName: string;
  
  /** Metaclass type (e.g., "PartUsage", "PortDef") */
  metaclass: string;
  
  /** Parent element's qualified name */
  parent?: string;
  
  /** Child element qualified names */
  children: string[];
  
  /** Additional properties */
  properties: Record<string, unknown>;
}

/**
 * Represents a relationship in the model
 */
export interface SysMLRelationship {
  /** Unique identifier */
  id: string;
  
  /** Type of relationship (e.g., "specialization", "dependency") */
  type: string;
  
  /** Source element qualified name */
  source: string;
  
  /** Target element qualified name */
  target: string;
  
  /** Additional properties */
  properties: Record<string, unknown>;
}

/**
 * The model context containing all elements and relationships
 */
export interface ModelContext {
  /** All elements keyed by qualified name */
  elements: Map<string, SysMLElement>;
  
  /** All relationships */
  relationships: SysMLRelationship[];
}

/**
 * Create an empty model context
 */
export function createModelContext(): ModelContext {
  return {
    elements: new Map(),
    relationships: [],
  };
}

/**
 * Add an element to the model context
 */
export function addElement(context: ModelContext, element: SysMLElement): void {
  context.elements.set(element.qualifiedName, element);
}

/**
 * Add a relationship to the model context
 */
export function addRelationship(context: ModelContext, relationship: SysMLRelationship): void {
  context.relationships.push(relationship);
}

// ========== Expose Resolution ==========

/**
 * Collect elements based on expose clauses
 */
export function collectExposedElements(
  exposes: ExposeClause[],
  context: ModelContext
): SysMLElement[] {
  const result = new Map<string, SysMLElement>();
  
  for (const expose of exposes) {
    const exposed = resolveExposeClause(expose, context);
    for (const element of exposed) {
      result.set(element.qualifiedName, element);
    }
  }
  
  return Array.from(result.values());
}

/**
 * Resolve a single expose clause to elements
 */
function resolveExposeClause(
  expose: ExposeClause,
  context: ModelContext
): SysMLElement[] {
  const { target, allMembers, recursive } = expose;
  
  // Direct element reference
  const element = context.elements.get(target);
  if (!element) {
    // Target not found - could be a namespace pattern
    return resolveNamespacePattern(target, allMembers ?? false, recursive ?? false, context);
  }
  
  if (!allMembers) {
    // Single element
    return [element];
  }
  
  // Expose members
  return exposeMembers(element, recursive ?? false, context);
}

/**
 * Resolve a namespace pattern like "Package::*" or "Package::**"
 */
function resolveNamespacePattern(
  pattern: string,
  allMembers: boolean,
  recursive: boolean,
  context: ModelContext
): SysMLElement[] {
  const result: SysMLElement[] = [];
  const prefix = pattern.replace(/::(\*{1,2})?$/, '');
  
  for (const [qualifiedName, element] of context.elements) {
    if (qualifiedName.startsWith(prefix + '::')) {
      const remainder = qualifiedName.slice(prefix.length + 2);
      const isDirectChild = !remainder.includes('::');
      
      if (recursive || isDirectChild) {
        result.push(element);
      }
    }
  }
  
  return result;
}

/**
 * Expose members of an element
 */
function exposeMembers(
  element: SysMLElement,
  recursive: boolean,
  context: ModelContext
): SysMLElement[] {
  const result: SysMLElement[] = [element];
  
  for (const childName of element.children) {
    const child = context.elements.get(childName);
    if (child) {
      if (recursive) {
        result.push(...exposeMembers(child, true, context));
      } else {
        result.push(child);
      }
    }
  }
  
  return result;
}

// ========== Filter Application ==========

/**
 * Apply filters to a list of elements
 */
export function applyFilters(
  elements: SysMLElement[],
  filters: FilterExpression[]
): SysMLElement[] {
  if (filters.length === 0) {
    return elements;
  }
  
  return elements.filter(element => {
    // All filters must pass (implicit AND between top-level filters)
    return filters.every(filter => evaluateFilter(element, filter));
  });
}

/**
 * Evaluate a filter expression against an element
 */
function evaluateFilter(element: SysMLElement, filter: FilterExpression): boolean {
  let result = true;
  
  // Metaclass filter
  if (filter.metaclass) {
    result = element.metaclass === filter.metaclass;
  }
  
  // Custom expression (simplified - just check if metaclass contains the expression)
  if (filter.expression) {
    result = element.metaclass.includes(filter.expression) ||
             element.name.includes(filter.expression);
  }
  
  // Negate if needed
  if (filter.not) {
    result = !result;
  }
  
  // AND combination
  if (filter.and && result) {
    result = result && evaluateFilter(element, filter.and);
  }
  
  // OR combination
  if (filter.or && !result) {
    result = evaluateFilter(element, filter.or);
  }
  
  return result;
}

// ========== Element to Node Conversion ==========

/**
 * Convert a SysML element to a diagram node
 */
export function elementToNode(element: SysMLElement): DiagramNode {
  return {
    id: element.id,
    type: element.metaclass,
    position: { x: 0, y: 0 }, // Position will be set by layout
    data: {
      name: element.name,
      qualifiedName: element.qualifiedName,
      ...element.properties,
    },
  };
}

/**
 * Find relationships between elements and convert to edges
 */
export function findRelationshipEdges(
  elements: SysMLElement[],
  relationships: SysMLRelationship[]
): DiagramEdge[] {
  const elementNames = new Set(elements.map(e => e.qualifiedName));
  
  return relationships
    .filter(rel => 
      elementNames.has(rel.source) && elementNames.has(rel.target)
    )
    .map(rel => ({
      id: rel.id,
      source: rel.source,
      target: rel.target,
      type: rel.type,
      ...rel.properties,
    }));
}

// ========== View Resolution Result ==========

/**
 * Result of resolving a view
 */
export interface ResolvedView {
  /** The view usage that was resolved */
  view: ViewUsage;
  
  /** The view definition (merged with usage overrides) */
  definition: ViewDefinition;
  
  /** Diagram nodes to render */
  nodes: DiagramNode[];
  
  /** Diagram edges to render */
  edges: DiagramEdge[];
  
  /** Exposed elements before filtering */
  exposedCount: number;
  
  /** Elements after filtering */
  filteredCount: number;
}

// ========== Main Resolution Function ==========

/**
 * Resolve a view usage to concrete diagram content
 */
export function resolveView(
  view: ViewUsage,
  viewDef: ViewDefinition,
  context: ModelContext
): ResolvedView {
  // Merge view usage overrides with definition
  const effectiveExposes = view.exposes ?? viewDef.exposes;
  const effectiveFilters = view.filters ?? viewDef.filters;
  
  // Step 1: Collect exposed elements
  const exposedElements = collectExposedElements(effectiveExposes, context);
  
  // Step 2: Apply filters
  const filteredElements = applyFilters(exposedElements, effectiveFilters);
  
  // Step 3: Convert to diagram nodes
  const nodes = filteredElements.map(elementToNode);
  
  // Step 4: Find relationships as edges
  const edges = findRelationshipEdges(filteredElements, context.relationships);
  
  return {
    view,
    definition: viewDef,
    nodes,
    edges,
    exposedCount: exposedElements.length,
    filteredCount: filteredElements.length,
  };
}

// ========== View Type Helpers ==========

/**
 * Get default filters for a view type
 */
export function getDefaultFiltersForViewType(viewType: ViewType): FilterExpression[] {
  switch (viewType) {
    case VIEW_TYPES.INTERCONNECTION:
      return [
        { id: 'filter-parts', metaclass: 'PartUsage' },
        { id: 'filter-ports', metaclass: 'PortUsage', or: { id: 'filter-parts-2', metaclass: 'PartUsage' } },
      ];
    
    case VIEW_TYPES.ACTION_FLOW:
      return [
        { id: 'filter-actions', metaclass: 'ActionUsage' },
      ];
    
    case VIEW_TYPES.STATE_TRANSITION:
      return [
        { id: 'filter-states', metaclass: 'StateUsage' },
      ];
    
    default:
      return [];
  }
}

/**
 * Suggest a view type based on the elements present
 */
export function suggestViewType(elements: SysMLElement[]): ViewType {
  const metaclasses = new Set(elements.map(e => e.metaclass));
  
  if (metaclasses.has('StateUsage') || metaclasses.has('StateDef')) {
    return VIEW_TYPES.STATE_TRANSITION;
  }
  
  if (metaclasses.has('ActionUsage') || metaclasses.has('ActionDef')) {
    return VIEW_TYPES.ACTION_FLOW;
  }
  
  if (metaclasses.has('PortUsage') || metaclasses.has('ConnectionUsage')) {
    return VIEW_TYPES.INTERCONNECTION;
  }
  
  return VIEW_TYPES.GENERAL;
}
