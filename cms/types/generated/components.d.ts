import type { Schema, Struct } from '@strapi/strapi';

export interface AvatarListAvatarList extends Struct.ComponentSchema {
  collectionName: 'components_avatar_list_avatar_lists';
  info: {
    displayName: 'Avatar List';
    icon: 'medium';
  };
  attributes: {
    entity: Schema.Attribute.Enumeration<['BOOK', 'BOOK_CATEGORY']> &
      Schema.Attribute.Required;
  };
}

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
      'avatar-list.avatar-list': AvatarListAvatarList;
      'grid.grid': GridGrid;
    }
  }
}
