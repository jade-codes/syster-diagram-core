import { describe, it, expect } from 'bun:test';
import {
  createModelContext,
  addElement,
  addRelationship,
  collectExposedElements,
  applyFilters,
  resolveView,
  suggestViewType,
  type SysMLElement,
} from '../view-resolver';
import {
  VIEW_TYPES,
  exposeMember,
  exposeAllMembers,
  exposeRecursive,
  filterByMetaclass,
  createViewDefinition,
  createViewUsage,
} from '../sysml-views';

function createElement(id: string, name: string, metaclass: string, parent?: string): SysMLElement {
  return {
    id,
    name,
    qualifiedName: parent ? `${parent}::${name}` : name,
    metaclass,
    parent,
    children: [],
    properties: {},
  };
}

describe('view-resolver', () => {
  describe('createModelContext', () => {
    it('creates an empty model context', () => {
      const ctx = createModelContext();
      expect(ctx.elements.size).toBe(0);
      expect(ctx.relationships).toEqual([]);
    });
  });

  describe('addElement / addRelationship', () => {
    it('adds elements to context', () => {
      const ctx = createModelContext();
      const el = createElement('1', 'Part1', 'PartUsage');
      addElement(ctx, el);
      expect(ctx.elements.size).toBe(1);
      expect(ctx.elements.get('Part1')).toEqual(el);
    });

    it('adds relationships to context', () => {
      const ctx = createModelContext();
      addRelationship(ctx, {
        id: 'rel1',
        type: 'specialization',
        source: 'Part1',
        target: 'Part2',
        properties: {},
      });
      expect(ctx.relationships).toHaveLength(1);
    });
  });

  describe('collectExposedElements', () => {
    it('exposes a single element by qualified name', () => {
      const ctx = createModelContext();
      addElement(ctx, createElement('1', 'Vehicle', 'PartDef'));
      
      const exposed = collectExposedElements([exposeMember('Vehicle')], ctx);
      expect(exposed).toHaveLength(1);
      expect(exposed[0].name).toBe('Vehicle');
    });

    it('exposes namespace members', () => {
      const ctx = createModelContext();
      const parent = createElement('1', 'Vehicle', 'Package');
      parent.children = ['Vehicle::Engine', 'Vehicle::Wheel'];
      addElement(ctx, parent);
      addElement(ctx, createElement('2', 'Engine', 'PartDef', 'Vehicle'));
      addElement(ctx, createElement('3', 'Wheel', 'PartDef', 'Vehicle'));
      
      // Fix qualified names for children
      ctx.elements.set('Vehicle::Engine', ctx.elements.get('Engine')!);
      ctx.elements.set('Vehicle::Wheel', ctx.elements.get('Wheel')!);
      
      const exposed = collectExposedElements([exposeAllMembers('Vehicle')], ctx);
      expect(exposed.length).toBeGreaterThanOrEqual(1);
    });

    it('returns empty for non-existent element', () => {
      const ctx = createModelContext();
      const exposed = collectExposedElements([exposeMember('NonExistent')], ctx);
      expect(exposed).toHaveLength(0);
    });
  });

  describe('applyFilters', () => {
    const elements: SysMLElement[] = [
      createElement('1', 'Engine', 'PartUsage'),
      createElement('2', 'FuelPort', 'PortUsage'),
      createElement('3', 'Drive', 'ActionUsage'),
    ];

    it('returns all elements when no filters', () => {
      const filtered = applyFilters(elements, []);
      expect(filtered).toHaveLength(3);
    });

    it('filters by metaclass', () => {
      const filtered = applyFilters(elements, [filterByMetaclass('PartUsage')]);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Engine');
    });

    it('applies NOT filter', () => {
      const filtered = applyFilters(elements, [filterByMetaclass('PortUsage', true)]);
      expect(filtered).toHaveLength(2);
      expect(filtered.map(e => e.name)).toContain('Engine');
      expect(filtered.map(e => e.name)).toContain('Drive');
    });
  });

  describe('resolveView', () => {
    it('resolves a complete view', () => {
      const ctx = createModelContext();
      addElement(ctx, createElement('1', 'System', 'Package'));
      addElement(ctx, createElement('2', 'Part1', 'PartUsage'));
      addElement(ctx, createElement('3', 'Port1', 'PortUsage'));
      
      const viewDef = createViewDefinition('SystemView', VIEW_TYPES.GENERAL, {
        exposes: [exposeMember('Part1'), exposeMember('Port1')],
      });
      const viewUsage = createViewUsage('myView', viewDef.id);
      
      const result = resolveView(viewUsage, viewDef, ctx);
      
      expect(result.view).toBe(viewUsage);
      expect(result.definition).toBe(viewDef);
      expect(result.nodes).toHaveLength(2);
      expect(result.exposedCount).toBe(2);
      expect(result.filteredCount).toBe(2);
    });

    it('applies filters during resolution', () => {
      const ctx = createModelContext();
      addElement(ctx, createElement('1', 'Part1', 'PartUsage'));
      addElement(ctx, createElement('2', 'Port1', 'PortUsage'));
      
      const viewDef = createViewDefinition('PartsOnly', VIEW_TYPES.INTERCONNECTION, {
        exposes: [exposeMember('Part1'), exposeMember('Port1')],
        filters: [filterByMetaclass('PartUsage')],
      });
      const viewUsage = createViewUsage('myView', viewDef.id);
      
      const result = resolveView(viewUsage, viewDef, ctx);
      
      expect(result.exposedCount).toBe(2);
      expect(result.filteredCount).toBe(1);
      expect(result.nodes[0].type).toBe('PartUsage');
    });
  });

  describe('suggestViewType', () => {
    it('suggests StateTransition for state elements', () => {
      const elements = [createElement('1', 'Idle', 'StateUsage')];
      expect(suggestViewType(elements)).toBe(VIEW_TYPES.STATE_TRANSITION);
    });

    it('suggests ActionFlow for action elements', () => {
      const elements = [createElement('1', 'Process', 'ActionUsage')];
      expect(suggestViewType(elements)).toBe(VIEW_TYPES.ACTION_FLOW);
    });

    it('suggests Interconnection for port elements', () => {
      const elements = [createElement('1', 'DataPort', 'PortUsage')];
      expect(suggestViewType(elements)).toBe(VIEW_TYPES.INTERCONNECTION);
    });

    it('defaults to General', () => {
      const elements = [createElement('1', 'Thing', 'PartDef')];
      expect(suggestViewType(elements)).toBe(VIEW_TYPES.GENERAL);
    });
  });
});
