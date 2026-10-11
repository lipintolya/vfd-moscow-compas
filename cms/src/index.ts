import type { Core } from '@strapi/strapi'
import { applyLabels } from './bootstrap/labels'
import { grantEditor, ensureSiteToken, ensureDevWebhook } from './bootstrap/access'

export default {
  register() {},
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await applyLabels(strapi)
    await grantEditor(strapi)
    await ensureSiteToken(strapi)
    await ensureDevWebhook(strapi)
  },
}
