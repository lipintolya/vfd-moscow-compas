import type { Schema, Struct } from '@strapi/strapi';

export interface ArticleAuthor extends Struct.ComponentSchema {
  collectionName: 'components_article_authors';
  info: {
    displayName: '\u0410\u0432\u0442\u043E\u0440';
    icon: 'user';
  };
  attributes: {
    href: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    linkLabel: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 80;
      }>;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 80;
      }>;
    photo: Schema.Attribute.Media<'images'>;
    role: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 120;
      }>;
    type: Schema.Attribute.Enumeration<
      [
        '\u0427\u0435\u043B\u043E\u0432\u0435\u043A',
        '\u041E\u0440\u0433\u0430\u043D\u0438\u0437\u0430\u0446\u0438\u044F',
      ]
    > &
      Schema.Attribute.DefaultTo<'\u041E\u0440\u0433\u0430\u043D\u0438\u0437\u0430\u0446\u0438\u044F'>;
  };
}

export interface ArticleCallout extends Struct.ComponentSchema {
  collectionName: 'components_article_callouts';
  info: {
    displayName: '\u0412\u044B\u043D\u043E\u0441\u043A\u0430';
    icon: 'information';
  };
  attributes: {
    kind: Schema.Attribute.Enumeration<
      [
        '\u0421\u043E\u0432\u0435\u0442',
        '\u0412\u0430\u0436\u043D\u043E',
        '\u041E\u0431\u0440\u0430\u0442\u0438\u0442\u0435 \u0432\u043D\u0438\u043C\u0430\u043D\u0438\u0435',
      ]
    > &
      Schema.Attribute.DefaultTo<'\u0421\u043E\u0432\u0435\u0442'>;
    text: Schema.Attribute.Blocks & Schema.Attribute.Required;
    title: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 120;
      }>;
  };
}

export interface ArticleCatalogPage extends Struct.ComponentSchema {
  collectionName: 'components_article_catalog_pages';
  info: {
    displayName: '\u0421\u0442\u0440\u0430\u043D\u0438\u0446\u0430 \u043A\u0430\u0442\u0430\u043B\u043E\u0433\u0430';
    icon: 'link';
  };
  attributes: {
    page: Schema.Attribute.Enumeration<
      [
        '\u0421\u043A\u0440\u044B\u0442\u044B\u0435 \u0434\u0432\u0435\u0440\u0438',
        '\u0421\u043A\u0440\u044B\u0442\u044B\u0435 \u0434\u0432\u0435\u0440\u0438 \u0434\u043B\u044F \u0434\u043E\u043C\u0430',
        '\u0421\u043A\u0440\u044B\u0442\u044B\u0435 \u0434\u0432\u0435\u0440\u0438 \u0434\u043B\u044F \u043E\u0444\u0438\u0441\u0430',
        '\u0421\u043A\u0440\u044B\u0442\u044B\u0435 \u0434\u0432\u0435\u0440\u0438 \u0432 \u043D\u043E\u0432\u043E\u0441\u0442\u0440\u043E\u0439\u043A\u0443',
        '\u0421\u043A\u0440\u044B\u0442\u044B\u0435 \u0434\u0432\u0435\u0440\u0438 \u043F\u043E\u0434 \u0434\u0438\u0437\u0430\u0439\u043D-\u043F\u0440\u043E\u0435\u043A\u0442',
        '\u0414\u0432\u0435\u0440\u0438 \u0432 \u0441\u0442\u0438\u043B\u0435 \u043B\u043E\u0444\u0442',
        '\u0414\u0432\u0435\u0440\u0438 \u0432 \u0441\u0442\u0438\u043B\u0435 \u043C\u0438\u043D\u0438\u043C\u0430\u043B\u0438\u0437\u043C',
        '\u0414\u0432\u0435\u0440\u0438 \u0432 \u0441\u043A\u0430\u043D\u0434\u0438\u043D\u0430\u0432\u0441\u043A\u043E\u043C \u0441\u0442\u0438\u043B\u0435',
        '\u0414\u0435\u043A\u043E\u0440 \u0438 \u043F\u043E\u0433\u043E\u043D\u0430\u0436',
      ]
    > &
      Schema.Attribute.Required;
  };
}

export interface ArticleCatalogSeries extends Struct.ComponentSchema {
  collectionName: 'components_article_catalog_series';
  info: {
    displayName: '\u0421\u0435\u0440\u0438\u044F \u043A\u0430\u0442\u0430\u043B\u043E\u0433\u0430';
    icon: 'layer';
  };
  attributes: {
    series: Schema.Attribute.Enumeration<
      [
        'antique-luxe',
        'basic',
        'elegant',
        'emalex',
        'emalex-modern',
        'innova',
        'linea',
        'next',
        'premium',
        'sektor',
        'skinel',
        'smart',
        'stockholm',
        'tehno',
        'urban',
        'urban-drevesnyy',
        'urban-pet',
        'winter',
      ]
    > &
      Schema.Attribute.Required;
  };
}

export interface ArticleCoating extends Struct.ComponentSchema {
  collectionName: 'components_article_coatings';
  info: {
    displayName: '\u041F\u043E\u043A\u0440\u044B\u0442\u0438\u0435';
    icon: 'brush';
  };
  attributes: {
    coating: Schema.Attribute.Enumeration<
      [
        '\u041F\u042D\u0422',
        '\u042D\u043C\u0430\u043B\u044C',
        '\u042D\u043C\u0430\u043B\u0435\u043A\u0441',
        '\u041F\u0440\u043E\u0442\u0430\u0447',
        '\u042D\u043A\u043E\u0448\u043F\u043E\u043D',
      ]
    > &
      Schema.Attribute.Required;
  };
}

export interface ArticleCoatingPrices extends Struct.ComponentSchema {
  collectionName: 'components_article_coating_prices';
  info: {
    displayName: '\u0426\u0435\u043D\u044B \u043F\u043E \u043F\u043E\u043A\u0440\u044B\u0442\u0438\u044F\u043C';
    icon: 'priceTag';
  };
  attributes: {
    note: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 120;
      }>;
  };
}

export interface ArticleFaq extends Struct.ComponentSchema {
  collectionName: 'components_article_faqs';
  info: {
    displayName: '\u0412\u043E\u043F\u0440\u043E\u0441-\u043E\u0442\u0432\u0435\u0442';
    icon: 'question';
  };
  attributes: {
    a: Schema.Attribute.Text & Schema.Attribute.Required;
    q: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
  };
}

export interface ArticleGallery extends Struct.ComponentSchema {
  collectionName: 'components_article_galleries';
  info: {
    displayName: '\u0413\u0430\u043B\u0435\u0440\u0435\u044F';
    icon: 'apps';
  };
  attributes: {
    columns: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 4;
          min: 2;
        },
        number
      >;
    doors: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    photos: Schema.Attribute.Component<'article.gallery-photo', true> &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 4;
          min: 2;
        },
        number
      >;
  };
}

export interface ArticleGalleryPhoto extends Struct.ComponentSchema {
  collectionName: 'components_article_gallery_photos';
  info: {
    displayName: '\u0424\u043E\u0442\u043E \u0433\u0430\u043B\u0435\u0440\u0435\u0438';
    icon: 'picture';
  };
  attributes: {
    alt: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160;
      }>;
    caption: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 120;
      }>;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    link: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
  };
}

export interface ArticleHiddenPrices extends Struct.ComponentSchema {
  collectionName: 'components_article_hidden_prices';
  info: {
    displayName: '\u0426\u0435\u043D\u044B \u0441\u043A\u0440\u044B\u0442\u044B\u0445 \u0434\u0432\u0435\u0440\u0435\u0439';
    icon: 'priceTag';
  };
  attributes: {
    note: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 120;
      }>;
  };
}

export interface ArticlePhoto extends Struct.ComponentSchema {
  collectionName: 'components_article_photos';
  info: {
    displayName: '\u0424\u043E\u0442\u043E';
    icon: 'picture';
  };
  attributes: {
    alt: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160;
      }>;
    caption: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    layout: Schema.Attribute.Enumeration<
      [
        '\u0412\u043E \u0432\u0441\u044E \u043A\u043E\u043B\u043E\u043D\u043A\u0443',
        '\u0423\u0437\u043A\u043E\u0435 (\u0441\u0445\u0435\u043C\u0430)',
        '\u0411\u0435\u0437 \u043E\u0431\u0440\u0435\u0437\u043A\u0438',
      ]
    > &
      Schema.Attribute.DefaultTo<'\u0412\u043E \u0432\u0441\u044E \u043A\u043E\u043B\u043E\u043D\u043A\u0443'>;
  };
}

export interface ArticleSeo extends Struct.ComponentSchema {
  collectionName: 'components_article_seos';
  info: {
    displayName: '\u0414\u043B\u044F \u043F\u043E\u0438\u0441\u043A\u043E\u0432\u0438\u043A\u043E\u0432 \u0438 \u043A\u0430\u0442\u0430\u043B\u043E\u0433\u0430';
    icon: 'search';
  };
  attributes: {
    author: Schema.Attribute.Component<'article.author', false>;
    coatings: Schema.Attribute.Component<'article.coating', true>;
    metaTitle: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 70;
      }>;
    pages: Schema.Attribute.Component<'article.catalog-page', true>;
    series: Schema.Attribute.Component<'article.catalog-series', true>;
    spotlight: Schema.Attribute.Component<'article.spotlight', false>;
    steps: Schema.Attribute.Component<'article.step', true>;
  };
}

export interface ArticleSpotlight extends Struct.ComponentSchema {
  collectionName: 'components_article_spotlights';
  info: {
    displayName: '\u041F\u043E\u043A\u0430\u0437 \u043D\u0430 \u0433\u043B\u0430\u0432\u043D\u043E\u0439';
    icon: 'star';
  };
  attributes: {
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    imageAlt: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160;
      }>;
    label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 30;
      }>;
    lead: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 300;
      }>;
    points: Schema.Attribute.Component<'shared.item', true> &
      Schema.Attribute.SetMinMax<
        {
          max: 4;
        },
        number
      >;
    poster: Schema.Attribute.Media<'images'>;
    video: Schema.Attribute.Media<'videos'>;
    videoTitle: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 120;
      }>;
  };
}

export interface ArticleStep extends Struct.ComponentSchema {
  collectionName: 'components_article_steps';
  info: {
    displayName: '\u0428\u0430\u0433';
    icon: 'arrowRight';
  };
  attributes: {
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 120;
      }>;
    text: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface ArticleTable extends Struct.ComponentSchema {
  collectionName: 'components_article_tables';
  info: {
    displayName: '\u0422\u0430\u0431\u043B\u0438\u0446\u0430';
    icon: 'grid';
  };
  attributes: {
    markdown: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface ArticleText extends Struct.ComponentSchema {
  collectionName: 'components_article_texts';
  info: {
    displayName: '\u0422\u0435\u043A\u0441\u0442';
    icon: 'pencil';
  };
  attributes: {
    content: Schema.Attribute.Blocks & Schema.Attribute.Required;
  };
}

export interface ArticleVideo extends Struct.ComponentSchema {
  collectionName: 'components_article_videos';
  info: {
    displayName: '\u0412\u0438\u0434\u0435\u043E';
    icon: 'play';
  };
  attributes: {
    caption: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    narrow: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    poster: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 120;
      }>;
    video: Schema.Attribute.Media<'videos'> & Schema.Attribute.Required;
  };
}

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
        maxLength: 200;
      }>;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'article.author': ArticleAuthor;
      'article.callout': ArticleCallout;
      'article.catalog-page': ArticleCatalogPage;
      'article.catalog-series': ArticleCatalogSeries;
      'article.coating': ArticleCoating;
      'article.coating-prices': ArticleCoatingPrices;
      'article.faq': ArticleFaq;
      'article.gallery': ArticleGallery;
      'article.gallery-photo': ArticleGalleryPhoto;
      'article.hidden-prices': ArticleHiddenPrices;
      'article.photo': ArticlePhoto;
      'article.seo': ArticleSeo;
      'article.spotlight': ArticleSpotlight;
      'article.step': ArticleStep;
      'article.table': ArticleTable;
      'article.text': ArticleText;
      'article.video': ArticleVideo;
      'shared.catalog-link': SharedCatalogLink;
      'shared.item': SharedItem;
    }
  }
}
