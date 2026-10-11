import type { Schema, Struct } from '@strapi/strapi';

export interface SharedCatalogLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_catalog_links';
  info: {
    displayName: '\u0421\u0441\u044B\u043B\u043A\u0430 \u043D\u0430 \u043A\u0430\u0442\u0430\u043B\u043E\u0433';
    icon: 'link';
  };
  attributes: {
    label: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 80;
      }>;
    section: Schema.Attribute.Enumeration<
      [
        '\u041C\u0435\u0436\u043A\u043E\u043C\u043D\u0430\u0442\u043D\u044B\u0435 \u0434\u0432\u0435\u0440\u0438',
        '\u0421\u043A\u0440\u044B\u0442\u044B\u0435 \u0434\u0432\u0435\u0440\u0438',
        '\u0421\u0435\u0440\u044B\u0435 \u0438 \u0433\u0440\u0430\u0444\u0438\u0442\u043E\u0432\u044B\u0435 \u0434\u0432\u0435\u0440\u0438',
        '\u0411\u0435\u043B\u044B\u0435 \u0434\u0432\u0435\u0440\u0438',
        '\u041F\u0435\u0440\u0435\u0433\u043E\u0440\u043E\u0434\u043A\u0438',
        '\u0414\u0435\u043A\u043E\u0440 \u0438 \u043F\u043E\u0433\u043E\u043D\u0430\u0436',
      ]
    > &
      Schema.Attribute.Required;
  };
}

export interface SharedItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_items';
  info: {
    displayName: '\u041F\u0443\u043D\u043A\u0442';
    icon: 'bulletList';
  };
  attributes: {
    text: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160;
      }>;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'shared.catalog-link': SharedCatalogLink;
      'shared.item': SharedItem;
    }
  }
}
