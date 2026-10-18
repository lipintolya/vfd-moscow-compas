import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Server => ({
  /* Только этот компьютер: админка Strapi не видна соседям по сети (Wi-Fi).
     Сайт собирается через localhost; другой адрес — переменная HOST */
  host: env('HOST', '127.0.0.1'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS')!,
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
});

export default config;
