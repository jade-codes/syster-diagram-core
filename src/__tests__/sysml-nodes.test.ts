import { describe, test, expect } from 'bun:test';
import { 
  NODE_TYPES,
  isDefinitionNode,
  isUsageNode,
  type SysMLNode,
} from '../sysml-nodes';

describe('NODE_TYPES', () => {
  test('exports all definition types', () => {
    const definitionTypes = [
      'PART_DEF', 'PORT_DEF', 'ACTION_DEF', 'STATE_DEF', 'ITEM_DEF',
      'ATTRIBUTE_DEF', 'REQUIREMENT_DEF', 'CONSTRAINT_DEF', 'VIEW_DEF',
      'CASE_DEF', 'CALCULATION_DEF', 'CONNECTION_DEF', 'INTERFACE_DEF',
    ];
    
    for (const type of definitionTypes) {
      expect(NODE_TYPES[type as keyof typeof NODE_TYPES]).toBeDefined();
    }
  });

  test('exports all usage types', () => {
    const usageTypes = [
      'PART_USAGE', 'PORT_USAGE', 'ACTION_USAGE', 'ITEM_USAGE',
      'ATTRIBUTE_USAGE', 'REQUIREMENT_USAGE', 'CASE_USAGE', 'VIEW_USAGE',
    ];
    
    for (const type of usageTypes) {
      expect(NODE_TYPES[type as keyof typeof NODE_TYPES]).toBeDefined();
    }
  });

  test('definition types end with "Def"', () => {
    const defEntries = Object.entries(NODE_TYPES).filter(([key]) => key.endsWith('_DEF'));
    
    for (const [, value] of defEntries) {
      expect(value).toMatch(/Def$/);
    }
  });

  test('usage types end with "Usage"', () => {
    const usageEntries = Object.entries(NODE_TYPES).filter(([key]) => key.endsWith('_USAGE'));
    
    for (const [, value] of usageEntries) {
      expect(value).toMatch(/Usage$/);
    }
  });

  test('all values are unique', () => {
    const values = Object.values(NODE_TYPES);
    const uniqueValues = new Set(values);
    expect(uniqueValues.size).toBe(values.length);
  });

  test('has expected total count', () => {
    const count = Object.keys(NODE_TYPES).length;
    // Should have at least 40 node types (defs + usages + KerML types)
    expect(count).toBeGreaterThanOrEqual(40);
  });

  test('is a const object', () => {
    expect(typeof NODE_TYPES).toBe('object');
    expect(NODE_TYPES).not.toBeNull();
  });
});

describe('isDefinitionNode', () => {
  test('returns true for definition nodes', () => {
    const defNode: SysMLNode = {
      id: 'test-1',
      type: NODE_TYPES.PART_DEF,
      name: 'TestPart',
      qualifiedName: 'Pkg::TestPart',
    };
    
    expect(isDefinitionNode(defNode)).toBe(true);
  });

  test('returns true for various definition types', () => {
    const defTypes = [
      NODE_TYPES.PORT_DEF,
      NODE_TYPES.ACTION_DEF,
      NODE_TYPES.REQUIREMENT_DEF,
      NODE_TYPES.CONSTRAINT_DEF,
    ];
    
    for (const type of defTypes) {
      const node: SysMLNode = {
        id: 'test',
        type,
        name: 'Test',
        qualifiedName: 'Pkg::Test',
      };
      expect(isDefinitionNode(node)).toBe(true);
    }
  });

  test('returns false for usage nodes', () => {
    const usageNode: SysMLNode = {
      id: 'test-1',
      type: NODE_TYPES.PART_USAGE,
      name: 'myPart',
      qualifiedName: 'Pkg::myPart',
    };
    
    expect(isDefinitionNode(usageNode)).toBe(false);
  });
});

describe('isUsageNode', () => {
  test('returns true for usage nodes', () => {
    const usageNode: SysMLNode = {
      id: 'test-1',
      type: NODE_TYPES.PART_USAGE,
      name: 'myPart',
      qualifiedName: 'Pkg::myPart',
    };
    
    expect(isUsageNode(usageNode)).toBe(true);
  });

  test('returns true for various usage types', () => {
    const usageTypes = [
      NODE_TYPES.PORT_USAGE,
      NODE_TYPES.ACTION_USAGE,
      NODE_TYPES.REQUIREMENT_USAGE,
      NODE_TYPES.ATTRIBUTE_USAGE,
    ];
    
    for (const type of usageTypes) {
      const node: SysMLNode = {
        id: 'test',
        type,
        name: 'test',
        qualifiedName: 'Pkg::test',
      };
      expect(isUsageNode(node)).toBe(true);
    }
  });

  test('returns false for definition nodes', () => {
    const defNode: SysMLNode = {
      id: 'test-1',
      type: NODE_TYPES.PART_DEF,
      name: 'TestPart',
      qualifiedName: 'Pkg::TestPart',
    };
    
    expect(isUsageNode(defNode)).toBe(false);
  });
});
