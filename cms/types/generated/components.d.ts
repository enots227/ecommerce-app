import type { Schema, Struct } from '@strapi/strapi';

export interface GridGrid extends Struct.ComponentSchema {
  collectionName: 'components_grid_grids';
  info: {
    displayName: 'Grid';
    icon: 'apps';
  };
  attributes: {
    entity: Schema.Attribute.Enumeration<['BOOK', 'BOOK_CATEGORY']> &
      Schema.Attribute.Required;
    filters: Schema.Attribute.JSON;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'grid.grid': GridGrid;
    }
  }
}
