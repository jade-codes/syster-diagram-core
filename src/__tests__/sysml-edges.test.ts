import { describe, test, expect } from 'bun:test';
import { 
  EDGE_TYPES,
  isRelationshipEdge,
  isStructuralEdge,
  type SysMLEdge,
} from '../sysml-edges';

describe('EDGE_TYPES', () => {
  test('exports core relationship types', () => {
    const coreTypes = [
      'SPECIALIZATION', 'REDEFINITION', 'SUBSETTING', 'TYPING',
    ];
    
    for (const type of coreTypes) {
      expect(EDGE_TYPES[type as keyof typeof EDGE_TYPES]).toBeDefined();
    }
  });

  test('exports domain-specific types', () => {
    const domainTypes = [
      'SATISFY', 'PERFORM', 'VERIFY', 'DEPENDENCY',
    ];
    
    for (const type of domainTypes) {
      expect(EDGE_TYPES[type as keyof typeof EDGE_TYPES]).toBeDefined();
    }
  });

  test('exports structural types', () => {
    const structuralTypes = [
      'COMPOSITION', 'CONNECTION', 'FLOW', 'ALLOCATION',
    ];
    
    for (const type of structuralTypes) {
      expect(EDGE_TYPES[type as keyof typeof EDGE_TYPES]).toBeDefined();
    }
  });

  test('all values are lowercase', () => {
    for (const value of Object.values(EDGE_TYPES)) {
      expect(value).toBe(value.toLowerCase());
    }
  });

  test('all values are unique', () => {
    const values = Object.values(EDGE_TYPES);
    const uniqueValues = new Set(values);
    expect(uniqueValues.size).toBe(values.length);
  });

  test('has expected total count', () => {
    const count = Object.keys(EDGE_TYPES).length;
    // Should have at least 15 edge types
    expect(count).toBeGreaterThanOrEqual(15);
  });

  test('is a const object', () => {
    expect(typeof EDGE_TYPES).toBe('object');
    expect(EDGE_TYPES).not.toBeNull();
  });
});

describe('isRelationshipEdge', () => {
  test('returns true for specialization edge', () => {
    const edge: SysMLEdge = {
      id: 'edge-1',
      type: EDGE_TYPES.SPECIALIZATION,
      source: 'node-1',
      target: 'node-2',
    };
    
    expect(isRelationshipEdge(edge)).toBe(true);
  });

  test('returns true for typing edge', () => {
    const edge: SysMLEdge = {
      id: 'edge-1',
      type: EDGE_TYPES.TYPING,
      source: 'node-1',
      target: 'node-2',
    };
    
    expect(isRelationshipEdge(edge)).toBe(true);
  });

  test('returns true for satisfy edge', () => {
    const edge: SysMLEdge = {
      id: 'edge-1',
      type: EDGE_TYPES.SATISFY,
      source: 'node-1',
      target: 'node-2',
    };
    
    expect(isRelationshipEdge(edge)).toBe(true);
  });

  test('returns false for composition edge', () => {
    const edge: SysMLEdge = {
      id: 'edge-1',
      type: EDGE_TYPES.COMPOSITION,
      source: 'node-1',
      target: 'node-2',
    };
    
    expect(isRelationshipEdge(edge)).toBe(false);
  });

  test('returns false for flow edge', () => {
    const edge: SysMLEdge = {
      id: 'edge-1',
      type: EDGE_TYPES.FLOW,
      source: 'node-1',
      target: 'node-2',
    };
    
    expect(isRelationshipEdge(edge)).toBe(false);
  });
});

describe('isStructuralEdge', () => {
  test('returns true for composition edge', () => {
    const edge: SysMLEdge = {
      id: 'edge-1',
      type: EDGE_TYPES.COMPOSITION,
      source: 'node-1',
      target: 'node-2',
    };
    
    expect(isStructuralEdge(edge)).toBe(true);
  });

  test('returns true for connection edge', () => {
    const edge: SysMLEdge = {
      id: 'edge-1',
      type: EDGE_TYPES.CONNECTION,
      source: 'node-1',
      target: 'node-2',
    };
    
    expect(isStructuralEdge(edge)).toBe(true);
  });

  test('returns true for flow edge', () => {
    const edge: SysMLEdge = {
      id: 'edge-1',
      type: EDGE_TYPES.FLOW,
      source: 'node-1',
      target: 'node-2',
    };
    
    expect(isStructuralEdge(edge)).toBe(true);
  });

  test('returns true for allocation edge', () => {
    const edge: SysMLEdge = {
      id: 'edge-1',
      type: EDGE_TYPES.ALLOCATION,
      source: 'node-1',
      target: 'node-2',
    };
    
    expect(isStructuralEdge(edge)).toBe(true);
  });

  test('returns false for specialization edge', () => {
    const edge: SysMLEdge = {
      id: 'edge-1',
      type: EDGE_TYPES.SPECIALIZATION,
      source: 'node-1',
      target: 'node-2',
    };
    
    expect(isStructuralEdge(edge)).toBe(false);
  });

  test('returns false for typing edge', () => {
    const edge: SysMLEdge = {
      id: 'edge-1',
      type: EDGE_TYPES.TYPING,
      source: 'node-1',
      target: 'node-2',
    };
    
    expect(isStructuralEdge(edge)).toBe(false);
  });
});
