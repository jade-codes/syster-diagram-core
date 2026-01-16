import { describe, it, expect } from 'bun:test';
import {
  VIEW_TYPES,
  METACLASSES,
  exposeMember,
  exposeAllMembers,
  exposeRecursive,
  filterByMetaclass,
  andFilter,
  orFilter,
  createViewDefinition,
  createViewUsage,
  createViewpointDefinition,
} from '../sysml-views';

describe('sysml-views', () => {
  describe('VIEW_TYPES', () => {
    it('should have all view types defined', () => {
      expect(VIEW_TYPES.GENERAL).toBe('GeneralView');
      expect(VIEW_TYPES.INTERCONNECTION).toBe('InterconnectionView');
      expect(VIEW_TYPES.ACTION_FLOW).toBe('ActionFlowView');
      expect(VIEW_TYPES.STATE_TRANSITION).toBe('StateTransitionView');
      expect(VIEW_TYPES.SEQUENCE).toBe('SequenceView');
    });
  });

  describe('METACLASSES', () => {
    it('should have common SysML metaclasses', () => {
      expect(METACLASSES.PART_DEF).toBeDefined();
      expect(METACLASSES.PART_USAGE).toBeDefined();
      expect(METACLASSES.PORT_DEF).toBeDefined();
      expect(METACLASSES.ACTION_DEF).toBeDefined();
      expect(METACLASSES.STATE_DEF).toBeDefined();
    });
  });

  describe('ExposeClause factories', () => {
    it('exposeMember creates a simple expose clause', () => {
      const clause = exposeMember('Package::MyPart');
      expect(clause.target).toBe('Package::MyPart');
      expect(clause.allMembers).toBeFalsy();
      expect(clause.recursive).toBeFalsy();
    });

    it('exposeAllMembers exposes all members', () => {
      const clause = exposeAllMembers('Package::SubPackage');
      expect(clause.target).toBe('Package::SubPackage');
      expect(clause.allMembers).toBe(true);
      expect(clause.recursive).toBeFalsy();
    });

    it('exposeRecursive exposes members recursively', () => {
      const clause = exposeRecursive('Package::SubPackage');
      expect(clause.target).toBe('Package::SubPackage');
      expect(clause.allMembers).toBe(true);
      expect(clause.recursive).toBe(true);
    });
  });

  describe('FilterExpression factories', () => {
    it('filterByMetaclass creates metaclass filter', () => {
      const filter = filterByMetaclass('PartUsage');
      expect(filter.metaclass).toBe('PartUsage');
      expect(filter.not).toBeFalsy();
    });

    it('filterByMetaclass with negate creates NOT filter', () => {
      const filter = filterByMetaclass('PortUsage', true);
      expect(filter.metaclass).toBe('PortUsage');
      expect(filter.not).toBe(true);
    });

    it('andFilter combines filters with AND', () => {
      const f1 = filterByMetaclass('PartUsage');
      const f2 = filterByMetaclass('PortUsage');
      const combined = andFilter(f1, f2);
      expect(combined.metaclass).toBe('PartUsage');
      expect(combined.and?.metaclass).toBe('PortUsage');
    });

    it('orFilter combines filters with OR', () => {
      const f1 = filterByMetaclass('PartUsage');
      const f2 = filterByMetaclass('PortUsage');
      const combined = orFilter(f1, f2);
      expect(combined.metaclass).toBe('PartUsage');
      expect(combined.or?.metaclass).toBe('PortUsage');
    });
  });

  describe('createViewDefinition', () => {
    it('creates a view definition with required fields', () => {
      const viewDef = createViewDefinition('VehicleView', VIEW_TYPES.GENERAL, {
        exposes: [exposeAllMembers('Vehicle')],
      });

      expect(viewDef.id).toBeDefined();
      expect(viewDef.name).toBe('VehicleView');
      expect(viewDef.viewType).toBe('GeneralView');
      expect(viewDef.exposes).toHaveLength(1);
      expect(viewDef.filters).toEqual([]);
    });

    it('creates a view definition with filters', () => {
      const viewDef = createViewDefinition('PartsOnlyView', VIEW_TYPES.INTERCONNECTION, {
        exposes: [exposeRecursive('System')],
        filters: [filterByMetaclass('PartUsage')],
      });

      expect(viewDef.viewType).toBe('InterconnectionView');
      expect(viewDef.filters).toHaveLength(1);
      expect(viewDef.filters[0].metaclass).toBe('PartUsage');
    });
  });

  describe('createViewUsage', () => {
    it('creates a view usage referencing a definition', () => {
      const viewDef = createViewDefinition('BaseView', VIEW_TYPES.GENERAL, []);
      const usage = createViewUsage('myView', viewDef.id);

      expect(usage.id).toBeDefined();
      expect(usage.name).toBe('myView');
      expect(usage.definition).toBe(viewDef.id);
    });

    it('allows overriding exposes and filters', () => {
      const usage = createViewUsage('customView', 'def-123', {
        exposes: [exposeMember('CustomPart')],
        filters: [filterByMetaclass('ActionUsage')],
      });

      expect(usage.exposes).toHaveLength(1);
      expect(usage.filters).toHaveLength(1);
    });
  });

  describe('createViewpointDefinition', () => {
    it('creates a viewpoint definition', () => {
      const vp = createViewpointDefinition('SafetyViewpoint', {
        concerns: [filterByMetaclass('RequirementUsage')],
      });

      expect(vp.id).toBeDefined();
      expect(vp.name).toBe('SafetyViewpoint');
      expect(vp.concerns).toHaveLength(1);
    });
  });
});
