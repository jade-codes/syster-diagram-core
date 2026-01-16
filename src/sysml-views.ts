/**
 * SysML v2 View and Viewpoint Types
 * 
 * Views in SysML v2 present filtered, rendered subsets of a model
 * for specific stakeholders addressing specific concerns.
 * 
 * Key concepts:
 * - ViewDefinition: Reusable view template
 * - ViewUsage: Instance of a view
 * - ViewpointDefinition: Defines stakeholder concerns
 * - Expose: Selects model elements to include
 * - Filter: Constrains what's shown
 * - Rendering: Specifies presentation style
 */

// ========== Constants ==========

/** Standard SysML v2 view types */
export const VIEW_TYPES = {
  /** Basic view with nodes and compartments */
  GENERAL: "GeneralView",
  /** Shows parts with ports and connections (BDD-like) */
  INTERCONNECTION: "InterconnectionView",
  /** Shows actions and control/data flows (activity diagram) */
  ACTION_FLOW: "ActionFlowView",
  /** Shows states and transitions (state machine) */
  STATE_TRANSITION: "StateTransitionView",
  /** Shows message sequences between lifelines */
  SEQUENCE: "SequenceView",
} as const;

export type ViewType = typeof VIEW_TYPES[keyof typeof VIEW_TYPES];

/** Metaclass names for filtering */
export const METACLASSES = {
  // Definitions
  PART_DEF: "PartDef",
  PORT_DEF: "PortDef",
  ACTION_DEF: "ActionDef",
  STATE_DEF: "StateDef",
  REQUIREMENT_DEF: "RequirementDef",
  VIEW_DEF: "ViewDef",
  VIEWPOINT_DEF: "ViewpointDef",
  
  // Usages
  PART_USAGE: "PartUsage",
  PORT_USAGE: "PortUsage",
  ACTION_USAGE: "ActionUsage",
  STATE_USAGE: "StateUsage",
  REQUIREMENT_USAGE: "RequirementUsage",
  CONNECTION_USAGE: "ConnectionUsage",
  FLOW_USAGE: "FlowUsage",
  INTERFACE_USAGE: "InterfaceUsage",
  ALLOCATION_USAGE: "AllocationUsage",
} as const;

export type Metaclass = typeof METACLASSES[keyof typeof METACLASSES];

// ========== Expose Clause ==========

/**
 * Specifies which model elements to include in a view.
 * Similar to 'import' but for presentation purposes.
 */
export interface ExposeClause {
  /** Unique identifier */
  id: string;
  
  /** Qualified name of element or namespace to expose */
  target: string;
  
  /** If true, expose all direct members of the namespace */
  allMembers?: boolean;
  
  /** If true, recursively expose nested members */
  recursive?: boolean;
  
  /** Optional alias for the exposed element */
  alias?: string;
}

/**
 * Create an expose clause for a single element
 */
export function exposeMember(target: string, alias?: string): ExposeClause {
  return {
    id: `expose-${target}`,
    target,
    alias,
  };
}

/**
 * Create an expose clause for all members of a namespace (::*)
 */
export function exposeAllMembers(namespace: string): ExposeClause {
  return {
    id: `expose-${namespace}::*`,
    target: namespace,
    allMembers: true,
  };
}

/**
 * Create a recursive expose clause (::**)
 */
export function exposeRecursive(namespace: string): ExposeClause {
  return {
    id: `expose-${namespace}::**`,
    target: namespace,
    allMembers: true,
    recursive: true,
  };
}

// ========== Filter Expression ==========

/**
 * Constrains which exposed elements are actually shown.
 * Filters are evaluated as boolean expressions.
 */
export interface FilterExpression {
  /** Unique identifier */
  id: string;
  
  /** Filter by metaclass (e.g., "PartUsage") */
  metaclass?: Metaclass | string;
  
  /** Negate the filter (NOT) */
  not?: boolean;
  
  /** Combine with another filter (AND) */
  and?: FilterExpression;
  
  /** Combine with another filter (OR) */
  or?: FilterExpression;
  
  /** Custom expression string for complex filters */
  expression?: string;
}

/**
 * Create a filter for a specific metaclass
 */
export function filterByMetaclass(metaclass: Metaclass | string, negate = false): FilterExpression {
  return {
    id: `filter-${negate ? 'not-' : ''}${metaclass}`,
    metaclass,
    not: negate,
  };
}

/**
 * Combine two filters with AND
 */
export function andFilter(a: FilterExpression, b: FilterExpression): FilterExpression {
  return {
    ...a,
    id: `${a.id}-and-${b.id}`,
    and: b,
  };
}

/**
 * Combine two filters with OR
 */
export function orFilter(a: FilterExpression, b: FilterExpression): FilterExpression {
  return {
    ...a,
    id: `${a.id}-or-${b.id}`,
    or: b,
  };
}

// ========== Rendering ==========

/**
 * Reference to a rendering definition
 */
export interface RenderingReference {
  /** Qualified name of the rendering definition */
  name: string;
  
  /** Whether this is a pre-release rendering */
  preRelease?: boolean;
}

// ========== Viewpoint ==========

/**
 * Reference to a viewpoint that a view satisfies
 */
export interface ViewpointReference {
  /** Qualified name of the viewpoint */
  name: string;
}

/**
 * Stakeholder information for a viewpoint
 */
export interface Stakeholder {
  /** Name of the stakeholder */
  name: string;
  
  /** Type/role of the stakeholder */
  type?: string;
}

/**
 * A concern that a viewpoint addresses
 */
export interface Concern {
  /** Unique identifier */
  id: string;
  
  /** Name of the concern */
  name?: string;
  
  /** Description of the concern */
  description?: string;
}

/**
 * Viewpoint definition - defines what concerns a view addresses
 */
export interface ViewpointDefinition {
  /** Unique identifier */
  id: string;
  
  /** Name of the viewpoint */
  name: string;
  
  /** Fully qualified name */
  qualifiedName: string;
  
  /** Documentation/description */
  documentation?: string;
  
  /** Stakeholders this viewpoint serves */
  stakeholders: Stakeholder[];
  
  /** Concerns this viewpoint addresses */
  concerns: Concern[];
}

/**
 * Viewpoint usage - an instance of a viewpoint
 */
export interface ViewpointUsage {
  /** Unique identifier */
  id: string;
  
  /** Name of the viewpoint usage */
  name: string;
  
  /** Reference to the definition */
  definition?: string;
}

// ========== View Definition ==========

/**
 * View definition - a reusable template for views
 */
export interface ViewDefinition {
  /** Unique identifier */
  id: string;
  
  /** Name of the view definition */
  name: string;
  
  /** Fully qualified name */
  qualifiedName: string;
  
  /** Type of view (determines layout and rendering) */
  viewType: ViewType;
  
  /** Documentation/description */
  documentation?: string;
  
  /** Viewpoint this view satisfies */
  viewpoint?: ViewpointReference;
  
  /** Elements to expose in this view */
  exposes: ExposeClause[];
  
  /** Filters to apply to exposed elements */
  filters: FilterExpression[];
  
  /** How to render the view content */
  rendering?: RenderingReference;
  
  /** Nested view definitions */
  nestedViews?: ViewDefinition[];
}

// ========== View Usage ==========

/**
 * View usage - an instance of a view
 */
export interface ViewUsage {
  /** Unique identifier */
  id: string;
  
  /** Name of the view */
  name: string;
  
  /** Fully qualified name */
  qualifiedName: string;
  
  /** Reference to the view definition */
  definition?: string;
  
  /** Override exposes from definition */
  exposes?: ExposeClause[];
  
  /** Override filters from definition */
  filters?: FilterExpression[];
  
  /** Override rendering from definition */
  rendering?: RenderingReference;
}

// ========== Factory Functions ==========

/**
 * Create a new view definition
 */
export function createViewDefinition(
  name: string,
  viewType: ViewType = VIEW_TYPES.GENERAL,
  options: Partial<Omit<ViewDefinition, 'id' | 'name' | 'qualifiedName' | 'viewType'>> = {}
): ViewDefinition {
  return {
    id: `view-def-${name}`,
    name,
    qualifiedName: name,
    viewType,
    exposes: [],
    filters: [],
    ...options,
  };
}

/**
 * Create a new view usage
 */
export function createViewUsage(
  name: string,
  definition?: string,
  options: Partial<Omit<ViewUsage, 'id' | 'name' | 'qualifiedName' | 'definition'>> = {}
): ViewUsage {
  return {
    id: `view-${name}`,
    name,
    qualifiedName: name,
    definition,
    ...options,
  };
}

/**
 * Create a viewpoint definition
 */
export function createViewpointDefinition(
  name: string,
  options: Partial<Omit<ViewpointDefinition, 'id' | 'name' | 'qualifiedName'>> = {}
): ViewpointDefinition {
  return {
    id: `viewpoint-def-${name}`,
    name,
    qualifiedName: name,
    stakeholders: [],
    concerns: [],
    ...options,
  };
}
