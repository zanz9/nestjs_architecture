import { BaseService } from './base.service';
import { Repository } from 'typeorm';

type Dummy = any;

class DummyService extends BaseService<Dummy> {
  constructor() {
    // @ts-ignore
    super({
      metadata: {
        columns: [
          { propertyName: 'id' },
          { propertyName: 'name' },
          { propertyName: 'price' },
          { propertyName: 'description' },
        ],
        findRelationWithPropertyPath: (relation: string) => ({
          inverseEntityMetadata: {
            columns: [{ propertyName: 'id' }, { propertyName: 'name' }],
          },
        }),
      },
    } as unknown as Repository<Dummy>);
  }
}

describe('BaseService.getQueryOptions', () => {
  let service: DummyService;

  beforeEach(() => {
    service = new DummyService();
  });

  it('should handle relations as string', async () => {
    const options = await service['getQueryOptions'](undefined, {
      relations: 'category,shop',
    });
    expect(options.relations).toEqual(['category', 'shop']);
  });

  it('should handle relations as array', async () => {
    const options = await service['getQueryOptions'](undefined, {
      relations: ['category', 'shop'],
    });
    expect(options.relations).toEqual(['category', 'shop']);
  });
  it('should handle nested relations with dot notation', async () => {
    const options = await service['getQueryOptions'](undefined, {
      relations: 'category.parent,shop.owner',
    });
    expect(options.relations).toEqual(['category.parent', 'shop.owner']);
  });

  it('should handle exclude', async () => {
    const options = await service['getQueryOptions'](undefined, {
      exclude: 'price',
    });
    expect(options.select).not.toHaveProperty('price');
    expect(options.select).toHaveProperty('id');
  });

  it('should handle exclude nested', async () => {
    const options = await service['getQueryOptions'](undefined, {
      exclude: 'category.name',
      relations: 'category',
    });
    expect(options.select).toBeDefined();
    const select: any = options.select;
    if (
      select &&
      typeof select.category === 'object' &&
      select.category !== null
    ) {
      expect(select.category).not.toHaveProperty('name');
    }
  });

  it('should handle sort', async () => {
    const options = await service['getQueryOptions'](undefined, {
      sort: { price: 'ASC' },
    });
    expect(options.order).toEqual({ price: 'ASC' });
  });

  it('should handle pagination', async () => {
    const options = await service['getQueryOptions'](undefined, {
      page: 2,
      pageSize: 5,
    });
    expect(options.skip).toBe(5);
    expect(options.take).toBe(5);
  });
});
