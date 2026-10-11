import type { Core } from '@strapi/strapi';
import { UPLOAD_LIMIT } from './plugins';

const config: Core.Config.Middlewares = [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  { name: 'strapi::body', config: { formidable: { maxFileSize: UPLOAD_LIMIT } } },
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];

export default config;
