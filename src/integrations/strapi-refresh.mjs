// @ts-check
/* В разработке: Strapi после правки шлёт POST /__strapi/refresh
   (вебхук создаётся в cms/src/bootstrap/access.ts) — данные коллекций из
   Strapi перечитываются без перезапуска дев-сервера.
   .mjs, а не .ts: astro.config.mjs намеренно не импортирует TypeScript. */

/**
 * @param {string[]} loaders имена загрузчиков (src/lib/strapi-content.ts)
 * @returns {import('astro').AstroIntegration}
 */
export default function strapiRefresh(loaders) {
  return {
    name: 'strapi-refresh',
    hooks: {
      'astro:server:setup': ({ server, refreshContent, logger }) => {
        server.middlewares.use('/__strapi/refresh', async (req, res) => {
          if (req.method !== 'POST') { res.statusCode = 405; res.end(); return }
          await refreshContent?.({ loaders })
          logger.info('Strapi: данные обновлены')
          res.statusCode = 204
          res.end()
        })
      },
    },
  }
}
