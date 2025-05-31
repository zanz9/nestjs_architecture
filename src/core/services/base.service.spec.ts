import { BaseService } from './base.service';
import { Repository } from 'typeorm';

type Dummy = any;

class DummyService extends BaseService<Dummy> {
  constructor() {
    // @ts-ignore
    super({} as Repository<Dummy>);
  }
}

describe('BaseService.getWhere', () => {
  let service: DummyService;

  beforeEach(() => {
    service = new DummyService();
  });

  it('should handle AND (default)', async () => {
    const where = await service.getWhere({ name: 'сыр', inStock: true });
    expect(where).toEqual({ name: 'сыр', inStock: true });
  });

  it('should handle OR', async () => {
    const where = await service.getWhere({ or: [{ id: 1 }, { id: 2 }] });
    expect(where).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it('should handle LIKE', async () => {
    const where = await service.getWhere({ name: { like: 'сыр' } });
    expect(where.name.type).toBe('ilike');
    expect(where.name.value).toContain('сыр');
  });

  it('should handle IN', async () => {
    const where = await service.getWhere({ id: { in: [1, 2, 3] } });
    expect(where.id.type).toBe('in');
    expect(where.id.value).toEqual([1, 2, 3]);
  });

  it('should handle BETWEEN', async () => {
    const where = await service.getWhere({ price: { from: 100, to: 200 } });
    expect(where.price.type).toBe('between');
    expect(where.price.value).toEqual([100, 200]);
  });

  it('should handle IS NULL', async () => {
    const where = await service.getWhere({ photoId: { isNull: true } });
    expect(where.photoId.type).toBe('isNull');
  });

  it('should handle gt + lt as Between', async () => {
    const where = await service.getWhere({ price: { gt: 100, lt: 200 } });
    expect(where.price.type).toBe('between');
    expect(where.price.value).toEqual([100, 200]);
  });

  it('should handle gt', async () => {
    const where = await service.getWhere({ price: { gt: 100 } });
    expect(where.price.type).toBe('moreThan');
    expect(where.price.value).toBe(100);
  });

  it('should handle lt', async () => {
    const where = await service.getWhere({ price: { lt: 200 } });
    expect(where.price.type).toBe('lessThan');
    expect(where.price.value).toBe(200);
  });

  it('should handle gte', async () => {
    const where = await service.getWhere({ price: { gte: 100 } });
    expect(where.price.type).toBe('moreThanOrEqual');
    expect(where.price.value).toBe(100);
  });

  it('should handle lte', async () => {
    const where = await service.getWhere({ price: { lte: 200 } });
    expect(where.price.type).toBe('lessThanOrEqual');
    expect(where.price.value).toBe(200);
  });

  it('should handle startsWith', async () => {
    const where = await service.getWhere({ name: { startsWith: 'мо' } });
    expect(where.name.type).toBe('ilike');
    expect(where.name.value.startsWith('мо')).toBe(true);
  });

  it('should handle endsWith', async () => {
    const where = await service.getWhere({ name: { endsWith: 'ко' } });
    expect(where.name.type).toBe('ilike');
    expect(where.name.value.endsWith('ко')).toBe(true);
  });

  it('should handle NOT', async () => {
    const where = await service.getWhere({ not: { inStock: true } });
    expect(where.type).toBe('not');
  });

  it('should handle nested conditions', async () => {
    const where = await service.getWhere({ user: { id: 1 } });
    expect(where.user).toEqual({ id: 1 });
  });

  it('should handle complex AND + OR', async () => {
    const where = await service.getWhere({
      and: [
        { name: { like: 'сыр' } },
        { or: [{ price: { lt: 200 } }, { inStock: false }] },
      ],
    });
    expect(where).toHaveProperty('name');
    expect(Array.isArray(where.or)).toBe(false); // OR вложен внутрь AND
  });

  it('should handle AND (default, doc example)', async () => {
    const where = await service.getWhere({
      category: 'Молочные',
      inStock: true,
    });
    expect(where).toEqual({ category: 'Молочные', inStock: true });
  });

  it('should handle OR (doc example)', async () => {
    const where = await service.getWhere({ or: [{ id: 1 }, { id: 2 }] });
    expect(where).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it('should handle LIKE (doc example)', async () => {
    const where = await service.getWhere({ name: { like: 'сыр' } });
    expect(where.name.type).toBe('ilike');
    expect(where.name.value).toContain('сыр');
  });

  it('should handle IN (doc example)', async () => {
    const where = await service.getWhere({ id: { in: [1, 2, 3] } });
    expect(where.id.type).toBe('in');
    expect(where.id.value).toEqual([1, 2, 3]);
  });

  it('should handle BETWEEN (doc example)', async () => {
    const where = await service.getWhere({ price: { from: 100, to: 200 } });
    expect(where.price.type).toBe('between');
    expect(where.price.value).toEqual([100, 200]);
  });

  it('should handle IS NULL (doc example)', async () => {
    const where = await service.getWhere({ photoId: { isNull: true } });
    expect(where.photoId.type).toBe('isNull');
  });

  it('should handle gt (doc example)', async () => {
    const where = await service.getWhere({ price: { gt: 100 } });
    expect(where.price.type).toBe('moreThan');
    expect(where.price.value).toBe(100);
  });

  it('should handle STARTSWITH (doc example)', async () => {
    const where = await service.getWhere({ name: { startsWith: 'мо' } });
    expect(where.name.type).toBe('ilike');
    expect(where.name.value.startsWith('мо')).toBe(true);
  });

  it('should handle ENDSWITH (doc example)', async () => {
    const where = await service.getWhere({ name: { endsWith: 'ко' } });
    expect(where.name.type).toBe('ilike');
    expect(where.name.value.endsWith('ко')).toBe(true);
  });

  it('should handle NOT (doc example)', async () => {
    const where = await service.getWhere({ not: { inStock: true } });
    expect(where.type).toBe('not');
  });

  it('should handle complex AND + OR (doc example)', async () => {
    const where = await service.getWhere({
      and: [
        { name: { like: 'сыр' } },
        { or: [{ price: { lt: 200 } }, { inStock: false }] },
      ],
    });
    expect(where).toHaveProperty('name');
    expect(Array.isArray(where.or)).toBe(false); // OR вложен внутрь AND
  });

  it('should handle complex OR + BETWEEN (doc example)', async () => {
    const where = await service.getWhere({
      or: [{ price: { from: 100, to: 200 } }, { category: 'Сыры' }],
    });
    expect(where[0].price.type).toBe('between');
    expect(where[1].category).toBe('Сыры');
  });

  it('should handle complex NOT + LIKE (doc example)', async () => {
    const where = await service.getWhere({ not: { name: { like: 'сыр' } } });
    expect(where.type).toBe('not');
    expect(where.value.name.type).toBe('ilike');
  });
});
